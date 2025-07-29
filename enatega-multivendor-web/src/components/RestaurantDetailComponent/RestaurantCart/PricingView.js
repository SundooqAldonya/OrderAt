import { Box, Button, Container, Typography, useTheme } from "@mui/material";
import React, { useContext, useMemo, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import ConfigurationContext from "../../../context/Configuration";
import UserContext from "../../../context/User";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import {
  calculateDistance,
  calculateAmount,
} from "../../../utils/customFunction";
import { getDeliveryCalculation } from "../../../apollo/server";
import { useQuery } from "@apollo/client";

function PricingView(props) {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const configuration = useContext(ConfigurationContext);
  const { cart } = useContext(UserContext);
  const { restaurantData } = props;

  const [deliveryCharges, setDeliveryCharges] = useState(0);
  // const [isBelowMinimumDistance, setIsBelowMinimumDistance] = useState(false);
  const location = JSON.parse(localStorage.getItem("location"));

  const {
    data: calcData,
    loading: calcLoading,
    error: errorCalc,
  } = useQuery(getDeliveryCalculation, {
    skip: !restaurantData,
    variables: {
      input: {
        destLong: Number(location.longitude),
        destLat: Number(location.latitude),
        originLong: Number(restaurantData?.location.coordinates[0]),
        originLat: Number(restaurantData?.location.coordinates[1]),
        restaurantId: restaurantData?._id,
      },
    },
  });

  console.log({
    calcData,
    originLong: restaurantData?.location.coordinates[0],
    originLat: restaurantData?.location.coordinates[1],
  });

  useEffect(() => {
    if (calcData) {
      const amount = calcData.getDeliveryCalculation.amount;
      setDeliveryCharges(amount);
      // setDeliveryCharges(
      //   amount >= configuration.minimumDeliveryFee
      //     ? amount
      //     : configuration.minimumDeliveryFee
      // );
    }
  }, [calcData]);

  // useEffect(() => {
  //   (async () => {
  //     const destinationObj = JSON.parse(localStorage.getItem("location"));

  //     const latOrigin = Number(restaurantData.location.coordinates[1]);
  //     const lonOrigin = Number(restaurantData.location.coordinates[0]);
  //     const latDest = Number(destinationObj.latitude);
  //     const longDest = Number(destinationObj.longitude);
  //     const distance = await calculateDistance(
  //       latOrigin,
  //       lonOrigin,
  //       latDest,
  //       longDest
  //     );
  //     console.log(distance, "distance@123234342424--------------------------");

  //     let costType = configuration.costType;
  //     let amount = calculateAmount(
  //       costType,
  //       configuration.deliveryRate,
  //       distance
  //     );
  //     let d_charges = amount;
  //     if (parseFloat(amount) <= configuration.minimumDeliveryFee) {
  //       d_charges = configuration.minimumDeliveryFee;
  //     }
  //     setDeliveryCharges(d_charges);
  //   })();
  // }, [restaurantData, configuration]);

  const calculatePrice = useMemo(
    () =>
      (amount = 0) => {
        let itemTotal = 0;
        cart.forEach((cartItem) => {
          itemTotal += cartItem.price * cartItem.quantity;
        });

        const deliveryAmount = amount > 0 ? deliveryCharges : 0;
        return (itemTotal + deliveryAmount).toFixed(2);
      },
    [deliveryCharges, cart]
  );

  const taxCalculation = useMemo(
    () => () => {
      const tax = restaurantData ? +restaurantData.tax : 0;
      if (tax === 0) {
        return tax.toFixed(2);
      }
      const amount = +calculatePrice(deliveryCharges, true);
      const taxAmount = ((amount / 100) * tax).toFixed(2);
      return taxAmount;
    },
    [restaurantData, cart, deliveryCharges]
  );

  const calculateTotal = useMemo(
    () => () => {
      let total = 0;
      total += +calculatePrice(deliveryCharges);
      total += +taxCalculation();
      return parseFloat(total).toFixed(2);
    },
    [deliveryCharges, cart]
  );

  return (
    <Container
      style={{
        paddingTop: theme.spacing(2),
        background: theme.palette.common.white,
      }}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: theme.spacing(1),
        }}
        className={classes.border}
      >
        <Typography className={classes.subtotalText}>
          {t("subTotal")}
        </Typography>
        <Typography className={classes.subtotalText}>
          {`${configuration.currencySymbol} ${calculatePrice(0)}`}
        </Typography>
      </Box>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: theme.spacing(1),
        }}
        className={classes.border}
      >
        <Typography className={classes.subtotalText}>
          {t("deliveryFee")}
        </Typography>
        <Typography className={classes.subtotalText}>
          {deliveryCharges ? configuration.currencySymbol : null}{" "}
          {`${deliveryCharges ? deliveryCharges.toFixed(2) : "Free"}`}
        </Typography>
      </Box>
      {taxCalculation() > 0 && (
        <Box
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: theme.spacing(1),
          }}
          className={classes.border}
        >
          <Typography className={classes.subtotalText}>
            {t("taxFee")}
          </Typography>
          <Typography className={classes.subtotalText}>
            {`${configuration.currencySymbol} ${taxCalculation()}`}
          </Typography>
        </Box>
      )}
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: theme.spacing(2),
        }}
      >
        <Typography
          style={{ fontWeight: 700, color: theme.palette.text.secondary }}
          className={classes.subtotalText}
        >
          {t("total")} (Inc. TAX)
        </Typography>
        <Typography
          style={{ fontWeight: 700, color: theme.palette.text.secondary }}
          className={classes.subtotalText}
        >
          {`${configuration.currencySymbol} ${calculateTotal()}`}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Box display="flex" alignItems={"center"}>
          <Typography
            style={{
              fontWeight: 700,
              color: theme.palette.text.secondary,
              fontSize: "0.975rem",
            }}
          >
            {`${configuration.currencySymbol} ${calculateTotal()}`}
          </Typography>
          <Typography
            style={{
              ...theme.typography.caption,
              fontWeight: 700,
              color: theme.palette.common.black,
              padding: "5px 10px",
              borderRadius: 5,
              border: "1px solid theme.palette.common.black",
              margin: "0 8px",
            }}
          >
            {cart && cart.length}
          </Typography>
        </Box>
        <Box flexGrow={1} ml={2}>
          <RouterLink to="/checkout" style={{ textDecoration: "none" }}>
            <Button
              style={{
                background: theme.palette.primary.main,
                margin: theme.spacing(2, 0),
                borderRadius: 10,
              }}
              className={classes.checkoutContainer}
            >
              <Typography
                style={{ color: theme.palette.common.black }}
                className={classes.checkoutText}
              >
                {t("goToCheckout")}
              </Typography>
            </Button>
          </RouterLink>
        </Box>
      </Box>
    </Container>
  );
}

export default React.memo(PricingView);
