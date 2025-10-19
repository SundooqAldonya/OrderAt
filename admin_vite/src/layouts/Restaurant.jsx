import React, { useRef, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { Container } from "@mui/material";
import AdminNavbar from "../components/Navbars/AdminNavbar";
import AdminFooter from "../components/Footers/AdminFooter";

import routes from "../routes";

function Restaurant(props) {
  var divRef = useRef(null);
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    divRef.current.scrollTop = 0;
  }, []);

  // const getRoutes = (routes) => {
  //   return routes.map((prop, key) => {
  //     if (prop.layout === "/restaurant") {
  //       return (
  //         <Route
  //           path={prop.layout + prop.path}
  //           component={prop.component}
  //           key={key}
  //         />
  //       );
  //     } else {
  //       return null;
  //     }
  //   });
  // };

  const getRoutes = (routes) => {
    return routes
      .filter((prop) => prop.layout === "/restaurant")
      .map((prop, key) => (
        <Route
          key={key}
          path={prop.layout + prop.path}
          element={<prop.component />}
        />
      ));
  };

  const getBrandText = (path) => {
    for (let i = 0; i < routes.length; i++) {
      if (
        props.location.pathname.indexOf(routes[i].layout + routes[i].path) !==
        -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  return (
    <>
      <div ref={divRef}>
        <AdminNavbar
          {...props}
          brandText={getBrandText(props.location.pathname)}
        />
        <Routes>{getRoutes(routes)}</Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
}

export default Restaurant;
