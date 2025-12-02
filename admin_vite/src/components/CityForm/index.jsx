import React, { useEffect, useState } from "react";
import useStyles from "../styles";
import { useTranslation } from "react-i18next";
import useGlobalStyles from "../../utils/globalStyles";
import { Alert, Box, Button, Input, Typography } from "@mui/material";
import { useMutation } from "@apollo/client/react";
import { createCity, editCity, getCities } from "../../apollo";
import { GoogleMap, Marker, Polygon } from "@react-google-maps/api";
import { gql } from "@apollo/client";
import { useRef } from "react";

const CREATE_CITY = gql`
  ${createCity}
`;
const EDIT_CITY = gql`
  ${editCity}
`;
const GET_CITIES = gql`
  ${getCities}
`;

const CityForm = ({ onClose, city }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const globalClasses = useGlobalStyles();
  const polygonRef = useRef(null);

  console.log({ city });

  const [title, setTitle] = useState(city ? city.title : "");

  // 🆕 Polygon State
  const [drawMode, setDrawMode] = useState("point"); // "point" | "polygon"
  const [polygonCoords, setPolygonCoords] = useState([]);

  const [center, setCenter] = useState({ lat: 31.1107, lng: 30.9388 });
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    if (city) {
      // 🆕 Load polygon if exists
      if (city.geometry?.coordinates?.length) {
        const coords = city.geometry.coordinates[0].map((c) => ({
          lat: c[1],
          lng: c[0],
        }));
        setPolygonCoords(coords);
        setCenter(coords[0]);
        setMarker(null); // polygon overrides marker
      }

      // fallback: load marker (old system)
      if (!polygonCoords.length && city.location) {
        setMarker({
          lng: city.location.location.coordinates[0],
          lat: city.location.location.coordinates[1],
        });
        setCenter({
          lng: city.location.location.coordinates[0],
          lat: city.location.location.coordinates[1],
        });
      }
    }
  }, [city]);

  const onCompleted = () => {
    if (!city) {
      setTitle(null);
      setPolygonCoords([]);
      setMarker([]);
      setSuccess("Created city successfully!");
    } else setSuccess("Updated city successfully!");
  };

  const [mutate] = useMutation(CREATE_CITY, {
    onCompleted,
    refetchQueries: [{ query: GET_CITIES }],
  });

  const [mutateUpdate] = useMutation(EDIT_CITY, {
    onCompleted,
    refetchQueries: [{ query: GET_CITIES }],
  });

  // 🆕 Add polygon points on map click
  const onClick = (e) => {
    const { latLng } = e;
    console.log("pressing coordinates", { latLng });
    const lat = latLng.lat();
    const lng = latLng.lng();

    console.log({ lng, lat });

    if (drawMode === "polygon") {
      setPolygonCoords([...polygonCoords, { lat, lng }]);
    } else {
      setMarker({ lat, lng });
    }
  };

  console.log({ polygonCoords });

  const updatePolygonFromMap = () => {
    if (!polygonRef.current) return;

    const path = polygonRef.current.getPath();
    const updated = [];

    for (let i = 0; i < path.getLength(); i++) {
      updated.push({
        lat: path.getAt(i).lat(),
        lng: path.getAt(i).lng(),
      });
    }

    setPolygonCoords(updated);
  };

  // 🆕 Remove polygon
  const clearPolygon = () => setPolygonCoords([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let geometry = null;
    let coordinates = null;

    // 🆕 FORM SUBMISSION RULES:
    // If polygon is drawn → convert it to GeoJSON
    if (polygonCoords.length) {
      let ring = polygonCoords.map((p) => [p.lng, p.lat]);

      // CLOSE POLYGON
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        ring.push(first);
      }

      geometry = {
        type: "Polygon",
        coordinates: [ring],
      };
    }

    // GRAPHQL VARIABLES FOR CREATE
    if (!city) {
      mutate({
        variables: {
          title,
          geometry, // 🆕 send geometry polygon
          coordinates: marker ? [+marker.lng, +marker.lat] : null,
        },
      });
    }

    // GRAPHQL VARIABLES FOR UPDATE
    else {
      mutateUpdate({
        variables: {
          id: city._id,
          title,
          geometry, // 🆕 polygon override
          locationId: city.location?._id,
          coordinates: marker ? [+marker.lng, +marker.lat] : null,
        },
      });
    }

    // Close modal after 3 seconds
    if (onClose) setTimeout(onClose, 3000);
  };

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Typography variant="h6" className={classes.textWhite}>
          {city ? t("Edit City") : t("Add City")}
        </Typography>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <GoogleMap
            mapContainerStyle={{
              height: "500px",
              width: "100%",
              borderRadius: 30,
            }}
            zoom={12}
            center={center}
            onClick={onClick}
          >
            {/* Marker fallback */}
            {marker && !polygonCoords.length && <Marker position={marker} />}

            {/* 🆕 DRAW POLYGON */}
            {polygonCoords.length > 0 && (
              <Polygon
                path={polygonCoords}
                options={{
                  fillColor: "#2196F3",
                  fillOpacity: 0.3,
                  strokeColor: "#0D47A1",
                  strokeWeight: 2,
                  editable: true,
                  draggable: true,
                }}
                editable
                draggable
                onLoad={(polygon) => (polygonRef.current = polygon)}
                onMouseUp={updatePolygonFromMap}
              />
            )}
          </GoogleMap>

          <Box mt={2} mb={2} style={{ display: "flex", gap: "10px" }}>
            <Button
              variant="contained"
              color={drawMode === "point" ? "primary" : "inherit"}
              onClick={() => setDrawMode("point")}
            >
              Select Point
            </Button>

            <Button
              variant="contained"
              color={drawMode === "polygon" ? "primary" : "inherit"}
              onClick={() => setDrawMode("polygon")}
            >
              Draw Polygon
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={() => setPolygonCoords([])}
              disabled={polygonCoords.length === 0}
            >
              Clear Polygon
            </Button>
          </Box>

          {/* Clear polygon */}
          {polygonCoords.length > 0 && (
            <Button
              onClick={clearPolygon}
              style={{ marginTop: 10, backgroundColor: "red", color: "white" }}
            >
              {t("Clear Polygon")}
            </Button>
          )}

          <Box>
            <Typography className={classes.labelText}>{t("Title")}</Typography>
            <Input
              id="input-title"
              placeholder={t("Title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          <Button className={globalClasses.button} type="submit">
            {t("Save")}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default CityForm;
