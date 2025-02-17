import { Box, Grid, Paper, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ChooseOption = () => {
  const { t } = useTranslation();
  const images = [
    {
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("for_companies_title"),
      description: t("for_companies_description"),
      btnText: t("btn_text_partner"),
      link: "/add-your-business",
    },
    {
      url: "https://images.unsplash.com/photo-1609923519519-7f470620fa10?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("for_riders"),
      description: t("for_riders_description"),
      btnText: t("btn_text_rider"),
      link: "/",
    },
    {
      url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: t("for_customers"),
      description: t("for_customers_description"),
      btnText: t("btn_text_customer"),
      link: "/",
    },
  ];

  const displayOptions = () => {
    return images?.map((item, index) => {
      return (
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={4}
          style={{
            height: 300,
          }}
        >
          <Paper sx={{ textAlign: "center", height: "100%" }}>
            <Box
              style={{
                height: "100%",
                backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)), url(${item.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5">{item.title}</Typography>
                <Typography variant="p">{item.description}</Typography>
                <Link
                  style={{
                    textTransform: "capitalize",
                    color: "#fff",
                    marginTop: 15,
                    cursor: "pointer",
                  }}
                  to={item.link}
                >
                  <Typography variant="h6">{item.btnText}</Typography>
                </Link>
              </Box>
            </Box>
          </Paper>
        </Grid>
      );
    });
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
      <Grid container spacing={2}>
        {displayOptions()}
      </Grid>
    </Box>
  );
};

export default ChooseOption;
