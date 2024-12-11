import React from "react";
import { Grid, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from "react-i18next";
import BusinessIcon from "@mui/icons-material/Business";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import GetAppIcon from "@mui/icons-material/GetApp";

function BusinessSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const sectionStyle = {
    padding: "40px 0",
    // backgroundColor: '#f6f6f6',
  };

  const cardStyle = {
    padding: "24px",
    backgroundColor: "#f6f6f6",
    borderRadius: "8px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    transition: "transform 0.2s",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    },
  };

  const iconStyle = {
    fontSize: "48px",
    color: theme.palette.primary.main,
    marginBottom: "16px",
  };

  return (
    <Box sx={sectionStyle}>
      <Grid container spacing={4} maxWidth="lg" margin="0 auto" padding={2}>
        <Grid item xs={12} md={4}>
          <Box sx={cardStyle}>
            <BusinessIcon sx={iconStyle} />
            <Typography variant="h6" gutterBottom>
              Add your business
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Partner with Orderat and reach more customers. We handle delivery,
              so you can focus on the food.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/business-signup")}
              sx={{ mt: "auto" }}
            >
              Get Started
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={cardStyle}>
            <DeliveryDiningIcon sx={iconStyle} />
            <Typography variant="h6" gutterBottom>
              Drive with Orderat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set your own schedule, be your own boss, and earn money by
              delivering with Orderat.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/driver-signup")}
              sx={{ mt: "auto" }}
            >
              Sign up to deliver
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={cardStyle}>
            <GetAppIcon sx={iconStyle} />
            <Typography variant="h6" gutterBottom>
              Download our app
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Get the best Orderat experience with our mobile app.
            </Typography>
            <Grid container spacing={2} sx={{ mt: "auto" }}>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  href="https://play.google.com/store/apps/details?id=multivendor.enatega.restaurant"
                  target="_blank"
                >
                  Android
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  href="https://apps.apple.com/pk/app/enatega-multivendor-restaurant/id1526672537"
                  target="_blank"
                >
                  iOS
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default BusinessSection;
