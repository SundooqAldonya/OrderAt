import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { moderateScale } from '../../utils/scaling'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    itemContainer: {
      flexDirection: 'row',
      justifyContent:'space-between',
      alignItems: 'center',
    gap:moderateScale(4),
      marginBottom:moderateScale(15)
    },
    suggestItemImg:{
      aspectRatio: 6/8,
      height:moderateScale(50) 
    },
    suggestItemImgContainer:{
      backgroundColor: '#F3F4F6',
      borderWidth:1,
      borderColor:'#E5E7EB',
      borderRadius:8,
      padding:moderateScale(4),
     
    },
    divider:{
      width:moderateScale(1),
      height:moderateScale(15),
      backgroundColor: props !== null ? props.verticalLine : '#D1D5DB'
    },
    actionContainer: {
      width: '30%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.darkText,
      borderRadius:40,
      borderWidth:1,
      borderColor:props !== null ? props.iconBackground: '#fcfcfc',
    },
    actionContainerBtns: {
      width: moderateScale(30),
      height:moderateScale(30),
      borderRadius: moderateScale(20),
      alignItems: 'center',
     justifyContent:'center'
    },
    minusBtn:{
      backgroundColor: '#fff',
    },
    plusBtn:{
      backgroundColor: '#111827',
    },
    actionContainerView: {    
      justifyContent: 'center',
      alignItems: 'center',
    },
    additionalItem:{
      marginTop:moderateScale(4),
      marginBottom:moderateScale(2),
    },
    itemsDropdown:{
      borderLeftWidth:2.5,
      borderColor:'#D1D5DB',
      paddingLeft:moderateScale(8),
      marginVertical:moderateScale(3)
    }
  })
export default styles
