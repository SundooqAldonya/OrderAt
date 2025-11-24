import React, { useEffect, useMemo, useState } from "react";
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
import { useLazyQuery, useMutation } from "@apollo/client/react";
import {
  createRequestorOverride,
  getRestaurantRequestorOverrideList,
  searchRestaurants,
  updateRequestorOverride,
} from "../../apollo";
import { debounce } from "lodash";

const RestaurantDeliveryForm = ({ onClose, restaurant }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const globalClasses = useGlobalStyles();
  const [restaurantOptions, setRestaurantOptions] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

  console.log({ values });

  // Load edit mode
  useEffect(() => {
    if (restaurant) {
      setValues({
        ...values,
        // country: restaurant.country,
        // city: restaurant.city || "",
        requestor_id: restaurant.requestor_id?._id || "",
        service: restaurant.service,
        model: restaurant.model,
        fixed: restaurant.params?.fixed || "",
        per_km: restaurant.params?.per_km || "",
        min_fee: restaurant.params?.min_fee || "",
        included_km: restaurant.params?.included_km || "",
        effective_from: restaurant.effective?.from
          ? restaurant.effective.from.substring(0, 10) // ⬅ RIGHT HERE
          : "",
        effective_to: restaurant.effective?.to
          ? restaurant.effective.to.substring(0, 10) // ⬅ AND HERE
          : "",
        status: restaurant.status,
        priority: restaurant.priority,
      });
      setSelectedRestaurant(restaurant.requestor_id);
    }
  }, [restaurant]);

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
    refetchQueries: [{ query: getRestaurantRequestorOverrideList }],
    onCompleted: (res) => {
      console.log({ res });
      setSuccess("Override saved successfully!");
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  console.log({ selectedRestaurant });

  const [fetchRestaurants, { loading: loadingRestaurants }] = useLazyQuery(
    searchRestaurants,
    {
      fetchPolicy: "no-cache",
    }
  );

  const handleRestaurantSelect = (newValue) => {
    console.log({ newValue });
    setSelectedRestaurant(newValue);
  };

  const debouncedSearchRestaurants = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          fetchRestaurants({ variables: { search: value } }).then((res) => {
            setRestaurantOptions(res.data?.searchRestaurants || []);
          });
        }
      }, 300),
    [fetchRestaurants]
  );

  console.log({ restaurant });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedInput = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        value === "" ? null : value,
      ])
    );

    if (restaurant) {
      mutateUpdate({
        variables: {
          id: restaurant._id,
          input: {
            ...cleanedInput,
            requestor_id: restaurant.requestor_id._id,
            fixed: parseFloat(values.fixed),
            min_fee: parseFloat(values.min_fee),
            included_km: parseFloat(values.included_km),
            per_km: parseFloat(values.per_km),
          },
        },
      });
    } else {
      mutate({
        variables: {
          input: {
            ...cleanedInput,
            requestor_id: selectedRestaurant._id,
            fixed: parseFloat(values.fixed),
            min_fee: parseFloat(values.min_fee),
            included_km: parseFloat(values.included_km),
            per_km: parseFloat(values.per_km),
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
            {!restaurant
              ? t("Add Requestor Override")
              : `${t("Edit Requestor Override")} for ${
                  restaurant?.requestor_id?.name
                }`}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {!restaurant ? (
            <Box>
              <Typography className={classes.labelText}>
                {t("businesses")}
              </Typography>
              <Autocomplete
                // multiple
                options={restaurantOptions || []}
                value={selectedRestaurant}
                onChange={(e, newValue) => handleRestaurantSelect(newValue)}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                onInputChange={(event, inputValue) => {
                  debouncedSearchRestaurants(inputValue);
                }}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Select Business"
                    className={globalClasses.input}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "black",
                        "& fieldset": { border: "none" }, // ❌ remove border
                        "&:hover fieldset": { border: "none" },
                        "&.Mui-focused fieldset": { border: "none" },
                      },
                    }}
                  />
                )}
                renderOption={(props, option, { selected }) => (
                  <li {...props} key={option._id}>
                    <Checkbox style={{ marginRight: 8 }} checked={selected} />
                    <ListItemText
                      primary={option.name}
                      style={{ textTransform: "capitalize", color: "#000" }}
                    />
                  </li>
                )}
                disableCloseOnSelect
                sx={{
                  width: "100%", // ✅ or a fixed width like '300px'
                  "& .MuiAutocomplete-inputRoot": {
                    flexWrap: "wrap",
                    paddingRight: "8px",
                    alignItems: "flex-start", // keeps label up
                  },
                  "& .MuiAutocomplete-tag": {
                    maxWidth: "100%", // ensures long chip labels wrap or truncate
                  },
                  margin: "0 0 0 0",
                  padding: "0px 0px",
                  "& .MuiOutlinedInput-root": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // ✅ remove border including on focus
                    },
                  },
                  "& .MuiChip-root": {
                    backgroundColor: "#f0f0f0", // ✅ light background
                    color: "#000", // ✅ black text
                    fontWeight: 500,
                    margin: "2px", // spacing between chips
                  },
                  "& .MuiChip-deleteIcon": {
                    color: "#888", // Optional: change delete icon color
                    "&:hover": {
                      color: "#000",
                    },
                  },
                }}
                slotProps={{
                  paper: {
                    sx: {
                      color: "black", // Text color
                      backgroundColor: "white", // Optional: background for contrast
                    },
                  },
                }}
              />
            </Box>
          ) : null}
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
