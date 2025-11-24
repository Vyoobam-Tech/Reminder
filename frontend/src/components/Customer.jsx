import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
import API from "../api/axiosInstance";
import {
  Container,
  Typography,
  Button,
  Paper,
  Input,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  FormHelperText,
  IconButton,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import * as XLSX from "xlsx";
import { MdDelete, MdEdit } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";


export default function Customer() {
  const {t, i18n} = useTranslation()
  const [language,setLanguage] = useState('en')
  const [search,setSearch] = useState('')
  const [searchResults,setSearchResults] = useState([])
  const [file, setFile] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [reminderEdit, setReminderEdit] = useState({
    open: false,
    id: null,
    value: null,
  });
  const [newCustomerDialog, setNewCustomerDialog] = useState(false);
  const [error,setError] = useState({})
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    purchaseDate: "",
    note: "",
    address: "", 
    dob: "", 
    preferredDelivery: [],
    
  });
  const fileInputRef = useRef();
  const deliveryOptions = ["email", "sms", "whatsapp"];

  useEffect(() => {
    if (newCustomerDialog) {
      setLanguage("en");        // dropdown resets
      i18n.changeLanguage("en"); // form labels reset
    }
  }, [newCustomerDialog]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setLanguage(lng)
  }

  useEffect(() => {
      const filterResults = customers.filter((customer) => 
        ((customer.name).toLowerCase()).startsWith(search.toLowerCase()))
      setSearchResults(filterResults.reverse())
      },[customers,search])

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get("/api/customers");
      setCustomers(res.data);
    } catch {
      alert("Failed to fetch customers");
    }
  };
  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const fileBuffer = XLSX.write(workbook, {
      type: "array",
      bookType: "xlsx",
    });
    const formData = new FormData();
    formData.append("file", new Blob([fileBuffer]), "uploaded.xlsx");

    try {
      const res = await API.post(
        "/api/customers/upload",
        formData,
      );
      const { insertedCount, skipped = [] } = res.data;

      let msg = `✅ Upload successful\nInserted: ${insertedCount}`;
      if (skipped.length) {
        msg += `\nSkipped Duplicates:\n${skipped.map((c) => `${c.name} (${c.email || c.phone})`).join("\n")}`;
      }
      alert(msg);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  //sample Download Excel
   const handleDownloadSample = () => {
    const sampleData = [
      {
        
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        purchaseDate: "2025-05-07",
        note: "Repeat customer",
        address: "123 Street",
        dob: "1990-01-01",
        preferredDelivery: ["email","sms"],
        
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sample_customer.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch {
      alert("Delete failed");
    }
  };

  const handleEditOpen = (c) => setEditCustomer({ ...c });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "preferredDelivery") {
      setEditCustomer((prev) => ({
        ...prev,
        preferredDelivery: typeof value === "string" ? value.split(",") : value,
      }));
    } else {
      setEditCustomer({ ...editCustomer, [name]: value });
    }
  };

  const handleEditSave = async () => {
    try {
      await API.put(
        `/api/customers/${editCustomer._id}`,
        editCustomer,
      );
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      setError({api:err.response?.data?.message || "Failed to Edit customer"});
    }
  };

  const handleReminderEditOpen = (id, value) => {
    setReminderEdit({
      open: true,
      id,
      value: value ? new Date(value) : new Date(),
    });
  };

  const handleReminderEditSave = async () => {
    try {
      const formattedDate = reminderEdit.value
        ? new Date(reminderEdit.value).toISOString()
        : null;
      await API.put(
        `/api/customers/${reminderEdit.id}`,
        {
          reminderDate: formattedDate,
        },
      );
      setReminderEdit({ open: false, id: null, value: null });
      fetchCustomers();
    } catch {
      alert("Failed to save reminder");
    }
  };

  const handleNoteChange = async (id, note) => {
    await API.put(`/api/customers/${id}`, { note });
    fetchCustomers();
  };

  const handleNewCustomerChange = (e) => {
    const { name, value } = e.target;
    if (name === "preferredDelivery") {
      setNewCustomer((prev) => ({
        ...prev,
        preferredDelivery: typeof value === "string" ? value.split(",") : value,
      }));
    } else {
      setNewCustomer({ ...newCustomer, [name]: value });
    }
  };

  const handleAddCustomer = async () => {
    let newErrors = {}

    if (!newCustomer.name) newErrors.name = 'Name is required'
    if (!newCustomer.email) newErrors.email = 'Email is required'
    if (!newCustomer.phone) {
    newErrors.phone = "Phone is required";
    }
    else if (!/^\d{10}$/.test(newCustomer.phone)) {
    newErrors.phone = "Phone must be exactly 10 digits";
    }
    if (newCustomer.preferredDelivery.length === 0 ){
    newErrors.preferredDelivery = 'Preferred Delivery is required'
    }
    if (Object.keys(newErrors).length > 0) {
      setError(newErrors)
      return
    }

    setError({})

    try {
      await API.post("/api/customers", newCustomer);
      setNewCustomerDialog(false);
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        purchaseDate: "",
        note: "",
        address: "",
        dob: "",
        preferredDelivery: [],
      });
      fetchCustomers();
    } catch (err) {
      setError({api:err.response?.data?.message || "Failed to add customer"});
    }
  };

  const columns = [
    {field:"id", headerName:"Sr.No",width:80},
    {field:"name", headerName:"Name",width:150},
    {field:"email", headerName:"Email",width:200},
    {field:"phone", headerName:"Phone",width:140},
    {field:"purchaseDate", headerName:"Purchase Date",width:105},
    {field:"note", headerName:"Note",width:200},
    {field:"address", headerName:"Address",width:150},
    {field:"dob", headerName:"DOB",width:105},
    {field:"preferredDelivery", headerName:"preferred Delivery",width:120},
    {
      field:"actions",
      headerName:"Actions",
      width:150,
      renderCell:(params) => (
        <>
          <Button size="small" onClick={() => handleEditOpen(params.row)}>
            <MdEdit size={25}/>
          </Button>
          <Button
            size="small"
            color="error"
            onClick={() => handleDelete(params.row._id)}
          >
            <MdDelete size={25}/>
          </Button>
        </>
      )
    }
  ]

  const rows = customers.filter((c) => c.name.toLowerCase().startsWith(search.toLowerCase())
  ).map((c, idx) => ({
    id: idx + 1,
    ...c,
    purchaseDate: c.purchaseDate ? c.purchaseDate.split("T")[0] : "",
    dob: c.dob ? c.dob.split("T")[0] : "",
  }
  ))

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Customer Management
        </Typography>

        <Paper sx={{ p: 2, mb: 4 }}>
          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            {/* <Input
              type="file"
              inputRef={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button variant="contained" onClick={handleUpload}>
              Upload Excel
            </Button>
            <Button variant="contained" color="secondary" onClick={handleDownloadSample}>
              Download Sample
            </Button> */}
            <Button
              variant="contained"
              onClick={() => setNewCustomerDialog(true)}
            >
              Add Customer
            </Button>
            <TextField 
              type='text'
              name='search'
              placeholder='Search'
              onChange={(e) => setSearch(e.target.value)}
            />
          </Box>
        </Paper>

        <div>
          <DataGrid style={{ height: 500, width: "100%"}}
            columns={columns}
            rows={rows}
            // disableRowSelectionOnClick
            // checkboxSelection
          />
        </div>

        {/* Reminder Dialog */}
        <Dialog
          open={reminderEdit.open}
          onClose={() =>
            setReminderEdit({ open: false, id: null, value: null })
          }
        >
          <DialogTitle>Set Reminder</DialogTitle>
          <DialogContent>
            <DateTimePicker
              label="Reminder Date"
              value={reminderEdit.value}
              onChange={(newValue) =>
                setReminderEdit((prev) => ({ ...prev, value: newValue }))
              }
              minDateTime={new Date()}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setReminderEdit({ open: false, id: null, value: null })
              }
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleReminderEditSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Customer Dialog */}
        <Dialog
          open={newCustomerDialog}
          onClose={() => setNewCustomerDialog(false)}
        >
          {/* <DialogTitle> */}
            <DialogTitle sx={{ color: 'white', bgcolor: '#1976D2', display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>Add New Customer<IconButton onClick={() => setNewCustomerDialog(false)} color="dark"> <CloseIcon sx={{ color: "white" }} /> </IconButton> </DialogTitle>
            {/* <Box display="flex" alignItems="center" justifyContent="space-between"> */}
              {/* <Typography variant="h6">{t("addNewCustomer")}</Typography> */}
                {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Language</InputLabel>
                    <Select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="ta">தமிழ்</MenuItem>
                      <MenuItem value="hi">हिंदी</MenuItem>
                    </Select>
                </FormControl> */}
            {/* </Box> */}
          {/* </DialogTitle> */}

          {error.api && (
            <Box display="flex" justifyContent="center">
              <Typography textAlign="center" color="error" variant="body2">
              {error.api}
              </Typography>
            </Box>
          )}

          <DialogContent>
            <TextField
              label={t("name")}
              name="name"
              fullWidth
              required
              margin="dense"
              value={newCustomer.name}
              onChange={handleNewCustomerChange}
              error={!newCustomer.name}
              helperText={error.name}
            />
            <TextField
              label={t("email")}
              name="email"
              fullWidth
              required
              margin="dense"
              value={newCustomer.email}
              onChange={handleNewCustomerChange}
              error={!newCustomer.email}
              helperText={error.email}
            />
            <TextField
              label={t("phone")}
              name="phone"
              fullWidth
              required
              margin="dense"
              value={newCustomer.phone}
              onChange={handleNewCustomerChange}
              error={!newCustomer.phone}
              helperText={error.phone}
            />
            <TextField
              label={t("purchaseDate")}
              name="purchaseDate"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={newCustomer?.purchaseDate ? newCustomer.purchaseDate.split("T")[0] : ""}
              onChange={handleNewCustomerChange}
            />
            <TextField
              label={t("note")}
              name="note"
              fullWidth
              margin="dense"
              value={newCustomer.note}
              onChange={handleNewCustomerChange}
            />
            <TextField
              label={t("address")}
              name="address"
              fullWidth
              margin="dense"
              value={newCustomer.address}
              onChange={handleNewCustomerChange}
            />

            <TextField
              label={t("dob")}
              name="dob"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={newCustomer.dob}
              onChange={handleNewCustomerChange}
            />

            <FormControl fullWidth margin="dense" error={Boolean(error.preferredDelivery)}>
              <InputLabel id="preferred-label">{t("preferredDelivery")}</InputLabel>
              <Select
                labelId="preferred-label"
                multiple
                name="preferredDelivery"
                input={<OutlinedInput label='preferredDelivery' />}
                value={newCustomer.preferredDelivery}
                onChange={handleNewCustomerChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {deliveryOptions.map((method) => (
                  <MenuItem key={method} value={method} >
                    <Checkbox
                      checked={newCustomer.preferredDelivery.includes(method)}
                    />
                    <ListItemText primary={method.toUpperCase()} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{error.preferredDelivery}</FormHelperText>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewCustomerDialog(false)}>{t("cancel")}</Button>
            <Button variant="contained" onClick={handleAddCustomer}>
              {t("add")}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={!!editCustomer} onClose={() => setEditCustomer(null)}>
            <DialogTitle sx={{ color: 'white', bgcolor: '#1976D2', display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>Edit Customer<IconButton onClick={() => setEditCustomer(false)} color="dark"> <CloseIcon sx={{ color: "white" }} /> </IconButton> </DialogTitle>

          {error.api && (
            <Box display="flex" justifyContent="center">
              <Typography textAlign="center" color="error" variant="body2">
              {error.api}
              </Typography>
            </Box>
          )}
          <DialogContent>
            <TextField
              label="Name"
              name="name"
              fullWidth
              margin="dense"
              value={editCustomer?.name || ""}
              onChange={handleEditChange}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="dense"
              value={editCustomer?.email || ""}
              onChange={handleEditChange}
            />
            <TextField
              label="Phone"
              name="phone"
              fullWidth
              margin="dense"
              value={editCustomer?.phone || ""}
              onChange={handleEditChange}
            />
            <TextField
              label="Note"
              name="note"
              fullWidth
              margin="dense"
              value={editCustomer?.note || ""}
              onChange={handleEditChange}
            />
            <TextField
              label="Address"
              name="address"
              fullWidth
              margin="dense"
              value={editCustomer?.address || ""}
              onChange={handleEditChange}
            />

            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={editCustomer?.dob || ""}
              onChange={handleEditChange}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="edit-preferred-label">
                Preferred Delivery
              </InputLabel>
              <Select
                labelId="edit-preferred-label"
                multiple
                name="preferredDelivery"
                input={<OutlinedInput label="Preferred Delivery" />}
                value={editCustomer?.preferredDelivery || []}
                onChange={handleEditChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {deliveryOptions.map((method) => (
                  <MenuItem key={method} value={method}>
                    <Checkbox
                      checked={editCustomer?.preferredDelivery?.includes(
                        method,
                      )}
                    />
                    <ListItemText primary={method.toUpperCase()} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSave}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
