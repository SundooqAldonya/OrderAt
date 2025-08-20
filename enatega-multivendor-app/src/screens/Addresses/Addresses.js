import React, { useContext, useEffect, useLayoutEffect, useState } from 'react'
import {
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform
} from 'react-native'
import { NetworkStatus, useMutation, useQuery } from '@apollo/client'
import {
  AntDesign,
  EvilIcons,
  SimpleLineIcons,
  MaterialIcons
} from '@expo/vector-icons'

import gql from 'graphql-tag'

import { moderateScale } from '../../utils/scaling'
import { deleteAddress } from '../../apollo/mutations'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import UserContext from '../../context/User'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { alignment } from '../../utils/alignment'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import EmptyAddress from '../../assets/SVG/imageComponents/EmptyAddress'
import analytics from '../../utils/analytics'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import navigationService from '../../routes/navigationService'
import { HeaderBackButton } from '@react-navigation/elements'
import CustomHomeIcon from '../../assets/SVG/imageComponents/CustomHomeIcon'
import CustomWorkIcon from '../../assets/SVG/imageComponents/CustomWorkIcon'
import CustomOtherIcon from '../../assets/SVG/imageComponents/CustomOtherIcon'
import CustomApartmentIcon from '../../assets/SVG/imageComponents/CustomApartmentIcon'
import { useTranslation } from 'react-i18next'
import { colors } from '../../utils/colors'
import { LocationContext } from '../../context/Location'
import { restaurantListPreview } from '../../apollo/queries'
import { setAddress } from '../../store/addNewAddressSlice'
import { useDispatch } from 'react-redux'

const DELETE_ADDRESS = gql`
  ${deleteAddress}
`

const RESTAURANTS = gql`
  ${restaurantListPreview}
`
function Addresses() {
  const Analytics = analytics()
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [mutate, { loading: loadingMutation }] = useMutation(DELETE_ADDRESS, {
    onCompleted
  })
  const [addressId, setAddressId] = useState(null)
  const [addresses, setAddresses] = useState(null)
  const { profile, refetchProfile, networkStatus } = useContext(UserContext)
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const { t } = useTranslation()
  const { location, setLocation } = useContext(LocationContext)
  const { refetch: refetchRestaurants } = useQuery(RESTAURANTS, {
    variables: {
      longitude: location.longitude || null,
      latitude: location.latitude || null,
      shopType: null,
      ip: null
    },
    fetchPolicy: 'network-only'
  })
  function onCompleted() {
    const newArr = addresses.filter((item) => item._id !== addressId)
    const lastAddress = newArr[newArr.length - 1]

    setAddresses(newArr)
    setLocation({
      _id: lastAddress._id,
      label: lastAddress.label,
      latitude: Number(lastAddress.location.coordinates[1]),
      longitude: Number(lastAddress.location.coordinates[0]),
      deliveryAddress: lastAddress.deliveryAddress,
      details: lastAddress.details
    })
    refetchRestaurants()
    FlashMessage({ message: t('addressDeletedMessage') })
  }

  useEffect(() => {
    if (profile?.addresses.length) {
      setAddresses(profile?.addresses)
    }
  }, [profile])

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_ADDRESS)
    }
    Track()
  }, [])
  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('myAddresses'),
      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        fontWeight: 'bold',
        fontSize: moderateScale(14)
      },
      headerTitleContainerStyle: {
        paddingLeft: moderateScale(25),
        paddingRight: moderateScale(25),
        height: '75%',
        marginLeft: 0
      },
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG,
        elevation: 0
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={{paddingLeft: 10}}>
              <MaterialIcons
                name='arrow-back'
                size={moderateScale(24)}
                color={currentTheme.newIconColor}
              />
            </View>
          )}
          onPress={() => {
            navigationService.goBack()
          }}
        />
      )
    })
  }, [])

  const addressIcons = {
    House: CustomHomeIcon,
    Office: CustomWorkIcon,
    Apartment: CustomApartmentIcon,
    Other: CustomOtherIcon
  }

  function emptyView() {
    return (
      <View style={styles().subContainerImage}>
        <EmptyAddress width={moderateScale(300)} height={moderateScale(300)} />
        <View>
          <View style={styles().descriptionEmpty}>
            <View style={styles().viewTitle}>
              <TextDefault textColor={colors.dark} bolder>
                {t('emptyHere')}
              </TextDefault>
            </View>
            <View>
              <TextDefault textColor={currentTheme.fontMainColor} bold>
                {t('addressNotSaved')}
                {'\n'}
                {t('addNewAddress')}
              </TextDefault>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles(currentTheme).flex}>
      {profile?.addresses.length ? (
        <FlatList
          onRefresh={refetchProfile}
          refreshing={networkStatus === NetworkStatus.refetch}
          data={profile?.addresses ? addresses : null}
          ListEmptyComponent={emptyView}
          keyExtractor={(item, index) => index}
          ItemSeparatorComponent={() => (
            <View style={styles(currentTheme).line} />
          )}
          ListHeaderComponent={() => <View style={{ ...alignment.MTmedium }} />}
          renderItem={({ item: address }) => {
            console.log('t(address.label)', t(address.label), addressIcons[address.label])
            return(
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles(currentTheme).containerSpace]}
            >
              <View style={[styles().width100, styles().rowContainer]}>
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
                <View style={styles().buttonsAddress}>
                  <TouchableOpacity
                    disabled={loadingMutation}
                    onPress={() => {
                      const [longitude, latitude] = address.location.coordinates
                      dispatch(
                        setAddress({
                          addressFrom: address.deliveryAddress,
                          regionFrom: {
                            latitude: +latitude,
                            longitude: +longitude
                          },
                          addressFreeText: address.details,
                          label: address.label
                        })
                      )
                      navigation.navigate('EditAddressNewVersion', {
                        address,
                        id: address._id,
                        longitude: +longitude,
                        latitude: +latitude,
                        prevScreen: 'Addresses'
                      })
                    }}
                  >
                    <SimpleLineIcons
                      name='pencil'
                      size={moderateScale(18)}
                      color={currentTheme.darkBgFont}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    disabled={loadingMutation}
                    onPress={() => {
                      setAddressId(address._id)
                      mutate({ variables: { id: address._id } })
                    }}
                  >
                    <EvilIcons
                      name='trash'
                      size={moderateScale(28)}
                      // color={currentTheme.darkBgFont}
                      color={'red'}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ ...alignment.MTxSmall }}></View>
              </View>
              <View style={styles().midContainer}>
                <View style={styles(currentTheme).addressDetail}>
                  <TextDefault
                    numberOfLines={2}
                    textColor={currentTheme.darkBgFont}
                    style={{ ...alignment.PBxSmall }}
                  >
                    {address.deliveryAddress}
                  </TextDefault>
                </View>
              </View>
            </TouchableOpacity>
          )}}
        />
      ) : null}
      {/* </ScrollView> */}
      <View>
        <View style={styles(currentTheme).containerButton}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles(currentTheme).addButton}
            onPress={() =>
              // navigation.navigate('AddNewAddressUser', {
              //   prevScreen: 'Addresses'
              // })
              navigation.navigate('AddressNewVersion', {
                prevScreen: 'Addresses'
              })
            }
          >
            <TextDefault H5 bold>
              {t('addAddress')}
            </TextDefault>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Addresses
