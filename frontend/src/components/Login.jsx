import { Box, Button, colors, IconButton, InputAdornment, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react'
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let valid = true;
    let newErrors = {};


    if (!formData.email.includes("@")) {
      newErrors.email = "Invalid email format.";
      valid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }


    if (!valid) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    const API_URL = `${import.meta.env.VITE_API_URL}/api/auth/signin`;

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true // send cookies
      });

    alert(
        response.data.message ||
          "Login Successful!"
      );

      navigate("/dashboard");
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
          Sign In
        </Typography>

        {errors.api && (
          <Typography color="error" variant="body2">
            {errors.api}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>

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
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />


          <Link
            to="/forgot-password"
            style={{
              display: "flex",
              justifyContent: "end",
              textDecoration: "none",
              color: "#1976D2",
            }}
          >
            Forgot Password?
          </Link>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, borderRadius: 2 }}
            disabled={loading}
          >
            Sign In
          </Button>
          </form>
    
        <Button
          onClick={() => navigate("/signup")}
          sx={{ mt: 2, textTransform: "none", color: "primary.main" }}
        >
            Don't have an account? Sign Up
        </Button>
      </Paper>
    </Box>
  )
}

export default Login