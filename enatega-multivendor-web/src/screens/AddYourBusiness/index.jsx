/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, Box, Typography, TextField, Button } from "@mui/material";
import React, { useCallback, useContext, useState } from "react";
import FlashMessage from "../../components/FlashMessage";
import { LoginHeader } from "../../components/Header";
import Header from "../../components/Header/Header";
import UserContext from "../../context/User";
import useStyles from "./styles";
import * as Sentry from "@sentry/react";
import Footer from "../../components/Footer/Footer";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/favicon.png";
import { useMutation } from "@apollo/client";
import { createBusiness } from "../../apollo/server";
import { direction } from "../../utils/helper";

function AddYourBusiness() {
  const { i18n, t } = useTranslation();
  const classes = useStyles();
  const { isLoggedIn } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [values, setValues] = useState({
    name: "",
    businessName: "",
    address: "",
    phone: "",
  });

  const { name, businessName, phone, address } = values;

  const [mutateCreateBusiness] = useMutation(createBusiness, {
    onCompleted: (data) => {
      setMessage(t(data.createBusiness.message));
      setOpenAlert(true);
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClose = useCallback(() => {
    setOpenAlert(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !businessName || !phone || !address) {
      setMessage("All fields are required");
      setOpenAlert(true);
    } else {
      mutateCreateBusiness({
        variables: {
          businessInput: {
            name,
            businessName,
            phone,
            address,
          },
        },
      });
      setValues({
        name: "",
        businessName: "",
        address: "",
        phone: "",
      });
    }
  };

  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <Box className={classes.root}>
        <FlashMessage
          severity={"success"}
          alertMessage={message}
          open={openAlert}
          handleClose={handleClose}
        />
        {isLoggedIn ? <Header /> : <LoginHeader showIcon />}

        <Box dir={direction(i18n.language)} className={classes.container}>
          <Box className={classes.wrapper}>
            <Box sx={{ width: 200, marginBottom: 5 }}>
              <img src={Logo} alt={"logo"} style={{ width: "100%" }} />
            </Box>
            <Box
              sx={{
                marginBottom: 3,
                alignSelf: "flex-start",
              }}
            >
              <Typography sx={{ textAlign: "end" }} variant="h4">
                {t("tell_us_business")}
              </Typography>
            </Box>
            <Grid
              container
              // spacing={2}
              component="form"
              onSubmit={handleSubmit}
            >
              <Grid item sm={12} md={12} sx={{ marginBottom: 2 }}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label={t("name")}
                  variant="outlined"
                  placeholder={t("name")}
                  name="name"
                  onChange={handleChange}
                  value={name}
                />
              </Grid>
              <Grid item sm={12} md={12} sx={{ marginBottom: 2 }}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label={t("business_name")}
                  variant="outlined"
                  placeholder={t("business_name")}
                  name="businessName"
                  onChange={handleChange}
                  value={businessName}
                />
              </Grid>
              <Grid item sm={12} md={12} sx={{ marginBottom: 2 }}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label={t("business_address")}
                  variant="outlined"
                  placeholder={t("business_address")}
                  name="address"
                  onChange={handleChange}
                  value={address}
                />
              </Grid>
              <Grid item sm={12} md={12} sx={{ marginBottom: 2 }}>
                <TextField
                  sx={{ width: "100%" }}
                  id="outlined-basic"
                  label={t("phone")}
                  variant="outlined"
                  placeholder={t("phone")}
                  name="phone"
                  onChange={handleChange}
                  value={phone}
                />
              </Grid>
              <Button
                type="submit"
                sx={{ width: 200, mt: 2, mx: "auto" }}
                variant="contained"
              >
                {t("submit")}
              </Button>
            </Grid>
          </Box>
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
