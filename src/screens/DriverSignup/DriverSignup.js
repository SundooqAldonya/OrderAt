import React, { useState } from "react";
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
import Footer from "../../components/Footer/Footer";
import FlashMessage from '../../components/FlashMessage';
import useStyles from "./styles";

function DriverSignup() {
  const { t } = useTranslation();
  const classes = useStyles();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    vehicleType: 'motorcycle'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.name) return t("nameRequired");
    if (!formData.phoneNumber) return t("phoneNumberRequired");
    if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber)) return t("invalidPhoneNumber");
    if (!formData.vehicleType) return t("vehicleTypeRequired");
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
      // Giả sử gọi API
      console.log('Submitting driver application:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(t("applicationSuccess"));
    } catch (err) {
      setError(t("applicationFail"));
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
            severity={error.includes(t("applicationSuccess")) ? 'success' : 'error'}
            alertMessage={error}
            open={!!error}
            handleClose={() => setError('')}
          />
        )}

        <Typography variant="h4" gutterBottom>
          {t("driveWithOrderatTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("driveWithOrderatDesc")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t("fullNameLabel")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t("phoneNumberLabel")}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                helperText={t("phoneNumberHelper")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t("vehicleTypeLabel")}</FormLabel>
                <RadioGroup
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                >
                  <FormControlLabel value="bicycle" control={<Radio />} label={t("bicycleLabel")} />
                  <FormControlLabel value="motorcycle" control={<Radio />} label={t("motorcycleLabel")} />
                  <FormControlLabel value="car" control={<Radio />} label={t("carLabel")} />
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
                {loading ? t("submitting") : t("submitApplication")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Box className={classes.footerContainer}>
        <Box className={classes.footerWrapper}>
          <Footer />
        </Box>
      </Box>
    </Grid>
  );
}

export default DriverSignup; 