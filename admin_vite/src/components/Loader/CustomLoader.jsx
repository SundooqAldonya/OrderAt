import React from "react";
// import Loader from 'react-loader-spinner'
import { Oval } from "react-loader-spinner";

import { useTheme } from "@mui/material";

const CustomLoader = () => {
  const theme = useTheme();

  return (
    <div style={{ padding: "50px", alignSelf: "center" }}>
      <Oval
        visible
        type="TailSpin"
        color={theme.palette.error.lightest}
        height={100}
        width={100}
      />
    </div>
  );
};

export default CustomLoader;
