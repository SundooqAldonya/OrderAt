import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
// import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";

const GET_AREAS = gql`
  query ($city: ID!) {
    areas(city: $city) {
      _id
      title
    }
  }
`;

const CREATE_DELIVERY_ZONE = gql`
  mutation CreateDeliveryZone(
    $title: String!
    $description: String!
    $city: ID!
    $area: ID
    $location: PolygonInput!
    $tax: Float
    $isActive: Boolean!
    $timeRange: TimeRangeInput
  ) {
    deliveryZoneCreate(
      title: $title
      description: $description
      city: $city
      area: $area
      location: $location
      tax: $tax
      isActive: $isActive
      timeRange: $timeRange
    ) {
      _id
    }
  }
`;

function PolygonDrawer({ onChange }) {
  useMapEvents({
    click(e) {
      onChange((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
}

function DeliveryZoneForm({ cityId, onNext }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [tax, setTax] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [timeRange, setTimeRange] = useState({
    from: "",
    to: "",
    allowAcrossMidnight: false,
  });

  const { data: areaData } = useQuery(GET_AREAS, {
    variables: { city: cityId },
  });

  const [createZone, { loading }] = useMutation(CREATE_DELIVERY_ZONE);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || coordinates.length < 3) {
      alert("Please complete all required fields and draw the polygon.");
      return;
    }

    try {
      const { data } = await createZone({
        variables: {
          title,
          description,
          city: cityId,
          area: area || null,
          tax: parseFloat(tax),
          isActive,
          location: {
            type: "Polygon",
            coordinates: [coordinates.map((c) => [c[1], c[0]])], // GeoJSON [lng, lat]
          },
          timeRange,
        },
      });

      onNext(data.deliveryZoneCreate._id);
    } catch (err) {
      console.error(err);
      alert("Error creating delivery zone");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 700, mx: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Create Delivery Zone
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Zone Title"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Description"
          fullWidth
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          select
          fullWidth
          label="Area (optional)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          sx={{ mb: 2 }}
        >
          {areaData?.areas?.map((a) => (
            <MenuItem key={a._id} value={a._id}>
              {a.title}
            </MenuItem>
          ))}
        </TextField>

        {/* Polygon Map */}
        {/* <Typography sx={{ mb: 1 }}>Draw Delivery Polygon:</Typography>
        <Box sx={{ height: 300, mb: 2 }}>
          <MapContainer
            center={[30.0444, 31.2357]}
            zoom={12}
            style={{ height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <PolygonDrawer onChange={setCoordinates} />
            {coordinates.length > 1 && <Polygon positions={coordinates} />}
          </MapContainer>
        </Box> */}

        {/* Tax */}
        <TextField
          label="Tax (%)"
          fullWidth
          type="number"
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Time Range */}
        <TextField
          label="Time From (HH:mm)"
          fullWidth
          value={timeRange.from}
          onChange={(e) => setTimeRange({ ...timeRange, from: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Time To (HH:mm)"
          fullWidth
          value={timeRange.to}
          onChange={(e) => setTimeRange({ ...timeRange, to: e.target.value })}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={timeRange.allowAcrossMidnight}
              onChange={(e) =>
                setTimeRange({
                  ...timeRange,
                  allowAcrossMidnight: e.target.checked,
                })
              }
            />
          }
          label="Allow Across Midnight"
        />

        {/* Is Active */}
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          }
          label="Active Zone"
        />

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </Box>
    </Paper>
  );
}

export default DeliveryZoneForm;
