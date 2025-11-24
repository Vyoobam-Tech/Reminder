import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box, Typography, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField,
  Container,
  IconButton
} from '@mui/material';
import API from '../api/axiosInstance';
import CloseIcon from "@mui/icons-material/Close";


export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', type: '', notes: '', date: '', _id: null });
  const [open, setOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/api/reminders/calendar");

      const localEvents = res.data.map(event => {
        const date = new Date(event.start);

        // Fix UTC → Local
        const corrected = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        ).toISOString();

        return {
          ...event,
          start: event.start, // now calendar shows correct local time
        };
      });

      setEvents(localEvents);
    } catch (err) {
      console.error("Calendar load error:", err);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = (arg) => {
    setForm({
      title: '',
      type: '',
      notes: '',
      date: arg.dateStr + 'T09:00',
      _id: null
    });
    setOpen(true);
  };


  const handleEventClick = (arg) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      const ist = new Date(event.start).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata"
      });

      setForm({
        title: event.title,
        type: event.type,
        notes: event.notes,
        date: ist,
        _id: event.id
      });
      setOpen(true);
    }
  };


  const handleSave = async () => {
    try {
      if (form._id) {
        await API.put(`/api/reminders/${form._id}`, form);
      } else {
        await API.post("/api/reminders", form);
      }
      setOpen(false);
      fetchEvents();
    } catch (err) {
      alert('Save failed');
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/api/reminders/${form._id}`);
      setOpen(false);
      fetchEvents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (

    <Container>
      <Typography variant="h4" gutterBottom>
        Customer Reminder Calendar
      </Typography>
    <Card elevation={3} sx={{background: "#white",  borderRadius: 3, p: 2 }}>
      <CardContent >
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
          eventClick={handleEventClick}

          dayCellDidMount={(info) => {
            const frame = info.el.querySelector(".fc-daygrid-day-frame");
            if (frame) {
              frame.style.backgroundColor = "#2c3e50";
              frame.style.color = "white"
            }
          }}

          editable={false}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }}
        />
        </Box>
      </CardContent>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle sx={{ color: 'white', bgcolor: '#1976D2', display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>Reminder Details<IconButton onClick={() => setOpen(false)} color="dark"> <CloseIcon sx={{ color: "white" }} /> </IconButton> </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            sx={{ mt: 1 }}
            disabled
          />
          <TextField
            fullWidth
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            sx={{ mt: 1 }}
            disabled
          />

          <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            sx={{ mt: 1 }}
            disabled
          />
          <TextField
            fullWidth
            type="text"
            label="Date & Time"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            sx={{ mt: 2 }}
            disabled
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        {/* <DialogActions>
          {form._id && (
            <Button color="error" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions> */}
      </Dialog>
    </Card>
    </Container>
  );
}
