import { Box, Divider, useMediaQuery } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React, { Fragment, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useStyle from "./styles";
import { ReactComponent as Logo } from "../../../assets/images/logo.svg";
import { useTheme } from "@emotion/react";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PersonIcon from "@mui/icons-material/Person";
import { useTranslation } from "react-i18next";
import logo from "../../../assets/8.png";
import logoAr from "../../../assets/9.png";
import { direction } from "../../../utils/helper";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import DrawerMenu from "./DrawerMenu";

function LoginDesktopHeader({ title, showIcon, showCart = false }) {
  const [open, setOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const classes = useStyle();
  const theme = useTheme();
  const location = useLocation();
  const { language } = i18n;
  const currentLang = localStorage.getItem("enatega-language") || language;
  const mobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = () => {
    setOpen(!open);
  };

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
    <AppBar dir={direction(language)} elevation={0} position="fixed">
      <Toolbar className={classes.toolbar}>
        <RouterLink
          to={location.pathname === "/checkout" ? "/business-list" : "/"}
          className={classes.linkDecoration}
        >
          <Box
            style={{
              width: mobile ? 100 : 200,
              height: mobile ? 40 : 64,
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

        {!mobile && (
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
              <Fragment>
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
                {/* <Divider flexItem orientation="vertical" light /> */}
              </Fragment>
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
        )}

        {mobile && (
          <Button
            onClick={toggleDrawer}
            sx={{
              justifyContent: "flex-end",
              marginInlineEnd: -15,
            }}
          >
            <LunchDiningIcon />
          </Button>
        )}

        {mobile && (
          <DrawerMenu
            open={open}
            setOpen={setOpen}
            toggleDrawer={toggleDrawer}
            handleLanguageChange={handleLanguageChange}
          />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default React.memo(LoginDesktopHeader);
