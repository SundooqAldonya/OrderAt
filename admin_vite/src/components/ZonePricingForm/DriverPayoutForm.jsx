import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_ZONES = gql`
  query {
    deliveryZones {
      _id
      title
    }
  }
`;

const CREATE_PAYOUT = gql`
  mutation CreateDriverPayout(
    $zone: ID!
    $type: String!
    $fixedAmount: Float
    $percentage: Float
    $baseFare: Float
    $perKmRate: Float
  ) {
    driverPayoutCreate(
      zone: $zone
      type: $type
      fixedAmount: $fixedAmount
      percentage: $percentage
      baseFare: $baseFare
      perKmRate: $perKmRate
    ) {
      _id
    }
  }
`;

function DriverPayoutForm({ onFinish }) {
  const [zone, setZone] = useState("");
  const [type, setType] = useState("FIXED");

  const [fixedAmount, setFixedAmount] = useState("");
  const [percentage, setPercentage] = useState("");
  const [baseFare, setBaseFare] = useState("");
  const [perKmRate, setPerKmRate] = useState("");

  const { data: zonesData } = useQuery(GET_ZONES);

  const [createPayout, { loading }] = useMutation(CREATE_PAYOUT);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createPayout({
        variables: {
          zone,
          type,
          fixedAmount: type === "FIXED" ? parseFloat(fixedAmount) : null,
          percentage:
            type === "PERCENTAGE" || type === "MIXED"
              ? parseFloat(percentage)
              : null,
          baseFare: type === "MIXED" ? parseFloat(baseFare) : null,
          perKmRate: type === "MIXED" ? parseFloat(perKmRate) : null,
        },
      });

      onFinish(); // Wizard complete
    } catch (err) {
      console.error(err);
      alert("Error creating driver payout");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Driver Payout Configuration
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Zone */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Delivery Zone</InputLabel>
          <Select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            required
          >
            {zonesData?.deliveryZones?.map((z) => (
              <MenuItem key={z._id} value={z._id}>
                {z.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Type */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Payout Type</InputLabel>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <MenuItem value="FIXED">Fixed Amount</MenuItem>
            <MenuItem value="PERCENTAGE">Percentage of Delivery Fee</MenuItem>
            <MenuItem value="MIXED">
              Mixed (Base + Per KM + Percentage)
            </MenuItem>
          </Select>
        </FormControl>

        {/* Conditional Fields */}
        {type === "FIXED" && (
          <TextField
            label="Fixed Amount"
            fullWidth
            required
            type="number"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        {type === "PERCENTAGE" && (
          <TextField
            label="Percentage (%)"
            fullWidth
            required
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        {type === "MIXED" && (
          <>
            <TextField
              label="Base Fare"
              fullWidth
              required
              type="number"
              value={baseFare}
              onChange={(e) => setBaseFare(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Per KM Rate"
              fullWidth
              required
              type="number"
              value={perKmRate}
              onChange={(e) => setPerKmRate(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Percentage (%)"
              fullWidth
              required
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              sx={{ mb: 2 }}
            />
          </>
        )}

        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? "Saving..." : "Finish Setup"}
        </Button>
      </Box>
    </Paper>
  );
}
export default DriverPayoutForm;
