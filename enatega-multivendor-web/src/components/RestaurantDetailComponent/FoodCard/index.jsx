import React, { useContext } from "react";
import { Box, Button, Grid, Typography, useTheme } from "@mui/material";
import ConfigurationContext from "../../../context/Configuration";
import AddIcon from "@mui/icons-material/Add";

const FoodCard = ({
  title,
  discount,
  image,
  variations,
  onClick,
  restaurant,
  food,
}) => {
  const configuration = useContext(ConfigurationContext);
  const theme = useTheme();
  return (
    <Grid
      item
      sm={12}
      md={3}
      sx={{
        width: "100%",
        minHeight: 300,
        cursor: "pointer",
      }}
      onClick={() => onClick({ ...food, ...restaurant })}
    >
      <Box
        sx={{ width: "100%", height: 150, borderRadius: 2, overflow: "hidden" }}
      >
        <img
          src={
            image
              ? image
              : "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          }
          alt={title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>
      <Box
        mt={2}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingInline: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",

            paddingInline: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
          <Typography>{`${configuration.currencySymbol} ${parseFloat(
            variations[0].price + variations[0].discounted
          ).toFixed(2)}`}</Typography>
        </Box>
        <Box>
          <Button>
            <AddIcon style={{ color: theme.palette.common.green }} />
          </Button>
        </Box>
      </Box>
    </Grid>
  );
};

export default FoodCard;
