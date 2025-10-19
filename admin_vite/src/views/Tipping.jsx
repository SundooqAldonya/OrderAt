/* eslint-disable react/display-name */
import React from "react";
import { withTranslation } from "react-i18next";
import { Container, Grid } from "@mui/material";
import TippingComponent from "../components/Tipping/Tipping";
// core components
import Header from "../components/Headers/Header";
import useGlobalStyles from "../utils/globalStyles";
import TippingIcon from "../assets/svg/svg/Tipping.svg";

function Tipping() {
  const globalClasses = useGlobalStyles();
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <Grid container>
          <Grid item order={{ xs: 2, md: 1 }}>
            <TippingComponent />
          </Grid>
          <Grid
            sx={{ display: { xs: "none", lg: "block" } }}
            item
            mt={5}
            order={{ xs: 1, lg: 2 }}
          >
            {/* <TippingIcon /> */}
            <img src={TippingIcon} alt="Config" width={32} height={32} />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default withTranslation()(Tipping);
