import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, // Add this import
  Button, // Add this import
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Add } from '@mui/icons-material';

export default function EngineerManagement() {
  const [engineers, setEngineers] = useState([]);
  const [open, setOpen] = useState(false);
  const [newEngineer, setNewEngineer] = useState({
    username: '',
    password: '',
    full_name: ''
  });

  useEffect(() => {
    fetchEngineers();
  }, []);

  const fetchEngineers = async () => {
    try {
      const response = await axios.get('/api/users?role=engineer');
      setEngineers(response.data);
    } catch (error) {
      console.error('Error fetching engineers:', error);
    }
  };

  // Add error state
const [error, setError] = useState(null);

const handleCreateEngineer = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/users', {
      ...newEngineer,
      role: 'engineer'
    }, {
      headers: { 'x-access-token': token }
    });
    fetchEngineers();
    setOpen(false);
    setNewEngineer({  // Reset form
      username: '',
      password: '',
      full_name: ''
    });
  } catch (error) {
    console.error('Error creating engineer:', error);
    setError(error.response?.data?.message || 'Failed to create engineer');
  }
};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpen(true)}
        >
          Add Engineer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engineers.map((engineer) => (
              <TableRow key={engineer.id}>
                <TableCell>{engineer.full_name}</TableCell>
                <TableCell>{engineer.username}</TableCell>
                <TableCell>
                  <Button size="small">Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Engineer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            fullWidth
            value={newEngineer.full_name}
            onChange={(e) => setNewEngineer({...newEngineer, full_name: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={newEngineer.username}
            onChange={(e) => setNewEngineer({...newEngineer, username: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newEngineer.password}
            onChange={(e) => setNewEngineer({...newEngineer, password: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setError(null);
      }}>Cancel</Button>
        <Button 
          onClick={handleCreateEngineer}
          variant="contained"
          disabled={!newEngineer.username || !newEngineer.password || !newEngineer.full_name}
          >Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}