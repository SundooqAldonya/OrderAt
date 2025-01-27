/* eslint-disable react-hooks/exhaustive-deps */
import {
  Grid,
  Container,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useState } from "react";
import FlashMessage from "../../components/FlashMessage";
import { LoginHeader } from "../../components/Header";
import Header from "../../components/Header/Header";
import UserContext from "../../context/User";
import { useLocation } from "../../hooks";
import useStyles from "./styles";
import * as Sentry from "@sentry/react";
import Footer from "../../components/Footer/Footer";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/favicon.png";

function AddYourBusiness() {
  const { t } = useTranslation();
  const classes = useStyles();
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

        <Box dir={"rtl"} className={classes.container}>
          <Box sx={{ width: 200 }}>
            <img src={Logo} alt={"logo"} style={{ width: "100%" }} />
          </Box>
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h4">{t("tell_us_business")}</Typography>
          </Box>
          <Grid
            container
            spacing={2}
            component="form"
            className={classes.wrapper}
          >
            <Grid
              item
              sm={12}
              md={6}
              sx={{ paddingInlineStart: "0 !important" }}
            >
              <TextField
                sx={{ width: "100%" }}
                id="outlined-basic"
                label={t("name")}
                variant="outlined"
                placeholder={t("name")}
              />
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                sx={{ width: "100%" }}
                id="outlined-basic"
                label={t("business_name")}
                variant="outlined"
                placeholder="Business Name"
              />
            </Grid>
            <Grid
              item
              sm={12}
              md={6}
              sx={{ paddingInlineStart: "0 !important" }}
            >
              <TextField
                sx={{ width: "100%" }}
                id="outlined-basic"
                label={t("business_address")}
                variant="outlined"
                placeholder="Business address"
              />
            </Grid>
            <Grid item sm={12} md={6}>
              <TextField
                sx={{ width: "100%" }}
                id="outlined-basic"
                label={t("phone")}
                variant="outlined"
                placeholder={t("phone")}
              />
            </Grid>
            <Button sx={{ width: "100%", mt: 2 }} variant="contained">
              {t("submit")}
            </Button>
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
