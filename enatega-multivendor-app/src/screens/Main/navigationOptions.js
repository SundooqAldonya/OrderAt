/* eslint-disable react/display-name */
import React, { useContext, useEffect } from 'react'
import { LeftButton } from '../../components/Header/HeaderIcons/HeaderIcons'
import SelectedLocation from '../../components/Main/Location/Location'
import { alignment } from '../../utils/alignment'
import { theme } from '../../utils/themeColors'
import { colors } from '../../utils/colors'
import { scale } from '../../utils/scaling'

const navigationOptions = props => ({
  headerStyle: {
    height:scale(50),
    backgroundColor:colors.primary,
    shadowColor: 'transparent',
    shadowRadius: 0,
  },
  headerTitleStyle: {
    color: colors.background,
    ...alignment.PTlarge
  },
  headerTitleContainerStyle: {
    alignItems: 'flex-start',
    ...alignment.MLxSmall
  },
  headerTitleAlign: 'left',
  headerLeft: () => <LeftButton icon={props.icon} iconColor={colors?.background}  />,
  headerTitle: headerProp => (
    <SelectedLocation
      {...headerProp}
      modalOn={() => props.open()}
      linkColor={colors.background}
      navigation={props.navigation}
    />
  )
})
export default navigationOptions
