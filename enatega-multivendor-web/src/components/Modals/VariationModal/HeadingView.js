import { Box, Typography } from "@mui/material";
import clsx from "clsx";
import React from "react";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";

function ItemHeadingView({
  /*title = "Select Variation",
  subTitle = "Select 1",
  status = "Required",*/
  error = false,
  option,
  notice,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 1 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography
          style={{ fontSize: "1.25rem" }}
          className={classes.itemTitle}
        >
          {option
            ? "Select option"
            : notice
            ? "Write a notice"
            : t("selectVariation")}
        </Typography>
        <Box>
          <Typography
            className={clsx(classes.infoStyle, { [classes.itemError]: error })}
          >
            {t("required")}
          </Typography>
        </Box>
      </Box>
      <Box>
        {!notice ? (
          <Typography className={classes.priceTitle}>
            {t("subTitle")}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default React.memo(ItemHeadingView);
