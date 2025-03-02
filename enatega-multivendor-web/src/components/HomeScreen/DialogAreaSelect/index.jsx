import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { useTranslation } from "react-i18next";
import { direction } from "../../../utils/helper";
import {
  CircularProgress,
  FormControl,
  NativeSelect,
  Typography,
  useTheme,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { getCities, getCityAreas } from "../../../apollo/server";
import SyncLoader from "react-spinners/SyncLoader";
import { useLocationContext } from "../../../context/Location";
import { useNavigate } from "react-router-dom";
import RiderImage from "../../../assets/images/rider.png";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogAreaSelect = ({
  open,
  handleClose,
  cityId,
  setSelectedCity,
  cities,
}) => {
  const { i18n, t } = useTranslation();
  const { language } = i18n;
  const { location, setLocation } = useLocationContext();
  const navigate = useNavigate();

  const [area, setArea] = React.useState(null);

  const { data, error, loading } = useQuery(getCityAreas, {
    variables: {
      id: cityId,
    },
    skip: !cityId,
  });

  const areas = data?.areasByCity || null;

  console.log({ dataAreas: data });

  const handleSelectArea = (itemId) => {
    const foundArea = data?.areasByCity?.find((item) => item._id === itemId);
    setArea(foundArea);
    setLocation({
      label: "Home",
      deliveryAddress: foundArea.address,
      latitude: foundArea.location.location.coordinates[1],
      longitude: foundArea.location.location.coordinates[0],
    });
    navigate("/business-list");
  };

  const handleSelectCity = (itemId) => {
    setSelectedCity(itemId);
  };

  // console.log({ cityId });

  // console.log({ area });

  // const handleSelectLocation = () => {
  //   setLocation({
  //     label: "Home",
  //     deliveryAddress: area.address,
  //     latitude: area.location.location.coordinates[1],
  //     longitude: area.location.location.coordinates[0],
  //   });
  //   navigate("/business-list");
  // };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        dir={direction(language)}
        sx={{
          "& .MuiPaper-root": {
            width: 700,
          },
        }}
      >
        <Box
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <Box
            style={{
              width: 80,
            }}
          >
            <img src={RiderImage} alt={"logo"} style={{ width: "100%" }} />
          </Box>
        </Box>
        <DialogTitle sx={{ color: "#000", textAlign: "center" }}>
          {t("select_area")}
        </DialogTitle>
        <DialogContent sx={{ overflowY: "auto" }}>
          {/* <DialogContentText id="alert-dialog-slide-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText> */}
          {loading && <CircularProgress color="success" />}
          <Grid
            container
            spacing={2}
            style={{
              overflowY: "auto",
              paddingTop: "20px",
            }}
          >
            <Grid
              md={6}
              sx={{ overflowY: "auto", maxHeight: "300px", width: "100%" }}
            >
              {cities?.map((city) => {
                return (
                  <Box
                    sx={{
                      px: 2,
                      py: 2,
                      my: 1,
                      width: "200px",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: "pointer",
                      backgroundColor: cityId === city._id ? "#efefef" : null,
                      borderRadius: 3,
                    }}
                    onClick={() => handleSelectCity(city._id)}
                  >
                    <LocationOnIcon sx={{ color: "#8BC34A" }} />
                    <Typography color="#000">{city.title}</Typography>
                  </Box>
                );
              })}
            </Grid>
            <Grid
              md={6}
              sx={{ overflowY: "auto", maxHeight: "300px", width: "100%" }}
            >
              {areas?.map((area) => {
                return (
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      my: 1,
                      width: "200px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleSelectArea(area._id)}
                  >
                    <Typography color="#000">{area.title}</Typography>
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          {/* {data?.areasByCity.length ? (
            <Button onClick={handleSelectLocation}>{t("select")}</Button>
          ) : null} */}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default DialogAreaSelect;
