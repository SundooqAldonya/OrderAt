import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiInputBase-root": {
      color: theme.palette.text.secondary,
    },
    "& label.Mui-focused": {
      color: theme.palette.text.secondary,
    },
    "& .MuiInput-underline:after": {
      borderColor: theme.palette.grey["300"],
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: theme.palette.grey["300"],
        borderRadius: 20,
      },
      "&:hover fieldset": {
        borderColor: theme.palette.grey["300"],
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.palette.grey["300"],
      },
    },
  },
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2),
  },
  addressBtn: {
    textAlign: "inherit",
    justifyContent: "flex-start",
    padding: "10px 16px",
    width: "auto",
    backgroundColor: theme.palette.background.paper,
    borderRadius: 20,
    boxShadow: theme.shadows[1],
    "&:hover": {
      backgroundColor: theme.palette.grey[200],
    },
  },
  button: {
    width: "100px",
    backgroundColor: theme.palette.primary.main,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    padding: 10,
    borderRadius: 10,
    color: theme.palette.common.white,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

export default useStyles;
