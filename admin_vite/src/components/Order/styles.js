import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(theme => ({
  flexRow: {
    display: 'flex',
    flexDirection: 'row'
  },
  container: {
    backgroundColor: theme.palette.background.primary,
    color: 'red',
    margin: '30px 0',
    borderRadius: 20,
    boxShadow: `0px 0px 38px ${theme.palette.common.blackShade}`,
    textAlign: 'center',
    marginInline: '15%',
    [theme.breakpoints.up('md')]: {
      marginInline: '25%'
    },
    [theme.breakpoints.up('sm')]: {
      marginInline: '5%'
    },
    [theme.breakpoints.up('xs')]: {
      marginInline: '5%'
    }
    // marginLeft: '15%',
    // marginRight: '15%'
    // paddingBottom: 5
  },
  bgPrimary: {
    backgroundColor: theme.palette.primary.main2
  },
  innerContainer: {
    padding: 12,
    backgroundColor: theme.palette.common.white,
    borderRadius: 20,
    textAlign: 'left'
  },
  heading: {
    backgroundColor: theme.palette.common.black,
    width: '50%',
    padding: 10,
    borderRadius: '20px 20px 20px 0',
    textAlign: 'center'
  },
  form: {
    margin: 25,
    alignItems: 'center'
  },
  text: {
    color: theme.palette.common.white,
    fontWeight: 'bold'
  },
  itemHeader: {
    textAlign: 'left',
    marginLeft: 20,
    fontWeight: 'bold',
    color: 'black'
  },
  quantity: {
    padding: 2,
    border: '1px solid grey',
    borderRadius: 5
  },
  items: {},
  price: {
    backgroundColor: theme.palette.common.black,
    borderRadius: 20,
    alignItems: 'center',
    textAlign: 'center'
  },
  textBlack: {
    color: theme.palette.common.black
  },
  textPrimary: {
    color: theme.palette.primary.main2
  },
  pd: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 10
  },
  pb: {
    paddingBottom: 20
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20
  },
  inputLength: {
    width: '50%'
  }
}))

export default useStyles
