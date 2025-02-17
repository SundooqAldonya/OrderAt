import React from "react";
import HeaderLanding from "../../components/LandingPageComponents/Header";
import Layout from "../../components/Layout";
import Aboutus from "../../components/LandingPageComponents/Aboutus";
import ChooseOption from "../../components/LandingPageComponents/ChooseOption";

const LandingPage = () => {
  return (
    <Layout>
      <HeaderLanding />
      <Aboutus />
      <ChooseOption />
    </Layout>
  );
};

export default LandingPage;
