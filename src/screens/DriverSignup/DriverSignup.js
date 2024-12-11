import React, { useState } from 'react';
import { 
  Grid, 
  TextField, 
  Typography, 
  Button, 
  Box, 
  Container,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header';
import FlashMessage from '../../components/FlashMessage';

function DriverSignup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    vehicleType: 'motorcycle'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.name) return "Name is required";
    if (!formData.phoneNumber) return "Phone number is required";
    if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber)) return "Invalid phone number";
    if (!formData.vehicleType) return "Vehicle type is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    
    try {
      // Here you would make your API call to submit the driver application
      console.log('Submitting driver application:', formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError('Application submitted successfully!');
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container>
      <Header />
      <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
        {error && (
          <FlashMessage
            severity={error.includes('successfully') ? 'success' : 'error'}
            alertMessage={error}
            open={!!error}
            handleClose={() => setError('')}
          />
        )}
        
        <Typography variant="h4" gutterBottom>
          Drive with Orderat
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Join our delivery team and earn money on your own schedule
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                helperText="Enter phone number with country code"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Vehicle Type</FormLabel>
                <RadioGroup
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                >
                  <FormControlLabel value="bicycle" control={<Radio />} label="Bicycle" />
                  <FormControlLabel value="motorcycle" control={<Radio />} label="Motorcycle" />
                  <FormControlLabel value="car" control={<Radio />} label="Car" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Grid>
  );
}

export default DriverSignup; 