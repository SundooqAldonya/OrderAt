import {
  Box,
  Divider,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState} from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import TwitterIcon from "@mui/icons-material/Twitter";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useTranslation } from "react-i18next";
import useStyles from "./styles";




function Footer() {

  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const small = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
   const [hovered, setHovered] = useState(false);
    const [hoveredLink, setHoveredLink] = useState(null);

    const links = [
      { id: 1, to: "/", label: "Home" },
      { id: 2, to: "/privacy", label: "Privacy and policy" },
      { id: 3, to: "/terms", label: "Terms and condition" }, // New link
    ];

  const redirectHandler = (link) => {
    window.open(link, "_blank");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleButtonClick = () => {  
    try {  
      window.scrollTo({ top: 0, behavior: 'smooth' });  
    } catch (error) {  
      console.error("Smooth scroll failed", error);  
      // Fallback to instant scroll  
      window.scrollTo(0, 0);  
    }  
  };  


  return (
    <Grid container alignItems="center">
      <Grid
        item
        xs={12}
        md={2.5}
        align="center"
        style={{ padding: small ? "3rem" : 0 }}
      >
        <Box className={classes.left}>
          <Typography
            variant="h4"
            style={{
              fontWeight: 900,
              color: theme.palette.primary.main,
              marginBottom: 20,
            }}
            align="center"
          >
            Orderat
          </Typography>
          <Typography
            variant="body2"
            style={{
              
              color: theme.palette.common.white,
              fontSize: 15,
            }}
          >
            {t("footerText")}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={6.5} align="center">
        <Box style={{ margin: small ? "2rem 0rem 4rem 0rem" : 0 }}>
          <Typography
            variant="body2"
            style={{ fontWeight: 700, fontSize: "1.4rem" }}
          >
            {t("linksTitle")}
          </Typography>
         {links.map((link) => (
        <RouterLink
          key={link.id}
          to={link.to}
          onClick={handleButtonClick}
          style={{ textDecoration: "none" }}
          onMouseEnter={() => setHoveredLink(link.id)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <Typography
            variant="body2"
            style={{
              marginTop: 10,
              color: hoveredLink === link.id ? "#8BC34A" : "#000",
            }}
          >
            {t ? t(link.label) : link.label}
          </Typography>
        </RouterLink>
      ))}

          <Divider
            style={{
              width: "70%",
              marginTop: 30,
              display: small ? "none" : "block",
            }}
          />
          <Typography
            variant="body2"
            style={{
              marginTop: 10,
              display: small ? "none" : "block",
            }}
          >
            {t("footerEndText")}
          </Typography>
        </Box>
      </Grid>
      <Grid
        item
        xs={12}
        md={3}
        align="center"
        style={{ margin: small ? "0rem 0rem 4rem 0rem" : 0 }}
      >
        <Typography
          variant="body2"
          style={{ fontWeight: 700, fontSize: "1.4rem" }}
        >
          {t("followUs")}
        </Typography>
        <Box
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            marginTop: 50,
            marginBottom: 20,
          }}
        >
          <Box
            className={classes.iconContainer}
            onClick={() => redirectHandler("https://www.facebook.com/enatega/")}
          >
            <FacebookIcon style={{ color: theme.palette.common.white }} />
          </Box>
          <Box
            className={classes.iconContainer}
            style={{ marginLeft: 10 }}
            onClick={() => redirectHandler("https://twitter.com/NinjasCode1")}
          >
            <TwitterIcon style={{ color: theme.palette.common.white }} />
          </Box>
          <Box
            className={classes.iconContainer}
            style={{ marginLeft: 10 }}
            onClick={() =>
              redirectHandler("https://www.instagram.com/enatega.nb/")
            }
          >
            <InstagramIcon style={{ color: theme.palette.common.white }} />
          </Box>
          <Box
            className={classes.iconContainer}
            style={{ marginLeft: 10 }}
            onClick={() =>
              redirectHandler("https://www.linkedin.com/company/14583783")
            }
          >
            <LinkedInIcon style={{ color: theme.palette.common.white }} />
          </Box>
          <Box
            className={classes.iconContainer}
            style={{ marginLeft: 10 }}
            onClick={() =>
              redirectHandler(
                "https://github.com/Ninjas-Code-official/Marketplace-Food-Delivery-Solution"
              )
            }
          >
            <GitHubIcon style={{ color: theme.palette.common.white }} />
          </Box>
        </Box>
        

        <Divider
          style={{
            width: "70%",
            marginTop: 30,
            display: small ? "block" : "none",
          }}
        />
        <Typography
          variant="body2"
          style={{
            fontWeight: 600,
            marginTop: 10,
            display: small ? "block" : "none",
            fontSize: 12,
          }}
        >
          {t("footerEndText")}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default Footer;
