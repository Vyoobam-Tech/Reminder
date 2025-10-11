import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// const clientId = "905445201561-7mtnovjg5aalpjv6u1854ctbmk5bgm9s.apps.googleusercontent.com"
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />



        
      </ThemeProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);