import React, { useContext, useEffect, useState } from 'react'
import { View, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import Analytics from '../../utils/analytics'
import { HeaderBackButton } from '@react-navigation/elements'
import { MaterialIcons } from '@expo/vector-icons'
import navigationService from '../../routes/navigationService'
import { scale } from '../../utils/scaling'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utils/colors'

const Help = props => {
  const { t } = useTranslation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [links, setLinks] = useState([
    {
      title: t('titleProductPage'),
      url: 'https://orderat.ai'
    },
    {
      title: t('titleDocs'),
      url: 'https://orderat.ai'
    },
    {
      title: t('titleBlog'),
      url: 'https://orderat.ai'
    },
    {
      title: t('titleAboutUs'),
      url: 'https://orderat.ai'
    }
  ])

  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_HELP)
    }
    Track()
  }, [])

  useEffect(() => {
    // Update translations when the language changes
    setLinks([
      {
        title: t('titleProductPage'),
        url:
          'https://orderat.ai'
      },
      {
        title: t('titleDocs'),
        url: 'https://orderat.ai'
      },
      {
        title: t('titleBlog'),
        url:
          'https://orderat.ai'
      },
      {
        title: t('titleAboutUs'),

        url: 'https://orderat.ai'
      }
    ])
  }, [])
  useEffect(() => {
    props.navigation.setOptions({
      headerTitle: t('titleHelp'),
      headerTitleAlign: 'center',
      headerRight: null,
      headerTitleContainerStyle: {
        marginTop: '1%',
        paddingLeft: scale(25),
        paddingRight: scale(25),
        height: '75%',
        borderRadius: scale(10),
        backgroundColor: currentTheme.black,
        borderWidth: 1,
        borderColor: 'white'
      },
      headerStyle: {
        backgroundColor: currentTheme.themeBackground
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=""
          backImage={() => (
            <View style={styles(currentTheme).backImageContainer}>
              <MaterialIcons name="arrow-back" size={30} color="black" />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [props.navigation])

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={styles(currentTheme).flex}>
      <StatusBar
        backgroundColor={colors.primary}
        barStyle={'light-content'}
      />
      <View style={styles(currentTheme).flex}>
        <View style={styles(currentTheme).mainContainer}>
          {links.map(({ title, url }, index) => (
            <TouchableOpacity
              style={styles(currentTheme).itemContainer}
              onPress={() =>
                props.navigation.navigate('HelpBrowser', { title, url })
              }
              key={index}>
              <View>
                <TextDefault textColor={currentTheme.fontMainColor} bolder>
                  {title}{' '}
                </TextDefault>
              </View>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={currentTheme.darkBgFont}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Help
