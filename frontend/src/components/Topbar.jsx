import React from "react";
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

const Topbar = ({ onMenuClick }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        background:
          "#00052b",
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
          <img src={logo}  style={{ height: 75, width: "auto", marginLeft: 8 }}/>
          {/* <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: 18, sm: 22 },
            }}
          >
            Vyoobam Reminder
          </Typography> */}
        </Box>

        {/* Right: Logout Icon (always shown) */}
        <Tooltip title="Logout">
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
