import React, { useEffect, useState } from "react";
import { ImManWoman } from "react-icons/im";
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
  MenuList,
  MenuItem,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
// import axios from "axios";
import API from "../api/axiosInstance";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";


const Employee = () => {

  const {t, i18n} = useTranslation()
  const [language,setLanguage] = useState("en")
  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [newEmployeeDialog, setNewEmployeeDialog] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    empid: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    bloodgroup: "",
    doj: "",
    department: "",
  });

  useEffect(() => {
  if (newEmployeeDialog) {
    setLanguage("en");        // dropdown resets
    i18n.changeLanguage("en"); // form labels reset
  }
  }, [newEmployeeDialog]);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const res = await API.get("/api/employee");
      setEmployees(res.data);
    } catch {
      alert("Failed to fetch employees");
    }
  };

  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phone) {
      alert("Name, Email, and Phone are required!");
      return;
    }

    try {
      const response = await API.post(
        "/api/employee",
        newEmployee
      );
      setEmployees([...employees, response.data]);
      setNewEmployeeDialog(false);

      setNewEmployee({
        empid: "",
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        bloodgroup: "",
        doj: "",
        department: "",
      });
    } catch (error) {
      alert("Failed to add employee. Try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/employee/${id}`);
      setEmployees(employees.filter((e) => e._id !== id));
    } catch (error) {
      alert("Failed to delete employee. Try again.");
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setLanguage(lng)
  }

  // Columns config for DataGrid
  const columns = [
    { field: "id", headerName: "Sr.No", width: 80 },
    { field: "empid", headerName: "Emp.ID", width: 120 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "phone", headerName: "Phone", width: 140 },
    { field: "dob", headerName: "DOB", width: 105 },
    { field: "address", headerName: "Address", width: 180 },
    { field: "bloodgroup", headerName: "Blood Group", width: 150 },
    { field: "doj", headerName: "Joining Date", width: 105 },
    { field: "department", headerName: "Department", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={() => handleDelete(params.row._id)}
        >
          <MdDelete size={25}/>
        </Button>
      ),
    },
  ];

  // Convert employees into DataGrid rows
  const rows = employees
    .filter((e) =>
      e.name.toLowerCase().startsWith(search.toLowerCase())
    )
    .map((e, idx) => ({
      id: idx + 1,
      ...e,
    }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        <ImManWoman /> Employee Management
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} flexDirection={{ xs: "column", sm: "row" }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => setNewEmployeeDialog(true)}
          >
            Add Employee
          </Button>
          <TextField
            type="text"
            name="search"
            value={search}
            placeholder="Search"
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </Box>
      </Paper>

      {/* ✅ DataGrid with drag & drop columns */}
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          // disableRowSelectionOnClick
          // checkboxSelection
          // experimentalFeatures={{ columnReordering: true }}
        />
      </div>

      {/* Add Employee Dialog */}
      <Dialog
        open={newEmployeeDialog}
        onClose={() => setNewEmployeeDialog(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{t('addNewEmployee')}</Typography>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ta">தமிழ்</MenuItem>
                <MenuItem value="hi">हिंदी</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogTitle>

        <DialogContent>
          {[
            { label: "Emp Id", name: "empid" },
            { label: "Name", name: "name" },
            { label: "Email", name: "email" },
            { label: "Phone", name: "phone" },
            { label: "DOB", name: "dob", type: "date" },
            { label: "Address", name: "address" },
            { label: "Blood Group", name: "bloodgroup" },
            { label: "Date of Joining", name: "doj", type: "date" },
            { label: "Department", name: "department" },
          ].map((field) => (
            <TextField
              key={field.name}
              required={field.name === "empid"||field.name === "name" || field.name === "email" || field.name === "phone"}
              label={t(field.name)}
              name={field.name}
              type={field.type || "text"}
              fullWidth
              margin="dense"
              InputLabelProps={field.type === "date" ? { shrink: true } : {}}
              value={newEmployee[field.name]}
              onChange={handleNewEmployeeChange}
              autoComplete="off"
            />
          ))}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setNewEmployeeDialog(false)}>{t("cancel")}</Button>
          <Button onClick={handleAddEmployee} variant="contained">
            {t("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Employee;
