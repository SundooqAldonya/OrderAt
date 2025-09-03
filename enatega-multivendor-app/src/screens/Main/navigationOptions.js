/* eslint-disable react/display-name */
import React, { useContext, useEffect } from 'react'
import {
  LeftButton,
  RightButton
} from '../../components/Header/HeaderIcons/HeaderIcons'
import SelectedLocation from '../../components/Main/Location/Location'
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'
import { colors } from '../../utils/colors'
import { moderateScale, scale } from '../../utils/scaling'
import { Platform } from 'react-native'

const navigationOptions = (props) => ({
  headerStyle: {
    height: Platform.OS === 'ios' ? moderateScale(100) : moderateScale(50),
    backgroundColor: colors.primary,
    shadowColor: 'transparent',
    shadowRadius: 0
  },
  headerTitleStyle: {
    color: colors.white,
    ...alignment.PTlarge
  },
  headerTitleContainerStyle: {
    alignItems: 'flex-start',
    ...alignment.MLxSmall
  },
  headerTitleAlign: 'left',
  headerLeft: () => <LeftButton icon={props.icon} iconColor={colors?.white} />,
  headerRight: () => <RightButton icon={'cart'} iconColor={colors?.white} />,
  headerTitle: (headerProp) => (
    <SelectedLocation
      {...headerProp}
      modalOn={() => props.open()}
      linkColor={colors.white}
      navigation={props.navigation}
    />
  ),
  headerShown: false
})
export default navigationOptions
