import { Box, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
  const { t } = useTranslation();
  const email = "info@orderatco.com";

  const classes = useStyles();
  const theme = useTheme();

  const redirectHandler = (link) => {
    window.open(link, "_blank");
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, mt: 8, height: 250 }}>
      <Grid sx={{ height: "100%" }} container spacing={2}>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          sx={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box sx={{ padding: 2 }}>
            <Typography variant="h3">{t("contactus")}</Typography>
            <Box
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Box
                className={classes.iconContainer}
                onClick={() =>
                  redirectHandler("https://www.facebook.com/orderategypt")
                }
              >
                <FacebookIcon style={{ color: theme.palette.common.white }} />
              </Box>
              <Box
                className={classes.iconContainer}
                style={{ marginLeft: 10 }}
                onClick={() =>
                  redirectHandler("https://www.instagram.com/orderategypt")
                }
              >
                <InstagramIcon style={{ color: theme.palette.common.white }} />
              </Box>
              <Box
                className={classes.iconContainer}
                style={{ marginLeft: 10 }}
                onClick={() => redirectHandler("https://wa.me/+201501662775")}
              >
                <WhatsAppIcon style={{ color: theme.palette.common.white }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h6">{t("facing_problem")}</Typography>
              <Typography variant="h6">{t("contact_email")}</Typography>
              <Typography variant="h6">{email}</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactUs;
