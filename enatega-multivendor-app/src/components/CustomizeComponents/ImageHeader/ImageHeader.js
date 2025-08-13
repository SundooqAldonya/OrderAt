import React from 'react'
import { ImageBackground } from 'react-native'
import styles from './styles'
import { scale } from '../../../utils/scaling'

function ImageHeader(props) {
  return (
    <ImageBackground
      style={styles.backgroundImage}
      borderRadius={scale(12)}
      resizeMode='cover'
      source={
        props.image
          ? { uri: props.image }
          : require('../../../assets/food_placeholder.jpeg')
      }
      defaultSource={require('../../../assets/food_placeholder.jpeg')}
    />
  )
}

export default ImageHeader
