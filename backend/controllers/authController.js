import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { compare } from "bcryptjs";
import pkg from "jsonwebtoken";
import nodemailer from 'nodemailer'
import crypto from "crypto";
import bcrypt from "bcryptjs";


const { sign } = pkg;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone Number already in use." });
    }

    const newUser = new User({ username, email, phone, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 3600000,
    });


    res.json({ message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: name,
        email,
        phone: "0000000000",
        password: sub,
      });
      await user.save();
    }

    const tokenJWT = sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", tokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 3600000,
    });

    res.json({ message: "Google login successful!" });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(500).json({ message: "Google login failed. Please try again later." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  })

  res.json({ message: "Logged out successfully" })
};




export const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user }); // send user object to frontend
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");

    // Set token and expiration (1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    // Send email (example with nodemailer)
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this because you requested a password reset. 
Visit the following link to reset your password: 
${process.env.CLIENT_URL}/reset-password/${token} 
This link will expire in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const token = decodeURIComponent(req.params.token); // decode token if URL-encoded
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token not expired
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Assign new password (pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};




