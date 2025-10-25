import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminPrivateRoute = () => {
  const storedUser = localStorage.getItem("user-enatega");
  if (!storedUser) {
    // Not logged in → go to login page
    return <Navigate to="/auth/login" replace />;
  }

  const user = JSON.parse(storedUser);
  if (user.userType !== "ADMIN") {
    // Logged in but not admin → redirect home
    return <Navigate to="/" replace />;
  }

  // Authorized → show nested routes
  return <Outlet />;
};

export default AdminPrivateRoute;

// import React from 'react'
// import { Redirect, Route } from 'react-router-dom'
// export const AdminPrivateRoute = ({ component: Component, ...rest }) => (
//   <Route
//     {...rest}
//     render={props =>
//       localStorage.getItem('user-enatega') ? (
//         JSON.parse(localStorage.getItem('user-enatega')).userType ===
//         'ADMIN' ? (
//           <Component {...props} />
//         ) : (
//           <Redirect
//             to={{
//               pathname: '/',
//               state: { from: props.location }
//             }}
//           />
//         )
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
