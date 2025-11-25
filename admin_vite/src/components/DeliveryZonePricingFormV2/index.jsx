import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import useStyles from "../styles";
import useGlobalStyles from "../../utils/globalStyles";
import {
  getAllDeliveryZonesByCity,
  getCities,
  upsertZonePricing,
} from "../../apollo";
import { gql } from "@apollo/client";

// const GET_ZONES = gql`
//   ${getAllDeliveryZones}
// `;
const GET_CITIES = gql`
  ${getCities}
`;

const DeliveryZonePricingFormV2 = ({ onClose, editData }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const [selectedCity, setSelectedCity] = useState(null);
  const [values, setValues] = useState({
    originZone: "",
    destinationZone: "",
    baseFare: "",
    perKmRate: "",
    minFare: "",
    surgeMultiplier: 1,
    isActive: true,
  });

  console.log({ selectedCity });

  // Fetch delivery zones
  const { data: citiesData } = useQuery(GET_CITIES);
  // const { data: zoneData } = useQuery(GET_ZONES);

  const [fetchZones, { data: zoneData, loading: loadingZones, error }] =
    useLazyQuery(getAllDeliveryZonesByCity);

  console.log({ zoneData });

  const cities = citiesData?.citiesAdmin || null;
  const zones = zoneData?.getAllDeliveryZonesByCity || null;

  const [success, setSuccess] = useState("");
  const [mainError, setMainError] = useState("");

  useEffect(() => {
    if (selectedCity) {
      fetchZones({
        variables: {
          cityId: selectedCity,
        },
      });
    }
  }, [selectedCity]);

  // If editing fill initial form values
  useEffect(() => {
    if (editData) {
      setValues({
        originZone: editData.originZone?._id || "",
        destinationZone: editData.destinationZone?._id || "",
        baseFare: editData.baseFare,
        perKmRate: editData.perKmRate,
        minFare: editData.minFare,
        surgeMultiplier: editData.surgeMultiplier || 1,
        isActive: editData.isActive,
      });
      setSelectedCity(editData.city?._id);
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const [mutate] = useMutation(upsertZonePricing, {
    // refetchQueries: ["GetAllZonePricing"],
    onCompleted: () => {
      setSuccess(
        editData
          ? "Updated zone pricing successfully!"
          : "Created zone pricing successfully!"
      );
      if (onClose) {
        setTimeout(() => onClose(), 1200);
      }
    },
    onError: (err) => setMainError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    mutate({
      variables: {
        input: {
          ...values,
          city: selectedCity,
          baseFare: values.baseFare ? parseFloat(values.baseFare) : null,
          perKmRate: values.perKmRate ? parseFloat(values.perKmRate) : null,
          minFare: values.minFare ? parseFloat(values.minFare) : null,
          surgeMultiplier: values.surgeMultiplier
            ? parseFloat(values.surgeMultiplier)
            : 1,
          isActive: Boolean(values.isActive),
          id: editData?._id || null,
        },
      },
    });
  };

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {editData ? "Edit Zone Pricing" : "Add Zone Pricing"}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {/* Origin Zone */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Cities</Typography>
            <Select
              name="originZone"
              value={selectedCity || ""}
              onChange={(e) => setSelectedCity(e.target.value)}
              fullWidth
              className={globalClasses.input}
            >
              {cities?.map((city) => (
                <MenuItem key={city._id} value={city._id}>
                  {city.title}
                </MenuItem>
              ))}
            </Select>
          </Box>
          {/* Origin Zone */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Origin Zone</Typography>
            <Select
              name="originZone"
              value={values.originZone || ""}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              {zones?.map((z) => (
                <MenuItem key={z._id} value={z._id}>
                  {z.title}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Destination Zone */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              Destination Zone
            </Typography>
            <Select
              name="destinationZone"
              value={values.destinationZone || ""}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              {zones?.map((z) => (
                <MenuItem key={z._id} value={z._id}>
                  {z.title}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Base Fare */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Base Fare</Typography>
            <Input
              name="baseFare"
              type="number"
              value={values.baseFare}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Per KM Rate */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Per KM Rate</Typography>
            <Input
              name="perKmRate"
              type="number"
              value={values.perKmRate}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Min Fare */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Minimum Fare</Typography>
            <Input
              name="minFare"
              type="number"
              value={values.minFare}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Surge */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              Surge Multiplier
            </Typography>
            <Input
              name="surgeMultiplier"
              type="number"
              value={values.surgeMultiplier}
              onChange={handleChange}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Status */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Status</Typography>
            <Select
              name="isActive"
              value={values.isActive}
              onChange={handleChange}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
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

export default DeliveryZonePricingFormV2;
