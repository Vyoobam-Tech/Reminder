// 📁 src/components/CalendarView.js
import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box, Typography, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField
} from '@mui/material';
// import axios from 'axios';
import API from '../api/axiosInstance';

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  // const [form, setForm] = useState({ title: '', date: '', _id: null });
  // const [open, setOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/api/reminders/calendar");
      setEvents(res.data);
    } catch (err) {
      console.error("Calendar load error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (arg) => {
    setForm({ title: '', date: arg.dateStr + 'T09:00', _id: null });
    setOpen(true);
  };

  // const handleEventClick = (arg) => {
  //   const event = events.find(e => e.id === arg.event.id);
  //   if (event) {
  //     setForm({
  //       title: event.title,
  //       date: new Date(event.start).toISOString().slice(0, 16),
  //       _id: event.id
  //     });
  //     setOpen(true);
  //   }
  // };

  // const handleSave = async () => {
  //   try {
  //     if (form._id) {
  //       await API.put(`/api/reminders/${form._id}`, form);
  //     } else {
  //       await API.post("/api/reminders", form);
  //     }
  //     setOpen(false);
  //     fetchEvents();
  //   } catch (err) {
  //     alert('Save failed');
  //   }
  // };

  // const handleDelete = async () => {
  //   try {
  //     await API.delete(`/api/reminders/${form._id}`);
  //     setOpen(false);
  //     fetchEvents();
  //   } catch (err) {
  //     alert('Delete failed');
  //   }
  // };

  return (
    <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Customer Reminder Calendar
        </Typography>
        <Box mt={2}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="80vh"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={events}
            dateClick={handleDateClick}
            // eventClick={handleEventClick}
            editable={false}
          />
        </Box>
      </CardContent>

      {/* Dialog */}
      {/* <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{form._id ? 'Edit Reminder' : 'New Reminder'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="datetime-local"
            label="Date & Time"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          {form._id && (
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog> */}
    </Card>
  );
}
