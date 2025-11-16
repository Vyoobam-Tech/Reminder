import React from "react";

// ✅ Correct relative path
import CalendarView from "../Calendar/CalendarView";
import UserTimeline from "../Calendar/UserTimeline";
import { Box, Container } from '@mui/material';

export default function CustomerPages() {
  return (
  <Container maxWidth="xl" sx={{ mt: 4 }}>
  <Box sx={{ mb: 4 }}>
    <CalendarView />
  </Box>

  {/* <Box sx={{ mb: 4 }}>
    <UserTimeline />
  </Box> */}
</Container>
  );
}