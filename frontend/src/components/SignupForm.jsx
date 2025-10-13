import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";


const SignupForm = () => {
  // const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const API_URL = import.meta.env.VITE_API_URL
  const API_URL = process.env.SERVER_URL;


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let valid = true;
    let newErrors = {};

    if (formData.username.trim() === "") {
      newErrors.username = "Username is required.";
      valid = false;
    }

    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits.";
      valid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID); // should log your client ID


    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true // send cookies
      });

      alert(
        response.data.message ||
          "Signup Successful!"
      );



      localStorage.setItem(
        "user",
        JSON.stringify({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        })
      );

      navigate("/");
    } catch (error) {
      setErrors({
        api:
          error.response?.data?.message ||
          "Something went wrong, please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {

      const response = await axios.post(
        `${API_URL}/api/auth/google`,
        {
          token: credentialResponse.credential
        },
        { withCredentials: true }
      );

      alert(response.data.message || "Google Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Google login failed");
    }
  };

  const handleGoogleFailure = () => {
    alert("Google login failed");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100%"
    
    >
      <Paper
        elevation={3}
        sx={{
          padding: 5,
          width: 350,
          textAlign: "center",
          borderRadius: 2
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Sign Up
        </Typography>

        {errors.api && (
          <Typography color="error" variant="body2">
            {errors.api}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              error={!!errors.username}
              helperText={errors.username}
             
            />
          

          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="username"
          />

       
            <TextField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              error={!!errors.phone}
              helperText={errors.phone}
            />
          

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            fullWidth
            required
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />

          
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
               autoComplete="new-password"
            />
        

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, borderRadius: 2 }}
            disabled={loading}
          >
            Sign Up
          </Button>
        </form>

        <Typography
          variant="subtitle2"
          align="center"
          sx={{ my: 2, fontWeight: "bold" }}
        >
          — OR —
        </Typography>

        <Box mt={3} display="flex" justifyContent="center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </Box>

        <Button
          onClick={() => navigate("/")}
          sx={{ mt: 2, textTransform: "none", color: "primary.main" }}
        >
          
            Already have an account? Sign In

        </Button>
      </Paper>
    </Box>
  );
};

export default SignupForm;
