import React, { Fragment, useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import GoogleMapsLoader from "./components/GoogleMapsLoader/GoogleMapsLoader.jsx";
import { Box, CircularProgress } from "@mui/material";
import AdminLayout from "./layouts/Admin.jsx";
import RestaurantLayout from "./layouts/Restaurant.jsx";
import AuthLayout from "./layouts/Auth.jsx";
import SuperAdminLayout from "./layouts/SuperAdmin.jsx";
import PrivateRoute from "./views/PrivateRoute.jsx";
import AdminPrivateRoute from "./views/AdminPrivateRoute.jsx";
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
// import * as Sentry from '@sentry/react'
import { isFirebaseSupported, initialize } from "./firebase.js";
import { uploadToken } from "./apollo/index.js";
import { useApolloClient } from "@apollo/client/react";
import ConfigurableValues from "./config/constants.js";
import { NotificationContainer } from "react-notifications";
import { gql } from "@apollo/client";
import "./i18n.js";
import Login from "./views/Login.jsx";
import ResetPassword from "./components/ResetPassword/ResetPassword.jsx";
import Vendors from "./views/Vendors.jsx";
// require("./i18n.js");

const UPLOAD_TOKEN = gql`
  ${uploadToken}
`;

const App = () => {
  const {
    VAPID_KEY,
    FIREBASE_KEY,
    AUTH_DOMAIN,
    PROJECT_ID,
    STORAGE_BUCKET,
    MSG_SENDER_ID,
    APP_ID,
    MEASUREMENT_ID,
    GOOGLE_MAPS_KEY,
    SENTRY_DSN,
  } = ConfigurableValues();
  // console.log({ tokeApp: JSON.parse(localStorage.getItem("user-enatega")) });
  const client = useApolloClient();
  const [user] = useState(localStorage.getItem("user-enatega"));
  const userType = localStorage.getItem("user-enatega")
    ? JSON.parse(localStorage.getItem("user-enatega")).userType
    : null;
  console.log("App component mounted");

  // useEffect(() => {
  //   if (user) {
  //     const initializeFirebase = async () => {
  //       if (await isFirebaseSupported()) {
  //         const messaging = initialize(
  //           FIREBASE_KEY,
  //           AUTH_DOMAIN,
  //           PROJECT_ID,
  //           STORAGE_BUCKET,
  //           MSG_SENDER_ID,
  //           APP_ID,
  //           MEASUREMENT_ID
  //         );
  //         Notification.requestPermission()
  //           .then(() => {
  //             getToken(messaging, {
  //               vapidKey: VAPID_KEY,
  //             })
  //               .then((token) => {
  //                 localStorage.setItem("messaging-token", token);
  //                 client
  //                   .mutate({
  //                     mutation: UPLOAD_TOKEN,
  //                     variables: {
  //                       id: JSON.parse(user).userId,
  //                       pushToken: token,
  //                     },
  //                   })
  //                   .then(() => {
  //                     console.log("upload token success");
  //                   })
  //                   .catch((error) => {
  //                     console.log("upload token error", error);
  //                   });
  //               })
  //               .catch((err) => {
  //                 console.log("getToken error", err);
  //               });
  //           })
  //           .catch(console.log);

  //         onMessage(messaging, function (payload) {
  //           console.log(payload);
  //           // Customize notification here
  //           // const { title, body } = payload.notification
  //           // eslint-disable-next-line no-restricted-globals
  //           var notificationTitle = "New Order on Enatega Multivendor";
  //           var notificationOptions = {
  //             body: payload.data.orderid,
  //             icon: "https://multivendor-admin.ninjascode.com/favicon.png",
  //           };
  //           const nt = new Notification(notificationTitle, notificationOptions);
  //           nt.onclick = function (event) {
  //             event.preventDefault(); // prevent the browser from focusing the Notification's tab
  //             window.open("https://multivendor-admin.ninjascode.com/dashboard");
  //             nt.close();
  //           };
  //         });
  //       }
  //     };
  //     initializeFirebase();
  //   }
  // }, [user]);

  // useEffect(() => {
  //   if (SENTRY_DSN) {
  //     Sentry.init({
  //       dsn: SENTRY_DSN,
  //       //SENTRY_DSN  integrations: [new Integrations.BrowserTracing()],
  //       environment: 'development',
  //       enableInExpoDevelopment: true,
  //       debug: true,
  //       tracesSampleRate: 1.0 // to be changed to 0.2 in production
  //     })
  //   }
  // }, [SENTRY_DSN])

  const route = userType
    ? userType === "VENDOR"
      ? "/restaurant/list"
      : "/super_admin/vendors"
    : "/auth/login";

  return (
    <Fragment>
      <NotificationContainer />
      {GOOGLE_MAPS_KEY ? (
        <Fragment>
          <GoogleMapsLoader GOOGLE_MAPS_KEY={GOOGLE_MAPS_KEY}>
            <BrowserRouter basename="/">
              <Routes>
                {/* Super Admin routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/reset" element={<ResetPassword />} />
                {/* <Route path="/super_admin/vendors" element={<Vendors />} /> */}
                <Route path="*" element={<Navigate to="/auth/login" />} />
                <Route element={<AdminPrivateRoute />}>
                  <Route path="/super_admin/*" element={<SuperAdminLayout />} />
                </Route>

                {/* Restaurant routes */}
                {/* <Route element={<PrivateRoute />}>
                  <Route path="/restaurant/*" element={<RestaurantLayout />} />
                </Route> */}

                {/* Admin routes */}
                {/* <Route element={<PrivateRoute />}>
                  <Route path="/admin/*" element={<AdminLayout />} />
                </Route> */}

                {/* Auth routes (public) */}
                {/* <Route path="/auth/*" element={<AuthLayout />} /> */}

                {/* Default redirect */}
                {/* <Route path="*" element={<Navigate to={route} replace />} /> */}
              </Routes>
            </BrowserRouter>
          </GoogleMapsLoader>
        </Fragment>
      ) : (
        <Box
          component="div"
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          width="100vw"
        >
          <CircularProgress color="primary" />
        </Box>
      )}
    </Fragment>
  );
};
// export default Sentry.withProfiler(App)
export default App;
