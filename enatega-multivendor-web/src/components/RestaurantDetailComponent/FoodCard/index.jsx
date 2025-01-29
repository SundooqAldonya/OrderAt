import React from "react";
import { Box, Grid, Typography } from "@mui/material";

const FoodCard = ({ title, price, discount, image }) => {
  return (
    <Grid
      sm={12}
      md={3}
      sx={{
        width: "100%",
      }}
    >
      <Box sx={{ width: "100%", height: 200 }}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </Box>
      <Box>
        <Typography>{title}</Typography>
        <Typography>{price}</Typography>
      </Box>
    </Grid>
  );
};

export default FoodCard;
