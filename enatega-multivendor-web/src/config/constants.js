/* eslint-disable no-unused-vars */
import React, { useContext } from "react";
import ConfigurationContext from "../../src/context/Configuration";

const LIBRARIES = ["places", "drawing", "geometry", "visualization"];

const ConfigurableValues = () => {
  const configuration = useContext(ConfigurationContext);

  // const SERVER_URL = "https://enatega-multivendor.up.railway.app/";
  // const WS_SERVER_URL = "wss://enatega-multivendor.up.railway.app/";
  // const SERVER_URL = "https://query.orderat.ai/";
  // const WS_SERVER_URL = "wss://query.orderat.ai/";
  let SERVER_URL, WS_SERVER_URL;
  // console.log("NODE_ENV", process.env.NODE_ENV);
  // if (process.env.NODE_ENV === "development") {
  //   SERVER_URL = "http://localhost:8001/";
  //   WS_SERVER_URL = "ws://localhost:8001/";
  // } else {
  //   SERVER_URL = "https://query.orderat.ai/";
  //   WS_SERVER_URL = "wss://query.orderat.ai/";
  // }

  switch (process.env.REACT_APP_ENV) {
    case "staging":
      SERVER_URL = "https://query.orderat.ai/";
      WS_SERVER_URL = "wss://query.orderat.ai/";
      break;

    case "production":
      SERVER_URL = "https://service.orderatco.com/";
      WS_SERVER_URL = "wss://service.orderatco.com/";
      break;

    default:
      // development
      SERVER_URL = "http://localhost:8001/";
      WS_SERVER_URL = "ws://localhost:8001/";
  }

  const GOOGLE_CLIENT_ID = configuration?.webClientID;
  const STRIPE_PUBLIC_KEY = configuration?.publishableKey;
  const PAYPAL_KEY = configuration?.clientId;
  const GOOGLE_MAPS_KEY = configuration?.googleApiKey ?? "";
  const AMPLITUDE_API_KEY = configuration?.webAmplitudeApiKey;

  const COLORS = {
    GOOGLE: configuration?.googleColor,
  };
  const SENTRY_DSN = configuration?.webSentryUrl;
  const SKIP_EMAIL_VERIFICATION = configuration?.skipEmailVerification;
  const SKIP_MOBILE_VERIFICATION = configuration?.skipMobileVerification;
  const VAPID_KEY = configuration?.vapidKey;

  return {
    SERVER_URL,
    WS_SERVER_URL,
    LIBRARIES,
    SENTRY_DSN,
    SKIP_EMAIL_VERIFICATION,
    SKIP_MOBILE_VERIFICATION,
    VAPID_KEY,
    GOOGLE_CLIENT_ID,
    STRIPE_PUBLIC_KEY,
    PAYPAL_KEY,
    GOOGLE_MAPS_KEY,
    AMPLITUDE_API_KEY,
    COLORS,
  };
};

export default ConfigurableValues;
