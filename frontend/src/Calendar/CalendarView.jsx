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
  IconButton,
  MenuItem,
  Autocomplete,
  InputAdornment,
  Checkbox
} from '@mui/material';
import API from '../api/axiosInstance';
import CloseIcon from "@mui/icons-material/Close";
import { MdImage, MdVideoLibrary } from 'react-icons/md';


const reminderTypes = [
    'Meeting', 'Client Follow-up', 'Payment Due',
    'Subscription/Service Renewal', 'Product Delivery', 'Custom'
  ];
  const recurrenceOptions = ['One-time', 'Daily', 'Weekly', 'Monthly'];

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ 
      title: '',
      type: 'Custom',
      notes: '',
      image: null,
      video: null,
      date: '',
      recurrence: 'One-time',
      recipient:'Customer',
      deliveryMethods: [],
      email: '',
      phone: '',
      whatsapp: '',
      groupemail: [],
      _id: null });
  const [open, setOpen] = useState(false);
  const [recipientType, setRecipientType] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [error, setError] = useState({});


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

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      setCustomerOptions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await API.get('/api/groups');
      setGroupOptions(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEvents()
    fetchCustomers()
    fetchGroups()
  }, [])

  const handleDateClick = (arg) => {
    setForm({
      title: '',
      type: '',
      notes: '',
      date: '',
      recurrence: '',
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

      const type = event.groups?.length > 0 ? "Group" : "Individual";

  // Recipients list
      const rec = type === "Group" ? event.groups : event.recipients;

      setForm({
        title: event.title,
        type: event.type,
        notes: event.notes,
        recurrence: 'One-time',
        date: event.start
          ? new Date(new Date(event.start).getTime() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)
          : "",
        image: event.image || null,
        video: event.video || null,
        _id: event.id
      });
      setRecipientType(type);
      setSelectedRecipients(rec || []);
      setOpen(true);
    }
  };


  const handleSave = async () => {
    let validationErrors = {};

      if (!form.title?.trim()) validationErrors.title = "Title is required"

      if (!recipientType) validationErrors.recipientType = "Recipient type required";
      if (selectedRecipients.length === 0)
        validationErrors.selectedRecipients = "Select at least one recipient";
      if (!form.notes?.trim()) validationErrors.notes = "Notes are required"

      if (Object.keys(validationErrors).length > 0) {
        setError(validationErrors);
        return;
      }

      const payload = { ...form };

      if (recipientType === "Individual") {
        payload.recipient = selectedRecipients;
        payload.groups=[]
      } else {
        payload.groups = selectedRecipients;
        payload.recipient=[]
      }

    try {
      if (form._id) {
        await API.put(`/api/reminders/${form._id}`, payload);
      } else {
        await API.post("/api/reminders", payload);
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

  const handleRecipientType = (e) => {
    const value = e.target.value;

    setRecipientType(value);

    // Clear recipients
    setSelectedRecipients([]);

    // Also clear form fields to avoid mixing old data
    setForm(prev => ({
      ...prev,
      recipient: [],
      groups: []
    }));
  };


  const handleSelectChange = (newValue) => {
    setSelectedRecipients(newValue.map(v => v._id));
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
            error={!!error.title}
            helperText={error.title}
          />
          <TextField
            select
            fullWidth
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            sx={{ mt: 1 }}
          >
            {reminderTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth
            margin="dense"
            type="datetime-local"
            label="Reminder Date"
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <TextField select fullWidth margin="dense" label="Type" name="type" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
            {recurrenceOptions.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </TextField>

          <TextField
            select
            fullWidth
            margin="dense"
            label="Recipient Type"
            value={recipientType}
            onChange={handleRecipientType}
            error={!!error.recipientType}
            helperText={error.recipientType}
          >
            <MenuItem value="Individual">Individual</MenuItem>
            <MenuItem value="Group">Group</MenuItem>
          </TextField>

        {recipientType === "Individual" && (
          <Autocomplete
            multiple
            options={customerOptions}
            getOptionLabel={(option) => option.name}
            value={customerOptions.filter((c) => selectedRecipients.includes(c._id))}
            onChange={(e, newValue) => handleSelectChange(newValue)}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} style={{ marginRight: 8 }} />
                  {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customer"
                margin="dense"
                fullWidth
                error={!!error.selectedRecipients}
                helperText={error.selectedRecipients}
              />
            )}
          />
        )}

        {recipientType === "Group" && (
          <Autocomplete
            multiple
            options={groupOptions}
            getOptionLabel={(option) => option.name}
            value={groupOptions.filter((g) => selectedRecipients.includes(g._id))}
            onChange={(e, newValue) => handleSelectChange(newValue)}
            disableCloseOnSelect
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} style={{ marginRight: 8 }} />
                  {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Group"
                margin="dense"
                fullWidth
                error={!!error.selectedRecipients}
                helperText={error.selectedRecipients}
              />
            )}
          />
        )}

         <TextField
            fullWidth
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            sx={{ mt: 1 }}
            multiline
            rows={4}
            error={!!error.notes}
            helperText={error.notes}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {/* IMAGE UPLOAD */}
                  <IconButton color="primary" component="label">
                    <MdImage size={22} />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, image: e.target.files[0] || null }))
                      }
                    />
                    {form.image && (
                      <Typography sx={{ mt: 1, fontSize: "14px", color: "green" }}>
                        {form.image.name || form.image.originalname || form.image.filename}
                      </Typography>
                    )}
                  </IconButton>

                  {/* VIDEO UPLOAD */}
                  <IconButton color="secondary" component="label">
                    <MdVideoLibrary size={22} />
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={(e) =>
                        setForm(prev => ({ ...prev, video: e.target.files[0] || null }))
                      }
                    />
                  {form.video && (
                    <Typography sx={{ mt: 1, fontSize: "14px", color: "purple" }}>
                      {form.video.name || form.video.originalname || form.video.filename}
                    </Typography>
                  )}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
      </Dialog>
    </Card>
    </Container>
  );
}
