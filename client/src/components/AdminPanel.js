import React, { useState } from 'react';
import { 
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import EngineerManagement from './EngineerManagement';
import JobManagement from './JobManagement';

function AdminPanel() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3 }}>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Jobs" />
          <Tab label="Engineers" />
          <Tab label="Reports" />
        </Tabs>
      </Box>
      
      <Box sx={{ pt: 3 }}>
        {tabValue === 0 && <JobManagement />}
        {tabValue === 1 && <EngineerManagement />}
        {tabValue === 2 && <Typography>Reports coming soon</Typography>}
      </Box>
    </Container>
  );
}

export default AdminPanel;