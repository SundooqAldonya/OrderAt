import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Input,
  Button,
  Autocomplete,
  TextField,
  Checkbox,
  ListItemText,
  Alert,
  MenuItem,
  Select,
  Stepper,
} from "@mui/material";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import { gql } from "@apollo/client";
import useGlobalStyles from "../../utils/globalStyles";
import { useTranslation } from "react-i18next";
import {
  getAllDeliveryZonesByCity,
  getCities,
  CREATE_ZONE_PRICING,
} from "../../apollo";

// GraphQL queries/mutations
const GET_ZONES = gql`
  query ZonesAdmin($search: String) {
    deliveryZonesAdmin(search: $search) {
      _id
      title
      city {
        title
      }
    }
  }
`;

const GET_ZONE_PRICINGS = gql`
  query {
    zonePricings {
      _id
      originZone {
        title
      }
      destinationZone {
        title
      }
      pricingRule {
        baseFare
        perKmRate
        minFare
        surgeMultiplier
      }
    }
  }
`;

const GET_CITIES = gql`
  ${getCities}
`;

export default function ZonePricingForm({ onClose }) {
  const { t } = useTranslation();
  const globalClasses = useGlobalStyles();

  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [zonesOptions, setZonesOptions] = useState([]);

  const [baseFare, setBaseFare] = useState("");
  const [perKmRate, setPerKmRate] = useState("");
  const [minFare, setMinFare] = useState("");
  const [surgeMultiplier, setSurgeMultiplier] = useState("");

  const [selectedCity, setSelectedCity] = useState(null);

  console.log({ selectedCity });
  console.log({ selectedOrigin });
  console.log({ selectedDestination });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const {
    data,
    loading: loadingCities,
    error: errorCities,
  } = useQuery(GET_CITIES);

  const cities = data?.citiesAdmin || null;

  console.log({ cities });

  const [fetchZones] = useLazyQuery(getAllDeliveryZonesByCity, {
    fetchPolicy: "no-cache",
    // onCompleted: (data) => {
    //   setZonesOptions(data?.getAllDeliveryZonesByCity || []);
    // },
  });

  useEffect(() => {
    if (selectedCity) {
      fetchZones({
        variables: {
          cityId: selectedCity,
        },
      }).then((res) => {
        console.log({ res });
        setZonesOptions(res?.data?.getAllDeliveryZonesByCity || []);
      });
    }
  }, [selectedCity]);

  const [mutate, { loading }] = useMutation(CREATE_ZONE_PRICING, {
    // refetchQueries: [{ query: GET_ZONE_PRICINGS }],
    onCompleted: (res) => {
      setSuccess("Zone pricing created successfully!");
      setError("");
      onClose && onClose();
    },
    onError: (err) => {
      console.log(err);
      setError(err.message || "Something went wrong");
      setSuccess("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ selectedOrigin });
    console.log({ selectedDestination });
    if (!selectedOrigin || !selectedDestination) {
      setError("Please select both origin and destination zones.");
      return;
    }

    mutate({
      variables: {
        input: {
          originZone: selectedOrigin,
          destinationZone: selectedDestination,
          pricingRule: {
            baseFare: parseFloat(baseFare),
            perKmRate: parseFloat(perKmRate),
            minFare: parseFloat(minFare),
            surgeMultiplier: parseFloat(surgeMultiplier) || 1,
          },
        },
      },
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        p: 3,
        boxShadow: 2,
        width: "100%",
        maxWidth: 700,
        mx: "auto",
      }}
    >
      <Typography variant="h6" mb={2} fontWeight="bold">
        {t("Create Zone Pricing")}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Origin Zone */}
          <Grid size={{ xs: 12 }}>
            <Typography>City</Typography>
            <Select
              id="input-city"
              name="input-city"
              defaultValue={selectedCity || ""}
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              className={[globalClasses.input]}
            >
              {!selectedCity && (
                <MenuItem value="" style={{ color: "black" }}>
                  {t("Select City")}
                </MenuItem>
              )}
              {cities?.map((city) => (
                <MenuItem
                  value={city._id}
                  key={city._id}
                  style={{ color: "black" }}
                >
                  {city.title}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>Origin Zone</Typography>
            <Select
              id="input-city"
              name="input-city"
              defaultValue={selectedOrigin || ""}
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              className={[globalClasses.input]}
            >
              {!selectedOrigin && (
                <MenuItem value="" style={{ color: "black" }}>
                  {t("Select Origin Zone")}
                </MenuItem>
              )}
              {zonesOptions?.map((zone) => (
                <MenuItem
                  value={zone._id}
                  key={zone._id}
                  style={{ color: "black" }}
                >
                  {zone.title}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Destination Zone */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography>Destination Zone</Typography>
            <Select
              id="input-city"
              name="input-city"
              defaultValue={selectedDestination || ""}
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              displayEmpty
              inputProps={{ "aria-label": "Without label" }}
              className={[globalClasses.input]}
            >
              {!selectedDestination && (
                <MenuItem value="" style={{ color: "black" }}>
                  {t("Select Origin Zone")}
                </MenuItem>
              )}
              {zonesOptions?.map((zone) => (
                <MenuItem
                  value={zone._id}
                  key={zone._id}
                  style={{ color: "black" }}
                >
                  {zone.title}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Base Fare */}
          <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
            <Typography>Base Fare</Typography>
            <Input
              type="number"
              placeholder="e.g. 10"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
              disableUnderline
              className={globalClasses.input}
            />
          </Grid>

          {/* Per Km Rate */}
          <Grid size={{ xs: 12 }}>
            <Typography>Per Km Rate</Typography>
            <Input
              type="number"
              placeholder="e.g. 2.5"
              value={perKmRate}
              onChange={(e) => setPerKmRate(e.target.value)}
              disableUnderline
              className={globalClasses.input}
            />
          </Grid>

          {/* Min Fare */}
          <Grid size={{ xs: 12 }}>
            <Typography>Minimum Fare</Typography>
            <Input
              type="number"
              placeholder="e.g. 15"
              value={minFare}
              onChange={(e) => setMinFare(e.target.value)}
              disableUnderline
              className={globalClasses.input}
            />
          </Grid>

          {/* Surge Multiplier */}
          <Grid size={{ xs: 12 }}>
            <Typography>Surge Multiplier</Typography>
            <Input
              type="number"
              placeholder="e.g. 1.5"
              value={surgeMultiplier}
              onChange={(e) => setSurgeMultiplier(e.target.value)}
              disableUnderline
              className={globalClasses.input}
            />
          </Grid>
        </Grid>

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            className={globalClasses.button}
          >
            {loading ? t("Saving...") : t("save")}
          </Button>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </form>
    </Box>
  );
}
