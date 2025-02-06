import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import React, { useContext } from "react";
import ConfigurationContext from "../../../context/Configuration";
import useStyles from "./styles";
import FoodCard from "../FoodCard";

function ItemCard(props) {
  const theme = useTheme();
  const { title, foods } = props;
  const classes = useStyles();
  const configuration = useContext(ConfigurationContext);

  return (
    <Container
      className={classes.cardContainer}
      sx={{ maxWidth: "100% !important" }}
    >
      <Typography
        variant="h5"
        color="textSecondary"
        className={`${classes.titleText} ${classes.boldText}`}
      >
        {title}
      </Typography>
      <Grid container spacing={2}>
        {foods.map((item) => {
          return (
            <FoodCard
              key={item._id}
              {...item}
              food={item}
              onClick={props.onPress}
              restaurant={props.restaurant}
            />
          );
        })}
        {/* {foods.map((item, index) => (
          <Grid
            key={index}
            item
            xs={12}
            md={4}
            style={{ paddingBottom: "20px" }}
          >
            <Paper
              elevation={1}
              square
              className={classes.itemContainer}
              onClick={() => props.onPress({ ...item, ...props.restaurant })}
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    className={classes.boldText}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="caption" className={classes.itemDesc}>
                    {item.description.length > 80
                      ? `${item.description.substring(0, 80)}...`
                      : item.description}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {`${configuration.currencySymbol} ${parseFloat(
                    item.variations[0].price
                  ).toFixed(2)}`}
                  {item.variations[0].discounted > 0 && (
                    <Typography
                      variant="caption"
                      className={classes.discountText}
                    >
                      {`${configuration.currencySymbol} ${parseFloat(
                        item.variations[0].price + item.variations[0].discounted
                      ).toFixed(2)}`}
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Box
                className={classes.imageContainer}
                style={{
                  // backgroundImage: `url(${item.image})`,
                  borderRadius: 10,
                }}
              >
                <Button className={classes.addContainer}>
                  <AddIcon style={{ color: theme.palette.common.white }} />
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))} */}
      </Grid>
    </Container>
  );
}

export default React.memo(ItemCard);
