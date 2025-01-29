import { Box, Divider, Grid, Paper, Typography, useTheme } from "@mui/material";
import clsx from "clsx";
import React, { useContext, useState, useEffect } from "react";
import ConfigurationContext from "../../../context/Configuration";
import { calculatePrice } from "../../../utils/customFunction";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  calculateDistance,
  calculateAmount,
} from "../../../utils/customFunction";

export default function AmountCard(props) {
  console.log(props, "PROPS@1222");
  const { t } = useTranslation();
  const classes = useStyles();
  const configuration = useContext(ConfigurationContext);

  const [deliveryChargesdata, setDeliveryChargesdata] = useState(0);
  const [isBelowMinimumDistance, setIsBelowMinimumDistance] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    (async () => {
      const destinationObj = JSON.parse(localStorage.getItem("location"));
      const latOrigin = Number(props.restaurant.location.coordinates[1]);
      const lonOrigin = Number(props.restaurant.location.coordinates[0]);
      const latDest = Number(destinationObj.latitude);
      const longDest = Number(destinationObj.longitude);

      const distance = await calculateDistance(
        latOrigin,
        lonOrigin,
        latDest,
        longDest
      );
      console.log(distance, "DISTANCE------------");

      let costType = configuration.costType;

      let calculatedDeliveryFee;

      if (distance < 2) {
        // If the distance is less than 2km, set delivery fee to minimum
        calculatedDeliveryFee = configuration.minimumDeliveryFee;
        setIsBelowMinimumDistance(true);
      } else {
        // Otherwise, calculate the delivery fee
        let amount = calculateAmount(
          costType,
          configuration.deliveryRate,
          distance
        );
        calculatedDeliveryFee =
          amount > 0 ? amount : configuration.deliveryRate;
        setIsBelowMinimumDistance(false);
      }

      // Ensure the calculated delivery fee is not lower than the minimum
      setDeliveryChargesdata(
        Math.max(calculatedDeliveryFee, configuration.minimumDeliveryFee)
      );
    })();
  }, [props, configuration]);

  return (
    <>
      <Grid container item xs={12}>
        <Grid item xs={1} />
        <Grid item xs={10} sm={6} md={4}>
          <Paper style={{ padding: theme.spacing(5) }} elevation={1}>
            <Grid
              container
              className={clsx(classes.cardRow, classes.mv2)}
              // sx={{ height: "auto" }}
            >
              {props.items.map((item) => (
                <React.Fragment key={item._id}>
                  <Grid item xs={1}>
                    <Typography
                      variant="caption"
                      className={`${classes.disabledText} ${classes.mediumBoldText}`}
                    >
                      {`${item.quantity}x`}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography
                      variant="caption"
                      style={{ marginLeft: 5 }}
                      className={`${classes.disabledText} ${classes.mediumText}`}
                    >
                      {`${item.title} ${
                        item.variation.title ? `(${item.variation.title})` : ""
                      }`}
                    </Typography>
                    <Box display="flex" flexDirection="column">
                      {item.addons.map((addon, index) => (
                        <Typography
                          key={index}
                          variant="caption"
                          className={`${classes.disabledText}`}
                        >
                          {addon.options.map((option) => {
                            return (
                              <Box
                                key={option._id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                <Typography>{option.title}</Typography>
                                <Typography>+{option.price}</Typography>
                              </Box>
                            );
                          })}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="caption"
                      className={`${classes.disabledText} ${classes.smallText}`}
                    >
                      {`${configuration.currencySymbol} ${parseFloat(
                        calculatePrice(item)
                      ).toFixed(2)}`}
                    </Typography>
                  </Grid>
                  <Grid md={12} my={2}>
                    <Typography
                      sx={{ fontSize: 18, fontWeight: "bold", color: "#000" }}
                    >
                      {t("specialInstructions")}
                    </Typography>
                    <Typography sx={{ color: "#000" }}>
                      {item.specialInstructions
                        ? item.specialInstructions
                        : null}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} mb={2}>
                    <Divider />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Grid
              container
              className={clsx(classes.cardRow, classes.mv2)}
              mb={5}
            >
              <Grid item xs={9}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {t("subTotal")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {/* {`${configuration.currencySymbol} ${parseFloat(
                    props.orderAmount -
                    deliveryChargesdata -
                      props.taxationAmount -
                      props.tipping
                  ).toFixed(2)}`} */}
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.orderAmount -
                      props.deliveryCharges -
                      props.taxationAmount -
                      props.tipping
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>

            <Grid container className={clsx(classes.cardRow, classes.mv2)}>
              <Grid item xs={9}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {t("tip")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.tipping
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
            <Grid container className={clsx(classes.cardRow, classes.mv2)}>
              <Grid item xs={9}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {t("taxFee")}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}
                >
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.taxationAmount
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
            {!props.isPickedUp && (
              <>
                <Grid container className={clsx(classes.cardRow, classes.mv2)}>
                  <Grid item xs={9}>
                    <Typography
                      variant="body2"
                      className={clsx(classes.disabledText, classes.smallText)}
                    >
                      {t("deliveryFee")}
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="body2"
                      className={clsx(classes.disabledText, classes.smallText)}
                    >
                      {`${configuration.currencySymbol} ${parseFloat(
                        props.deliveryCharges
                      ).toFixed(2)}`}
                    </Typography>
                  </Grid>
                </Grid>
              </>
            )}

            <Grid container className={clsx(classes.cardRow, classes.mv2)}>
              <Grid item xs={9}>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={clsx(classes.textBold, classes.smallText)}
                  >
                    {t("total")}
                  </Typography>
                  <Typography
                    variant="caption"
                    className={classes.disabledText}
                  >
                    (Incl. TAX)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={clsx(classes.textBold, classes.smallText)}
                >
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.orderAmount
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
