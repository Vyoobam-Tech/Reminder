import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const FullOverlayCalendar = ({ open, onClose }) => {
  const [events, setEvents] = useState([
    { id: '1', title: 'Test Event', start: new Date().toISOString() }
  ]);

  const handleDateClick = (info) => {
    const title = prompt('Enter Event Title:');
    if (title) {
      setEvents((prev) => [
        ...prev,
        {
          id: String(prev.length + 1),
          title,
          start: info.dateStr,
        }
      ]);
    }
  };

  const handleDelete = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // 👇 Render custom content with delete icon
  const renderEventContent = (eventInfo) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="body2">{eventInfo.event.title}</Typography>
        <IconButton
          size="small"
          sx={{ color: 'red', p: 0.2 }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering eventClick
            handleDelete(eventInfo.event.id);
          }}
        >
          <DeleteIcon size={30}/>
        </IconButton>
      </Box>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', md: '75%' },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 2,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            📅  Calendar
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Calendar */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="80vh"
          events={events}
          dateClick={handleDateClick}
          eventContent={renderEventContent} // 👈 Injects the custom event content
        />
      </Box>
    </Modal>
  );
};

export default FullOverlayCalendar;
