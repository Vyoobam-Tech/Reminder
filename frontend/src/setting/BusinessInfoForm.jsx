import { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import { TextField, Button, Typography, Stack } from '@mui/material';

export default function BusinessInfoForm() {
  const [info, setInfo] = useState({ name: '', address: '', phone: '', email: '', website: '' });

  useEffect(() => {
    API.get('/api/settings').then(res => {
      if (res.data?.businessInfo) setInfo(res.data.businessInfo);
    });
  }, []);

  const handleChange = (e) => setInfo({ ...info, [e.target.name]: e.target.value });

  const handleSave = async () => {
    await API.put('/api/settings', { businessInfo: info });
    alert('Business Info saved!');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Business Info</Typography>
      <TextField label="Business Name" name="name" value={info.name} onChange={handleChange} fullWidth />
      <TextField label="Address" name="address" value={info.address} onChange={handleChange} fullWidth />
      <TextField label="Phone" name="phone" value={info.phone} onChange={handleChange} fullWidth />
      <TextField label="Email" name="email" value={info.email} onChange={handleChange} fullWidth />
      <TextField label="Website" name="website" value={info.website} onChange={handleChange} fullWidth />
      <Button variant="contained" onClick={handleSave}>Save</Button>
    </Stack>
  );
}
