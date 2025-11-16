import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Typography,
  Paper,
} from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

const CREATE_CITY = gql`
  mutation CreateCity(
    $title: String!
    $location: LocationInput!
    $isActive: Boolean!
  ) {
    cityCreate(title: $title, location: $location, isActive: $isActive) {
      _id
      title
    }
  }
`;

function CityForm({ onNext }) {
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [createCity, { loading }] = useMutation(CREATE_CITY);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !latitude || !longitude) {
      alert("Please fill all fields");
      return;
    }

    try {
      const { data } = await createCity({
        variables: {
          title,
          isActive,
          location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      });

      onNext(data.cityCreate._id); // Pass city ID to next step
    } catch (error) {
      console.error(error);
      alert("Error creating city");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Create City
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* City Title */}
        <TextField
          label="City Name"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Latitude */}
        <TextField
          label="Latitude"
          fullWidth
          required
          value={latitude}
          type="number"
          onChange={(e) => setLatitude(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Longitude */}
        <TextField
          label="Longitude"
          fullWidth
          required
          value={longitude}
          type="number"
          onChange={(e) => setLongitude(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Is Active */}
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          }
          label="Active City"
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>
    </Paper>
  );
}
export default CityForm;
