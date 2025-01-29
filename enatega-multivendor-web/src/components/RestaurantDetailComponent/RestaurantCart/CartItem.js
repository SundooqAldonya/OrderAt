import { Box, IconButton, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import React, { useContext } from "react";
import ConfigurationContext from "../../../context/Configuration";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import { direction } from "../../../utils/helper";

function CartItem(props) {
  const { i18n, t } = useTranslation();
  const { language } = i18n;
  const classes = useStyles();
  const theme = useTheme();
  const configuration = useContext(ConfigurationContext);

  return (
    <Box>
      <Box
        style={{ marginTop: theme.spacing(3), marginBottom: theme.spacing(3) }}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              props.removeQuantity();
            }}
            style={{ background: theme.palette.primary.main }}
          >
            <RemoveIcon
              fontSize="small"
              style={{ color: theme.palette.common.black }}
            />
          </IconButton>
          <Typography
            style={{
              ...theme.typography.caption,
              fontWeight: theme.typography.fontWeightBold,
              color: theme.palette.common.black,
              padding: "5px 10px",
              borderRadius: 5,
              border: "1px solid theme.palette.common.black",
              margin: "0 8px",
            }}
          >
            {props.quantity ? props.quantity : 0}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.preventDefault();
              props.addQuantity();
            }}
            style={{ background: theme.palette.primary.main }}
          >
            <AddIcon
              fontSize="small"
              color="primary"
              style={{ color: theme.palette.common.black }}
            />
          </IconButton>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          flexGrow={1}
          marginInlineStart={1}
          justifyContent="flex-end"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-end"
            style={{
              flexGrow: 1,
            }}
          >
            <Box>
              <Typography className={classes.itemTextStyle}>
                {props.foodTitle ? props.foodTitle : ""}
              </Typography>
              <Typography
                style={{
                  color: theme.palette.common.black,
                  fontSize: "0.7rem",
                  marginTop: theme.spacing(0.5),
                }}
                className={classes.itemTextStyle}
              >
                {props.variationTitle ? `(${props.variationTitle})` : ""}
              </Typography>
              {props?.optionTitles?.map((title, index) => (
                <Box key={index} display="flex">
                  <Typography
                    style={{
                      color: theme.palette.common.black,
                      fontSize: "0.7rem",
                    }}
                    className={classes.optionTextStyle}
                  >
                    +{title}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box>
              <Typography
                style={{ color: theme.palette.common.black }}
                className={classes.subtotalText}
              >
                {` ${configuration.currencySymbol}  ${parseFloat(
                  props.dealPrice
                ).toFixed(2)}`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {props.instructions ? (
        <Box dir={direction(language)} sx={{ width: "100%" }}>
          <Typography sx={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
            {t("specialInstructions")}
          </Typography>
          <Typography sx={{ color: "#000" }}>
            {props.instructions ? props.instructions : null}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
export default React.memo(CartItem);
