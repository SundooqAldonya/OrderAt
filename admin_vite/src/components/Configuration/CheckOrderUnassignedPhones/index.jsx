import React, { useState } from "react";
import {
  Box,
  Typography,
  Input,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useStyles from "../styles";
import useGlobalStyles from "../../../utils/globalStyles";
import { useMutation } from "@apollo/client/react";
import { phonesUncheckedOrdersUpdate } from "../../../apollo";

function CheckOrderUnassignedPhones({ oldPhones }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const globalClasses = useGlobalStyles();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phones, setPhones] = useState(
    oldPhones.length ? [...oldPhones] : [""]
  ); // start with one field

  console.log({ oldPhones });
  console.log({ phones });

  const [mutatePhones] = useMutation(phonesUncheckedOrdersUpdate, {
    onCompleted: (res) => {
      console.log({ res });
      setSuccessMessage("Saved successfully");
    },
    onError: (err) => {
      console.log({ err });
    },
  });

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...phones];
    updatedPhones[index] = value;
    setPhones(updatedPhones);
  };

  const addPhone = () => {
    setPhones([...phones, ""]);
  };

  const removePhone = (index) => {
    if (phones.length === 1) return; // prevent removing last one
    const updatedPhones = phones.filter((_, i) => i !== index);
    setPhones(updatedPhones);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Phones:", phones);
    mutatePhones({
      variables: {
        phones,
      },
    });
  };

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box item className={classes.heading}>
          <Typography variant="h6" className={classes.text}>
            {t("Phones")}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box mt={2}>
            <Typography className={classes.labelText}>{t("Phones")}</Typography>

            {phones.map((phone, index) => (
              <Box key={index} display="flex" alignItems="center" mt={1}>
                <Input
                  placeholder={t("Enter phone number")}
                  value={phone}
                  disableUnderline
                  className={globalClasses.input}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  style={{ flex: 1 }}
                />

                <IconButton onClick={() => addPhone()}>
                  <Add />
                </IconButton>

                {phones.length > 1 && (
                  <IconButton onClick={() => removePhone(index)}>
                    <Remove />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

          <Box mt={3}>
            <Button className={globalClasses.button} type="submit">
              {t("Save")}
            </Button>
          </Box>

          <Box mt={2}>
            {successMessage && (
              <Alert
                className={globalClasses.alertSuccess}
                variant="filled"
                severity="success"
              >
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert
                className={globalClasses.alertError}
                variant="filled"
                severity="error"
              >
                {errorMessage}
              </Alert>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  );
}

export default CheckOrderUnassignedPhones;
