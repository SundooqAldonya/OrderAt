import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme) => ({
  flex: {
    display: "flex",
    minHeight: "64px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.palette.primary.light,
  },
  font700: {
    fontWeight: 700,
  },
  ml: {
    marginLeft: "8px",
  },
  userTitle: {
    marginLeft: "8px",
    textTransform: "uppercase",
  },
  linkDecoration: {
    textDecoration: "none",
    alignSelf: "center",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  imageIcon: {
    height: "50px",
    width: "10px",
  },
  iconRoot: {
    textAlign: "center",
    height: "100%",
    display: "inline-flex",
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.main,
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "background-color 0.3s",
    "&:hover": {
      backgroundColor: theme.palette.common.black, // Change to a darker shade on hover
    },
  },
}));

export default useStyles;
