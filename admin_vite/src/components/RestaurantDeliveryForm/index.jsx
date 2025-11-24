import React, { useEffect, useState } from "react";
import useStyles from "../styles";
import { useTranslation } from "react-i18next";
import useGlobalStyles from "../../utils/globalStyles";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Input,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { createRequestorOverride, updateRequestorOverride } from "../../apollo";

const RestaurantDeliveryForm = ({ onClose, overrideData }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const [values, setValues] = useState({
    // country: "",
    // city: "",
    requestor_type: "Business",
    requestor_id: "",
    service: "FOOD",
    model: "FIXED",
    fixed: "",
    per_km: "",
    min_fee: "",
    included_km: "",
    effective_from: "",
    effective_to: "",
    status: "ACTIVE",
    priority: 100,
  });

  const [success, setSuccess] = useState("");
  const [mainError, setMainError] = useState("");
  const restaurantId = localStorage.getItem("restaurantId");
  console.log({ restaurantId });

  // Load edit mode
  useEffect(() => {
    if (overrideData) {
      setValues({
        ...values,
        // country: overrideData.country,
        // city: overrideData.city || "",
        requestor_id: overrideData.requestor_id?._id || "",
        service: overrideData.service,
        model: overrideData.model,
        fixed: overrideData.params?.fixed || "",
        per_km: overrideData.params?.per_km || "",
        min_fee: overrideData.params?.min_fee || "",
        included_km: overrideData.params?.included_km || "",
        effective_from: overrideData.effective?.from || "",
        effective_to: overrideData.effective?.to || "",
        status: overrideData.status,
        priority: overrideData.priority,
      });
    }
  }, [overrideData]);

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const [mutate] = useMutation(createRequestorOverride, {
    onCompleted: (res) => {
      console.log({ res });
      setSuccess("Override saved successfully!");
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  const [mutateUpdate] = useMutation(updateRequestorOverride, {
    onCompleted: (res) => {
      console.log({ res });
      setSuccess("Override saved successfully!");
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  console.log({ values });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedInput = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    if (overrideData) {
      mutateUpdate({
        variables: {
          id: restaurantId,
          input: {
            ...cleanedInput,
            requestor_id: restaurantId,
            fixed: parseFloat(values.fixed),
            min_fee: parseFloat(values.min_fee),
            included_km: parseFloat(values.included_km),
          },
        },
      });
    } else {
      mutate({
        variables: {
          input: {
            ...cleanedInput,
            requestor_id: restaurantId,
            fixed: parseFloat(values.fixed),
            min_fee: parseFloat(values.min_fee),
            included_km: parseFloat(values.included_km),
          },
        },
      });
    }

    if (onClose) {
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {!overrideData
              ? t("Add Requestor Override")
              : t("Edit Requestor Override")}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {/* Service */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              {t("Service Type")}
            </Typography>
            <Select
              name="service"
              value={values.service}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FOOD">Food</MenuItem>
              <MenuItem value="GROCERY">Grocery</MenuItem>
              <MenuItem value="PHARMACY">Pharmacy</MenuItem>
              <MenuItem value="MASHAWEER">Mashawer</MenuItem>
            </Select>
          </Box>

          {/* Model */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              {t("Pricing Model")}
            </Typography>
            <Select
              name="model"
              value={values.model}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="PER_KM">Per KM</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </Select>
          </Box>

          {/* Dynamic Params */}
          {values.model === "FIXED" && (
            <Box mt={2}>
              <Typography className={classes.labelText}>
                Fixed Amount
              </Typography>
              <Input
                name="fixed"
                type="number"
                value={values.fixed}
                onChange={handleChange}
                disableUnderline
                className={globalClasses.input}
              />
            </Box>
          )}

          {values.model === "PER_KM" && (
            <>
              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Per KM Rate
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Minimum Fee
                </Typography>
                <Input
                  name="min_fee"
                  type="number"
                  value={values.min_fee}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
            </>
          )}

          {values.model === "HYBRID" && (
            <>
              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Base Fee (Fixed)
                </Typography>
                <Input
                  name="fixed"
                  type="number"
                  value={values.fixed}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Included KM
                </Typography>
                <Input
                  name="included_km"
                  type="number"
                  value={values.included_km}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Per KM After Included
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Minimum Fee
                </Typography>
                <Input
                  name="min_fee"
                  type="number"
                  value={values.min_fee}
                  onChange={handleChange}
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
            </>
          )}

          {/* Effective Dates */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              Effective From
            </Typography>
            <Input
              name="effective_from"
              type="date"
              value={values.effective_from}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          <Box mt={2}>
            <Typography className={classes.labelText}>Effective To</Typography>
            <Input
              name="effective_to"
              type="date"
              value={values.effective_to}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Priority */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Priority</Typography>
            <Input
              name="priority"
              type="number"
              value={values.priority}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Status */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Status</Typography>
            <Select
              name="status"
              value={values.status}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </Box>

          {/* Submit */}
          <Box mt={3}>
            <Button className={globalClasses.button} type="submit">
              {t("Save")}
            </Button>
          </Box>

          <Box mt={2}>
            {success && (
              <Alert
                variant="filled"
                severity="success"
                className={globalClasses.alertSuccess}
              >
                {success}
              </Alert>
            )}
            {mainError && (
              <Alert
                variant="filled"
                severity="error"
                className={globalClasses.alertError}
              >
                {mainError}
              </Alert>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default RestaurantDeliveryForm;
