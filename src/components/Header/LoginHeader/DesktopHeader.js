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
import i18n from "../../../i18n";
import { SearchHeader } from "./SearchHeader";

function LoginDesktopHeader({ title, showIcon, showCart = false }) {
  const { t } = useTranslation();
  const classes = useStyle();
  const theme = useTheme();
  const location = useLocation();

  const handleLanguageToggle = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("enatega-language", newLang);
  };

  return (
    <AppBar elevation={0} position="fixed">
      <Toolbar className={classes.toolbar}>
        <Box sx={{ display: "flex", justifyContent: "start", gap: 1 }}>
          <RouterLink
            to={location.pathname === "/checkout" ? "/restaurant-list" : "/"}
            className={classes.linkDecoration}
          >
            <Logo height={37} width={169} />
          </RouterLink>

          <SearchHeader />
        </Box>
        <Box className={classes.flex}>
          {/* Language Toggle */}
          <Button
            onClick={handleLanguageToggle}
            aria-controls="language-menu"
            aria-haspopup="true"
            className={classes.languageToggle}
            sx={{
              textTransform: "none",
              display: "flex",
              alignItems: "center",
              color: theme.palette.text.secondary,
              fontWeight: 700, // Match Login button font weight
            }}
          >
            <Typography
              variant="button"
              color="textSecondary"
              className={classes.font700}
            >
              {i18n.language === "en" ? "Arabic (عربي)" : "English"}
            </Typography>
          </Button>
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
