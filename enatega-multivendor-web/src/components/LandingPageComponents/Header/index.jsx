import { Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import Carousel from "react-material-ui-carousel";

const HeaderLanding = () => {
  const { t } = useTranslation();
  const images = [
    {
      url: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("welcome_to_orderat"),
      subtitle: t("Order from one of our restaurants"),
    },
    {
      url: "https://images.unsplash.com/photo-1548695607-9c73430ba065?q=80&w=1625&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("welcome_to_orderat"),
      subtitle: t("Be our delivery team"),
    },
    {
      url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("welcome_to_orderat"),
      subtitle: t("Become our partner"),
    },
  ];

  const displayImages = () => {
    return images?.map((item, index) => {
      return (
        <Box key={index} style={{ position: "relative", height: "100%" }}>
          <Box style={{ height: "70dvh" }}>
            <Box
              style={{
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.7),rgba(0, 0, 0, 0.7)), url(${item.url})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 999,
              color: "#fff",
            }}
          >
            <Typography
              variant="h2"
              style={{ textShadow: "0 0 10px #000", textAlign: "center" }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="h5"
              style={{ textShadow: "0 0 10px #000", textAlign: "center" }}
            >
              {item.subtitle}
            </Typography>
          </Box>
        </Box>
      );
    });
  };
  return (
    <Box>
      <Carousel
        sx={{ height: "100%" }}
        navButtonsAlwaysVisible
        indicatorContainerProps={{
          style: {
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          },
        }}
      >
        {displayImages()}
      </Carousel>
    </Box>
  );
};

export default HeaderLanding;
