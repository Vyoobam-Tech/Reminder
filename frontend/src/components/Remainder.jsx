import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import {
    Container, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Box,
    Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Autocomplete,
    IconButton, InputAdornment,
    Grid
  } from '@mui/material';
import { MdDelete, MdEdit, MdImage, MdVideoLibrary } from "react-icons/md";
import { SlBell } from "react-icons/sl";

  const reminderTypes = [
    'Meeting', 'Client Follow-up', 'Payment Due',
    'Subscription/Service Renewal', 'Product Delivery', 'Custom'
  ];
  const recurrenceOptions = ['One-time', 'Daily', 'Weekly', 'Monthly'];
  const recipientOptions = ['Individual', 'Group'];
  const deliveryOptions = ['email', 'phone', 'whatsapp', 'emailgroup'];

  export default function Reminder() {
    const [reminders, setReminders] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
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
      groupemail: []
    });
    const [editId, setEditId] = useState(null);
    const [emailGroups, setEmailGroups] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [recipientType, setRecipientType] = useState('')
    const [customerOptions, setCustomerOptions] = useState([])
    const [groupOptions, setGroupOptions] = useState([])
    const [selectedRecipients, setSelectedRecipients] = useState([])
    const [error, setError] = useState({})

    useEffect(() => {
      fetchReminders();
      fetchEmailGroups();
      fetchCustomers();
    }, []);

    const fetchReminders = async () => {
      const res = await API.get('/api/reminders');
      setReminders(res.data);
    };

    const fetchEmailGroups = async () => {
      const res = await API.get('/api/groups');
      setEmailGroups(res.data);
    };

    const fetchCustomers = async () => {
      const res = await API.get('/api/customers');
      setCustomers(res.data);
    };

    const handleOpen = (reminder = null) => {
      if (reminder) {
        setFormData({
          ...reminder,
          image: reminder.image || null,
          video: reminder.video || null,
          date: reminder.date
            ? new Date(reminder.date).toISOString().slice(0, 16)
            : "",
          deliveryMethods: reminder.deliveryMethods || [],
          email: reminder.email || '',
          phone: reminder.phone || '',
          whatsapp: reminder.whatsapp || '',
          groupemail: reminder.groupemail || []
        });
        setEditId(reminder._id);
      } else {
        setFormData({
          title: '', type: 'Custom', notes: '', date: '', recurrence: 'One-time',
          deliveryMethods: [], email: '', phone: '', whatsapp: '', groupemail: []
        });
        setEditId(null);
      }
      setDialogOpen(true);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === 'deliveryMethods' || name === 'groupemail') {
        setFormData(prev => ({ ...prev, [name]: Array.isArray(value) ? value : [value] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    const handleSubmit = async () => {
      let newErrors = {};

      if (!formData.title) newErrors.title = "Title is required";
      if (!formData.date) newErrors.date = "Date is required";
      if (!recipientType) newErrors.recipientType = "Recipient type is required";
      if (recipientType && selectedRecipients.length === 0)
        newErrors.selectedRecipients = "Please select at least one";
      if (!formData.notes) newErrors.notes = "Notes are required";

      if (Object.keys(newErrors).length > 0) {
        setError(newErrors); // show inline errors
        return;
      }

      setError({});

      try {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("type", formData.type);
        data.append("notes", formData.notes);
        // Fix timezone issue
        const utcDate = new Date(formData.date).toISOString();
        data.append("date", utcDate);
        data.append("recurrence", formData.recurrence);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        data.append("whatsapp", formData.whatsapp);

        // Ensure deliveryMethods array is always up-to-date
        const methods = [...formData.deliveryMethods];
        if (formData.email && !methods.includes("email")) methods.push("email");
        if (formData.phone && !methods.includes("phone")) methods.push("phone");
        if (formData.whatsapp && !methods.includes("whatsapp")) methods.push("whatsapp");
        if (formData.groupemail.length && !methods.includes("emailgroup")) methods.push("emailgroup");

        methods.forEach(m => data.append("deliveryMethods[]", m));
        formData.groupemail.forEach(e => data.append("groupemail[]", e));

        if (selectedRecipients.length) {
          if (recipientType === "Individual") {
            selectedRecipients.forEach(id => data.append("recipients", id));
          } else if (recipientType === "Group") {
            selectedRecipients.forEach(id => data.append("groups", id));
          }
        }


        if (formData.image) data.append("image", formData.image);
        if (formData.video) data.append("video", formData.video);

        if (editId) {
          await API.put(`/api/reminders/${editId}`, data, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        } else {
          await API.post("/api/reminders", data, {
            headers: { "Content-Type": "multipart/form-data" }
          });
        }

        fetchReminders();
        setDialogOpen(false);
      } catch (err) {
        alert("Save failed: " + err.message);
      }
    };

    const handleDelete = async (id) => {
      if (window.confirm('Delete this reminder?')) {
        await API.delete(`/api/reminders/${id}`);
        fetchReminders();
      }
    };

    const handleRecipientType = async(e) => {
      const value = e.target.value
      setRecipientType(value)
      setSelectedRecipients([])

      if (value === "Individual") {
        try {
          const res = await API.get('/api/customers')
          setCustomerOptions(res.data);
        } catch (err) {
          console.log(err)
        }
      } else if (value === 'Group'){
        try {
        const res = await API.get('/api/groups')
        setGroupOptions(res.data)
        } catch (err) {
          console.log(err)
        }
      }
    }

    const handleSelectChange = (e) => {
      setSelectedRecipients(e.target.value);
    }
    



    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom><SlBell /> Reminder Management</Typography>
        <Box mb={2}><Button variant="contained" onClick={() => handleOpen()}>+ Add Reminder</Button></Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Recurrence</TableCell>
                {/* <TableCell>Delivery</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reminders.map((r) => (
                <TableRow key={r._id}>
                  <TableCell>{r.title}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.notes}</TableCell>
                  <TableCell>
                    {new Date(r.date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </TableCell>
                  <TableCell>{r.recurrence}</TableCell>
                  <TableCell>
                    <Button size="large" onClick={() => handleOpen(r)}><MdEdit size={25} /></Button>
                    <Button size='large' color="error" onClick={() => handleDelete(r._id)}><MdDelete size={25} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>{editId ? 'Edit' : 'Create'} Reminder</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
            
                <TextField 
                  fullWidth 
                  margin="dense" 
                  label="Title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  sx={{ width: '220px' }}
                  error={!formData.title}
                  helperText={error.title}
                />

                <TextField select fullWidth margin="dense" label="Type" name="type"  sx={{ width: '315px' }}  value={formData.type} onChange={handleChange}>
                  {reminderTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </TextField>

      
                <TextField
                  fullWidth
                  margin="dense"
                  type="datetime-local"
                  label="Reminder Date"
                  name="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date}
                  onChange={handleChange}
                  sx={{ width: '220px' }}
                  error={!formData.date}
                  helperText={error.date}
              />

              <TextField select fullWidth margin="dense" label="Recurrence" name="recurrence" sx={{ width: '315px' }} value={formData.recurrence} onChange={handleChange}>
                {recurrenceOptions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>

          {/* customer fetching */}
            
              <TextField
                select
                fullWidth
                margin='dense'
                label='Recipient Type'
                value={recipientType}
                onChange={handleRecipientType}
                error={!!error.recipientType}
                helperText={error.recipientType}
              >
                <MenuItem value='Individual'>Individual</MenuItem>
                <MenuItem value='Group'>Group</MenuItem>
              </TextField>
              

            {recipientType === 'Individual' && (
              <TextField
                select
                fullWidth
                margin='dense'
                label='Select Customer'
                value={selectedRecipients}
                onChange={handleSelectChange}
                error={!!error.selectedRecipients}
                helperText={error.selectedRecipients}
                SelectProps={{ 
                  multiple: true,
                  renderValue: (selected) => 
                    customerOptions.filter(c => selected.includes(c._id))
                    .map(c => c.name)
                    .join(", ")
                }}
              >
                {/* {customerOptions.map((cust) => (
                  <MenuItem key={cust._id} value={cust._id}>
                    <Checkbox checked={selectedRecipients.includes(cust._id)}/>
                    <ListItemText>{cust.name}</ListItemText>
                  </MenuItem>
                ))} */}
                <Autocomplete
                  multiple
                  options={customerOptions}
                  getOptionLabel={(option) => option.name}
                  value={customerOptions.filter(c => selectedRecipients.includes(c._id))}
                  onChange={(e, value) => setSelectedRecipients(value.map(v => v._id))}
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
                      placeholder="Type to search..."
                      margin="dense"
                      fullWidth
                    />
                  )}
                  filterSelectedOptions
                />
              </TextField>
            )}

            {recipientType === 'Group' && (
              <TextField
                select
                fullWidth
                margin='dense'
                label='Select Group'
                value={selectedRecipients}
                onChange={handleSelectChange}
                error={!!error.selectedRecipients}
                helperText={error.selectedRecipients}
                SelectProps={{ 
                  multiple: true,
                  renderValue: (selected) => 
                    groupOptions.filter(g => selected.includes(g._id))
                    .map(g => g.name)
                    .join(", ")
                }}
              >
                {/* {groupOptions.map((gro) => (
                  <MenuItem key={gro._id} value={gro._id}>
                    <Checkbox checked={selectedRecipients.includes(gro._id)}/>
                    <ListItemText>{gro.name}</ListItemText>
                  </MenuItem>
                ))} */}
                <Autocomplete
                  multiple
                  options={groupOptions}
                  getOptionLabel={(option) => option.name}
                  value={(groupOptions.filter((g) => selectedRecipients.includes(g._id)))}
                  onChange={(e, value) => setSelectedRecipients(value.map(v => v._id))}
                  disableCloseOnSelect
                  renderOption={(props, option, {selected}) => (
                    <li {...props}>
                      <Checkbox checked={selected} style={{ marginRight:8 }}/>
                      {option.name}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Select Group'
                      placeholder='Type to Search ...'
                      margin='dense'
                      fullWidth
                    />
                  )}
                  filterSelectedOptions
                />
              </TextField>
            )}

            <TextField
              fullWidth
              margin="dense"
              label="Notes"
              name="notes"
              multiline
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              error={!formData.notes}
              helperText={error.notes}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color="primary" component="label">
                      <MdImage size={22} />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, image: e.target.files[0] || null }))
                        }
                      />
                    </IconButton>
                    <IconButton color="secondary" component="label">
                      <MdVideoLibrary size={22} />
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, video: e.target.files[0] || null }))
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />



            {/* Delivery Methods */}
            {/* <FormControl fullWidth margin="dense">
              <InputLabel id="delivery-methods-label">Preferred Choice</InputLabel>
              <Select
                labelId="delivery-methods-label"
                multiple
                name="deliveryMethods"
                value={formData.deliveryMethods}
                onChange={handleChange}
                input={<OutlinedInput label="Preferred Choice" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {deliveryOptions.map((method) => (
                  <MenuItem key={method} value={method}>
                    <Checkbox checked={formData.deliveryMethods.includes(method)} />
                    <ListItemText primary={method} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}


            {formData.deliveryMethods.includes('email') && (
              <Autocomplete
                options={customers.map(c => c.email).filter(Boolean)}
                value={formData.email}
                onChange={(e, value) => setFormData(prev => ({ ...prev, email: value || '' }))}
                renderInput={(params) => <TextField {...params} label="Email Address" margin="dense" fullWidth />}
                freeSolo
              />
            )}
            {formData.deliveryMethods.includes('phone') && (
              <Autocomplete
                options={customers.map(c => c.phone).filter(Boolean)}
                value={formData.phone}
                onChange={(e, value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                renderInput={(params) => <TextField {...params} label="Phone Number" margin="dense" fullWidth />}
                freeSolo
              />
            )}
            {formData.deliveryMethods.includes('whatsapp') && (
              <TextField fullWidth margin="dense" label="WhatsApp Number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
            )}
            {formData.deliveryMethods.includes('emailgroup') && (
              <FormControl fullWidth margin="dense">
                <InputLabel id="email-groups-label">Email Groups</InputLabel>
                <Select
                  labelId="email-groups-label"
                  multiple
                  name="groupemail"
                  value={formData.groupemail}
                  onChange={handleChange}
                  input={<OutlinedInput label="Email Groups" />}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {emailGroups.map((group) => (
                    <MenuItem key={group._id} value={group.name}>
                      <Checkbox checked={formData.groupemail.includes(group.name)} />
                      <ListItemText primary={group.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }
