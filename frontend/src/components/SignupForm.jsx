import React, { useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Box,
  IconButton,
  InputAdornment
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";


const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL

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

    const passwordRegex =/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include letters, numbers, and special characters."
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
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>,
              }}
            />
          

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            fullWidth
            required
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  // edge="end"
                >
                  {showPassword ? <Visibility/> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          />

          
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              autoComplete="new-password"
              InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
