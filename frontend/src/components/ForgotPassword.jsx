import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import "../App.css";
import API from "../api/axiosInstance";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    API.post("/api/auth/forgot-password", { email })
      .then((response) => {
        if (response.data.status) {
          alert("Check your email for the reset password link");
          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minheight: "100vh",       // full viewport height
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,                 // padding
          width: 360,
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }} fontWeight="bold" gutterBottom>
          Forgot Password
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <TextField
            type="email"
            placeholder="Email"
            autoComplete="off"
            required
            fullWidth
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon style={{ fontSize: "20px", color: "#666" }} />
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Send
          </Button>
        </form>

        <Typography sx={{ mt: 2 }}>
          <Link to="/" style={{ textDecoration: "none", color: "#1976D2" }}>
            ← Back to Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
