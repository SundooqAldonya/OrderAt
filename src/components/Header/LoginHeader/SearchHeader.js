import { Box, TextField, Modal, Typography, useMediaQuery } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";
import { useEffect, useState, useRef } from "react";
import { useLocationContext } from "../../../context/Location";
import { useLocation } from "../../../hooks";
import SyncLoader from "react-spinners/SyncLoader";
import LocationIcon from "../../../assets/icons/LocationIcon";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const autocompleteService = { current: null };

export const SearchHeader = () => {
  const theme = useTheme();
  const navigateTo = useNavigate();

  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [open, setOpen] = useState(false);

  const { getCurrentLocation } = useLocation();
  const { location, setLocation } = useLocationContext();

  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);

  const [search, setSearch] = useState("");

  const fetch = useRef(
    throttle((request, callback) => {
      autocompleteService.current.getPlacePredictions(request, callback);
    }, 200)
  ).current;

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const locationCallback = (error, data) => {
    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }
    setSearch(data.deliveryAddress);
    setLocation(data);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 600) {
        setIsSearchVisible(false);
      } else {
        setIsSearchVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onChangeModal = () => {
    setOpen((op) => !op);
  };

  // Initialize AutocompleteService when Google maps is loaded
  useEffect(() => {
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  // Update options whenever inputValue changes
  useEffect(() => {
    let active = true;
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];
        if (value) {
          newOptions = [value];
        }
        if (results) {
          newOptions = [...newOptions, ...results];
        }
        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  const handleLocationButtonClick = () => {
    setLoading(true);
    getCurrentLocation(locationCallback);
  };

  return (
    <>
      {isSearchVisible ? (
        <></>
      ) : (
        <div onClick={onChangeModal}>
          <Box
            sx={{
              width: isSmallScreen ? "180px" : "222px",
              height: 36,
              backgroundColor: "black",
              borderRadius: 36,
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              fontSize: isSmallScreen ? "0.8rem" : "1rem",
              padding: isSmallScreen ? "0 8px" : "0 16px"
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <title>Location marker</title>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 1c2.4 0 4.9.9 6.7 2.8 3.7 3.7 3.7 9.8 0 13.4L12 24l-6.7-6.7c-3.7-3.7-3.7-9.8 0-13.5C7.1 1.9 9.6 1 12 1Zm0 18.8 4.6-4.6c2.5-2.6 2.5-6.7 0-9.3C15.4 4.7 13.7 4 12 4c-1.7 0-3.4.7-4.6 1.9-2.5 2.6-2.5 6.7 0 9.3l4.6 4.6Zm2-9.3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
                fill="currentColor"
              ></path>
            </svg>
            <Typography
              variant="body2"
              component="p"
              sx={{ margin: 0, fontSize: isSmallScreen ? "0.7rem" : "1rem" }}
            >
              Enter delivery address
            </Typography>
          </Box>
          <Modal
            open={open}
            onClose={onChangeModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              onClick={onChangeModal}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                padding: isSmallScreen ? "10px" : "0",
                backgroundColor: "rgba(0,0,0,0.3)"
              }}
            >
              <Box
                onClick={(event) => event.stopPropagation()}
                sx={{
                  width: isSmallScreen ? "90%" : "500px",
                  maxWidth: "500px",
                  backgroundColor: "white",
                  borderRadius: isSmallScreen ? "20px" : "36px",
                  padding: isSmallScreen ? "16px" : "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Typography
                  id="modal-modal-title"
                  variant="h6"
                  component="h4"
                  sx={{
                    fontSize: isSmallScreen ? "18px" : "24px",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  Enter delivery address
                </Typography>
                <Autocomplete
                  id="google-map-modal"
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.description
                  }
                  filterOptions={(x) => x}
                  options={options}
                  autoComplete
                  includeInputInList
                  filterSelectedOptions
                  value={
                    loading
                      ? "Loading ..."
                      : search
                        ? search
                        : location
                          ? location.deliveryAddress
                          : ""
                  }
                  onChange={(event, newValue) => {
                    if (newValue) {
                      const geocoder = new window.google.maps.Geocoder();
                      geocoder.geocode({ placeId: newValue.place_id }, (res) => {
                        const loc = res[0].geometry.location;
                        setLocation({
                          label: "Home",
                          deliveryAddress: newValue.description,
                          latitude: loc.lat(),
                          longitude: loc.lng(),
                        });
                        setSearch(newValue.description);
                      });
                    } else {
                      setSearch("");
                    }
                    setOptions(newValue ? [...options] : options);
                    setValue(newValue);
                  }}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder="Enter your full address"
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          if (location) {
                            navigateTo("/restaurant-list");
                          }
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
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
                                <LocationIcon
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setLoading(true);
                                    getCurrentLocation(locationCallback);
                                  }}
                                />
                              )}
                            </Box>
                          </>
                        ),
                        style: {
                          borderRadius: "36px",
                          color: "black"
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const matches =
                      option.structured_formatting?.main_text_matched_substrings;
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
                      <li {...props} style={{ display: "flex", alignItems: "center" }}>
                        <LocationOnIcon
                          style={{ marginRight: 8, color: theme.palette.text.secondary }}
                        />
                        <div>
                          {parts
                            ? parts.map((part, index) => (
                              <span
                                key={index}
                                style={{
                                  fontWeight: part.highlight ? 700 : 400,
                                  color: "black",
                                }}
                              >
                                {part.text}
                              </span>
                            ))
                            : option.structured_formatting?.main_text}
                          <Typography variant="body2" color="textSecondary">
                            {option.structured_formatting?.secondary_text}
                          </Typography>
                        </div>
                      </li>
                    );
                  }}
                />
              </Box>
            </Box>
          </Modal>
        </div>
      )}
    </>
  );
};
