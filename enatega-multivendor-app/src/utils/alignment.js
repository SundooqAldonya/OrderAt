import { moderateScale } from './scaling'

const XSMALL = 5
const SMALL = 10
const MEDIUM = 15
const LARGE = 20
const XLARGE = 50
export const alignment = {
  MxSmall: {
    margin: moderateScale(XSMALL)
  },
  MBxSmall: {
    marginBottom: moderateScale(XSMALL)
  },
  MTxSmall: {
    marginTop: moderateScale(XSMALL)
  },
  MRxSmall: {
    marginRight: moderateScale(XSMALL)
  },
  MLxSmall: {
    marginLeft: moderateScale(XSMALL)
  },

  Msmall: {
    margin: moderateScale(SMALL)
  },
  MBsmall: {
    marginBottom: moderateScale(SMALL)
  },
  MTsmall: {
    marginTop: moderateScale(SMALL)
  },
  MRsmall: {
    marginRight: moderateScale(SMALL)
  },
  MLsmall: {
    marginLeft: moderateScale(SMALL)
  },

  Mmedium: {
    margin: moderateScale(MEDIUM)
  },
  MBmedium: {
    marginBottom: moderateScale(MEDIUM)
  },
  MTmedium: {
    marginTop: moderateScale(MEDIUM)
  },
  MRmedium: {
    marginRight: moderateScale(MEDIUM)
  },
  MLmedium: {
    marginLeft: moderateScale(MEDIUM)
  },
  Mlarge: {
    margin: moderateScale(LARGE)
  },
  MBlarge: {
    marginBottom: moderateScale(LARGE)
  },
  MTlarge: {
    marginTop: moderateScale(LARGE)
  },
  MRlarge: {
    marginRight: moderateScale(LARGE)
  },
  MLlarge: {
    marginLeft: moderateScale(LARGE)
  },
  MBxLarge: {
    marginBottom: moderateScale(XLARGE)
  },
  MTxLarge: {
    marginTop: moderateScale(XLARGE)
  },
  // Padding
  PxSmall: {
    padding: moderateScale(XSMALL)
  },
  PBxSmall: {
    paddingBottom: moderateScale(XSMALL)
  },
  PTxSmall: {
    paddingTop: moderateScale(XSMALL)
  },
  PRxSmall: {
    paddingRight: moderateScale(XSMALL)
  },
  PLxSmall: {
    paddingLeft: moderateScale(XSMALL)
  },

  Psmall: {
    padding: moderateScale(SMALL)
  },
  PBsmall: {
    paddingBottom: moderateScale(SMALL)
  },
  PTsmall: {
    paddingTop: moderateScale(SMALL)
  },
  PRsmall: {
    paddingRight: moderateScale(SMALL)
  },
  PLsmall: {
    paddingLeft: moderateScale(SMALL)
  },

  Pmedium: {
    padding: moderateScale(MEDIUM)
  },
  PBmedium: {
    paddingBottom: moderateScale(MEDIUM)
  },
  PTmedium: {
    paddingTop: moderateScale(MEDIUM)
  },
  PRmedium: {
    paddingRight: moderateScale(MEDIUM)
  },
  PLmedium: {
    paddingLeft: moderateScale(MEDIUM)
  },

  Plarge: {
    padding: moderateScale(LARGE)
  },
  PBlarge: {
    paddingBottom: moderateScale(LARGE)
  },
  PTlarge: {
    paddingTop: moderateScale(LARGE)
  },
  PRlarge: {
    paddingRight: moderateScale(LARGE)
  },
  PLlarge: {
    paddingLeft: moderateScale(LARGE)
  }
}
