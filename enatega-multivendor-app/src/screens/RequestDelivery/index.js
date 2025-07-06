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
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { useTranslation } from 'react-i18next'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import useEnvVars from '../../../environment'
import MapView, { Marker, Polyline } from 'react-native-maps'
import { LocationContext } from '../../context/Location'
import { Controller, useForm } from 'react-hook-form'
import { Picker } from '@react-native-picker/picker'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client'
import { getDeliveryCalculation, myOrders } from '../../apollo/queries'
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons'
import FromIcon from '../../assets/delivery_from.png'
import ToIcon from '../../assets/delivery_to.png'
import {
  applyCoupon,
  applyCouponMandoob,
  createDeliveryRequest
} from '../../apollo/mutations'
import Toast from 'react-native-toast-message'
import { Image } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import MapViewDirections from 'react-native-maps-directions'
import ConfigurationContext from '../../context/Configuration'
import { Modalize } from 'react-native-modalize'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { scale } from '../../utils/scaling'
import { alignment } from '../../utils/alignment'
import Spinner from '../../components/Spinner/Spinner'
import { FlashMessage } from '../../ui/FlashMessage/FlashMessage'
import { colors } from '../../utils/colors'

const ORDERS = gql`
  ${myOrders}
`
const RequestDelivery = () => {
  const { i18n, t } = useTranslation()
  const mapRef = useRef()
  const voucherModalRef = useRef(null)
  const inputRef = useRef()
  const configuration = useContext(ConfigurationContext)

  const navigation = useNavigation()
  const addressInfo = useSelector((state) => state.requestDelivery)
  const isArabic = i18n.language === 'ar'
  const [pickupCoords, setPickupCoords] = useState(addressInfo.regionFrom)
  const [dropOffCoords, setDropOffCoords] = useState(addressInfo.regionTo)
  const { location } = useContext(LocationContext)
  const [isUrgent, setIsUrgent] = useState(false)
  const [notes, setNotes] = useState('')
  const [disabled, setDisabled] = useState(false)

  console.log({ regionFrom: addressInfo.regionFrom })
  console.log({ pickupCoords })

  const [coupon, setCoupon] = useState(null)
  const [voucherCode, setVoucherCode] = useState('')

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]

  useEffect(() => {
    console.log({ mapRef })
    let timeout = setTimeout(() => {
      if (mapRef?.current) {
        mapRef.current.fitToCoordinates([pickupCoords, dropOffCoords], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        })
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [mapRef?.current])

  useEffect(() => {
    if (addressInfo.regionFrom && addressInfo.regionTo) {
      setPickupCoords({ ...addressInfo.regionFrom })
      setDropOffCoords({ ...addressInfo.regionTo })
    }
  }, [addressInfo])

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
    useLazyQuery(getDeliveryCalculation)

  useEffect(() => {
    if (addressInfo.regionTo && addressInfo.regionFrom) {
      fetchCalculateDelivery({
        variables: {
          code: coupon?.code.replace(' ', ''),
          destLong: Number(addressInfo.regionTo.longitude),
          destLat: Number(addressInfo.regionTo.latitude),
          originLong: Number(addressInfo.regionFrom.longitude),
          originLat: Number(addressInfo.regionFrom.latitude)
        }
      })
    }
  }, [addressInfo, coupon])

  const deliveryFee = data?.getDeliveryCalculation?.amount || null
  const originalDiscount =
    data?.getDeliveryCalculation?.originalDiscount || null

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
        onModalClose(voucherModalRef)
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
    if (!notes) {
      Toast.show({
        type: 'error',
        text1: t('important_field'),
        text2: t('notes_required'),
        text1Style: {
          textAlign: isArabic ? 'right' : 'left'
        },
        text2Style: {
          textAlign: isArabic ? 'right' : 'left'
        }
      })
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
        dropoffLat: +dropOffCoords?.latitude,
        dropoffLng: +dropOffCoords?.longitude,
        dropoffAddressText: addressInfo.addressTo,
        dropoffAddressFreeText: addressInfo.addressFreeTextTo,
        deliveryFee,
        requestChannel: 'customer_app',
        is_urgent: isUrgent,
        notes
      }
      console.log({ pickupCoords, dropOffCoords })

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
    }
  }

  const handleApplyCoupon = () => {
    const coordinates = {
      // latitude: location.latitude,
      // longitude: location.longitude
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 120}
    >
      <ScrollView
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View>
          <MapView
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
                mapRef.current.fitToCoordinates([pickupCoords, dropOffCoords], {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true
                })
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
        <View style={styles.wrapper}>
          <View style={styles.inputContainer}>
            {/* <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('pick_up_location')}
          </TextDefault> */}
            <TouchableOpacity
              onPress={() => navigation.navigate('NewPickupMandoob')}
              style={{
                ...styles.address,
                flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  flexDirection: isArabic ? 'row' : 'row-reverse',
                  alignItems: 'center'
                }}
              >
                <TextDefault
                  style={{
                    color: '#000',
                    textAlign: isArabic ? 'right' : 'left',
                    fontSize: 18
                  }}
                >
                  {/* {addressInfo.labelFrom
                ? addressInfo.labelFrom
                : addressInfo.addressFrom} */}
                  {/* {t('FromPlace')} */}
                  {t('pick_up_location')}
                </TextDefault>
                <Image
                  source={FromIcon}
                  style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
                />
              </View>
              <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  gap: 5
                }}
              >
                <TextDefault
                  style={{
                    color: '#000',
                    textAlign: isArabic ? 'right' : 'left',
                    fontSize: 18
                  }}
                >
                  {t('edit')}
                </TextDefault>
                <Feather name='edit' size={24} color='black' />
              </View>
              {/* <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#000',
                borderStyle: 'dashed',
                marginTop: 10,
                marginBottom: 7
              }}
            />
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {addressInfo.addressFreeTextFrom}
            </TextDefault> */}
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            {/* <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('drop_off_location')}
          </TextDefault> */}
            <TouchableOpacity
              onPress={() => navigation.navigate('NewDropoffMandoob')}
              style={{
                ...styles.address,
                flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  flexDirection: isArabic ? 'row' : 'row-reverse',
                  alignItems: 'center'
                }}
              >
                <TextDefault
                  style={{
                    color: '#000',
                    textAlign: isArabic ? 'right' : 'left',
                    fontSize: 18
                  }}
                >
                  {/* {addressInfo.labelTo
                ? addressInfo.labelTo
                : addressInfo.addressTo} */}
                  {/* {t('ToPlace')} */}
                  {t('drop_off_location')}
                </TextDefault>
                <Image
                  source={ToIcon}
                  style={{ width: 40, height: 40, resizeMode: 'contain' }} // control the size here
                />
              </View>
              <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  gap: 5
                }}
              >
                <TextDefault
                  style={{
                    color: '#000',
                    textAlign: isArabic ? 'right' : 'left',
                    fontSize: 18
                  }}
                >
                  {t('edit')}
                </TextDefault>
                <Feather name='edit' size={24} color='black' />
              </View>
              {/* <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#000',
                borderStyle: 'dashed',
                marginTop: 10,
                marginBottom: 7
              }}
            />
            <TextDefault
              style={{ color: '#000', textAlign: isArabic ? 'right' : 'left' }}
            >
              {addressInfo.addressFreeTextTo}
            </TextDefault> */}
            </TouchableOpacity>
          </View>

          {/* Item Description */}
          <TextDefault
            bolder
            style={{
              ...styles.title,
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('item_description')}
          </TextDefault>
          <TextInput
            placeholder={t('item_description_notes')}
            style={styles.textArea}
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
                onPress={() => onModalOpen(voucherModalRef)}
              >
                <MaterialCommunityIcons
                  name='ticket-confirmation-outline'
                  size={24}
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
                      paddingTop: scale(8),
                      gap: scale(5)
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
                  gap: 10
                }}
              >
                <Text
                  style={{
                    textAlign: isArabic ? 'right' : 'left',
                    fontSize: 20
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
                      fontSize: 20
                    }}
                  >
                    {originalDiscount} {configuration.currencySymbol}
                  </Text>
                )}
              </View>
            )}

            {/* <Text>ETA: 25 mins</Text> */}
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
        <Modalize
          ref={voucherModalRef}
          onOpened={() => {
            setTimeout(() => {
              inputRef.current?.focus()
            }, 100) // slight delay to ensure animation settles
          }}
          modalStyle={[styles.modal]}
          overlayStyle={styles.overlay}
          handleStyle={styles.handle}
          modalHeight={550}
          handlePosition='inside'
          openAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
          closeAnimationConfig={{
            timing: { duration: 400 },
            spring: { speed: 20, bounciness: 10 }
          }}
          keyboardAvoidingBehavior='padding'
          scrollViewProps={{
            keyboardShouldPersistTaps: 'handled'
          }}
        >
          <View style={styles.modalContainer}>
            <View
              style={{
                ...styles.modalHeader,
                flexDirection: isArabic ? 'row-reverse' : 'row'
              }}
            >
              <View
                activeOpacity={0.7}
                style={{
                  ...styles.modalheading,
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }}
              >
                <MaterialCommunityIcons
                  name='ticket-confirmation-outline'
                  size={24}
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
                size={34}
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
                style={styles.modalInput}
              />
            </View>
            <TouchableOpacity
              disabled={!voucherCode || couponLoading}
              onPress={handleApplyCoupon}
              style={[
                styles.button,
                !voucherCode && styles.buttonDisabled,
                { height: scale(40) },
                { opacity: couponLoading ? 0.5 : 1 }
              ]}
            >
              {!couponLoading && (
                <TextDefault
                  textColor={currentTheme.black}
                  style={styles.checkoutBtn}
                  bold
                  H4
                >
                  {t('apply')}
                </TextDefault>
              )}
              {couponLoading && <Spinner backColor={'transparent'} />}
            </TouchableOpacity>
          </View>
        </Modalize>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 18,
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
    fontSize: 16,
    height: 120, // adjust height as needed
    textAlignVertical: 'top',
    backgroundColor: '#fff`'
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
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20
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
    height: 40
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
    height: scale(60),
    borderWidth: 1,
    borderColor: '#B8B8B8',
    padding: 10,
    borderRadius: 6,
    color: '#000'
  },
  modal: {
    backgroundColor: '#FFF',
    borderTopEndRadius: scale(20),
    borderTopStartRadius: scale(20),
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
    gap: scale(5),
    marginTop: scale(10),
    marginBottom: scale(10)
  },
  button: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    height: scale(50),
    borderRadius: 40
  },
  buttonDisabled: {
    backgroundColor: 'gray'
  },
  changeBtn: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: scale(100),
    height: scale(30),
    borderRadius: 40
  },
  changeBtnInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  }
})
