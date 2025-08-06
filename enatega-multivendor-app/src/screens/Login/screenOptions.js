import React from 'react'
import styles from './styles'
import { AntDesign } from '@expo/vector-icons'
import { moderateScale } from '../../utils/scaling'

const navigationOptions = props => {
  return {
    title: null,
    // eslint-disable-next-line react/display-name
    headerRight: () => (
      <AntDesign
        onPress={() =>
          props.navigation.navigate({
            name: 'Main',
            merge: true
          })
        }
        name='closecircleo'
        size={moderateScale(20)}
        color={props.iconColor}
        style={styles().headerRightIcon}
      />
    ),
    // eslint-disable-next-line react/display-name
    headerLeft: () => (
      <AntDesign
        onPress={() => props.navigation.goBack()}
        name='arrowleft'
        size={moderateScale(20)}
        color={props.iconColor}
        style={styles().headerLeftIcon}
      />
    ),
    headerStyle: {
      backgroundColor: props.backColor
    }
  }
}
export default navigationOptions
