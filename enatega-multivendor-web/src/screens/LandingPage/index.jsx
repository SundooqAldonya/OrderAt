import React, { useCallback, useContext, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import HeaderLanding from "../../components/LandingPageComponents/Header";
import { Header, LoginHeader } from "../../components/Header";
import FlashMessage from "../../components/FlashMessage";
import useStyles from "./styles";
import { useLocation } from "../../hooks";
import { Box } from "@mui/material";
import Footer from "../../components/Footer/Footer";
import UserContext from "../../context/User";
import Layout from "../../components/Layout";

const LandingPage = () => {
  const classes = useStyles();
  const { error, loading } = useLocation();
  const [open, setOpen] = useState(!!error);
  const [check, setCheck] = useState(false);
  const { isLoggedIn } = useContext(UserContext);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (check) {
      setOpen(!!error);
    } else {
      setCheck(true);
    }
  }, [error]);

  return (
    <Layout>
      <HeaderLanding />
    </Layout>
  );
};

export default LandingPage;
