import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Dashboard,
  EditNotifications,
  ListAlt,
  Group,
  Summarize,
  Task,
  CalendarMonth,
  Settings,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { ImManWoman } from "react-icons/im";

const drawerWidth = 190;

const navItems = [
  { icon: <Dashboard />, label: "Dashboard", path: "/dashboard" },
  { icon: <EditNotifications />, label: "Reminder", path: "/reminder" },
  { icon: <ListAlt />, label: "Customer", path: "/customer" },
  // { icon: <ImManWoman />, label: "Employee", path: "/employee" },
  { icon: <Group />, label: "Group", path: "/group" },
  { icon: <Summarize />, label: "Reports", path: "/reminderReport" },
  // { icon: <Task />, label: "Task", path: "/task" },
  { icon: <CalendarMonth />, label: "Calendar", path: "/calendar" },
  { icon: <Settings />, label: "Settings", path: "/settings" },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const drawer = (
    <Box sx={{ px: 1, pt: 10 }}>
      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (isMobile) onClose(); // Auto-close on mobile
              }}
              sx={{
                mb: 1,
                px: 2,
                py: 1,
                borderRadius: "8px",
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.15)"
                  : "transparent",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.25)",
                  transform: "scale(1.03)",
                },
                transition: "all 0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: 500,
                  color:'white'
                }}
              />
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
            width: drawerWidth,
            background:
             "#0A123F",
            color: "#fff",
            boxSizing: "border-box",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
