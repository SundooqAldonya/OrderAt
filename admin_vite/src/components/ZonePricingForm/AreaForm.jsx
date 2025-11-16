import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  MenuItem,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const CREATE_AREA = gql`
  mutation CreateArea(
    $title: String!
    $address: String
    $city: ID!
    $location: LocationInput!
  ) {
    areaCreate(
      title: $title
      address: $address
      city: $city
      location: $location
    ) {
      _id
      title
    }
  }
`;

const GET_CITIES = gql`
  query {
    cities {
      _id
      title
    }
  }
`;

function AreaForm({ cityId, onNext }) {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const { data: cityData } = useQuery(GET_CITIES);

  const [createArea, { loading }] = useMutation(CREATE_AREA);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !latitude || !longitude) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const { data } = await createArea({
        variables: {
          title,
          address,
          city: cityId,
          location: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      });

      onNext(data.areaCreate._id); // pass area ID to next step
    } catch (err) {
      console.error(err);
      alert("Error creating area");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Create Area
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Title */}
        <TextField
          fullWidth
          label="Area Name"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Address */}
        <TextField
          fullWidth
          label="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* City (read-only) */}
        <TextField
          select
          fullWidth
          label="City"
          value={cityId}
          disabled
          sx={{ mb: 2 }}
        >
          {cityData?.cities?.map((city) => (
            <MenuItem key={city._id} value={city._id}>
              {city.title}
            </MenuItem>
          ))}
        </TextField>

        {/* Latitude */}
        <TextField
          label="Latitude"
          fullWidth
          required
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Longitude */}
        <TextField
          label="Longitude"
          fullWidth
          required
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Submit */}
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
export default AreaForm;
