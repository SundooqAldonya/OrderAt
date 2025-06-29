import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { Header, LoginHeader } from "../../components/Header";
import UserContext from "../../context/User";
import { useNavigate } from "react-router-dom";
import { useRequestDelivery } from "../../context/requestDelivery";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 30.033333,
  lng: 31.233334,
};

const DropoffMandoob = () => {
  const navigate = useNavigate();
  const { state, setAddressTo } = useRequestDelivery();

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(defaultCenter);
  const [saveAddress, setSaveAddress] = useState(false);
  const [label, setLabel] = useState("");
  const [details, setDetails] = useState("");
  const { isLoggedIn } = useContext(UserContext);

  console.log({ state });
  const allDetails = localStorage.getItem("addressTo");
  console.log({ allDetails: JSON.parse(allDetails) });

  const handleSelect = async (value) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setCoordinates(latLng);
    setMapCenter(latLng);
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setCoordinates({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      }
    });
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMapCenter(coords);
        setCoordinates(coords);
        setAddress("");
      },
      () => alert("Failed to get current location")
    );
  };

  const handleNext = () => {
    console.log({ address, coordinates, saveAddress, label, details });
    // navigate to DropOff or save in context/store
    setAddressTo({
      addressTo: address,
      regionTo: coordinates,
      labelTo: label,
      addressFreeTextTo: details,
    });
    navigate("/otlob-mandoob");
  };

  return (
    <Box>
      {isLoggedIn ? <Header /> : <LoginHeader showIcon />}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          mt={5}
          sx={{ color: "#000", textAlign: "center" }}
        >
          Drop-off Location
        </Typography>
        <Grid item xs={12} sx={{ mb: 4 }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}
          >
            <Marker position={coordinates} />
          </GoogleMap>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleCurrentLocation}
            >
              Use Current Location
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <PlacesAutocomplete
              value={address}
              onChange={setAddress}
              onSelect={handleSelect}
            >
              {({
                getInputProps,
                suggestions,
                getSuggestionItemProps,
                loading,
              }) => (
                <div>
                  <TextField
                    fullWidth
                    label="Search address"
                    {...getInputProps({ placeholder: "Search Places..." })}
                    sx={{
                      "& .MuiInputBase-input": {
                        color: "black", // ✅ Search input text color
                      },
                      "& .MuiInputLabel-root": {
                        color: "black", // ✅ Label color
                      },
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                        {
                          borderColor: "#ccc",
                        },
                    }}
                  />
                  <Box
                    sx={{
                      border: "1px solid #ccc",
                      maxHeight: 200,
                      overflowY: "auto",
                    }}
                  >
                    {loading && (
                      <Typography variant="body2">Loading...</Typography>
                    )}
                    {suggestions.map((suggestion, i) => {
                      const style = {
                        backgroundColor: suggestion.active ? "#fafafa" : "#fff",
                        padding: "10px",
                        cursor: "pointer",
                        color: "#000",
                      };
                      return (
                        <div
                          key={i}
                          {...getSuggestionItemProps(suggestion, { style })}
                        >
                          {suggestion.description}
                        </div>
                      );
                    })}
                  </Box>
                </div>
              )}
            </PlacesAutocomplete>
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={saveAddress}
                  onChange={() => setSaveAddress((prev) => !prev)}
                />
              }
              label="Save this address"
            />
          </Grid>

          {saveAddress && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Label (e.g. Home, Work)"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address details (optional)"
              value={details}
              multiline
              rows={3}
              onChange={(e) => setDetails(e.target.value)}
              sx={{
                "& .MuiInputBase-input": {
                  color: "#000", // input text
                },
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              width: "100%",
              bgcolor: "#fff",
              p: 2,
              borderTop: "1px solid #ccc",
              display: "flex",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <Button variant="contained" fullWidth onClick={handleNext}>
              Next (Review)
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DropoffMandoob;
