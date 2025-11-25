import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Dashboard,
  EditNotifications,
  ListAlt,
  Group,
  Summarize,
  CalendarMonth,
  Settings,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

const expandedWidth = 190;
const collapsedWidth = 70;

const navItems = [
  { icon: <Dashboard />, label: "Dashboard", path: "/dashboard" },
  { icon: <EditNotifications />, label: "Reminder", path: "/reminder" },
  { icon: <ListAlt />, label: "Customer", path: "/customer" },
  { icon: <Group />, label: "Group", path: "/group" },
  { icon: <Summarize />, label: "Reports", path: "/reminderReport" },
  { icon: <CalendarMonth />, label: "Calendar", path: "/calendar" },
  { icon: <Settings />, label: "Settings", path: "/settings" },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleSidebar = () => setCollapsed(!collapsed);

  const drawer = (
    <Box sx={{ px: 1, pt: 9 }}>
      {/* Menu Toggle Button */}
      <Box sx={{ width: "100%", display: "flex", px: collapsed ? 1 : 1, mb: 1 }}>
        <IconButton sx={{ color: "white" }} onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
      </Box>

      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onClose();
              }}
              sx={{
                mb: 1,
                px: collapsed ? 1 : 2,
                py: 1,
                borderRadius: "8px",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                color: "white",
                justifyContent: collapsed ? "center" : "flex-start",
                transition: "all 0.3s",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                  transform: "scale(1.03)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: "white",
                  minWidth: 0,
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "white",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav">
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: collapsed ? collapsedWidth : expandedWidth,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            background: "#1976d2",
            color: "#fff",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
