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
import { getAllCityPricing, getCities, upsertCityPricing } from "../../apollo";
import { gql } from "@apollo/client";

const GET_CITIES = gql`
  ${getCities}
`;

const CityPricingForm = ({ onClose, editData }) => {
  console.log({ editData });
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const [values, setValues] = useState({
    city: "",
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

  const { data, loading, refetch } = useQuery(GET_CITIES);
  const cities = data?.citiesAdmin || null;

  // Load editData into form
  useEffect(() => {
    if (editData) {
      setValues({
        city: editData.city?._id || "",
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

  // Normalize empty strings → null
  const clean = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
    );

  const [mutate] = useMutation(upsertCityPricing, {
    onCompleted: () => {
      setSuccess(
        editData
          ? "Updated city pricing successfully!"
          : "Created city pricing successfully!"
      );
      if (onClose) {
        setTimeout(() => onClose(), 1200);
      }
    },
    onError: (err) => setMainError(err.message),
    refetchQueries: [{ query: getAllCityPricing }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = clean(values);

    mutate({
      variables: {
        id: editData?._id || null,
        input: {
          city: cleaned.city,
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
            {editData
              ? `Edit City Pricing ${editData.city?.title}`
              : "Add City Pricing"}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {/* City */}
          {!editData ? (
            <Box mt={2}>
              <Typography className={classes.labelText}>City</Typography>
              <Select
                name="city"
                value={values.city}
                onChange={(e) => setValues({ ...values, city: e.target.value })}
                fullWidth
                className={globalClasses.input}
              >
                {cities?.map((city) => {
                  return (
                    <MenuItem key={city._id} value={city._id}>
                      {city.title}
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
          ) : null}

          {/* Service Type */}
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

          {/* Model */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Pricing Model</Typography>
            <Select
              name="model"
              value={values.model}
              onChange={(e) =>
                setValues({
                  ...values,
                  model: e.target.value,
                  ...(e.target.value === "FIXED"
                    ? { per_km: "", min_fee: "", included_km: "" }
                    : e.target.value === "PER_KM"
                    ? { fixed: "", included_km: "" }
                    : {}),
                })
              }
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="PER_KM">Per KM</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </Select>
          </Box>

          {/* Params: dynamic fields */}
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

          {/* Submit */}
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

export default CityPricingForm;
