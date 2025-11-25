import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  TextField,
  Switch,
  FormControlLabel, 
  Stack,
  Avatar,
  Container,
  Button,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import API from "../api/axiosInstance";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';


const SettingsPage = ({ darkMode, setDarkMode }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [user, setUser] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/api/auth/profile", {
          withCredentials: true,
        });
        setUser(res.data.user);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleTabChange = (_, newValue) => setTabIndex(newValue);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        App Settings
      </Typography>

      <Card sx={{ mt: 2, borderRadius: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<AccountCircleIcon />} label="Account" />
          <Tab icon={<SettingsIcon />} label="Preferences" />
          <Tab icon={<InfoIcon />} label="About App" />
        </Tabs>

        <Divider />

        <CardContent>
          {/* ACCOUNT TAB */}
          {tabIndex === 0 && (
            <Stack spacing={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 60, height: 60 }}>
                  {user ? user.username[0] : "U"}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {user ? user.username : "Loading..."}
                </Typography>
              </Box>

              <TextField
                label="Email"
                value={user ? user.email : ""}
                sx={{ width:300 }}
                disabled
              />
              <TextField
                label="Phone"
                value={user ? user.phone : ""}
                sx={{ width:300 }}
                disabled
              />
              <TextField
                label="Password"
                value={user ? "********" : ""}
                sx={{ width:300 }}
                disabled
              />
            </Stack>
          )}

          {/* PREFERENCES TAB */}
          {tabIndex === 1 && (
            <Stack spacing={3}>

              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                  />
                }
                label="Enable Dark Theme"
              />

            </Stack>
          )}

          {/* ABOUT TAB */}
          {tabIndex === 2 && (
            <Box sx={{ m:2, p:3}}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Reminder App Features
              </Typography>
              <ul>
                <li>
                  Smart Reminders & Alerts
                </li>
                <li>
                  Integrated Calendar View
                </li>
                <li>
                  Task & Customer Management
                </li>
                <li>
                  Dashboard Analytics
                </li>
                <li>
                  Email/SMS Integrations
                </li>
                <li>
                  AI-Powered Follow-ups (coming soon)
                </li>
              </ul>

              <Box textAlign="center" mt={2}>
                <a href="/demo.pdf" download>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PictureAsPdfIcon />}
                  >
                    Download Demo PDF
                  </Button>
                </a>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SettingsPage;
