import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

export default function JobManagement() {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState({
    title: '',
    description: '',
    customer_name: '',
    customer_address: '',
    scheduled_date: '',
    assigned_to: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  // Error handling
const [error, setError] = useState(null);

const fetchJobs = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/jobs', {
      headers: { 'x-access-token': token }
    });
    setJobs(response.data);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    setError(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

const handleCreateJob = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/api/jobs', currentJob, {
      headers: { 'x-access-token': token }
    });
    fetchJobs();
    setOpen(false);
    setCurrentJob({
      title: '',
      description: '',
      customer_name: '',
      customer_address: '',
      scheduled_date: '',
      assigned_to: ''
    });
  } catch (error) {
    console.error('Error creating job:', error);
    setError(error.response?.data?.message || 'Failed to create job');
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
          Create Job
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.customer_name}</TableCell>
                <TableCell>{new Date(job.scheduled_date).toLocaleDateString()}</TableCell>
                <TableCell>{job.assigned_to_name || 'Unassigned'}</TableCell>
                <TableCell>
                  <IconButton>
                    <Edit />
                  </IconButton>
                  <IconButton>
                    <Delete />
                  </IconButton>
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
        <DialogTitle>Create New Job</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            fullWidth
            value={currentJob.title}
            onChange={(e) => setCurrentJob({...currentJob, title: e.target.value})}
          />
          {/* Add other job fields similarly */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setError(null);
            }}>Cancel</Button>
          <Button 
            onClick={handleCreateJob}
            variant="contained" 
            disabled={!currentJob.title || !currentJob.customer_name}
          >Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}