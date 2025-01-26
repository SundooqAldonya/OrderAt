/* eslint-disable react-hooks/exhaustive-deps */
import {
  Grid,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import FlashMessage from "../../components/FlashMessage";
import { LoginHeader } from "../../components/Header";
import Header from "../../components/Header/Header";
import { SearchContainer } from "../../components/HomeScreen";
import UserContext from "../../context/User";
import { useLocation } from "../../hooks";
// import Analytics from "../../utils/analytics";
import useStyles from "./styles";
import * as Sentry from "@sentry/react";
import CategoryCards from "../../components/HomeScreen/CategoryCards";
import WebApp from "../../assets/images/webapp.png";
import CustApp from "../../assets/images/cust-app.png";
import RiderApp from "../../assets/images/rider-app.png";
import RestaurantApp from "../../assets/images/restaurant-app.png";
import Dashboard from "../../assets/images/dashboard.png";
import Footer from "../../components/Footer/Footer";
import Fruits2 from "../../assets/images/fruits-2.png";
import AppComponent from "../../components/HomeScreen/AppComponent";
import Banner2 from "../../assets/images/banner-2.png";
import Banner1 from "../../assets/images/banner-1.png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function AddYourBusiness() {
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();

  const { error, loading } = useLocation();
  const [open, setOpen] = useState(!!error);
  const { isLoggedIn } = useContext(UserContext);
  let check = false;

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (check) {
      setOpen(!!error);
    } else {
      check = true;
    }
  }, [error]);

  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <Box className={classes.root}>
        <FlashMessage
          severity={loading ? "info" : "error"}
          alertMessage={error}
          open={open}
          handleClose={handleClose}
        />
        {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
        {/* serch container (1st) */}
        <Box>
          <Grid container item>
            <SearchContainer loading={loading} isHome={true} />
          </Grid>
        </Box>

        <Box className={classes.footerContainer}>
          <Box className={classes.footerWrapper}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Sentry.ErrorBoundary>
  );
}
export default AddYourBusiness;
