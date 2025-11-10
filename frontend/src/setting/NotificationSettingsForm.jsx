import { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import { Typography, Stack, TextField, Button, FormControlLabel, Switch } from '@mui/material';

export default function NotificationSettingsForm() {
  const [notify, setNotify] = useState({
    emailEnabled: true,
    smsEnabled: false,
    emailSender: '',
    smsSender: ''
  });

  useEffect(() => {
    API.get('/api/settings').then(res => {
      if (res.data?.notifications) setNotify(res.data.notifications);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNotify({ ...notify, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = async () => {
    await API.put('/api/settings', { notifications: notify });
    alert('Notification settings saved!');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Email/SMS Configuration</Typography>
      <FormControlLabel
        control={<Switch checked={notify.emailEnabled} onChange={handleChange} name="emailEnabled" />}
        label="Enable Email"
      />
      <TextField label="Email Sender" name="emailSender" value={notify.emailSender} onChange={handleChange} fullWidth />
      <FormControlLabel
        control={<Switch checked={notify.smsEnabled} onChange={handleChange} name="smsEnabled" />}
        label="Enable SMS"
      />
      <TextField label="SMS Sender" name="smsSender" value={notify.smsSender} onChange={handleChange} fullWidth />
      <Button variant="contained" onClick={handleSave}>Save</Button>
    </Stack>
  );
}
