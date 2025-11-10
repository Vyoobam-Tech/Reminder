import React, { useState } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import {ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';
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
import Employee from './components/Employee';
import GroupPage from './pages/GroupPage';
import SignupPage from './pages/SignupPage';

const App = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const hideRoutes = ["/","/signup"];
  const showTopbar = !hideRoutes.includes(location.pathname);
  const showSidebar = !hideRoutes.includes(location.pathname);
  const [darkMode, setDarkMode] = useState(false)
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
        {showSidebar && (
          <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            mt: { xs: '64px', sm: '64px' },
            ml: showSidebar ? { sm: '190px' } : 0,
            width: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/employee" element={<Employee />} />
            <Route path="/reminderReport" element={<ReminderReport />} />
            <Route path="/reminder" element={<ReminderL />} />
            <Route path="/settings" element={<SettingsPage darkMode={darkMode} setDarkMode={setDarkMode}/>} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/task" element={<Task />} />
            <Route path="/group" element={<GroupPage />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
