import React, { useContext,useState } from "react";
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
import { LoginHeader } from "../../components/Header";
import UserContext from "../../context/User";
import FlashMessage from "../../components/FlashMessage";
import Footer from "../../components/Footer/Footer";
import useStyles from "./styles";

function BusinessSignup() {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isLoggedIn } = useContext(UserContext);
  const [formData, setFormData] = useState({
    businessName: "",
    address: "",
    contactName: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.businessName) return t("businessNameRequired");
    if (!formData.address) return t("businessAddressRequired");
    if (!formData.contactName) return t("contactNameRequired");
    if (!formData.phoneNumber) return t("phoneNumberRequired");
    if (!/^\+?[\d\s-]{8,}$/.test(formData.phoneNumber))
      return t("invalidPhoneNumber");
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
      // Giả sử gọi API ở đây
      console.log("Submitting business application:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setError(t("applicationSuccess"));
    } catch (err) {
      setError(t("applicationFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container>
      {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
      <Container maxWidth="md" sx={{ mt: 12, mb: 8 }}>
        {error && (
          <FlashMessage
            severity={error.includes(t("applicationSuccess")) ? "success" : "error"}
            alertMessage={error}
            open={!!error}
            handleClose={() => setError("")}
          />
        )}

        <Typography variant="h4" gutterBottom>
          {t("addYourBusinessTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t("addYourBusinessDesc")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t("businessNameLabel")}
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
                  label={t("businessAddressLabel")}
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
                label={t("contactPersonNameLabel")}
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
                label={t("phoneNumberLabel")}
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                helperText={t("phoneNumberHelper")}
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

export default BusinessSignup;
