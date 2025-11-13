import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import { gql } from "@apollo/client";
import useGlobalStyles from "../../utils/globalStyles";
import { useTranslation } from "react-i18next";

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

const CREATE_ZONE_PRICING = gql`
  mutation CreateZonePricing($input: ZonePricingInput!) {
    createZonePricing(input: $input) {
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

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [fetchZones] = useLazyQuery(GET_ZONES, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      setZonesOptions(data?.deliveryZonesAdmin || []);
    },
  });

  const [mutate, { loading }] = useMutation(CREATE_ZONE_PRICING, {
    refetchQueries: [{ query: GET_ZONE_PRICINGS }],
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

  const debouncedSearchZones = useMemo(
    () =>
      debounce((value) => {
        if (value.trim()) {
          fetchZones({ variables: { search: value } });
        }
      }, 300),
    [fetchZones]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedOrigin || !selectedDestination) {
      setError("Please select both origin and destination zones.");
      return;
    }

    mutate({
      variables: {
        input: {
          originZone: selectedOrigin._id,
          destinationZone: selectedDestination._id,
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
          <Grid item xs={12} sm={6}>
            <Typography>Origin Zone</Typography>
            <Autocomplete
              options={zonesOptions}
              value={selectedOrigin}
              onChange={(e, newValue) => setSelectedOrigin(newValue)}
              onInputChange={(e, val) => debouncedSearchZones(val)}
              getOptionLabel={(option) =>
                `${option.title} (${option.city?.title || "No City"})`
              }
              isOptionEqualToValue={(opt, val) => opt._id === val._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Search origin zone"
                  className={globalClasses.input}
                />
              )}
            />
          </Grid>

          {/* Destination Zone */}
          <Grid item xs={12} sm={6}>
            <Typography>Destination Zone</Typography>
            <Autocomplete
              options={zonesOptions}
              value={selectedDestination}
              onChange={(e, newValue) => setSelectedDestination(newValue)}
              onInputChange={(e, val) => debouncedSearchZones(val)}
              getOptionLabel={(option) =>
                `${option.title} (${option.city?.title || "No City"})`
              }
              isOptionEqualToValue={(opt, val) => opt._id === val._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Search destination zone"
                  className={globalClasses.input}
                />
              )}
            />
          </Grid>

          {/* Base Fare */}
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
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
            {loading ? t("Saving...") : t("Save")}
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
