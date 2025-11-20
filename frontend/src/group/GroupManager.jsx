import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import {
  Container, Typography, Paper, Button, TextField, Autocomplete, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaUserGroup } from "react-icons/fa6";

function GroupManager() {
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [custRes, groupRes] = await Promise.all([
      API.get('/api/customers'),
      API.get('/api/groups'),
    ]);
    setCustomers(custRes.data);
    setGroups(groupRes.data);
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedIds.length === 0) {
      alert('Please provide group name and select members');
      return;
    }

    await API.post('/api/groups', {
      name: groupName,
      members: selectedIds
    });

    setGroupName('');
    setSelectedIds([]);
    fetchData();
  };

  const openEditDialog = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedIds(group.members.map((m) => m._id || m)); // populated or raw IDs
    setEditDialogOpen(true);
  };

  const handleUpdateGroup = async () => {
    await API.put(`/api/groups/${editingGroup._id}`, {
      name: groupName,
      members: selectedIds,
    });

    setEditDialogOpen(false);
    setEditingGroup(null);
    setGroupName('');
    setSelectedIds([]);
    fetchData();
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    await API.delete(`/api/groups/${groupId}`);
    fetchData();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        <FaUserGroup /> Group Manager
      </Typography>

      {/* Create Group */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <TextField
          fullWidth
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          margin="normal"
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          options={customers}
          getOptionLabel={(option) => option.name}
          value={customers.filter(c => selectedIds.includes(c._id))}
          onChange={(event, newValue) => {
            const ids = newValue.map(c => c._id);
            setSelectedIds(ids);
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.name}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Customers"
              placeholder="Choose customers"
              margin="normal"
            />
          )}
        />

        <Button variant="contained" sx={{ mt: 2 }} onClick={handleCreateGroup}>
          Create Group
        </Button>
      </Paper>

      {/* Group List */}
      <Paper sx={{ mt: 4, p: 2 }}>
        <Typography variant="h6" fontWeight="bold">Existing Groups</Typography>
        <ul>
          {groups.map(group => (
            <li key={group._id}>
              <strong
                style={{ cursor: 'pointer', color: '#1976d2' }}
                onClick={() => openEditDialog(group)}
              >
                {group.name}
              </strong> ({group.members.length} members)
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteGroup(group._id)}
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </li>
          ))}
        </ul>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth>
        <DialogTitle>Edit Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
          />
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={customers}
            getOptionLabel={(option) => option.name}
            value={customers.filter(c => selectedIds.includes(c._id))}
            onChange={(event, newValue) => {
              const ids = newValue.map(c => c._id);
              setSelectedIds(ids);
            }}
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox
                  style={{ marginRight: 8 }}
                  checked={selected}
                />
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Customers"
                placeholder="Choose customers"
                margin="normal"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateGroup}>Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default GroupManager;
