import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({

  termol: {
    '& p': {
      marginTop: '4px',
    },
    '& h6': {
      marginBottom: '4px',
    },
  },

  mainContainer: {
    display: "flex",
    paddingTop: "70px",
    minWidth: "100%",
    backgroundColor: "transparent",
    color: theme.palette.secondary.light,
  },
  imageContainer: {
    width: "100%",
    height: "400px",
    backgroundImage:
      "url(https://images.deliveryhero.io/image/foodpanda/cms-hero.jpg?width=2000&height=500|https://images.deliveryhero.io/image/foodpanda/cms-hero.jpg?width=4000&height=1000)",
    backgroundSize: "cover",
    backgroundPositionX: "50%",
    backgroundPositionY: "center",
    display: "flex",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
  },
  linkDecoration: {
    textDecoration: "none",
    alignSelf: "center",
  },
  link: {
    fontSize: 16,
  },
  boldText: {
    fontWeight: 600,
    width:'100%',
  },
  MV3: {
    margin: theme.spacing(3, 0),
  },

  footerContainer: {
    background: "white",
    width: "100%",
    marginTop: "60px",
  },
  footerWrapper: {
    backgroundColor: theme.palette.secondary.main,
    width: "90%",
    display: "flex",
    marginLeft: "auto",
    borderTopLeftRadius: "5rem",
    borderBottomLeftRadius: "5rem",
  },
  
}));

export default useStyles;
