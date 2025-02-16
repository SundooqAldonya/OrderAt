import React, { useState, useContext } from "react";
import Box from "@mui/material/Box";
import { useLocationContext } from "../../context/Location";
import {
  Autocomplete,
  Button,
  Container,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { ExpandContext } from "../../context/useExpand";
import { DeliveryCard } from "../Checkout";

const PickDeliveryTabs = () => {
  const [value, setValue] = useState(0);
  const { location, setLocation } = useLocationContext();
  const { expand, setExpand } = useContext(ExpandContext);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ width: 200, cursor: "pointer" }}
      onClick={() => setExpand((prev) => !prev)}
    >
      <Box>
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            // backgroundColor: "rgb(216 222 232 / 63%)",
            justifyContent: "space-between",
            flexGrow: 1,
            padding: "17px",
          }}
        >
          <LocationOnIcon style={{ fontSize: 16, color: "#000" }} />
          <Typography
            variant="body1"
            color="textSecondary"
            // className={`${classes.smallText} ${classes.mr10} ${classes.textMBold}`}
          >
            {location?.label}
          </Typography>
          {!expand ? (
            <ArrowDropDownIcon style={{ fontSize: 16, color: "#000" }} />
          ) : (
            <ArrowDropDownIcon
              style={{
                transform: "rotate(180deg)",
                fontSize: 16,
                color: "#000",
              }}
            />
          )}
        </Box>
      </Box>
      {/* {expand && (
        <>
          <Box
            style={{
              width: "100%",
              padding: "20px 0px",
              display: "flex",
              marginTop: "10px",
              alignItems: "center",
            }}
          >
            <Container style={{ display: "flex", marginLeft: "0px" }}>
              <Autocomplete
                style={{ width: "100%" }}
                id="google-map-demo"
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.description
                }
                filterOptions={(x) => x}
                options={options}
                autoComplete
                includeInputInList
                filterSelectedOptions
                value={value ? value : search ?? "Loading ..."}
                onChange={(event, newValue) => {
                  if (newValue) {
                    const b = new window.google.maps.Geocoder();
                    b.geocode({ placeId: newValue.place_id }, (res) => {
                      const location = res[0].geometry.location;
                      setSearch(res[0].formatted_address);
                      setLatLng({
                        lat: location.lat(),
                        lng: location.lng(),
                      });
                    });
                  } else {
                    setSearch("");
                    setLatLng({});
                  }
                  setOptions(newValue ? [newValue, ...options] : options);
                  setValue(newValue);
                }}
                onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{
                      color: "initial",
                      backgroundColor: "#F3F4F8",
                      borderRadius: 20,
                    }}
                    variant="outlined"
                    label="Enter your full address"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {params.InputProps.endAdornment}
                          <InputAdornment
                            position="end"
                            onClick={(e) => {
                              e.preventDefault();
                              setLoading(true);
                              getCurrentLocation(locationCallback);
                            }}
                          >
                            {loading ? (
                              <SyncLoader
                                color={theme.palette.primary.main}
                                size={5}
                                speedMultiplier={0.7}
                                margin={1}
                              />
                            ) : (
                              <LocationIcon style={{ fill: "#3C8F7C" }} />
                            )}
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => {
                  const matches =
                    option.structured_formatting.main_text_matched_substrings;
                  let parts = null;
                  if (matches) {
                    parts = parse(
                      option.structured_formatting.main_text,
                      matches.map((match) => [
                        match.offset,
                        match.offset + match.length,
                      ])
                    );
                  }
                  return (
                    <Grid {...props} container alignItems="center">
                      <Grid item>
                        <LocationOnIcon className={classes.icon} />
                      </Grid>
                      <Grid item xs>
                        {parts &&
                          parts.map((part, index) => (
                            <span
                              key={index}
                              style={{
                                fontWeight: part.highlight ? 700 : 400,
                                color: "black",
                              }}
                            >
                              {part.text}
                            </span>
                          ))}

                        <Typography variant="body2" color="textSecondary">
                          {option.structured_formatting.secondary_text}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                }}
              />
            </Container>
          </Box>
          <Box display="flex" justifyContent="center" mb={2}>
            <Button
              onClick={(e) => {
                e.preventDefault();
                setExpand(false);
                if (search) {
                  setLocation({
                    label: "Home",
                    latitude: latLng.lat,
                    longitude: latLng.lng,
                    deliveryAddress: search,
                  });
                }
              }}
              className={classes.button}
            >
              <RightIcon />
            </Button>
          </Box>
          <Divider
            orientation="horizontal"
            style={{
              backgroundColor: theme.palette.common.black,
              width: "80%",
              margin: "auto",
            }}
          />
          <Box style={{ margin: "auto", width: "90%" }}>
            <DeliveryCard
              selectedAddress={selectedAddress}
              setSelectedAddress={setDeliveryAddress}
              isProfile={true}
              isModal={true}
            />
          </Box>
        </>
      )} */}
    </Box>
  );
};

export default PickDeliveryTabs;
