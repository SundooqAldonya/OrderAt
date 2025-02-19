import React, { Fragment, useContext, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import PersonIcon from "@mui/icons-material/Person";
import LanguageIcon from "@mui/icons-material/Language";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import UserContext from "../../../context/User";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import useStyles from "./styles";
import SearchRestaurantNav from "../SearchRestaurantNav";
import { SearchContext } from "../../../context/useSearch";
import SearchRestaurantSidebar from "../SearchRestaurantSidebar";

const DrawerMenu = ({ open, setOpen, toggleDrawer, handleLanguageChange }) => {
  const { i18n, t } = useTranslation();
  const { language } = i18n;
  const [anchor, setAnchor] = useState(language === "ar" ? "left" : "right");
  const navigate = useNavigate();
  const { isLoggedIn, logout, profile } = useContext(UserContext);
  const theme = useTheme();
  const classes = useStyles();

  const handleClose = () => {
    setOpen(false);
  };

  const redirectHandler = (link) => {
    window.open(link, "_blank");
  };

  const { search, setSearch } = useContext(SearchContext);

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {isLoggedIn && (
          <Fragment>
            <ListItem disablePadding onClick={toggleDrawer}>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon style={{ color: theme.palette.common.black }} />
                </ListItemIcon>
                <ListItemText
                  onClick={() => navigate("/profile")}
                  primary={profile?.name}
                  sx={{
                    color: "#000",
                    textTransform: "capitalize",
                  }}
                  primaryTypographyProps={{
                    style: { fontWeight: "bold", fontSize: 22 },
                  }}
                />
              </ListItemButton>
            </ListItem>
            <Divider />
          </Fragment>
        )}
        <ListItem disablePadding>
          <ListItemButton sx={{ flexDirection: "column" }}>
            <SearchRestaurantSidebar
              search={search}
              setSearch={setSearch}
              sidebar={true}
            />
            <Button
              sx={{
                alignSelf: "flex-end",
              }}
              onClick={() => navigate("/business-list")}
            >
              {t("search")}
            </Button>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding onClick={toggleDrawer}>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon style={{ color: theme.palette.common.black }} />
            </ListItemIcon>
            <ListItemText
              onClick={() => navigate("/")}
              primary={`${t("home")}`}
              sx={{ color: "#000" }}
            />
          </ListItemButton>
        </ListItem>
        {!isLoggedIn && (
          <ListItem disablePadding onClick={toggleDrawer}>
            <ListItemButton>
              <ListItemIcon>
                <PersonIcon style={{ color: theme.palette.common.black }} />
              </ListItemIcon>
              <ListItemText
                onClick={() => navigate("/login")}
                primary={`${t("loginBtn")}`}
                sx={{ color: "#000" }}
              />
            </ListItemButton>
          </ListItem>
        )}

        {isLoggedIn && (
          <Fragment>
            <ListItem disablePadding onClick={toggleDrawer}>
              <ListItemButton>
                <ListItemIcon>
                  <LocalShippingIcon
                    style={{ color: theme.palette.common.black }}
                  />
                </ListItemIcon>
                <ListItemText
                  onClick={() => navigate("/orders")}
                  primary={t("titleOrders")}
                  sx={{ color: "#000", textTransform: "capitalize" }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={toggleDrawer}>
              <ListItemButton>
                <ListItemIcon>
                  <PersonIcon style={{ color: theme.palette.common.black }} />
                </ListItemIcon>
                <ListItemText
                  onClick={() => navigate("/profile")}
                  primary={t("titleProfile")}
                  sx={{ color: "#000", textTransform: "capitalize" }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding onClick={toggleDrawer}>
              <ListItemButton>
                <ListItemIcon>
                  <LogoutIcon style={{ color: theme.palette.common.black }} />
                </ListItemIcon>
                <ListItemText
                  onClick={() => logout()}
                  primary={t("titleLogout")}
                  sx={{ color: "#000", textTransform: "capitalize" }}
                />
              </ListItemButton>
            </ListItem>
          </Fragment>
        )}

        <ListItem disablePadding onClick={handleLanguageChange}>
          <ListItemButton>
            <ListItemIcon>
              <LanguageIcon style={{ color: theme.palette.common.black }} />
            </ListItemIcon>
            <ListItemText
              primary={language === "ar" ? "En" : "عربي"}
              sx={{ color: "#000" }}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
        <Box>
          {/* <Typography
            style={{
              textAlign: "center",
              fontSize: 18,
              marginTop: 20,
            }}
          >
            {t("contactus")}
          </Typography> */}
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <Box
              className={classes.iconContainer}
              onClick={() =>
                redirectHandler("https://www.facebook.com/orderategypt")
              }
            >
              <FacebookIcon style={{ color: theme.palette.common.white }} />
            </Box>
            <Box
              className={classes.iconContainer}
              style={{ marginLeft: 10 }}
              onClick={() =>
                redirectHandler("https://www.instagram.com/orderategypt")
              }
            >
              <InstagramIcon style={{ color: theme.palette.common.white }} />
            </Box>
            <Box
              className={classes.iconContainer}
              style={{ marginLeft: 10 }}
              onClick={() => redirectHandler("https://wa.me/+201501662775")}
            >
              <WhatsAppIcon style={{ color: theme.palette.common.white }} />
            </Box>
          </Box>
        </Box>
      </List>
    </Box>
  );

  return (
    <div>
      <Drawer
        open={open}
        anchor={anchor}
        onClose={handleClose}
        style={{ zIndex: 99999999999 }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default DrawerMenu;
