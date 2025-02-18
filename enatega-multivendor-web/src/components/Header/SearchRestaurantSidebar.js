import {
  Button,
  Grid,
  Input,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import React from "react";
import SearchIcon from "../../assets/icons/SearchIcon";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";

function SearchRestaurantSidebar({ search, setSearch, navbar }) {
  const { i18n, t } = useTranslation();
  const { language } = i18n;
  const isArabic = language === "ar" ? "rtl" : "ltr";
  const theme = useTheme();
  const extraSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles(extraSmall);

  return (
    <Grid container item className={`${classes.root}`}>
      <Grid container item xs={12} className={classes.searchContainer}>
        <Paper
          dir={isArabic}
          elevation={0}
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            padding: "12px",
            background: navbar ? "#efefef" : theme.palette.common.white,
            borderRadius: 50,
            height: 20,
          }}
        >
          <SearchIcon />
          <Input
            disableUnderline={true}
            fullWidth
            type="text"
            placeholder={t("searchRestaurantPlaceholder")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              "& .MuiInputBase-input::placeholder": {
                color: "#000",
                opacity: 0.5,
              },
            }}
            inputProps={{
              style: {
                borderWidth: 0,
                textOverflow: "ellipsis",
                marginInlineStart: 2,
                color: "#000",
              },
            }}
          />
          {search ? (
            <Button onClick={() => setSearch("")} style={{ maxWidth: "auto" }}>
              <HighlightOffIcon
                style={{ color: theme.palette.text.secondary }}
              />
            </Button>
          ) : null}
        </Paper>
      </Grid>
    </Grid>
  );
}

export default React.memo(SearchRestaurantSidebar);
