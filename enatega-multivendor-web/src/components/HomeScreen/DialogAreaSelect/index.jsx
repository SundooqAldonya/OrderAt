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
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { getCityAreas } from "../../../apollo/server";
import SyncLoader from "react-spinners/SyncLoader";
import { useLocationContext } from "../../../context/Location";
import { useNavigate } from "react-router-dom";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogAreaSelect = ({ open, handleClose, cityId }) => {
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

  console.log({ dataAreas: data });

  const handleChange = (e) => {
    console.log({ value: e.target.value });
    const foundArea = data?.areasByCity?.find(
      (item) => item._id === e.target.value
    );
    setArea(foundArea);
  };

  console.log({ area });

  const handleSelectArea = () => {
    setLocation({
      label: "Home",
      deliveryAddress: area.address,
      latitude: area.location.location.coordinates[1],
      longitude: area.location.location.coordinates[0],
    });
    navigate("/business-list");
  };

  // if (loading) {
  //   return <CircularProgress color="success" />;
  // }

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        dir={direction(language)}
      >
        <DialogTitle sx={{ color: "#000" }}>{t("select_area")}</DialogTitle>
        <DialogContent>
          {/* <DialogContentText id="alert-dialog-slide-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText> */}
          {loading && <CircularProgress color="success" />}
          {!loading && data?.areasByCity.length ? (
            <FormControl fullWidth>
              <NativeSelect
                sx={{ width: 300, color: "#000" }}
                defaultValue={data?.areasByCity[0]._id}
                inputProps={{
                  name: "area",
                  id: "uncontrolled-native",
                }}
                onChange={handleChange}
              >
                {data?.areasByCity?.map((area) => {
                  return (
                    <option key={area._id} value={area._id}>
                      {area.title}
                    </option>
                  );
                })}
              </NativeSelect>
            </FormControl>
          ) : (
            <Typography>{t("no_areas")}</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          {data?.areasByCity.length ? (
            <Button onClick={handleSelectArea}>{t("select")}</Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default DialogAreaSelect;
