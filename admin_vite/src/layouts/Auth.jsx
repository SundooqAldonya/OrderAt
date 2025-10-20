import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import routes from "../routes";

function Auth() {
  useEffect(() => {
    document.body.classList.add("bg-default");
    return () => {
      document.body.classList.remove("bg-default");
    };
  }, []);

  // const getRoutes = routes => {
  //   return routes.map((prop, key) => {
  //     if (prop.layout === '/auth') {
  //       return (
  //         <Route
  //           path={prop.layout + prop.path}
  //           component={prop.component}
  //           key={key}
  //         />
  //       )
  //     } else {
  //       return null
  //     }
  //   })
  // }

  const getRoutes = (routes) => {
    return routes
      .filter((prop) => prop.layout === "/auth")
      .map((prop, key) => (
        <Route
          key={key}
          path={prop.layout + prop.path}
          element={<prop.component />}
        />
      ));
  };

  return <Routes>{getRoutes(routes)}</Routes>;
}

export default Auth;
