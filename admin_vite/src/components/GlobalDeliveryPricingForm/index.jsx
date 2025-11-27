import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  Alert,
  MenuItem,
  Select,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";
import useStyles from "../styles";
import useGlobalStyles from "../../utils/globalStyles";
import {
  getGlobalDeliveryPricing,
  updateGlobalDeliveryPricing,
} from "../../apollo";

const GlobalDeliveryPricingForm = ({ onClose }) => {
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  // Fetch existing config
  const { data } = useQuery(getGlobalDeliveryPricing);

  const [values, setValues] = useState({
    model: "PER_KM",
    fixed: "",
    per_km: "",
    min_fee: "",
    included_km: "",
    baseFare: "",
    minimumDeliveryFee: "",
  });

  const [success, setSuccess] = useState("");
  const [mainError, setMainError] = useState("");

  // Load data on edit
  useEffect(() => {
    if (data?.getGlobalDeliveryPricing) {
      const cfg = data.getGlobalDeliveryPricing;

      setValues({
        model: cfg.model || "PER_KM",
        fixed: cfg.params?.fixed || "",
        per_km: cfg.params?.per_km || "",
        min_fee: cfg.params?.min_fee || "",
        included_km: cfg.params?.included_km || "",
        baseFare: cfg.params?.baseFare || "",
        minimumDeliveryFee: cfg.minimumDeliveryFee || "",
      });
    }
  }, [data]);

  const [mutate] = useMutation(updateGlobalDeliveryPricing, {
    onCompleted: () => {
      setSuccess("Global delivery pricing updated successfully!");
      if (onClose) {
        setTimeout(() => onClose(), 1500);
      }
    },
    onError: (err) => setMainError(err.message),
    refetchQueries: ["GetGlobalDeliveryPricing"],
  });

  const clean = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === "" ? null : v])
    );

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = clean(values);

    mutate({
      variables: {
        input: {
          model: cleaned.model,
          fixed: cleaned.fixed ? Number(cleaned.fixed) : null,
          per_km: cleaned.per_km
            ? Number(cleaned.per_k_km)
            : Number(cleaned.per_km),
          min_fee: cleaned.min_fee ? Number(cleaned.min_fee) : null,
          included_km: cleaned.included_km ? Number(cleaned.included_km) : null,
          baseFare: cleaned.baseFare ? Number(cleaned.baseFare) : null,
          minimumDeliveryFee: Number(cleaned.minimumDeliveryFee),
        },
      },
    });
  };

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Typography variant="h6" className={classes.textWhite}>
          Global Delivery Pricing
        </Typography>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          {/* Pricing Model */}
          <Box mt={2}>
            <Typography className={classes.labelText}>Pricing Model</Typography>
            <Select
              name="model"
              value={values.model}
              onChange={(e) => {
                const model = e.target.value;

                setValues({
                  ...values,
                  model,
                  ...(model === "FIXED"
                    ? { per_km: "", min_fee: "", included_km: "", baseFare: "" }
                    : model === "PER_KM"
                    ? { fixed: "", included_km: "", baseFare: "" }
                    : {}),
                });
              }}
              fullWidth
              className={globalClasses.input}
            >
              <MenuItem value="FIXED">Fixed</MenuItem>
              <MenuItem value="PER_KM">Per KM</MenuItem>
              <MenuItem value="HYBRID">Hybrid</MenuItem>
            </Select>
          </Box>

          {/* FIXED */}
          {values.model === "FIXED" && (
            <Box mt={2}>
              <Typography className={classes.labelText}>Fixed Price</Typography>
              <Input
                name="fixed"
                type="number"
                value={values.fixed}
                onChange={(e) =>
                  setValues({ ...values, fixed: e.target.value })
                }
                disableUnderline
                className={globalClasses.input}
              />
            </Box>
          )}

          {/* PER_KM */}
          {values.model === "PER_KM" && (
            <>
              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Price per KM
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={(e) =>
                    setValues({ ...values, per_km: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Minimum Fee
                </Typography>
                <Input
                  name="min_fee"
                  type="number"
                  value={values.min_fee}
                  onChange={(e) =>
                    setValues({ ...values, min_fee: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
            </>
          )}

          {/* HYBRID */}
          {values.model === "HYBRID" && (
            <>
              <Box mt={2}>
                <Typography className={classes.labelText}>Base Fare</Typography>
                <Input
                  name="baseFare"
                  type="number"
                  value={values.baseFare}
                  onChange={(e) =>
                    setValues({ ...values, baseFare: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Price per KM
                </Typography>
                <Input
                  name="per_km"
                  type="number"
                  value={values.per_km}
                  onChange={(e) =>
                    setValues({ ...values, per_km: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Minimum Fee
                </Typography>
                <Input
                  name="min_fee"
                  type="number"
                  value={values.min_fee}
                  onChange={(e) =>
                    setValues({ ...values, min_fee: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>

              <Box mt={2}>
                <Typography className={classes.labelText}>
                  Included KM
                </Typography>
                <Input
                  name="included_km"
                  type="number"
                  value={values.included_km}
                  onChange={(e) =>
                    setValues({ ...values, included_km: e.target.value })
                  }
                  disableUnderline
                  className={globalClasses.input}
                />
              </Box>
            </>
          )}

          {/* Minimum Delivery Fee */}
          <Box mt={2}>
            <Typography className={classes.labelText}>
              Minimum Delivery Fee
            </Typography>
            <Input
              name="minimumDeliveryFee"
              type="number"
              value={values.minimumDeliveryFee}
              onChange={(e) =>
                setValues({ ...values, minimumDeliveryFee: e.target.value })
              }
              disableUnderline
              className={globalClasses.input}
            />
          </Box>

          {/* Submit */}
          <Box mt={3}>
            <Button className={globalClasses.button} type="submit">
              Save
            </Button>
          </Box>

          {/* Alerts */}
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

export default GlobalDeliveryPricingForm;
