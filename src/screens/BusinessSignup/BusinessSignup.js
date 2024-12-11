import React, { useState } from "react";
import {
  Grid,
  TextField,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Autocomplete } from "@react-google-maps/api";
import Header from "../../components/Header/Header";
import FlashMessage from "../../components/FlashMessage";

function BusinessSignup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    contactName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.businessName) return "Business name is required";
    if (!formData.address) return "Business address is required";
    if (!formData.contactName) return "Contact name is required";
    if (!formData.phoneNumber) return "Phone number is required";
    if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber))
      return "Invalid phone number";
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
      // Here you would make your API call to submit the business application
      console.log("Submitting business application:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError("Application submitted successfully!");
    } catch (err) {
      setError("Failed to submit application. Please try again.");
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
            severity={error.includes("successfully") ? "success" : "error"}
            alertMessage={error}
            open={!!error}
            handleClose={() => setError("")}
          />
        )}

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
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete>
                <TextField
                  required
                  fullWidth
                  label="Business Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Autocomplete>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Contact Person Name"
                value={formData.contactName}
                onChange={(e) =>
                  setFormData({ ...formData, contactName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                helperText="Enter phone number with country code"
              />
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
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Grid>
  );
}

export default BusinessSignup;
