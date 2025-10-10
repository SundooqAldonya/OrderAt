import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import React, {
  Fragment,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'react'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useEnvVars from '../../../environment'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { LocationContext } from '../../context/Location'
import { Controller, useForm } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { getDeliveryCalculationV2, myOrders } from '../../apollo/queries'
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import FromIcon from '../../assets/delivery_from.png'
import ToIcon from '../../assets/delivery_to.png'
import {
  applyCoupon,
  applyCouponMandoob,
  bulkAddUserAddresses,
  createDeliveryRequest,
  updateUserName
} from '../../apollo/mutations'
import Toast from 'react-native-toast-message'
import { Image } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MapViewDirections from 'react-native-maps-directions'
import ConfigurationContext from '../../context/Configuration'
import { Modalize } from 'react-native-modalize'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { moderateScale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import Spinner from '../../components/Spinner/Spinner'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { colors } from '../../utils/colors'
import { resetRequestDelivery } from '../../store/requestDeliverySlice'
import Modal from 'react-native-modal'
import UserContext from '../../context/User'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const ORDERS = gql`
  ${myOrders}
`
const RequestDelivery = () => {
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const mapRef = useRef()
  const voucherModalRef = useRef(null)
  const inputRef = useRef()
  const configuration = useContext(ConfigurationContext)
  const { profile, refetchProfile } = useContext(UserContext)
  const navigation = useNavigation()
  const addressInfo = useSelector((state) => state.requestDelivery)
  const regionFrom = useSelector((state) => state.requestDelivery.regionFrom)
  const regionTo = useSelector((state) => state.requestDelivery.regionTo)
  const city = useSelector((state) => state.city.city)
  const isArabic = i18n.language === 'ar'
  const [pickupCoords, setPickupCoords] = useState(addressInfo.regionFrom)
  const [dropOffCoords, setDropOffCoords] = useState(addressInfo.regionTo)
  const { location } = useContext(LocationContext)
  const [isUrgent, setIsUrgent] = useState(false)
  const [notes, setNotes] = useState('')
  const [disabled, setDisabled] = useState(false)
  const [notesError, setNotesError] = useState(false)
  const [nameFormAppear, setNameFormAppear] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [layoutReset, setLayoutReset] = useState(false) // Used to reset layout when coupon modal closed
  const [couponOpen, setCouponOpen] = useState(false)

  console.log({ regionFrom: addressInfo.regionFrom })
  console.log({ pickupCoords })

  const [coupon, setCoupon] = useState(null)
  console.log({ coupon })
  const [voucherCode, setVoucherCode] = useState('')

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  const [mutateUserName, { loading: usernameLoading, error: usernameError }] =
    useMutation(updateUserName, {
      onCompleted: (res) => {
        console.log({ res })
        refetchProfile()
        Toast.show({
          type: 'success',
          text1: t('success'),
          text2: t('name_updated'),
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
        setNameFormAppear(false)
        setCustomerName('')
      },
      onError: (err) => {
        console.log({ err })
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: 'Something went wrong!',
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
      }
    })

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (mapRef?.current && pickupCoords && dropOffCoords) {
        mapRef.current.fitToCoordinates([pickupCoords, dropOffCoords], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        })
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [mapRef?.current, regionFrom, regionTo])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        const hasPickup = !!addressInfo.regionFrom
        const hasDropoff = !!addressInfo.regionTo

        if (hasPickup && hasDropoff) {
          const from = addressInfo.regionFrom
          const to = addressInfo.regionTo

          setPickupCoords(from)
          setDropOffCoords(to)

          mapRef.current.fitToCoordinates([from, to], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          })
        } else if (hasPickup) {
          setPickupCoords(addressInfo.regionFrom)
          mapRef.current.animateToRegion(
            {
              ...addressInfo.regionFrom,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            },
            1000
          )
        } else if (hasDropoff) {
          setDropOffCoords(addressInfo.regionTo)
          mapRef.current.animateToRegion(
            {
              ...addressInfo.regionTo,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            },
            1000
          )
        } else if (city?.location?.location?.coordinates) {
          const [lng, lat] = city.location.location.coordinates
          const region = {
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }

          mapRef.current.animateToRegion(region, 1000)
        }
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [addressInfo, city, regionFrom, regionTo])

  const [mutateBulkAddress] = useMutation(bulkAddUserAddresses, {
    onCompleted: (res) => {
      // Toast.show({
      //   type: 'success',
      //   text1: t('success'),
      //   text2: t(res.bulkAddUserAddresses.message),
      //   text1Style: {
      //     textAlign: isArabic ? 'right' : 'left'
      //   },
      //   text2Style: {
      //     textAlign: isArabic ? 'right' : 'left'
      //   }
      // })
      FlashMessage({
        message: t(res.bulkAddUserAddresses.message),
        duration: 5000
      })
      dispatch(resetRequestDelivery())
      refetchProfile()
    }
  })

  const [mutate] = useMutation(createDeliveryRequest, {
    refetchQueries: [{ query: ORDERS }],
    onCompleted: (res) => {
      console.log({ res })
      Toast.show({
        type: 'success',
        text1: t('success'),
        text2: t(res.createDeliveryRequest.message),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      const from = {
        deliveryAddress: addressInfo.addressFrom,
        details: addressInfo.addressFreeTextFrom,
        label: addressInfo.labelFrom,
        isActive: true,
        location: {
          type: 'Point',
          coordinates: [regionFrom.longitude, regionFrom.latitude]
        }
      }
      const to = {
        deliveryAddress: addressInfo.addressTo,
        details: addressInfo.addressFreeTextTo,
        label: addressInfo.labelTo,
        isActive: true,
        location: {
          type: 'Point',
          coordinates: [regionTo.longitude, regionTo.latitude]
        }
      }
      const addresses = [from, to]
      mutateBulkAddress({
        variables: {
          userId: profile._id,
          addresses
        }
      })
      dispatch(resetRequestDelivery())
      navigation.navigate('Main')
    },
    onError: (err) => {
      console.log({ err })
      setDisabled(false)
      const error = String(err)
      let errMessage
      if (error && error.includes('no_zone')) {
        errMessage = error.split(':').pop().trim()
        Toast.show({
          type: 'error',
          text1: t('error'),
          text2: t(errMessage),
          text1Style: {
            textAlign: isArabic ? 'right' : 'left'
          },
          text2Style: {
            textAlign: isArabic ? 'right' : 'left'
          }
        })
        return
      }
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('somethingWentWrong'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
    }
  })

  const [fetchCalculateDelivery, { data, loading, error, refetch }] =
    useLazyQuery(getDeliveryCalculationV2)

  useEffect(() => {
    if (addressInfo.regionTo && addressInfo.regionFrom) {
      fetchCalculateDelivery({
        variables: {
          input: {
            code: coupon?.code.replace(' ', ''),
            destLong: Number(addressInfo.regionTo.longitude),
            destLat: Number(addressInfo.regionTo.latitude),
            originLong: Number(addressInfo.regionFrom.longitude),
            originLat: Number(addressInfo.regionFrom.latitude)
          }
        }
      })
    }
  }, [addressInfo, coupon])

  const deliveryFee = data?.getDeliveryCalculationV2?.amount || null
  const originalDiscount =
    data?.getDeliveryCalculationV2?.originalDiscount || null

  console.log({ deliveryFee })
  console.log({ addressInfo })
  console.log({ addressInfo })

  useEffect(() => {
    if (data && coupon)
      FlashMessage({
        message: t('coupanApply')
      })
  }, [data])

  const [mutateCouponMandoob, { loading: couponLoading }] = useMutation(
    applyCouponMandoob,
    {
      onCompleted: (res) => {
        console.log({ res })
        setCoupon({ ...res.applyCouponMandoob })
        setVoucherCode('')
        setCouponOpen(false)
        setTimeout(() => {
          refetch()
        }, 2000)
      },
      onError: (err) => {
        console.log({ err })
        FlashMessage({
          message: t('invalidCoupan')
        })
      }
    }
  )

  const validate = () => {
    if (profile.name === 'N/A') {
      setNameFormAppear(true)
      return false
    }
    if (!addressInfo.regionTo || !addressInfo.regionFrom) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('regions_required'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      return false
    }
    if (!notes) {
      Toast.show({
        type: 'error',
        text1: t('error'),
        text2: t('notes_required'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
      setNotesError(true)
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (validate()) {
      setDisabled(true)
      const payload = {
        pickupLat: +pickupCoords?.latitude,
        pickupLng: +pickupCoords?.longitude,
        pickupAddressText: addressInfo.addressFrom,
        pickupAddressFreeText: addressInfo.addressFreeTextFrom,
        pickupLabel: addressInfo.labelFrom,
        dropoffLat: +dropOffCoords?.latitude,
        dropoffLng: +dropOffCoords?.longitude,
        dropoffAddressText: addressInfo.addressTo,
        dropoffAddressFreeText: addressInfo.addressFreeTextTo,
        dropoffLabel: addressInfo.labelTo,
        deliveryFee,
        requestChannel: 'customer_app',
        is_urgent: isUrgent,
        notes,
        couponId: coupon?.code || null
      }
      console.log({ pickupCoords, dropOffCoords })
      if (notes?.length) {
        setNotesError(false)
      }
      mutate({
        variables: {
          input: {
            ...payload
          }
        }
      })
    }
  }

  const toggleSwitch = () => {
    setIsUrgent(!isUrgent)
  }

  const onModalOpen = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.open()
    }
  }
  const onModalClose = (modalRef) => {
    const modal = modalRef.current
    if (modal) {
      modal.close()
      setCouponOpen(false)
    }
  }

  const handleApplyCoupon = () => {
    const coordinates = {
      latitude: +location.latitude,
      longitude: +location.longitude
    }
    mutateCouponMandoob({
      variables: {
        applyCouponMandoobInput: {
          code: voucherCode,
          deliveryFee,
          location: coordinates
        }
      }
    })
  }

  console.log({ pickupCoords })

  const onClose = () => {
    setNameFormAppear(false)
    setCouponOpen(false)
  }

  const handleSubmitCustomerName = () => {
    mutateUserName({
      variables: {
        id: profile._id,
        name: customerName
      }
    })
  }

  return (
    <Fragment>
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 120}
      > */}
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        extraScrollHeight={60}
      >
        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {regionFrom?.latitude &&
          regionFrom?.longitude &&
          regionTo?.latitude &&
          regionTo?.longitude ? (
            <View>
              <MapView
                key={`${regionFrom?.latitude}-${regionFrom?.longitude}-${regionTo?.latitude}-${regionTo?.longitude}`}
                ref={mapRef}
                style={{ height: 300 }}
                region={{
                  latitude: pickupCoords?.latitude || 31.111667,
                  longitude: pickupCoords?.longitude || 30.945833,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02
                }}
                onMapReady={() => {
                  if (pickupCoords && dropOffCoords && mapRef.current) {
                    mapRef.current.fitToCoordinates(
                      [pickupCoords, dropOffCoords],
                      {
                        edgePadding: {
                          top: 50,
                          right: 50,
                          bottom: 50,
                          left: 50
                        },
                        animated: true
                      }
                    )
                  }
                }}
              >
                {pickupCoords && (
                  <Marker coordinate={pickupCoords} title='Pickup'>
                    <Image
                      source={FromIcon}
                      style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
                    />
                  </Marker>
                )}
                {dropOffCoords && (
                  <Fragment>
                    <Marker coordinate={dropOffCoords} title='Dropoff'>
                      <Image
                        source={ToIcon}
                        style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
                      />
                    </Marker>
                  </Fragment>
                )}
                {/* {pickupCoords && dropOffCoords && (
            <MapViewDirections
              origin={pickupCoords}
              destination={dropOffCoords}
              apikey={googleApiKey}
              strokeWidth={4}
              strokeColor='#1E90FF'
              optimizeWaypoints={true}
              onReady={(result) => {
                mapRef.current?.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true
                })
              }}
              onError={(errorMessage) => {
                console.warn('Route error:', errorMessage)
              }}
            />
          )} */}
              </MapView>
            </View>
          ) : null}
          <View style={styles.wrapper}>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewPickupMandoob')}
              style={[styles.addressCard]}
            >
              <View style={styles.addressRow(isArabic)}>
                <View style={styles.labelContainer(isArabic)}>
                  <TextDefault style={styles.addressText(isArabic)}>
                    {t('pick_up_location')}:
                  </TextDefault>
                  <Image source={FromIcon} style={styles.iconStyle} />
                </View>

                <View style={styles.editIconContainer(isArabic)}>
                  <Feather name='edit' size={moderateScale(20)} color='black' />
                </View>
              </View>
              <View style={{ marginHorizontal: 35 }}>
                <TextDefault
                  style={{
                    ...styles.addressText(isArabic),
                    color: !addressInfo.labelFrom ? 'red' : colors.primary
                  }}
                >
                  {addressInfo.labelFrom
                    ? `(${addressInfo.labelFrom})`
                    : `(${t('choose_pickup')})`}
                </TextDefault>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('NewDropoffMandoob')}
              style={[styles.addressCard]}
            >
              <View style={styles.addressRow(isArabic)}>
                <View style={styles.labelContainer(isArabic)}>
                  <TextDefault style={styles.addressText(isArabic)}>
                    {t('drop_off_location')}:
                  </TextDefault>
                  <Image source={ToIcon} style={styles.iconStyle} />
                </View>

                <View style={styles.editIconContainer(isArabic)}>
                  <Feather name='edit' size={moderateScale(20)} color='black' />
                </View>
              </View>
              <View style={{ marginHorizontal: 35 }}>
                <TextDefault
                  style={{
                    ...styles.addressText(isArabic),
                    color: !addressInfo.labelTo ? 'red' : colors.primary
                  }}
                >
                  {addressInfo.labelTo
                    ? `(${addressInfo.labelTo})`
                    : `(${t('choose_dropoff')})`}
                </TextDefault>
              </View>
            </TouchableOpacity>

            {/* Item Description */}
            <TextDefault
              bolder
              style={{
                ...styles.title,
                textAlign: isArabic ? 'right' : 'left',
                marginTop: 20,
                color: notesError ? 'red' : '#000'
              }}
            >
              {t('item_description')} *
            </TextDefault>
            <TextInput
              placeholder={t('item_description_notes')}
              placeholderTextColor='#888'
              style={[
                styles.textArea,
                notesError && { borderColor: 'red', borderWidth: 1 }
              ]}
              onChangeText={(text) => setNotes(text)}
              multiline
              numberOfLines={4}
              textAlignVertical='top'
            />

            {/* Urgency */}
            {/* <View
          style={{
            ...styles.switchRow,
            flexDirection: isArabic ? 'row-reverse' : 'row'
          }}
        >
          <Text style={styles.label}>{t('is_urgent')}</Text>

          <Switch value={isUrgent} onValueChange={toggleSwitch} />
        </View> */}

            <View style={{ marginTop: 20 }}>
              {!coupon ? (
                <TouchableOpacity
                  // activeOpacity={0.7}
                  style={{
                    ...styles.voucherSecInner,
                    flexDirection: isArabic ? 'row-reverse' : 'row'
                  }}
                  onPress={() => setCouponOpen(true)}
                >
                  <MaterialCommunityIcons
                    name='ticket-confirmation-outline'
                    size={moderateScale(24)}
                    color={currentTheme.lightBlue}
                  />
                  <TextDefault
                    H4
                    bolder
                    textColor={currentTheme.lightBlue}
                    center
                  >
                    {t('applyVoucher')}
                  </TextDefault>
                </TouchableOpacity>
              ) : (
                <View>
                  <TextDefault
                    numberOfLines={1}
                    H5
                    bolder
                    textColor={currentTheme.fontNewColor}
                    style={{ textAlign: isArabic ? 'right' : 'left' }}
                  >
                    {t('coupon')}
                  </TextDefault>
                  <View
                    style={{
                      flexDirection: isArabic ? 'row-reverse' : 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingTop: moderateScale(8),
                        gap: moderateScale(5)
                      }}
                    >
                      <View>
                        <View
                          style={{
                            flexDirection: isArabic ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            gap: 5
                          }}
                        >
                          <AntDesign
                            name='tags'
                            size={24}
                            color={currentTheme.main}
                          />
                          <TextDefault
                            numberOfLines={1}
                            tnormal
                            bold
                            textColor={currentTheme.fontFourthColor}
                            style={{
                              textAlign: isArabic ? 'right' : 'left'
                            }}
                          >
                            {coupon ? coupon.code : null} {t('applied')}
                          </TextDefault>
                        </View>
                        <TextDefault
                          small
                          bolder
                          textColor={colors.primary}
                          style={{
                            textAlign: isArabic ? 'right' : 'left',
                            fontSize: 12,
                            marginTop: 10
                          }}
                        >
                          {coupon.discount}
                          {coupon.discountType === 'percent'
                            ? '%'
                            : configuration.currencySymbol}{' '}
                          {t('discount_on')} {t(coupon.appliesTo)}{' '}
                          {`(${t('max')} ${coupon.maxDiscount} ${configuration.currencySymbol})`}
                        </TextDefault>
                      </View>
                    </View>
                    <View style={{ alignSelf: 'flex-start', marginTop: 5 }}>
                      <TouchableOpacity
                        style={{
                          ...styles.changeBtn
                        }}
                        onPress={() => setCoupon(null)}
                      >
                        <TextDefault
                          small
                          bold
                          textColor={currentTheme.darkBgFont}
                          center
                        >
                          {coupon ? t('remove') : null}
                        </TextDefault>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Fare Preview */}
            <View style={styles.fareBox}>
              {loading ? (
                <Text>Loading...</Text>
              ) : (
                <View
                  style={{
                    flexDirection: isArabic ? 'row-reverse' : 'row',
                    gap: 10,
                    // marginTop: 20,
                    // alignItems: 'center',
                    // backgroundColor: 'red',
                    // justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <Text
                    style={{
                      textAlign: isArabic ? 'right' : 'left',
                      // textAlign: 'center',
                      fontSize: 16
                    }}
                  >
                    {t('deliveryFee')}: {deliveryFee}{' '}
                    {configuration.currencySymbol}
                  </Text>
                  {coupon && (
                    <Text
                      style={{
                        textAlign: isArabic ? 'right' : 'left',
                        textDecorationLine: 'line-through',
                        fontSize: 16
                      }}
                    >
                      {originalDiscount} {configuration.currencySymbol}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity
              disabled={disabled}
              style={{
                ...styles.submitButton,
                backgroundColor: disabled ? 'grey' : '#000'
              }}
              onPress={handleSubmit}
            >
              <TextDefault style={{ color: '#fff' }}>{t('submit')}</TextDefault>
            </TouchableOpacity>
          </View>

          <Modal
            isVisible={nameFormAppear}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            backdropOpacity={0.4}
            style={styleNameModal.modal}
            swipeDirection='down'
            onSwipeComplete={onClose}
            useNativeDriver={false}
          >
            <View style={styleNameModal.modalContent}>
              <Text
                style={{
                  ...styleNameModal.title,
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {t('enter_your_name')}
              </Text>
              <TextInput
                value={customerName}
                onChangeText={setCustomerName}
                placeholder={t('your_name')}
                style={styleNameModal.input}
                placeholderTextColor='#999'
              />
              <View style={styleNameModal.buttonsContainer}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styleNameModal.cancelButton}
                >
                  <Text style={styleNameModal.cancelText}>{t('Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmitCustomerName}
                  style={styleNameModal.submitButton}
                >
                  <Text style={styleNameModal.submitText}>{t('send')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            ref={voucherModalRef}
            isVisible={couponOpen}
            onBackdropPress={onClose}
            onBackButtonPress={onClose}
            backdropOpacity={0.4}
            style={couponStyles.modalWrapper}
            swipeDirection='down'
            onSwipeComplete={onClose}
            useNativeDriver={false}
          >
            <View style={couponStyles.modalContainer}>
              <View
                style={{
                  ...couponStyles.modalHeader,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }}
              >
                <View
                  activeOpacity={0.7}
                  style={{
                    ...couponStyles.modalHeading,
                    flexDirection: isArabic ? 'row-reverse' : 'row'
                  }}
                >
                  <MaterialCommunityIcons
                    name='ticket-confirmation-outline'
                    size={moderateScale(24)}
                    color={currentTheme.newIconColor}
                  />
                  <TextDefault
                    H4
                    bolder
                    textColor={currentTheme.newFontcolor}
                    center
                  >
                    {t('applyVoucher')}
                  </TextDefault>
                </View>
                <Feather
                  name='x-circle'
                  size={moderateScale(24)}
                  color={currentTheme.newIconColor}
                  onPress={() => onModalClose(voucherModalRef)}
                />
              </View>
              <View style={{ gap: 8 }}>
                <TextInput
                  ref={inputRef}
                  label={t('inputCode')}
                  placeholder={t('inputCode')}
                  value={voucherCode}
                  onChangeText={(text) => setVoucherCode(text)}
                  style={couponStyles.modalInput}
                />
              </View>
              <TouchableOpacity
                disabled={!voucherCode || couponLoading}
                onPress={handleApplyCoupon}
                style={[
                  couponStyles.applyButton,
                  !voucherCode && couponStyles.buttonDisabled,
                  { height: moderateScale(40), marginTop: moderateScale(20) },
                  { opacity: couponLoading ? 0.5 : 1 }
                ]}
              >
                {!couponLoading && (
                  <TextDefault
                    textColor={currentTheme.black}
                    style={couponStyles.checkoutBtn}
                    bold
                    H4
                  >
                    {t('apply')}
                  </TextDefault>
                )}
                {couponLoading && <Spinner backColor={'transparent'} />}
              </TouchableOpacity>
            </View>
          </Modal>
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </KeyboardAwareScrollView>
    </Fragment>
  )
}

export default RequestDelivery

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
    flex: 1
  },
  title: {
    color: '#000',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: 16
  },
  wrapper: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: moderateScale(16),
    height: 120, // adjust height as needed
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    color: '#000'
  },
  label: { fontWeight: '600', marginTop: 10 },
  picker: { backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 10 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  fareBox: {
    // padding: 10,
    backgroundColor: '#f5f5f5',
    // backgroundColor: 'red',
    borderRadius: 8,
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  address: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
    // paddingTop: 40
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    height: moderateScale(40)
  },
  editContainer: {
    position: 'absolute',
    top: 5,
    left: 10
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 24
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalheading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  modalInput: {
    height: moderateScale(60),
    borderWidth: 1,
    borderColor: '#B8B8B8',
    padding: 10,
    borderRadius: 6,
    color: '#000'
  },
  modal: {
    backgroundColor: '#FFF',
    borderTopEndRadius: moderateScale(20),
    borderTopStartRadius: moderateScale(20),
    shadowOpacity: 0,
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16
  },
  overlay: {
    backgroundColor: 'transparent'
  },
  handle: {
    width: 150,
    backgroundColor: '#b0afbc'
  },

  voucherSecInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(5),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(10)
  },
  button: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: moderateScale(50),
    borderRadius: 40
  },
  buttonDisabled: {
    backgroundColor: 'gray'
  },
  changeBtn: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: moderateScale(100),
    height: moderateScale(30),
    borderRadius: 40
  },
  changeBtnInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2, // shadow for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  addressRow: (isArabic) => ({
    flexDirection: isArabic ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }),
  labelContainer: (isArabic) => ({
    flexDirection: isArabic ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 8
  }),
  editIconContainer: (isArabic) => ({
    flexDirection: isArabic ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 5
  }),
  addressText: (isArabic) => ({
    color: '#333',
    textAlign: isArabic ? 'right' : 'left',
    fontSize: moderateScale(14),
    fontWeight: '500'
  }),
  iconStyle: {
    width: moderateScale(34),
    height: moderateScale(34),
    resizeMode: 'contain'
  }
})

const couponStyles = StyleSheet.create({
  modalWrapper: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: moderateScale(550)
  },
  modalHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  modalHeading: {
    alignItems: 'center',
    gap: 8
  },
  inputWrapper: {
    marginBottom: 24
  },
  modalInput: {
    height: moderateScale(50),
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#000',
    backgroundColor: '#fff',
    fontSize: moderateScale(16)
  },
  applyButton: {
    backgroundColor: colors.primary,
    height: moderateScale(48),
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  }
})

const styleNameModal = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 0
  },
  modalContent: {
    backgroundColor: theme?.background || '#fff',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme?.text || '#000'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    color: theme?.text || '#000',
    backgroundColor: theme?.inputBackground || '#f8f8f8'
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16
  },
  cancelButton: {
    marginRight: 12
  },
  cancelText: {
    color: '#000',
    textAlign: 'center',
    // backgroundColor: 'red',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    borderRadius: 8
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})
