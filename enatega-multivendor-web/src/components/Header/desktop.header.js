import { Box, Divider, Menu, MenuItem, useTheme, Link } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useContext, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useStyle from "./styles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { ReactComponent as PersonIcon } from "../../assets/icons/user.svg";
import { ReactComponent as FavoriteBorderIcon } from "../../assets/icons/favourite.svg";
import { ReactComponent as LocalMallIcon } from "../../assets/icons/cart.svg";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import logo from "../../assets/8.png";
import logoAr from "../../assets/9.png";
import { useTranslation } from "react-i18next";
import { direction } from "../../utils/helper";
import { SearchContext } from "../../context/useSearch";
import SearchRestaurantNav from "./SearchRestaurantNav";
import PickDeliveryTabs from "./PickDeliveryTabs";
import { Fragment } from "react";
import LunchDiningIcon from "@mui/icons-material/LunchDining";
import DrawerMenu from "./LoginHeader/DrawerMenu";

function DHeader({
  navitems,
  title,
  close,
  open,
  anchor,
  name,
  favLength = 0,
  cartCount = 0,
  mobile,
}) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();
  const classes = useStyle();
  const location = useLocation();
  const { i18n } = useTranslation();
  const { language } = i18n;
  const { search, setSearch } = useContext(SearchContext);
  const currentLang = localStorage.getItem("enatega-language") || language;

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
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
    <AppBar
      dir={direction(language)}
      elevation={0}
      position="fixed"
      style={{
        background: "transparent",
      }}
      className={classes.root}
    >
      <Toolbar className={classes.toolbar}>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          <RouterLink
            to={
              location.pathname === "/checkout"
                ? "/business-list"
                : "/business-list"
            }
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
          {/* <Link component={RouterLink} to={"/otlob-mandoob/pickup"}>
            <Typography>Otlob mandoob</Typography>
          </Link> */}
        </Box>
        {!mobile && (
          <Fragment>
            <Box sx={{ width: "40%", display: "flex", alignItems: "center" }}>
              {!mobile ? (
                <Fragment>
                  {/* <PickDeliveryTabs /> */}
                  <SearchRestaurantNav
                    search={search}
                    setSearch={setSearch}
                    navbar={true}
                  />
                </Fragment>
              ) : null}
            </Box>
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

              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={(event) => open(event)}
              >
                <PersonIcon className={classes.icon} />
                {!mobile && (
                  <Typography
                    variant="button"
                    color="textSecondary"
                    noWrap
                    className={`${classes.ml} ${classes.font700}`}
                    style={{ maxWidth: 70 }}
                  >
                    {name}
                  </Typography>
                )}

                {anchor === null ? (
                  <ExpandMoreIcon color="primary" className={classes.icon} />
                ) : (
                  <ExpandLessIcon color="primary" className={classes.icon} />
                )}
              </Button>
              <Divider flexItem orientation="vertical" light />
              <Menu
                id="long-menu"
                anchorEl={anchor}
                keepMounted
                open={Boolean(anchor)}
                onClose={close}
                getcontentanchorel={null}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                style={{
                  marginTop: "48px",
                }}
                MenuListProps={{
                  style: {
                    background: "rgba(243, 244, 248, 0.8)",
                    backdropFilter: "blur(6px)",
                    padding: 0,
                  },
                }}
              >
                {navitems.map((item, index) => (
                  <Box key={index}>
                    <RouterLink
                      to={item.link}
                      className={classes.linkDecoration}
                    >
                      <MenuItem
                        className={classes.menuItem}
                        onClick={() => close(item.title)}
                      >
                        <Typography color="textSecondary" variant="body2">
                          {item.title}
                        </Typography>
                      </MenuItem>
                    </RouterLink>
                  </Box>
                ))}
              </Menu>
              <Box display="flex" alignItems="center">
                <Box marginInline={theme.spacing(3)} alignItems={"center"}>
                  <RouterLink to="/favourite">
                    {favLength > 0 ? (
                      <FavoriteIcon className={classes.icon} />
                    ) : (
                      <FavoriteBorderIcon className={classes.icon} />
                    )}
                  </RouterLink>
                </Box>
                {cartCount && (
                  <>
                    <Divider orientation="vertical" light />
                    <RouterLink
                      to="/checkout"
                      className={classes.linkDecoration}
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        marginInlineStart={theme.spacing(3)}
                      >
                        <LocalMallIcon className={classes.icon} />
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          className={classes.cartText}
                        >
                          {cartCount}
                        </Typography>
                      </Box>
                    </RouterLink>
                  </>
                )}
              </Box>
            </Box>
          </Fragment>
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
            open={openDrawer}
            setOpen={setOpenDrawer}
            toggleDrawer={toggleDrawer}
            handleLanguageChange={handleLanguageChange}
          />
        )}
      </Toolbar>
    </AppBar>
  );
}

export default React.memo(DHeader);
