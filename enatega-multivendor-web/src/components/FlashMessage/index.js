import React from "react";
import Snackbar from "@mui/material/Snackbar";
import { Alert } from "@mui/material";

function FlashMessage({ open, onClose, alertMessage, type = "info" }) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      onClose={onClose}
      autoHideDuration={6000}
    >
      <Alert
        onClose={onClose}
        severity={type}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {alertMessage}
      </Alert>
    </Snackbar>
  );
}

export default FlashMessage;
