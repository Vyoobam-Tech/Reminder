import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api/axiosInstance';
import {
  Container, Typography, Paper, Button, TextField, Autocomplete, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Checkbox,
  Box
} from '@mui/material';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../components/ConfirmDialog';

function GroupManager() {
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [error, setError] = useState({})
  const [openDelete, setOpenDelete] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState(null)

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
    let newErrors ={}

    if(!groupName) newErrors.groupName = "Group Name is required"
    if(selectedIds.length === 0) newErrors.selectedIds = "Customer is required"

    setError(newErrors)

    if (Object.keys(newErrors).length > 0) return;

    try{
      await API.post('/api/groups', {
      name: groupName,
      members: selectedIds
    });

    setGroupName('');
    setSelectedIds([]);
    fetchData();
    } catch(err){
      setError({api: err.response?.data?.message || "Failed to create group"})
    }
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
    await API.delete(`/api/groups/${groupId}`);
    fetchData();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Group Manager
      </Typography>

      {/* Create Group */}
      <Box sx={{ display: "flex", gap: 2 }}>
         {error.api && (
          <Box >
            <Typography color='error' variant='body2'>
              {error.api}
            </Typography>
          </Box>
        )}
        <TextField
          sx={{ width: '250px' }}
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          margin="normal"
          error={!groupName}
          helperText={error.groupName}
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
              sx={{ width: '250px' }}
              label="Select Customers"
              placeholder="Choose customers"
              margin="normal"
              error={!!selectedIds}
              helperText={error.selectedIds}
            />
          )}
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleCreateGroup}>
            Create Group
          </Button>
        </Box>
      </Box>

        <ConfirmDialog
          open={openDelete}
          title="Delete"
          message="Are you sure you want to Delete this Group?"
          confirmText="Delete"
          onConfirm={() => {
            handleDeleteGroup(selectedGroupId);
            setOpenDelete(false)
          }}
          onCancel={() => setOpenDelete(false)}
        />

      {/* Group List */}
      <Typography variant="h6" sx={{ mt: 2 , mb: 2}}>Existing Groups</Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 2,
            mt: 2
          }}
        >
          {groups.map(group => (
            <Paper 
              key={group._id}
              elevation={3}
              sx={{
              p: 2,
              width: 220,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              cursor: "pointer",
              position: "relative",
            }}>
              <Typography>
                {group.name}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>Members: {group.members.length}</Typography>
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setSelectedGroupId(group._id);
                  setOpenDelete(true)
                }
                }
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
              <IconButton
                color='primary'
                onClick={() => openEditDialog(group)}
                sx={{ position: "absolute", top: 6, right: 26 }}
              >
                <EditIcon fontSize='small'/>
              </IconButton>
            </Paper>
          ))}
        </Box>
    </Container>
  );
}

export default GroupManager;
