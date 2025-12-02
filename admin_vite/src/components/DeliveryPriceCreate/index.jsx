import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Input,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useStyles from "../styles";
import useGlobalStyles from "../../utils/globalStyles";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  allDeliveryPrices,
  createDeliveryPrice,
  getAllDeliveryZones,
  updateDeliveryPrice,
} from "../../apollo";
import { gql } from "@apollo/client";

const GET_ZONES = gql`
  ${getAllDeliveryZones}
`;

const DeliveryPriceCreate = ({ onClose, edit, item }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const [success, setSuccess] = useState(null);
  const [mainError, setMainError] = useState(null);

  const [cost, setCost] = useState(edit && item ? item.cost : 0);

  const [originZone, setOriginZone] = useState("");
  const [destinationZone, setDestinationZone] = useState("");

  const [serviceType, setServiceType] = useState(
    edit && item ? item.service : ""
  );

  const { data, loading, error } = useQuery(GET_ZONES);

  const [mutate] = useMutation(createDeliveryPrice, {
    refetchQueries: [{ query: allDeliveryPrices }],
    onCompleted: (res) => {
      console.log({ res });
      setSuccess(t(res.createDeliveryPrice.message));
    },
    onError: (error) => {
      console.log({ error });
      setMainError(JSON.stringify(error));
    },
  });

  const [mutateUpdate] = useMutation(updateDeliveryPrice, {
    refetchQueries: [{ query: allDeliveryPrices }],
    onCompleted: (res) => {
      console.log({ res });
      setSuccess(t(res.updateDeliveryPrice.message));
    },
    onError: (error) => {
      console.log({ error });
      setMainError(JSON.stringify(error));
    },
  });

  const zones = data?.getAllDeliveryZones || null;

  console.log({ originZone, destinationZone });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!edit) {
      mutate({
        variables: {
          deliveryPriceInput: {
            originZone,
            destinationZone,
            service: serviceType,
            cost,
          },
        },
      });
    } else {
      mutateUpdate({ variables: { id: item._id, cost, service: serviceType } });
    }
  };

  return (
    <Box className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t("create_delivery_price")}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {loading ? "Loading zones..." : null}
          {data?.getAllDeliveryZones?.length && !edit ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                marginInline: "auto",
                // background: 'red'
              }}
            >
              <Box className={globalClasses.flexRow}>
                <Autocomplete
                  disablePortal
                  options={zones}
                  sx={{ width: 300 }}
                  getOptionLabel={(option) => option.title || ""}
                  name="originZone"
                  onChange={(e, newValue) => setOriginZone(newValue._id)}
                  renderInput={(params) => {
                    console.log({ params });
                    return (
                      <TextField
                        {...params}
                        label="Origin Zone"
                        sx={{
                          "& .MuiInputBase-input": {
                            color: "black",
                          },
                        }}
                      />
                    );
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        color: "black", // Text color
                        backgroundColor: "white", // Optional: background for contrast
                      },
                    },
                  }}
                />
              </Box>
              <Box className={globalClasses.flexRow}>
                <Autocomplete
                  disablePortal
                  options={zones}
                  sx={{ width: 300 }}
                  name="destinationZone"
                  getOptionLabel={(option) => option.title || ""}
                  onChange={(e, newValue) => setDestinationZone(newValue._id)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Destination Zone"
                      sx={{
                        "& .MuiInputBase-input": {
                          color: "black",
                        },
                      }}
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        color: "black", // Text color
                        backgroundColor: "white", // Optional: background for contrast
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          ) : null}
          {/* Service Type */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Service</Typography>
            <Select
              name="service"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FOOD">Food</MenuItem>
              <MenuItem value="MASHAWEER">Mashaweer</MenuItem>
              <MenuItem value="GROCERY">Grocery</MenuItem>
              <MenuItem value="PHARMACY">Pharmacy</MenuItem>
            </Select>
          </Box>

          {/* Cost */}
          <Box>
            <Typography className={classes.labelText}>{t("cost")}</Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-cost"
              name="cost"
              onChange={(e) => setCost(Number(e.target.value))}
              placeholder={t("Cost")}
              type="text"
              value={cost}
              disableUnderline
              className={[
                globalClasses.input,
                // addressError === false
                //   ? globalClasses.inputError
                //   : addressError === true
                //   ? globalClasses.inputSuccess
                //   : ''
              ]}
            />
          </Box>
          <Box>
            <Button
              className={globalClasses.button}
              // disabled={mutateLoading}
              type="submit"
            >
              {t("Save")}
            </Button>
          </Box>
          <Box mt={2}>
            {success && (
              <Alert
                className={globalClasses.alertSuccess}
                variant="filled"
                severity="success"
              >
                {success}
              </Alert>
            )}
            {mainError && (
              <Alert
                className={globalClasses.alertError}
                variant="filled"
                severity="error"
              >
                {mainError}
              </Alert>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default DeliveryPriceCreate;
