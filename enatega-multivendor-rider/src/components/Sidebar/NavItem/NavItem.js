import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import styles from './styles.js'
import TextDefault from '../../Text/TextDefault/TextDefault.js'
import { FontAwesome } from '@expo/vector-icons'
import { scale } from '../../../utilities/scaling.js'
import colors from '../../../utilities/colors.js'
import PropTypes from 'prop-types'

const NavItem = props => (
  <View style={styles.Flex}>
    <TouchableOpacity
      style={[
        styles.container,
        { flexDirection: props.reverse ? 'row-reverse' : 'row' }
      ]}
      onPress={props.onPress}>
      <View style={styles.leftContainer}>
        {props.icon ? (
          <FontAwesome
            name={props.icon}
            size={scale(20)}
            color={colors.white}
          />
        ) : null}
      </View>
      <View style={styles.rightContainer}>
        <TextDefault textColor={colors.white} H5 bold>
          {props.title}
        </TextDefault>
      </View>
    </TouchableOpacity>
  </View>
)
NavItem.propTypes = {
  onPress: PropTypes.func,
  icons: PropTypes.string,
  title: PropTypes.string.isRequired
}
export default NavItem
