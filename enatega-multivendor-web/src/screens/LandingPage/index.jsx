import React from "react";
import HeaderLanding from "../../components/LandingPageComponents/Header";
import Layout from "../../components/Layout";
import Aboutus from "../../components/LandingPageComponents/Aboutus";
import ChooseOption from "../../components/LandingPageComponents/ChooseOption";
import ContactUs from "../../components/LandingPageComponents/Contactus";
import Logo from "../../assets/favicon.png";
import { Box } from "@mui/material";

const LandingPage = () => {
  return (
    <Layout>
      <Box
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: 0.1,
          width: "30%",
        }}
      >
        <img src={Logo} alt={"logo"} style={{ width: "100%" }} />
      </Box>
      <HeaderLanding />
      <Aboutus />
      <ChooseOption />
      <ContactUs />
    </Layout>
  );
};

export default LandingPage;
