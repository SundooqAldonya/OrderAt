import React from "react";
import { Button, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import i18n from "../../i18n";

function LanguageToggle({ classes }) {
  const theme = useTheme();

  const handleLanguageToggle = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("enatega-language", newLang);
  };

  return (
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
        fontWeight: 700,
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
  );
}

export default React.memo(LanguageToggle);
