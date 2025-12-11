import { StyleSheet } from 'react-native'
import { verticalScale, moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    container: {
      // flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: props !== null ? props.themeBackground : '#fff',
      padding: moderateScale(10),
      marginBottom: moderateScale(10)
    },
    filterButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: moderateScale(20),
      backgroundColor: props !== null ? props.filtersBg : '#f0f0f0',
      marginRight: moderateScale(10)
    },
    selectedFilterButton: {
      // backgroundColor: props !== null ? props.main : colors.primary
      backgroundColor: colors.primary
    },
    filterText: {
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      // color: props !== null ? props.newFontcolor : colors.secondary,
      color: colors.secondary,
      marginRight: moderateScale(10)
    },
    filterButtonText: {
      fontSize: moderateScale(14),
      marginRight: moderateScale(10)
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: moderateScale(2),
      rowGap: moderateScale(10)
    },
    modalContainer: {
      flex: 1,
      backgroundColor: props !== null ? props.themeBackground : '#fff',
      paddingTop: moderateScale(20),
      paddingHorizontal: moderateScale(20)
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: moderateScale(18),
      backgroundColor: props !== null ? props.themeBackground : '#fff',
      marginTop: 20
    },
    modalTitle: {
      fontSize: moderateScale(20),
      fontWeight: 'bold',
      marginBottom: moderateScale(10),
      marginTop: moderateScale(10),
      paddingHorizontal: 10
    },
    modalItem: {
      paddingVertical: moderateScale(10),
      borderBottomWidth: 0.5,
      borderBottomColor: props !== null ? props.white : '#fff',
      paddingHorizontal: 10
    },
    modalItemText: {
      fontSize: moderateScale(16)
    },
    saveBtnContainer: {
      width: '100%',
      height: moderateScale(60),
      borderRadius: moderateScale(30),
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: props !== null ? props.main : '#90E36D',
      backgroundColor: colors.primary,
      alignSelf: 'center',
      marginTop: moderateScale(20),
      marginBottom: moderateScale(40)
    },
    selectedModalItem: {
      backgroundColor: props !== null ? props.borderColor : '#efefef',
      paddingHorizontal: 10
    }
  })
export default styles
