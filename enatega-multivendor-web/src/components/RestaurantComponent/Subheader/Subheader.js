import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Modal,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Autocomplete from "@mui/material/Autocomplete";
import throttle from "lodash/throttle";
import React, { useEffect, useState } from "react";
import SyncLoader from "react-spinners/SyncLoader";
import { useLocationContext } from "../../../context/Location";
import { useLocation } from "../../../hooks";
import FlashMessage from "../../FlashMessage";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";

const autocompleteService = { current: null };

function Subheader({ map }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("sm"));
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState(false);
  const { location, setLocation } = useLocationContext();
  const [search, setSearch] = useState(location?.deliveryAddress || "");
  const [alertMessage, setAlertMessage] = useState();
  const [value, setValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [latLng, setLatLng] = useState({});
  const [loading, setLoading] = useState();

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        if (!autocompleteService.current && window.google) {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
        }
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    []
  );

  useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results) => {
      if (active) {
        let newOptions = [];
        if (value) newOptions = [value];
        if (results) newOptions = [...newOptions, ...results];
        setOptions(newOptions);
      }
    });

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  const handleConfirm = () => {
    if (latLng.lat && latLng.lng && map) {
      map.panTo({ lat: latLng.lat, lng: latLng.lng });
      map.setZoom(15);
    }

    setLocation({
      label: value?.description || "",
      latitude: latLng.lat,
      longitude: latLng.lng,
      deliveryAddress: search,
    });

    setModalOpen(false);
  };

  const handleLocationChange = (newValue) => {
    if (newValue) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: newValue.place_id }, (res) => {
        const location = res[0].geometry.location;
        setSearch(res[0].formatted_address);
        setLatLng({ lat: location.lat(), lng: location.lng() });
        setValue(newValue);
      });
    } else {
      setSearch("");
      setLatLng({});
      setValue(null);
    }
  };

  return (
    <Box className={classes.upsideContainer}>
      <Button
        className={classes.addressBtn}
        onClick={() => setModalOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          textTransform: "none",
          padding: "8px 12px",
          borderRadius: "16px",
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <LocationOnIcon
          style={{
            marginRight: "8px",
            color: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="body1"
          style={{
            color: "#000",
            fontWeight: theme.typography.fontWeightRegular,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {search || t("Enter delivery address")}
        </Typography>
      </Button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: mobile ? "90%" : "400px",
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
          }}
        >
          <FlashMessage
            alertMessage={alertMessage}
            open={Boolean(alertMessage)}
          />
          <Grid container>
            <Grid item xs={12}>
              <Container>
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
                  value={value || search || ""}
                  onChange={(event, newValue) => handleLocationChange(newValue)}
                  onInputChange={(event, newInputValue) => {
                    setInputValue(newInputValue);
                  }}
                  renderOption={(props, option) => (
                    <Box
                      {...props}
                      style={{
                        color: "#000",
                        fontSize: "1rem",
                        padding: "8px 12px",
                      }}
                    >
                      {option.description}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("Enter your full address")}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        style: { color: "#000" },
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <InputAdornment position="end">
                              {loading ? (
                                <SyncLoader size={5} />
                              ) : (
                                <LocationOnIcon
                                  style={{
                                    fill: theme.palette.primary.main,
                                  }}
                                />
                              )}
                            </InputAdornment>
                          </>
                        ),
                      }}
                      InputLabelProps={{
                        style: { color: "#000" },
                      }}
                    />
                  )}
                />
              </Container>
            </Grid>
          </Grid>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button onClick={handleConfirm} className={classes.button}>
              {t("Confirm")}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default React.memo(Subheader);
