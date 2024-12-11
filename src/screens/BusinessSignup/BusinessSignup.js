import React, { useState } from 'react';
import { Grid, TextField, Typography, Button, Box, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@react-google-maps/api';
import Header from '../../components/Header/Header';

function BusinessSignup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    contactName: '',
    phoneNumber: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
  };

  return (
    <Grid container>
      <Header />
      <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
        <Typography variant="h4" gutterBottom>
          Add Your Business
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Partner with us and reach more customers
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Business Name"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete>
                <TextField
                  required
                  fullWidth
                  label="Business Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </Autocomplete>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Contact Person Name"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Submit Application
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Grid>
  );
}

export default BusinessSignup; 