import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuthenticated = !!localStorage.getItem("user-enatega");

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

export default PrivateRoute;

// import React from 'react'
// import { Redirect, Route } from 'react-router-dom'

// export const PrivateRoute = ({ component: Component, ...rest }) => (
//   <Route
//     {...rest}
//     render={props =>
//       localStorage.getItem('user-enatega') ? (
//         <Component {...props} />
//       ) : (
//         <Redirect
//           to={{
//             pathname: '/auth/login',
//             state: { from: props.location }
//           }}
//         />
//       )
//     }
//   />
// )
