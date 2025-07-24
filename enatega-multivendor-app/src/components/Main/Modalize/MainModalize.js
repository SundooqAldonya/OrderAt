import React, { Fragment, useContext, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  StyleSheet
} from 'react-native'
import { Modalize } from 'react-native-modalize'
import { MaterialIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import { theme } from '../../../utils/themeColors'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'
import { colors } from '../../../utils/colors'
import { ActivityIndicator } from 'react-native-paper'
import Modal from 'react-native-modal'

const MainModalize = ({
  isVisible,
  // currentTheme,
  isLoggedIn,
  addressIcons,
  modalHeader,
  modalFooter,
  setAddressLocation,
  profile,
  location,
  loading,
  onClose,
  otlobMandoob
}) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  return (
    <Fragment>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        backdropOpacity={0.4}
        style={styles(currentTheme).modal}
        swipeDirection='down'
        onSwipeComplete={onClose}
        useNativeDriver
      >
        <View style={styles(currentTheme).modalContent}>
          {modalHeader ? <Fragment>{modalHeader?.()}</Fragment> : null}

          <FlatList
            data={isLoggedIn && profile ? profile.addresses : []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item: address }) => (
              <TouchableOpacity
                style={[
                  styles(currentTheme).addressbtn,
                  styles(currentTheme).addressContainer
                ]}
                onPress={() => setAddressLocation(address)}
                activeOpacity={0.5}
              >
                <View style={styles().addressSubContainer}>
                  <View style={styles(currentTheme).homeIcon}>
                    {addressIcons[address.label]
                      ? React.createElement(addressIcons[address.label], {
                          fill: currentTheme.darkBgFont
                        })
                      : React.createElement(addressIcons['Other'], {
                          fill: currentTheme.darkBgFont
                        })}
                  </View>

                  <View style={styles().titleAddress}>
                    <TextDefault
                      textColor={currentTheme.darkBgFont}
                      style={styles(currentTheme).labelStyle}
                    >
                      {t(address.label)}
                    </TextDefault>
                  </View>
                </View>

                <View style={styles(currentTheme).addressTextContainer}>
                  <View style={styles(currentTheme).addressDetail}>
                    <TextDefault
                      style={{ ...alignment.PLlarge, paddingHorizontal: 25 }}
                      textColor={currentTheme.fontSecondColor}
                      small
                    >
                      {address.deliveryAddress}
                    </TextDefault>
                  </View>
                </View>
                {!otlobMandoob && address._id === location?._id ? (
                  <Fragment>
                    {loading ? (
                      <View
                        style={{ ...styles().addressTick, marginRight: 15 }}
                      >
                        <ActivityIndicator size={15} color={colors.primary} />
                      </View>
                    ) : (
                      <Fragment>
                        {address._id === location?._id &&
                          ![
                            t('currentLocation'),
                            t('selectedLocation')
                          ].includes(location.label) && (
                            <View style={styles().addressTick}>
                              <MaterialIcons
                                name='check'
                                size={scale(25)}
                                color={currentTheme.iconColorPink}
                              />
                            </View>
                          )}
                      </Fragment>
                    )}
                  </Fragment>
                ) : null}
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <TextDefault center>{t('noSavedAddresses')}</TextDefault>
            )}
            ListFooterComponent={modalFooter?.()}
            contentContainerStyle={{ paddingBottom: scale(20) }}
          />
        </View>
      </Modal>
    </Fragment>
  )
}

export default MainModalize
