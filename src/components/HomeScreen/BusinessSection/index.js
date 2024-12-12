import React from "react";
import { Grid, Typography, Button, Box, Container } from "@mui/material";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const cardStyle = {
    padding: isSmall ? "16px" : "24px",
    backgroundColor: "#f6f6f6",
    borderRadius: "10px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "center",
    transition: "transform 0.2s",
    marginBottom: isMobile ? "32px" : "0",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: theme.shadows[4],
    },
  };

  const iconStyle = {
    fontSize: isSmall ? "36px" : "48px",
    color: theme.palette.primary.main,
    marginBottom: "16px",
  };

  const textStyle = {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: isSmall ? "0.85rem" : "1rem",
  };

  const buttonStyle = {
    marginTop: "auto",
    fontSize: isSmall ? "0.75rem" : "1rem",
  };

  return (
    <Box sx={{ backgroundColor: "#ffffff", padding: isSmall ? "20px 0" : "40px 0" }}>
      <Container>
        {/* Box này sẽ bao toàn bộ các card */}
        <Box>
          <Grid container spacing={2}>
            {/* Add Your Business Card */}
            <Grid item xs={12} sm={6} md={4} sx={{ marginTop: "50px" }}>
              <Box sx={cardStyle}>
                <BusinessIcon sx={iconStyle} />
                <Box sx={textStyle}>
                  <Typography variant="body2" color="text.secondary">
                    {t("addYourBusinessDesc")}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/business-signup")}
                  fullWidth={isMobile}
                  sx={buttonStyle}
                >
                  {t("getStarted")}
                </Button>
              </Box>
            </Grid>

            {/* Drive With Us Card */}
            <Grid item xs={12} sm={6} md={4} sx={{ marginTop: "50px" }}>
              <Box sx={cardStyle}>
                <DeliveryDiningIcon sx={iconStyle} />
                <Box sx={textStyle}>
                  <Typography variant="body2" color="text.secondary">
                    {t("driveWithOrderatDesc")}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/driver-signup")}
                  fullWidth={isMobile}
                  sx={buttonStyle}
                >
                  {t("signUpToDeliver")}
                </Button>
              </Box>
            </Grid>

            {/* Download App Card */}
            <Grid item xs={12} sm={6} md={4} sx={{ marginTop: "50px" }}>
              <Box sx={cardStyle}>
                <GetAppIcon sx={iconStyle} />
                <Box sx={textStyle}>
                  <Typography variant="body2" color="text.secondary">
                    {t("downloadOurAppDesc")}
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ marginTop: "auto" }}>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      href="https://play.google.com/store/apps/details?id=multivendor.enatega.restaurant"
                      target="_blank"
                      sx={{ fontSize: isSmall ? "0.75rem" : "1rem" }}
                    >
                      {t("android")}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      href="https://apps.apple.com/pk/app/enatega-multivendor-restaurant/id1526672537"
                      target="_blank"
                      sx={{ fontSize: isSmall ? "0.75rem" : "1rem" }}
                    >
                      {t("ios")}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default BusinessSection;
