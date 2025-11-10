import { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import {
  TextField,
  Button,
  Typography,
  Stack,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MdDelete } from "react-icons/md";

export default function ReminderTemplatesForm() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    API.get('/api/settings').then(res => {
      if (res.data?.reminderTemplates) setTemplates(res.data.reminderTemplates);
    });
  }, []);

  const updateTemplate = (index, field, value) => {
    const updated = [...templates];
    updated[index][field] = value;
    setTemplates(updated);
  };

  const addTemplate = () => {
    setTemplates([...templates, { title: '', body: '' }]);
  };

  const deleteTemplate = (index) => {
    const updated = templates.filter((_, i) => i !== index);
    setTemplates(updated);
  };

  const handleSave = async () => {
    await API.put('/api/settings', { reminderTemplates: templates });
    alert('Templates saved!');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Custom Reminder Templates</Typography>

      {templates.map((t, i) => (
        <Paper key={i} variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Title"
              value={t.title}
              onChange={e => updateTemplate(i, 'title', e.target.value)}
              fullWidth
            />
            <TextField
              label="Body"
              multiline
              minRows={3}
              value={t.body}
              onChange={e => updateTemplate(i, 'body', e.target.value)}
              fullWidth
            />

            {/* Delete Button BELOW body */}
            <Button
              variant="outlined"
              color="error"
              onClick={() => deleteTemplate(i)}
              startIcon={<MdDelete />}
              sx={{ alignSelf: 'flex-start' }}
            >
              Delete
            </Button>
          </Stack>
        </Paper>
      ))}

      <Button variant="outlined" onClick={addTemplate}>
        + Add Template
      </Button>

      <Button variant="contained" onClick={handleSave}>
        Save
      </Button>
    </Stack>
  );
}
