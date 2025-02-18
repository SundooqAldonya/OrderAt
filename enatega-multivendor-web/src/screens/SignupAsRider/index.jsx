/* eslint-disable react-hooks/exhaustive-deps */
import { Grid, Box, Typography, TextField, Button, Alert } from "@mui/material";
import React, { useCallback, useState } from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import Logo from "../../assets/favicon.png";
import { useMutation } from "@apollo/client";
import { createRiderRegister } from "../../apollo/server";
import { direction } from "../../utils/helper";
import Layout from "../../components/Layout";
import FlashMessage from "../../components/FlashMessage";

function SignupAsRider() {
  const { i18n, t } = useTranslation();
  const classes = useStyles();
  const [message, setMessage] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [values, setValues] = useState({
    name: "",
    city: "",
    phone: "",
  });

  const { name, phone, city } = values;

  const [mutateCreateRider] = useMutation(createRiderRegister, {
    onCompleted: (data) => {
      setMessage(t(data.createRiderRegister.message));
      setOpenAlert(true);
    },
  });

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setOpenAlert(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !city) {
      setMessage("All fields are required");
      setOpenAlert(true);
    } else {
      mutateCreateRider({
        variables: {
          riderRegisterInput: {
            name,
            phone,
            city,
          },
        },
      });
      setValues({
        name: "",
        city: "",
        phone: "",
      });
    }
  };

  return (
    <Layout>
      <FlashMessage
        open={openAlert}
        alertMessage={message}
        onClose={handleClose}
        type="success"
      />

      <Box className={classes.imageContainer}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: 100, marginBottom: 5 }}>
            <img src={Logo} alt={"logo"} style={{ width: "100%" }} />
          </Box>
          <Typography
            variant="h4"
            color="textPrimary"
            align="center"
            className={classes.title}
          >
            {t("register_as_rider")}
          </Typography>
        </Box>
      </Box>
      <Box
        dir={direction(i18n.language)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 4,
        }}
      >
        <Box className={classes.wrapper}>
          <Box
            sx={{
              marginBottom: 3,
              alignSelf: "flex-start",
            }}
          >
            <Typography sx={{ textAlign: "end" }} variant="h4">
              {t("register_as_rider")}
            </Typography>
          </Box>
          <Grid container component="form" onSubmit={handleSubmit}>
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
                label={t("city")}
                variant="outlined"
                placeholder={t("city")}
                name="city"
                onChange={handleChange}
                value={city}
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
              sx={{ width: 200, mt: 2, mx: "auto", color: "#000" }}
              variant="contained"
            >
              {t("submit")}
            </Button>
          </Grid>
        </Box>
      </Box>
    </Layout>
  );
}
export default SignupAsRider;
