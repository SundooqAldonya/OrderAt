import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { FlashMessage } from '../../../ui/FlashMessage/FlashMessage'
import { moderateScale } from '../../../utils/scaling'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const MainV2Header = ({ styles, setIsVisible, location, cartCount }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  return (
    <View
      style={{
        ...styles.header
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.toggleDrawer()}
          style={{ width: moderateScale(40), height:  moderateScale(40) }}
        >
          <Image
            source={require('../../../assets/hamburger_btn.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain'
            }}
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => setIsVisible(true)}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'flex-start',
            maxWidth: '80%',
            gap: 4
          }}
        >
          <Text style={styles.headerSubtitle}>{t('deliver_to')}</Text>
          <Text style={styles.headerTitle}>
            {location?.label.length > 40
              ? `${location?.label.substring(0, 40)}...`
              : location?.label.substring(0, 40)}{' '}
            ▼
          </Text>
        </TouchableOpacity> */}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
        <TouchableOpacity
          onPress={() => setIsVisible(true)}
          style={{
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'flex-start',
            maxWidth: '80%',
            gap: 4
          }}
        >
          <Text style={styles.headerSubtitle}>{t('deliver_to')}</Text>
          <Text style={styles.headerTitle}>
            {location?.label.length > 40
              ? `${location?.label.substring(0, 40)}...`
              : location?.label.substring(0, 40)}{' '}
            ▼
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Favourite')}>
          <MaterialIcons
            name='favorite-outline'
            size={moderateScale(24)}
            color='black'
          />
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('SelectLanguageScreen')}
        >
          <FontAwesome name='language' size={moderateScale(24)} color='black' />
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            if (cartCount > 0) {
              navigation.navigate('Cart')
            } else {
              FlashMessage({
                message: t('cartIsEmpty')
              })
            }
          }}
          style={styles.cartWrapper}
        >
          <Ionicons name='cart-outline' size={moderateScale(24)} color='#000' />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default MainV2Header

const styles = StyleSheet.create({})
