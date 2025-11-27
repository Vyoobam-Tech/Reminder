import React, { useEffect, useMemo, useState } from 'react';
import API from '../api/axiosInstance';
import {
    Container, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Box,
    Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel, OutlinedInput, Autocomplete,
    IconButton, InputAdornment,
    Grid,
    CircularProgress
  } from '@mui/material';
import { MdDelete, MdEdit, MdImage, MdVideoLibrary } from "react-icons/md";
import CloseIcon from "@mui/icons-material/Close";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

ModuleRegistry.registerModules([AllCommunityModule]);



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
    const [search, setSearch] = useState('')
    const [searchType, setSearchType] = useState('')
    const [searchDate, setSearchDate] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [rowData, setRowData] = useState([])
    const [loading, setLoading] = useState(false);


    const [columDefs] = useState([
      {headerName: "Title", field: 'title',  headerClass: "ag-header-bold",  width: 120,},
      {headerName: "Type", field: 'type',  headerClass: "ag-header-bold",  width: 120,},
      {headerName: "Notes", field: 'notes',  headerClass: "ag-header-bold",  width: 120,},
      {
        headerName: "Date",
        field: "date",
        headerClass: "ag-header-bold",
        valueFormatter: (params) =>
          new Date(params.value).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      },

      {headerName: "Recurrence", field: 'recurrence', headerClass: "ag-header-bold", width: 120},
      {
      headerName: "Actions",
      field: "actions",
      headerClass: "ag-header-bold",
      width: 120,
      filter: false,
      cellRenderer: (params) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton
            onClick={() => handleOpen(params.data)}
            color="primary"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              handleDelete(params.data._id);
              setConfirmOpen(true);
            }}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ])

    useEffect(() => {
      let results = reminders;

      if (search.trim()) {
        results = results.filter(r =>
          r.title.toLowerCase().includes(search.toLowerCase())
        )
      }

      if (searchType.trim()) {
        results = results.filter(r =>
          r.type.toLowerCase() === searchType.toLowerCase()
        )
      }


      if (searchDate.trim()) {
        results = results.filter(r => {
          if (!r.date) return false  // skip null/undefined
          const d = new Date(r.date)
          if (isNaN(d)) return false // skip invalid date
          return d.toISOString().slice(0, 10) === searchDate
        })
      }

      setSearchResults(results)
    }, [reminders, search, searchType, searchDate])

    const handleReset = () => {
      setSearch('')
      setSearchType('')
      setSearchDate('')
    }



    useEffect(() => {
      fetchReminders();
      fetchEmailGroups();
      fetchCustomers();
    }, []);

    const fetchReminders = async () => {
      try {
        setLoading(true);  // start loader
        const res = await API.get('/api/reminders');

        const sorted = res.data.sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setReminders(sorted);
        setRowData(sorted);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false); // stop loader
      }
    };


    const fetchEmailGroups = async () => {
      const res = await API.get('/api/groups');
      setEmailGroups(res.data);
    };

    const fetchCustomers = async () => {
      const res = await API.get('/api/customers');
      setCustomers(res.data);
    };

    const handleOpen = async (reminder = null) => {
  if (reminder) {

    setFormData({
      ...reminder,
      image: reminder.image || null,
      video: reminder.video || null,
      date: reminder.date
        ? new Date(new Date(reminder.date).getTime() - new Date().getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        : "",
      deliveryMethods: reminder.deliveryMethods || [],
      email: reminder.email || '',
      phone: reminder.phone || '',
      whatsapp: reminder.whatsapp || '',
      groupemail: reminder.groupemail || []
    });

    setEditId(reminder._id);

    // ⭐ Load recipient type
    if (reminder.recipients?.length > 0) {
      setRecipientType("Individual");
      setSelectedRecipients(reminder.recipients);

      // Load customers
      const res = await API.get('/api/customers');
      setCustomerOptions(res.data);

    } else if (reminder.groups?.length > 0) {
      setRecipientType("Group");
      setSelectedRecipients(reminder.groups);

      // Load groups
      const res = await API.get('/api/groups');
      setGroupOptions(res.data);
    }

  } else {
    // NEW REMAINDER
    setFormData({
      title: '',
      type: 'Custom',
      notes: '',
      image: null,
      video: null,
      date: '',
      recurrence: 'One-time',
      deliveryMethods: [],
      email: '',
      phone: '',
      whatsapp: '',
      groupemail: []
    });

    setRecipientType("");
    setSelectedRecipients([]);
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
        await API.delete(`/api/reminders/${id}`);
        fetchReminders();
    };

    const handleRecipientType = async(e) => {
      const value = e.target.value
      setRecipientType(value)
      setSelectedRecipients([])

      setFormData(prev => ({
        ...prev,
        recipients: [],
        groups: []
      }));

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

    const defaultColDef = useMemo(
        () => ({
          filter: "agTextColumnFilter",
          floatingFilter: true,
        }),
        []
      )

    return (
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom> Reminder Management</Typography>
        <Box mb={2}><Button variant="contained" onClick={() => handleOpen()}>Add Reminder</Button></Box>

        <Typography variant='h6' fontWeight="bold">Search By</Typography>
        <Box mb={2} />
          <Box mb={6} display="flex" gap={2}>
            <TextField
              label="Title"
              value={search}
              variant='outlined'
              size='small'
              sx={{ maxWidth:160 }}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {reminderTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date"
              type='date'
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant='outlined'
              size='small'
              sx={{ maxWidth:200 }}
            />
            <Button variant='contained' color='error' onClick={handleReset}>
              Reset
            </Button>
          </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress />
          </Box>
        ) : (
          <div className="ag-theme-alpine" style={{ width: '100%', height: 'auto' }}>
            <AgGridReact
              rowData={searchResults}
              columnDefs={columDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              pagination={true}
              paginationPageSize={10}
              onGridReady={(params) => params.api.sizeColumnsToFit()}
            />
          </div>
        )}


        {/* Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle sx={{ color: 'white', bgcolor: '#1976D2', display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>{editId ? 'Edit' : 'Create'} Reminder<IconButton onClick={() => setDialogOpen(false)} color="dark"> <CloseIcon sx={{ color: "white" }} /> </IconButton> </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
            
                <TextField 
                  fullWidth 
                  margin="dense" 
                  label="Title" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  error={!formData.title}
                  helperText={error.title}
                />

                <TextField select fullWidth margin="dense" label="Type" name="type" value={formData.type} onChange={handleChange}>
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
                  error={!formData.date}
                  helperText={error.date}
              />

              <TextField select fullWidth margin="dense" label="Recurrence" name="recurrence" value={formData.recurrence} onChange={handleChange}>
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

            <Box sx={{ width: "100%" }}>
              {recipientType === "Individual" && (
                <Autocomplete
                  multiple
                  options={customerOptions}
                  getOptionLabel={(option) => option.name}
                  value={customerOptions.filter((c) => selectedRecipients.includes(c._id))}
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
                      label="Select Customers"
                      margin="dense"
                      fullWidth
                      error={!!error.selectedRecipients}
                      helperText={error.selectedRecipients}
                    />
                  )}
                />
              )}
            </Box>


            <Box sx={{ width: "100%"}}>
              {recipientType === 'Group' && (
                <Autocomplete
                  multiple
                  options={groupOptions}
                  getOptionLabel={(option) => option.name}
                  value={groupOptions.filter((g) => selectedRecipients.includes(g._id))}
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
                      label="Select Groups"
                      margin="dense"
                      fullWidth
                      error={!!error.selectedRecipients}
                      helperText={error.selectedRecipients}
                    />
                  )}
                />
              )}
            </Box>


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
                      {formData.image && (
                        <Typography sx={{ mt: 1, fontSize: "14px", color: "green" }}>
                          {formData.image.name || formData.image.originalname || formData.image.filename}
                        </Typography>
                      )}
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
                      {formData.video && (
                        <Typography sx={{ mt: 1, fontSize: "14px", color: "purple" }}>
                          {formData.video.name || formData.video.originalname || formData.video.filename}
                        </Typography>
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />


            {/* {formData.deliveryMethods.includes('email') && (
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
            )} */}
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
