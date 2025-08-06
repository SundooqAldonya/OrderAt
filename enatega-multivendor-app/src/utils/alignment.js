import { moderateScale, scale } from './scaling'

const XSMALL = 5
const SMALL = 10
const MEDIUM = 15
const LARGE = 20
const XLARGE = 50
export const alignment = {
  MxSmall: {
    margin: scale(XSMALL)
  },
  MBxSmall: {
    marginBottom: scale(XSMALL)
  },
  MTxSmall: {
    marginTop: scale(XSMALL)
  },
  MRxSmall: {
    marginRight: scale(XSMALL)
  },
  MLxSmall: {
    marginLeft: scale(XSMALL)
  },

  Msmall: {
    margin: scale(SMALL)
  },
  MBsmall: {
    marginBottom: scale(SMALL)
  },
  MTsmall: {
    marginTop: moderateScale(SMALL)
  },
  MRsmall: {
    marginRight: scale(SMALL)
  },
  MLsmall: {
    marginLeft: moderateScale(SMALL)
  },

  Mmedium: {
    margin: scale(MEDIUM)
  },
  MBmedium: {
    marginBottom: scale(MEDIUM)
  },
  MTmedium: {
    marginTop: scale(MEDIUM)
  },
  MRmedium: {
    marginRight: scale(MEDIUM)
  },
  MLmedium: {
    marginLeft: scale(MEDIUM)
  },
  Mlarge: {
    margin: scale(LARGE)
  },
  MBlarge: {
    marginBottom: moderateScale(LARGE)
  },
  MTlarge: {
    marginTop: moderateScale(LARGE)
  },
  MRlarge: {
    marginRight: scale(LARGE)
  },
  MLlarge: {
    marginLeft: scale(LARGE)
  },
  MBxLarge: {
    marginBottom: scale(XLARGE)
  },
  MTxLarge: {
    marginTop: scale(XLARGE)
  },
  // Padding
  PxSmall: {
    padding: scale(XSMALL)
  },
  PBxSmall: {
    paddingBottom: scale(XSMALL)
  },
  PTxSmall: {
    paddingTop: moderateScale(XSMALL)
  },
  PRxSmall: {
    paddingRight: scale(XSMALL)
  },
  PLxSmall: {
    paddingLeft: scale(XSMALL)
  },

  Psmall: {
    padding: scale(SMALL)
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
    padding: scale(MEDIUM)
  },
  PBmedium: {
    paddingBottom: scale(MEDIUM)
  },
  PTmedium: {
    paddingTop: scale(MEDIUM)
  },
  PRmedium: {
    paddingRight: moderateScale(MEDIUM)
  },
  PLmedium: {
    paddingLeft: moderateScale(MEDIUM)
  },

  Plarge: {
    padding: scale(LARGE)
  },
  PBlarge: {
    paddingBottom: scale(LARGE)
  },
  PTlarge: {
    paddingTop: scale(LARGE)
  },
  PRlarge: {
    paddingRight: moderateScale(LARGE)
  },
  PLlarge: {
    paddingLeft: moderateScale(LARGE)
  }
}
