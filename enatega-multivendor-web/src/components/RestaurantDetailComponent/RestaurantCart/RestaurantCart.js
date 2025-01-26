import { Box, Grid, Hidden } from "@mui/material";
import React, { Fragment, useContext } from "react";
import UserContext from "../../../context/User";
import CartView from "./CartView";
import EmptyView from "./EmptyView";

function RestaurantCart(props) {
  const { cart } = useContext(UserContext);
  console.log({ cart });
  return (
    <Fragment>
      <Hidden lgDown>
        <Grid
          item
          lg={3}
          // xs={false}
          style={{
            background: "#fafafa",
          }}
        >
          <Box style={{ position: "sticky", top: "100px", padding: "0px 5px" }}>
            {!cart.length ? (
              <EmptyView showMessage={props.showMessage} />
            ) : (
              <Fragment>
                <CartView showMessage={props.showMessage} />
              </Fragment>
            )}
          </Box>
        </Grid>
      </Hidden>
    </Fragment>
  );
}

export default React.memo(RestaurantCart);
