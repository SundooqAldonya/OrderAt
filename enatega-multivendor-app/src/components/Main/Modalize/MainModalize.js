import React, { Fragment, useContext, useEffect, useRef } from 'react'
import { View, TouchableOpacity, FlatList } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { MaterialIcons, AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import TextDefault from '../../Text/TextDefault/TextDefault'
import { alignment } from '../../../utils/alignment'
import { scale } from '../../../utils/scaling'
import styles from './styles'
import { useTranslation } from 'react-i18next'
import { theme } from '../../../utils/themeColors'
import ThemeContext from '../../../ui/ThemeContext/ThemeContext'

const MainModalize = ({
  modalRef,
  // currentTheme,
  isLoggedIn,
  addressIcons,
  modalHeader,
  modalFooter,
  setAddressLocation,
  profile,
  location
}) => {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  return (
    <Fragment>
      <Modalize
        ref={modalRef}
        // adjustToContentHeight
        modalHeight={400}
        // handlePosition='inside'
        overlayStyle={styles(currentTheme).overlay}
        handleStyle={styles(currentTheme).handle}
        modalStyle={styles(currentTheme).modal}
        // panGestureEnabled={false}
      >
        <View
          style={{
            padding: scale(12),
            paddingBottom: scale(30),
            minHeight: scale(200)
          }}
        >
          {modalHeader?.()}

          <FlatList
            data={isLoggedIn && profile ? profile.addresses : []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item: address }) => (
              <View style={styles(currentTheme).addressbtn}>
                <TouchableOpacity
                  style={styles(currentTheme).addressContainer}
                  onPress={() => setAddressLocation(address)}
                >
                  <View style={styles().addressSubContainer}>
                    <View style={[styles(currentTheme).homeIcon]}>
                      {addressIcons[address.label]
                        ? React.createElement(addressIcons[address.label], {
                            fill: currentTheme.darkBgFont
                          })
                        : React.createElement(addressIcons['Other'], {
                            fill: currentTheme.darkBgFont
                          })}
                    </View>
                    <View style={[styles().titleAddress]}>
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
                </TouchableOpacity>
                <View style={styles().addressTick}>
                  {address._id === location?._id &&
                    ![t('currentLocation'), t('selectedLocation')].includes(
                      location.label
                    ) && (
                      <MaterialIcons
                        name='check'
                        size={scale(25)}
                        color={currentTheme.iconColorPink}
                      />
                    )}
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <TextDefault center>{t('noSavedAddresses')}</TextDefault>
            )}
            ListFooterComponent={modalFooter?.()}
            contentContainerStyle={{ paddingBottom: scale(20) }}
          />
        </View>
      </Modalize>
      {/* <Modalize
      ref={modalRef}
      modalStyle={styles(currentTheme).modal}
      modalHeight={400}
      // modalPosition='top'
      adjustToContentHeight={false}
      overlayStyle={styles(currentTheme).overlay}
      handleStyle={styles(currentTheme).handle}
      handlePosition='inside'
      openAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 }
      }}
      closeAnimationConfig={{
        timing: { duration: 400 },
        spring: { speed: 20, bounciness: 10 }
      }}
      flatListProps={{
        data: isLoggedIn && profile ? profile.addresses : '',
        ListHeaderComponent: modalHeader ? modalHeader() : null,
        ListFooterComponent: modalFooter ? modalFooter() : null,
        showsVerticalScrollIndicator: false,
        keyExtractor: (item, index) => index,
        renderItem: ({ item: address }) => (
          <View style={styles(currentTheme).addressbtn}>
            <TouchableOpacity
              style={styles(currentTheme).addressContainer}
              onPress={() => setAddressLocation(address)}
            >
              <View style={styles().addressSubContainer}>
                <View style={[styles(currentTheme).homeIcon]}>
                  {addressIcons[address.label]
                    ? React.createElement(addressIcons[address.label], {
                        fill: currentTheme.darkBgFont
                      })
                    : React.createElement(addressIcons['Other'], {
                        fill: currentTheme.darkBgFont
                      })}
                </View>
                <View style={[styles().titleAddress]}>
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
            </TouchableOpacity>
            <View style={styles().addressTick}>
              {address._id === location?._id &&
                ![t('currentLocation'), t('selectedLocation')].includes(
                  location.label
                ) && (
                  <MaterialIcons
                    name='check'
                    size={scale(25)}
                    color={currentTheme.iconColorPink}
                  />
                )}
            </View>
          </View>
        )
      }}
    ></Modalize> */}
    </Fragment>
  )
}

export default MainModalize
