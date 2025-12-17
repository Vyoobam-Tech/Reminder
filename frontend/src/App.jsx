import React, { useState } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import Customer from './pages/CustomerPages';
import ReminderL from './pages/RemaninderL';
import ReminderReport from './components/ReminderReport';
import SettingsPage from './setting/SettingsPage';
import CalendarPage from './pages/CalendarPage';
import Task from './Task/TaskManager';
import GroupPage from './pages/GroupPage';
import Employee from './components/Employee';
import SignupPage from './pages/SignupPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const hideRoutes = ["/", "/signup", "/forgot-password"];
  const hideRoutesWithParams = ["/reset-password/"];

  const showTopbar =
    !hideRoutes.includes(location.pathname) &&
    !hideRoutesWithParams.some((path) => location.pathname.startsWith(path));
  const showSidebar = showTopbar;
  const showFooter = showTopbar;

  const [darkMode, setDarkMode] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />

        {showTopbar && <Topbar onMenuClick={handleDrawerToggle} />}
        {showSidebar && <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            mt: { xs: '64px', sm: '64px' },
            ml: showSidebar ? { sm: '190px' } : 0,
            width: '100%',

            minHeight: "calc(100vh - 64px)", 
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/customer"
              element={
                <PrivateRoute>
                  <Customer />
                </PrivateRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <PrivateRoute>
                  <Employee />
                </PrivateRoute>
              }
            />
            <Route
              path="/reminderReport"
              element={
                <PrivateRoute>
                  <ReminderReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/reminder"
              element={
                <PrivateRoute>
                  <ReminderL />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />
                </PrivateRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <PrivateRoute>
                  <CalendarPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/task"
              element={
                <PrivateRoute>
                  <Task />
                </PrivateRoute>
              }
            />
            <Route
              path="/group"
              element={
                <PrivateRoute>
                  <GroupPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Box>
      </Box>

      {showFooter && <Footer />}
    </ThemeProvider>
  );
};

export default App;
