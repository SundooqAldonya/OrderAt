import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
} from "@mui/material";

const apps = [
  {
    name: "Customer App",
    description:
      "Order from nearby restaurants, track your delivery and enjoy deals.",
    image:
      "https://multivendor.enatega.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FCustomerApp.be70f376.png&w=1920&q=75",
    playStoreLink: "#",
    appStoreLink: "#",
  },
  {
    name: "Driver App",
    description:
      "Get delivery requests, navigate efficiently and manage your orders.",
    image:
      "https://multivendor.enatega.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FriderApp.64bc8592.png&w=1920&q=75",
    playStoreLink: "#",
    appStoreLink: "#",
  },
  {
    name: "Business App",
    description:
      "Manage your restaurant, track orders and view performance analytics.",
    image:
      "https://multivendor.enatega.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FrestaurantApp.faedb86e.png&w=1920&q=75",
    playStoreLink: "#",
    appStoreLink: "#",
  },
];

const AppsSection = () => {
  return (
    <Box sx={{ py: 6, px: 3, backgroundColor: "#fff" }}>
      <Typography variant="h4" align="center" gutterBottom>
        Explore Our Apps
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {apps.map((app, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 4,
              }}
            >
              <CardMedia
                component="img"
                height="300"
                image={app.image}
                alt={`${app.name} image`}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {app.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {app.description}
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    href={app.playStoreLink}
                    target="_blank"
                  >
                    Google Play
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    href={app.appStoreLink}
                    target="_blank"
                  >
                    App Store
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppsSection;
