import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import {
  Container, Typography, TextField, Button, Paper,
  Box, List, ListItem, ListItemText, IconButton, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');

  // Fetch notes filtered by customerId (if selected)
  const fetchNotes = async () => {
    try {
      const res = await API.get('/api/notes', {
        params: customerId ? { customerId } : {},
      });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  // Fetch customers for dropdown
  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [customerId]);

  // Add new note
  const addNote = async () => {
    if (!text) return alert('Please enter a note');
    try {
      await API.post('/api/notes', {
        text,
        customer: customerId || null,
      });
      setText('');
      fetchNotes();
    } catch (err) {
      alert('Failed to add note');
    }
  };

  // Delete note by ID
  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await API.delete(`/api/notes/${id}`);
      fetchNotes();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>📝 Notes</Typography>

      {/* Select customer filter */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          select
          fullWidth
          label="Filter by Customer"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <MenuItem value="">All Customers</MenuItem>
          {customers.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Input note */}
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Add Note"
          value={text}
          fullWidth
          onChange={(e) => setText(e.target.value)}
        />
        <Button variant="contained" onClick={addNote}>Add</Button>
      </Box>

      {/* Notes List */}
      <Paper>
        <List>
          {notes.length === 0 && (
            <ListItem><ListItemText primary="No notes found" /></ListItem>
          )}
          {notes.map(note => (
            <ListItem
              key={note._id}
              secondaryAction={
                <IconButton onClick={() => deleteNote(note._id)}>
                  <DeleteIcon size={25}/>
                </IconButton>
              }
            >
              <ListItemText
                primary={note.text}
                secondary={note.customer?.name || 'Unassigned'}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
