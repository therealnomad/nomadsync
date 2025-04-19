import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/jobs/assigned', {
          headers: { 'x-access-token': token }
        });
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    
    fetchJobs();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Today's Jobs
      </Typography>
      <List>
        {jobs.map(job => (
          <ListItem key={job.id} divider>
            <ListItemText
              primary={job.title}
              secondary={`${job.customer_name} - ${job.customer_address}`}
            />
            <Button 
              variant="contained" 
              onClick={() => navigate(`/job/${job.id}`)}
            >
              View Details
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Dashboard;