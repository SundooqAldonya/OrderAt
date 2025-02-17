import React, { useCallback, useContext, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import HeaderLanding from "../LandingPageComponents/Header";
import { Header, LoginHeader } from "../Header";
import FlashMessage from "../FlashMessage";
import useStyles from "./styles";
import { useLocation } from "../../hooks";
import { Box } from "@mui/material";
import Footer from "../Footer/Footer";
import UserContext from "../../context/User";

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
        <HeaderLanding />
        <Box className={classes.footerContainer}>
          <Box className={classes.footerWrapper}>
            <Footer />
          </Box>
        </Box>
      </Box>
    </Sentry.ErrorBoundary>
  );
};

export default LandingPage;
