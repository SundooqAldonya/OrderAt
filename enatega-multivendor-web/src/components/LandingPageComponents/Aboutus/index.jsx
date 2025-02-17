import { Box, Grid, Paper, Typography } from "@mui/material";
import React, { useState } from "react";

const Aboutus = () => {
  const [data, setData] = useState({
    title: "About us",
    description:
      "Ordrat is an advanced delivery platform that connects businesses, customers, and delivery technicians in a seamless experience. Whether you’re looking to expand your business, earn extra income as a delivery captain, or order products easily – we’re here to serve you.",
    image:
      "https://images.unsplash.com/photo-1602306834394-6c8b7ea0ed9d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  });

  return (
    <Box style={{ height: "auto", marginBlock: 40 }}>
      <Grid style={{ height: "100%" }} container spacing={2}>
        <Grid item sm={12} md={6} style={{ marginInline: "auto" }}>
          <Box sx={{ padding: 2, textAlign: "center" }}>
            <Typography variant="h6">{data?.title}</Typography>
            <Typography variant="h6">{data?.description}</Typography>
          </Box>
        </Grid>
        {/* <Grid item xs={12} sm={6} md={6} lg={6}>
          <Box
            sx={{
              padding: 2,
              textAlign: "center",
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.3),rgba(0, 0, 0, 0.3)),url(${data?.image})`,
              backgroundSize: "cover",
              height: "100%",
            }}
          ></Box>
        </Grid> */}
      </Grid>
    </Box>
  );
};

export default Aboutus;
