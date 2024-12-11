import makeStyles from "@mui/styles/makeStyles";

const useStyle = makeStyles((theme) => {
  return {
    left: {
      backgroundColor: theme.palette.common.black,
      padding: "3rem",
      borderRadius: 80,
      [theme.breakpoints.down("md")]: {
        padding: "3rem",
      },
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
  };
});

export default useStyle;
