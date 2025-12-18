import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assests/vyoobamnudge.png";
import API from "../api/axiosInstance";
import ConfirmDialog from "./ConfirmDialog";

const Topbar = ({ onMenuClick }) => {

  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
      const fetchProfile = async () => {
        try {
          const res = await API.get("/api/auth/profile", {
            withCredentials: true,
          });
          setUser(res.data.user)
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      };
      fetchProfile()
    }, [])

  const handleLogout = async () => {
    try {
      await API.post("/api/auth/logout")
      localStorage.clear()
      window.location.href = "/"
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background:
          "#1976d2",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left: Menu icon (only on mobile) + Title */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { sm: "none" }, mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          <img src={logo}  style={{ height: 75, width: "auto" }}/>
        </Box>

        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <Typography sx={{ pr:4 }}>
            Welcome, {user ? user.username : ""}
          </Typography>

        {/* Right: Logout Icon (always shown) */}
        <Tooltip title="Logout">
          <IconButton color="inherit" onClick={() => setOpen(true)}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>

        </Box>

        <ConfirmDialog
          open={open}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          onConfirm={handleLogout}
          onCancel={() => setOpen(false)}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
