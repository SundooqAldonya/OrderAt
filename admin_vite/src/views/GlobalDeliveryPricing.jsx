import React, { Fragment } from "react";
import Header from "../components/Headers/Header";
import { Container } from "@mui/material";
import useGlobalStyles from "../utils/globalStyles";
import { useQuery } from "@apollo/client/react";
import { getGlobalDeliveryPricing } from "../apollo";
import CustomLoader from "../components/Loader/CustomLoader";
import GlobalDeliveryPricingForm from "../components/GlobalDeliveryPricingForm";

const GlobalDeliveryPricing = () => {
  const globalClasses = useGlobalStyles();

  const { data, loading } = useQuery(getGlobalDeliveryPricing);

  const pricing = data?.getGlobalDeliveryPricing || null;

  console.log({ data });

  return (
    <Fragment>
      <Header />
      <Container className={globalClasses.flex} fluid>
        {loading ? <CustomLoader /> : null}
        <GlobalDeliveryPricingForm editData={pricing} />
      </Container>
    </Fragment>
  );
};

export default GlobalDeliveryPricing;
