import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Alert,
  TextField,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import useStyles from "../styles";
import useGlobalStyles from "../../utils/globalStyles";
import {
  getAllCountryPricing,
  getCountries,
  upsertCountryPricing,
} from "../../apollo";

const CountryPricingForm = ({ onClose, editData }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const { data: dataCountries } = useQuery(getCountries);

  const countries = dataCountries?.getCountries || null;
  console.log({ editData });

  const [values, setValues] = useState({
    country: "",
    service: "MASHAWEER",
    model: "",
    fixed: "",
    per_km: "",
    min_fee: "",
    included_km: "",
    status: "ACTIVE",
  });

  const [success, setSuccess] = useState("");
  const [mainError, setMainError] = useState("");

  // Load edit data when editing existing record
  useEffect(() => {
    if (editData) {
      setValues({
        country: editData.country?._id || "",
        service: editData.service || "MASHAWEER",
        model: editData.model || "",
        fixed: editData.params?.fixed || "",
        per_km: editData.params?.per_km || "",
        min_fee: editData.params?.min_fee || "",
        included_km: editData.params?.included_km || "",
        status: editData.status || "ACTIVE",
      });
    }
  }, [editData]);

  // Convert empty strings to null
  const cleanValues = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
    );

  const [mutate] = useMutation(upsertCountryPricing, {
    onCompleted: () => {
      setSuccess(
        editData
          ? "Updated country pricing successfully!"
          : "Created country pricing successfully!"
      );
      if (onClose) {
        setTimeout(() => onClose(), 1200);
      }
    },
    onError: (err) => setMainError(err.message),
    refetchQueries: [{ query: getAllCountryPricing }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = cleanValues(values);

    mutate({
      variables: {
        id: editData?._id || null,
        input: {
          country: editData ? editData.country?._id : cleaned.country,
          service: cleaned.service,
          model: cleaned.model,
          fixed: cleaned.fixed ? Number(cleaned.fixed) : null,
          per_km: cleaned.per_km ? Number(cleaned.per_km) : null,
          min_fee: cleaned.min_fee ? Number(cleaned.min_fee) : null,
          included_km: cleaned.included_km ? Number(cleaned.included_km) : null,
          status: cleaned.status,
        },
      },
    });
  };

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {editData ? "Edit Country Pricing" : "Add Country Pricing"}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {/* Country */}
          {!editData ? (
            <Box mt={2}>
              <Typography className={classes.labelText}>Country</Typography>
              <Select
                name="country"
                value={values.country}
                onChange={(e) =>
                  setValues({ ...values, country: e.target.value })
                }
                fullWidth
                className={globalClasses.input}
              >
                {countries?.map((country) => {
                  return (
                    <MenuItem key={country._id} value={country._id}>
                      {country.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
          ) : null}

          {/* Service */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Service</Typography>
            <Select
              name="service"
              value={values.service}
              onChange={(e) =>
                setValues({ ...values, service: e.target.value })
              }
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FOOD">Food</MenuItem>
              <MenuItem value="MASHAWEER">Mashaweer</MenuItem>
              <MenuItem value="GROCERY">Grocery</MenuItem>
              <MenuItem value="PHARMACY">Pharmacy</MenuItem>
            </Select>
          </Box>

          {/* Pricing Model */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Pricing Model</Typography>
            <Select
              name="model"
              value={values.model}
              onChange={(e) => {
                const model = e.target.value;

                setValues({
                  ...values,
                  model,
                  ...(model === "FIXED"
                    ? { per_km: "", min_fee: "", included_km: "" }
                    : model === "PER_KM"
                    ? { fixed: "", included_km: "" }
                    : {}),
                });
              }}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="PER_KM">Per KM</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </Select>
          </Box>

          {/* Dynamic Fields */}
          {values.model === "FIXED" && (
            <Box mt={2}>
              <Typography className={classes.labelText}>Fixed Price</Typography>
              <Input
                name="fixed"
                type="number"
                value={values.fixed}
                onChange={(e) =>
                  setValues({ ...values, fixed: e.target.value })
                }
                disableUnderline
                className={globalClasses.input}
              />
            </Box>
          )}

          {values.model === "PER_KM" && (
            <>
              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Price per KM
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={(e) =>
                    setValues({ ...values, per_km: e.target.value })
                  }
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
                  onChange={(e) =>
                    setValues({ ...values, min_fee: e.target.value })
                  }
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
                  Base Fixed Fee
                </Typography>
                <Input
                  name="fixed"
                  type="number"
                  value={values.fixed}
                  onChange={(e) =>
                    setValues({ ...values, fixed: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Price per KM
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={(e) =>
                    setValues({ ...values, per_km: e.target.value })
                  }
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
                  onChange={(e) =>
                    setValues({ ...values, min_fee: e.target.value })
                  }
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
                  onChange={(e) =>
                    setValues({ ...values, included_km: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
            </>
          )}

          {/* Status */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Status</Typography>
            <Select
              name="status"
              value={values.status}
              onChange={(e) => setValues({ ...values, status: e.target.value })}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </Box>

          {/* Submit Button */}
          <Box mt={3}>
            <Button className={globalClasses.button} type="submit">
              Save
            </Button>
          </Box>

          {/* Alerts */}
          <Box mt={2}>
            {success && (
              <Alert
                className={globalClasses.alertSuccess}
                variant="filled"
                severity="success"
              >
                {success}
              </Alert>
            )}
            {mainError && (
              <Alert
                className={globalClasses.alertError}
                variant="filled"
                severity="error"
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

export default CountryPricingForm;
