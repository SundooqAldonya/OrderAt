import React, {
  useState,
  useContext,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
  Fragment
} from 'react'
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import { LocationContext } from '../../context/Location'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import styles from './styles'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import CustomMarker from '../../assets/SVG/imageComponents/CustomMarker'
import { customMapStyle } from '../../utils/customMapStyles'
import { useTranslation } from 'react-i18next'
import SearchModal from '../../components/Address/SearchModal'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import ModalDropdown from '../../components/Picker/ModalDropdown'
import { useNavigation } from '@react-navigation/native'
import MapView from './MapView'
import screenOptions from './screenOptions'
import { useLocation } from '../../ui/hooks'
import UserContext from '../../context/User'
import useGeocoding from '../../ui/hooks/useGeocoding'
import { moderateScale, scale } from '../../utils/scaling'
import gql from 'graphql-tag'
import { getCityAreas } from '../../apollo/queries'
import { useQuery } from '@apollo/client'
import AreasModal from './AreasModal'
import Icon from 'react-native-vector-icons/AntDesign'
import { HeaderBackButton } from '@react-navigation/elements'
import navigationService from '../../routes/navigationService'
import { textStyles } from '../../utils/textStyles'

const LATITUDE = 33.699265
const LONGITUDE = 72.974575
const LATITUDE_DELTA = 0.2
const LONGITUDE_DELTA = 0.2

const GET_AREAS = gql`
  ${getCityAreas}
`

export default function AddNewAddress(props) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const { isLoggedIn } = useContext(UserContext)
  const { getAddress } = useGeocoding()
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [cityModalVisible, setCityModalVisible] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [areasModalOpen, setAreasModalOpen] = useState(false)
  const [addressDetails, setAddressDetails] = useState('')
  const [isClicked, setIsClicked] = useState(false)

  const { longitude, latitude, city } = props.route.params || {}
  console.log({ city })
  const {
    data,
    loading: loadingAreas,
    error: errorAreas
  } = useQuery(GET_AREAS, {
    variables: {
      id: city?._id
    },
    skip: !city
  })

  console.log({ dataAreas: data })
  const areas = data?.areasByCity || null

  // console.log({ selectedArea: selectedArea })

  const [selectedValue, setSelectedValue] = useState({
    city: '',
    address: '',
    latitude: LATITUDE,
    longitude: LONGITUDE
  })
  const { setLocation } = useContext(LocationContext)
  const mapRef = useRef()

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const inset = useSafeAreaInsets()
  const navigation = useNavigation()
  const { getCurrentLocation } = useLocation()

  const setCurrentLocation = async () => {
    const { coords, error } = await getCurrentLocation()
    if (!error) {
      setCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude
      })
    }
  }

  // useLayoutEffect(() => {
  //   navigation.setOptions(
  //     screenOptions({
  //       title: t('addAddress'),
  //       fontColor: currentTheme.newFontcolor,
  //       backColor: currentTheme.newheaderBG,
  //       iconColor: currentTheme.newIconColor,
  //       lineColor: currentTheme.newIconColor,
  //       setCurrentLocation
  //     })
  //   )
  // }, [])

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('select_area'),
      setCurrentLocation,

      headerRight: null,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
        ...textStyles.H4,
        fontWeight: 'bold',
      },
      headerTitleContainerStyle: {
        paddingLeft: moderateScale(25),
        paddingRight: moderateScale(25),
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
                size={moderateScale(20)}
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

  const onSelectCity = (item) => {
    setSelectedValue({
      city: item?.name,
      address: '',
      latitude: item?.latitude,
      longitude: item?.longitude
    })
    console.log(item)
    setCoordinates({
      latitude: +item.latitude,
      longitude: +item.longitude
    })
    setCityModalVisible(false)
  }

  const onRegionChangeComplete = useCallback(async (coordinates) => {
    const response = await getAddress(
      coordinates.latitude,
      coordinates.longitude
    )
    console.log(response, 'response')
    setSelectedValue({
      city: response.city,
      address: response.formattedAddress,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    })
  })

  const setCoordinates = useCallback((location) => {
    mapRef.current.fitToCoordinates([
      {
        latitude: location.latitude,
        longitude: location.longitude
      }
    ])
  })

  // useEffect(() => {
  //   onRegionChangeComplete({ longitude, latitude })
  // }, [])

  const onSelectLocation = () => {
    console.log(selectedValue)
    setLocation({
      label: 'Location',
      deliveryAddress: selectedValue.address
        ? selectedValue.address
        : selectedArea.address,
      details: selectedValue.address
        ? selectedValue.address
        : selectedArea.address,
      latitude: selectedArea
        ? selectedArea.location.location.coordinates[1]
        : null,
      longitude: selectedArea
        ? selectedArea.location.location.coordinates[0]
        : null,
      city,
      area: selectedArea
    })
    if (isLoggedIn) {
      navigation.navigate('SaveAddress', {
        locationData: {
          id: city?._id,
          label: 'Location',
          deliveryAddress: selectedValue.address
            ? selectedValue.address
            : selectedArea.address,
          details: addressDetails,
          // latitude: selectedValue.latitude,
          // longitude: selectedValue.longitude,
          latitude: selectedArea.location.location.coordinates[1],
          longitude: selectedArea.location.location.coordinates[0],
          city: city ? city : null,
          area: selectedArea,
          prevScreen: props.route.params.prevScreen
            ? props.route.params.prevScreen
            : null
        }
      })
    } else {
      navigation.navigate('Main')
    }
  }

  const handleAreasModal = () => {
    setAreasModalOpen(true)
  }

  const handleAreaSelect = (item) => {
    setSelectedArea(item)
    setAreasModalOpen(false)
    navigation.navigate('SelectLocation', {
      areaCoords: [...item.location.location.coordinates]
    })
  }

  // console.log({ selectedArea: selectedArea?.location.location })

  return (
    <>
      <View style={styles().flex}>
        {/* <View style={[styles().mapView, { height: '55%' }]}>
          <MapView
            ref={mapRef}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }}
            customMapStyle={
              themeContext.ThemeValue === 'Dark'
                ? customMapStyle
                : customMapStyle
            }
            onRegionChangeComplete={onRegionChangeComplete}
          />
          <View style={styles().mainContainer}>
            <CustomMarker
              width={40}
              height={40}
              transform={[{ translateY: -20 }]}
              translateY={-20}
            />
          </View>
        </View> */}
        <View style={styles(currentTheme).container2}>
          <TextDefault
            textColor={currentTheme.newFontcolor}
            H3
            bolder
            Left
            style={{
              textAlign: isArabic ? 'right' : 'left'
            }}
          >
            {t('city')}
          </TextDefault>
          {/* <CityModal
            theme={currentTheme}
            setCityModalVisible={setCityModalVisible}
            city={city}
            selectedValue={selectedValue.city}
            cityModalVisible={cityModalVisible}
            onSelect={onSelectCity}
            t={t}
          /> */}

          {/* selected city */}
          <View
            style={[
              // styles(currentTheme).textInput,

              {
                height: 50,
                marginTop: 20
              }
            ]}
          >
            <TextDefault
              style={{
                color: '#000',
                textAlign: isArabic ? 'right' : 'left',
                fontSize: 20
              }}
            >
              {city?.title}
            </TextDefault>
          </View>

          <View
            style={{
              width: '95%',
              alignSelf: 'center',
              justifyContent: 'center',
              marginTop: moderateScale(5)
            }}
          >
            <Text style={{ fontSize: 18, textAlign: isArabic ? 'right' : 'left' }}>
              {t('select_area')}
            </Text>
          </View>
          {/* select area */}
          <TouchableOpacity
            style={[
              styles(currentTheme).textInput,
              {
                height: 50
              }
            ]}
            onPress={handleAreasModal}
          >
            <TextDefault
              style={{
                color: selectedArea ? '#000' : 'red',
                textAlign: isArabic ? 'right' : 'left',
              }}
            >
              {selectedArea ? selectedArea.title : t('select_area')}
            </TextDefault>
          </TouchableOpacity>

          {/* address_details  */}
          {/* <View style={[styles(currentTheme).textInput]}>
            <TextInput
              value={addressDetails}
              onChangeText={(text) => setAddressDetails(text)}
              placeholder={t('address_details')}
              placeholderTextColor={
                themeContext.ThemeValue === 'Dark' ? '#fff' : '#000'
              }
              style={{
                color: themeContext.ThemeValue === 'Dark' ? '#fff' : '#000'
              }}
            />
          </View> */}

          {/* toggle address api button */}
          {/* {!isLoggedIn ? (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 10
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setIsClicked(!isClicked)
                }}
              >
                <Text>
                  <Icon
                    name={isClicked ? 'upcircle' : 'downcircle'}
                    color={themeContext.ThemeValue === 'Dark' ? '#fff' : '#000'}
                    size={30}
                  />
                </Text>
              </TouchableOpacity>
            </View>
          ) : null} */}

          {/* toggle address input */}
          {/* {isClicked ? (
            <View style={[styles(currentTheme).textInput]}>
              <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
                <Text
                  style={{
                    color: currentTheme.newFontcolor,
                    overflow: 'scroll',
                    fontSize: scale(12)
                  }}
                >
                  {selectedValue.address || t('address')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null} */}

          {/* saving address */}
          <View style={{ flex: 1 }} />
          {/* {!isLoggedIn ? (
            <Fragment>
              {city && selectedArea ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles(currentTheme).emptyButton}
                  onPress={onSelectLocation}
                  disabled={!city || !selectedArea}
                >
                  <TextDefault textColor={currentTheme.buttonText} center H5>
                    {t('saveBtn')}
                  </TextDefault>
                </TouchableOpacity>
              ) : null}
              {!city || !selectedArea ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles(currentTheme).disabledButton}
                  // onPress={onSelectLocation}
                  disabled={!city || !selectedArea}
                >
                  <TextDefault textColor={currentTheme.buttonText} center H5>
                    {t('saveBtn')}
                  </TextDefault>
                </TouchableOpacity>
              ) : null}
            </Fragment>
          ) : null} */}
          {/* search address google api */}
          <SearchModal
            visible={searchModalVisible}
            onClose={() => setSearchModalVisible(false)}
            onSubmit={(description, coords, details) => {
              setSelectedValue({
                city: details?.vicinity,
                address: description,
                latitude: coords.lat,
                longitude: coords.lng
              })
              setSearchModalVisible(false)
              setCoordinates({
                latitude: coords.lat,
                longitude: coords.lng
              })
            }}
          />
        </View>
        <View style={{ paddingBottom: inset.bottom }} />
        <AreasModal
          areas={areas}
          theme={currentTheme}
          visible={areasModalOpen}
          onItemPress={handleAreaSelect}
          onClose={() => setAreasModalOpen(false)}
        />
      </View>
    </>
  )
}

// const CityModal = React.memo(
//   function CityModal({
//     theme,
//     setCityModalVisible,
//     selectedValue,
//     city,
//     cityModalVisible,
//     onSelect,
//     t
//   }) {
//     return (
//       <View style={styles().dropdownContainer}>
//         <TouchableOpacity
//           style={styles().button1}
//           onPress={() => {
//             setCityModalVisible(true)
//             console.log(selectedValue)
//           }}
//         >
//           {selectedValue && (
//             <Text style={styles(theme).cityField}>{selectedValue}</Text>
//           )}
//           {!selectedValue && (
//             <Text style={styles(theme).cityField}>{t('selectCity')}</Text>
//           )}
//           <Feather
//             name='chevron-down'
//             size={18}
//             color={theme.newIconColor}
//             style={styles().icon1}
//           />
//         </TouchableOpacity>
//         <ModalDropdown
//           theme={theme}
//           visible={cityModalVisible}
//           onItemPress={onSelect}
//           onClose={() => {
//             setCityModalVisible(false)
//           }}
//         />
//       </View>
//     )
//   },
//   (prevProps, nextProps) => {
//     return (
//       prevProps.cityModalVisible === nextProps.cityModalVisible &&
//       prevProps.selectedValue === nextProps.selectedValue
//     )
//   }
// )
