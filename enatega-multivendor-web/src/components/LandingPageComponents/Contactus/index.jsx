import { Box, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import useStyles from "./styles";

const ContactUs = () => {
  const image =
    "https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  const classes = useStyles();
  const theme = useTheme();

  const redirectHandler = (link) => {
    window.open(link, "_blank");
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, mt: 8, height: 250 }}>
      <Grid sx={{ height: "100%" }} container spacing={2}>
        {/* <Grid item xs={12} sm={6} md={4} lg={4}>
          <Box
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)), url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
        </Grid> */}
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
            <Typography variant="h3">Contact us</Typography>
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
              <Typography variant="h6">Are you facing a problem?</Typography>
              <Typography variant="h6">Contact us on our Email</Typography>
              <Typography variant="h6">info@orderatco.com</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ContactUs;
