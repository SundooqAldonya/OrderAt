/* eslint-disable react-hooks/exhaustive-deps */
import {
  Grid,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Paper,
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
import HeroSection from "../../components/HeroSection";
import { direction } from "../../utils/helper";
import { useQuery } from "@apollo/client";
import { getCities } from "../../apollo/server";
import DialogAreaSelect from "../../components/HomeScreen/DialogAreaSelect";
import AppsSection from "../../components/HomeScreen/AppsSection";

function Home() {
  const { i18n, t } = useTranslation();
  const { language } = i18n;
  const classes = useStyles();
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));
  const medium = useMediaQuery(theme.breakpoints.down("lg"));

  const {
    data,
    error: errorCities,
    loading: loadingCities,
  } = useQuery(getCities);

  console.log({ data });

  const cities = data?.cities || null;
  const [selectedCity, setSelectedCity] = useState(null);
  const [openAreaModal, setOpenAreaModal] = useState(false);

  const [body, setBody] = useState([
    {
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("your_restaurant"),
      subtitle: t("add_your_restaurant"),
      link: "/add-your-business",
    },
    {
      image:
        "https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("deliver_with_orderat"),
      subtitle: t("signup_to_deliver"),
      link: "/signup-as-rider",
    },
  ]);

  const { error, loading } = useLocation();
  const [open, setOpen] = useState(!!error);
  const { isLoggedIn } = useContext(UserContext);
  let check = false;

  const handleClose = useCallback(() => {
    setOpen(false);
    setOpenAreaModal(false);
  }, []);

  useEffect(() => {
    if (check) {
      setOpen(!!error);
    } else {
      check = true;
    }
  }, [error]);

  const handleCitySelect = (itemId) => {
    console.log({ itemId });
    setSelectedCity(itemId);
    setOpenAreaModal(true);
  };

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
        {/* <HeroSection /> */}
        <Box>
          <Grid container item>
            <SearchContainer loading={loading} isHome={true} />
          </Grid>
        </Box>

        {/* cities */}
        {data?.cities ? (
          <Box
            dir={direction(language)}
            sx={{
              maxWidth: "1200px",
              marginInline: "auto",
              marginTop: "50px",
            }}
          >
            <Typography variant="h5" sx={{ marginInlineStart: 2 }}>
              {t("cities_serving")}
            </Typography>
            {errorCities && <Typography>{errorCities}</Typography>}
            <Grid container spacing={2} my={2}>
              {cities?.map((item) => {
                if (item?.isActive) {
                  return (
                    <Grid
                      sm={12}
                      md={6}
                      lg={4}
                      key={item._id}
                      style={{ cursor: "pointer" }}
                    >
                      <Paper
                        sx={{
                          marginInline: 2,
                          padding: 2,
                          mb: 2,
                          backgroundColor: "#8BC34A",
                        }}
                        onClick={() => handleCitySelect(item._id)}
                      >
                        <Typography sx={{ color: "#fff" }}>
                          {item.title}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                }
              })}
            </Grid>
          </Box>
        ) : null}

        {/* dialog area select */}
        <DialogAreaSelect
          open={openAreaModal}
          handleClose={handleClose}
          cityId={selectedCity}
          setSelectedCity={setSelectedCity}
          cities={cities}
        />

        <Box
          sx={{
            maxWidth: "1500px",
            marginInline: "auto",
            marginTop: "50px",
          }}
        >
          <Grid container spacing={2} sx={{ paddingInline: { sm: 2, md: 4 } }}>
            {body?.map((item, index) => {
              return (
                <Grid
                  dir={direction(language)}
                  key={index}
                  item
                  xs={12}
                  sm={6}
                  md={6}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "300px",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="h5">{item.title}</Typography>
                    <Link
                      to={item.link}
                      style={{ fontSize: 17, color: "#000" }}
                    >
                      {item.subtitle}
                    </Link>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        {/* download apps section */}
        <AppsSection />

        <Box className={classes.footerContainer}>
          <Box className={classes.footerWrapper}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Sentry.ErrorBoundary>
  );
}
export default Home;
