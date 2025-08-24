import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import { Box, Typography } from "@mui/material";

const DownloadPage = () => {
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.orderatcustomer.app";
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.location.href =
        "https://apps.apple.com/au/app/orderat/id6744000403";
    } else {
      window.location.href = "https://orderat.ai"; // fallback
    }
  }, []);

  return (
    <Layout>
      <Box
        sx={{
          my: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Redirecting you to the right app store...</Typography>
      </Box>
    </Layout>
  );
};

export default DownloadPage;
