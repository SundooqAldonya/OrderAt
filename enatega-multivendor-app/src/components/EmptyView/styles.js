import { scale } from '../../utils/scaling'
import { StyleSheet } from 'react-native'
import { alignment } from '../../utils/alignment'
import { colors } from '../../utils/colors'

const styles = (props = null) =>
  StyleSheet.create({
    mainContainerEmpty: {
      backgroundColor: props !== null ? props.themeBackground : 'transparent',
      paddingTop: scale(100),
      
    },
    subContainerImage: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'center'
    },
    imageContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.MBlarge
    },
    descriptionEmpty: {
      justifyContent: 'center',
      alignItems: 'center',
      ...alignment.Plarge
    },
    emptyButton: {
      backgroundColor: colors.primary,
      width: '70%',
      height: scale(40),
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center'
    }
  })

export default styles
