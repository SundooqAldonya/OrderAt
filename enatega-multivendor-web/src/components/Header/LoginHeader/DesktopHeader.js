import { Box, Divider } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useStyle from "./styles";
import { ReactComponent as Logo } from "../../../assets/images/logo.svg";
import { useTheme } from "@emotion/react";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/8.png";
import logoAr from "../../../assets/9.png";

function LoginDesktopHeader({ title, showIcon, showCart = false }) {
  const { i18n, t } = useTranslation();
  const classes = useStyle();
  const theme = useTheme();
  const location = useLocation();
  const { language } = i18n;
  const currentLang = localStorage.getItem("enatega-language") || language;
  console.log({ currentLang });
  const handleLanguageChange = () => {
    const savedLanguage = localStorage.getItem("enatega-language");
    if (savedLanguage === "en") {
      localStorage.setItem("enatega-language", "ar");
    } else {
      localStorage.setItem("enatega-language", "en");
    }
    window.location.reload();
  };

  return (
    <AppBar elevation={0} position="fixed">
      <Toolbar className={classes.toolbar}>
        <RouterLink
          to={location.pathname === "/checkout" ? "/business-list" : "/"}
          className={classes.linkDecoration}
        >
          {/* <Logo height={37} width={169} /> */}
          <Box
            style={{
              width: 200,
              height: 64,
            }}
          >
            <img
              src={currentLang === "en" ? logo : logoAr}
              alt="logo"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </Box>
        </RouterLink>

        <Box
          className={classes.flex}
          sx={{
            alignItems: "center",
          }}
        >
          <Box>
            <Button
              onClick={handleLanguageChange}
              sx={{ fontSize: "20px", color: "#000" }}
            >
              {currentLang === "en" ? "عربي" : "EN"}
            </Button>
          </Box>
          {showIcon && (
            <>
              <Divider flexItem orientation="vertical" light />
              <RouterLink to={"/login"} className={classes.linkDecoration}>
                <Button aria-controls="simple-menu" aria-haspopup="true">
                  <PersonIcon style={{ color: theme.palette.common.black }} />
                  <Typography
                    variant="button"
                    color="textSecondary"
                    className={`${classes.ml} ${classes.font700}`}
                  >
                    {t("loginBtn")}
                  </Typography>
                </Button>
              </RouterLink>
              <Divider flexItem orientation="vertical" light />
            </>
          )}
          {showCart && (
            <Box style={{ alignSelf: "center" }}>
              <RouterLink to="/" className={classes.linkDecoration}>
                <Button>
                  <LocalMallIcon
                    style={{ color: theme.palette.common.black }}
                  />
                </Button>
              </RouterLink>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default React.memo(LoginDesktopHeader);
