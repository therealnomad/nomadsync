import React from 'react';
import { Typography, Container } from '@mui/material';

function AdminPanel() {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography paragraph>
        Welcome to the administration panel. Here you can manage jobs and engineers.
      </Typography>
      {/* Add your admin functionality here later */}
    </Container>
  );
}

export default AdminPanel;