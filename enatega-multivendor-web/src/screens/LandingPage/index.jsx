import React from "react";
import HeaderLanding from "../../components/LandingPageComponents/Header";
import Layout from "../../components/Layout";
import Aboutus from "../../components/LandingPageComponents/Aboutus";
import ChooseOption from "../../components/LandingPageComponents/ChooseOption";
import ContactUs from "../../components/LandingPageComponents/Contactus";

const LandingPage = () => {
  return (
    <Layout>
      <HeaderLanding />
      <Aboutus />
      <ChooseOption />
      <ContactUs />
    </Layout>
  );
};

export default LandingPage;
