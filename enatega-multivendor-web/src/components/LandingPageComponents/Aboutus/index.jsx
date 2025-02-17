import { Box, Grid, Paper, Typography } from "@mui/material";
import { t } from "i18next";
import React, { useState } from "react";

const Aboutus = () => {
  const [data, setData] = useState({
    title: t("aboutus"),
    description: t("about_us_description"),
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
