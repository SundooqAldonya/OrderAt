import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import React, { useState, useContext, useEffect, useRef } from 'react'
import {
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  SectionList
} from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useSharedValue,
  Easing as EasingNode,
  withTiming,
  withRepeat,
  useAnimatedStyle,
  useAnimatedScrollHandler
} from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Fade
} from 'rn-placeholder'
import ImageHeader from '../../components/Restaurant/ImageHeader'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ConfigurationContext from '../../context/Configuration'
import UserContext from '../../context/User'
import { useRestaurant } from '../../ui/hooks'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { scale } from '../../utils/scaling'
import { theme } from '../../utils/themeColors'
import styles from './styles'
import { DAYS } from '../../utils/enums'
import { alignment } from '../../utils/alignment'
import TextError from '../../components/Text/TextError/TextError'
import { MaterialIcons } from '@expo/vector-icons'
import analytics from '../../utils/analytics'
import { gql, useApolloClient, useQuery } from '@apollo/client'
import { popularItems, food, getSingleFood } from '../../apollo/queries'

import { useTranslation } from 'react-i18next'
import ItemCard from '../../components/ItemCards/ItemCards'
import { ScrollView } from 'react-native-gesture-handler'
import { IMAGE_LINK } from '../../utils/constants'
import { LocationContext } from '../../context/Location'
import PopularIcon from '../../assets/SVG/popular'
import { escapeRegExp } from '../../utils/regex'
import { colors } from '../../utils/colors'
import { Fragment } from 'react'

const { height } = Dimensions.get('screen')

// Animated Section List component
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)
const TOP_BAR_HEIGHT = height * 0.05
const HEADER_MAX_HEIGHT = height * 0.4
const HEADER_MIN_HEIGHT = height * 0.07 + TOP_BAR_HEIGHT
const SCROLL_RANGE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
const HALF_HEADER_SCROLL = HEADER_MAX_HEIGHT - TOP_BAR_HEIGHT

const POPULAR_ITEMS = gql`
  ${popularItems}
`
const FOOD = gql`
  ${food}
`

function Restaurant(props) {
  const { _id: restaurantId } = props.route.params
  const Analytics = analytics()
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'
  const scrollRef = useRef(null)
  const flatListRef = useRef(null)
  const navigation = useNavigation()
  const route = useRoute()
  const propsData = route.params
  const animation = useSharedValue(0)
  const translationY = useSharedValue(0)
  const circle = useSharedValue(0)
  const themeContext = useContext(ThemeContext)

  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const [selectedLabel, selectedLabelSetter] = useState(0)
  const [buttonClicked, buttonClickedSetter] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterData, setFilterData] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [businessCategories, setBusinessCategories] = useState(null)
  const [businessCategoriesNames, setBusinessCategoriesNames] = useState(null)
  const {
    restaurant: restaurantCart,
    setCartRestaurant,
    cartCount,
    addCartItem,
    addQuantity,
    clearCart,
    checkItemCart
  } = useContext(UserContext)
  const { data, refetch, networkStatus, loading, error } = useRestaurant(
    propsData._id
  )
  const restaurant = data?.restaurantCustomer || null

  useEffect(() => {
    if (data?.restaurantCustomer?.businessCategories?.length) {
      setBusinessCategories(data?.restaurantCustomer?.businessCategories)
      const string = data?.restaurantCustomer?.businessCategories
        ?.map((item) => item.name)
        .join(', ')
      setBusinessCategoriesNames(string)
    }
  }, [data])
  console.log({ businessCategories })
  console.log({ businessCategoriesNames })

  const { data: popularItems } = useQuery(POPULAR_ITEMS, {
    variables: { restaurantId }
  })

  const dataList =
    popularItems && popularItems?.popularItems?.map((item) => item)

  const searchHandler = () => {
    setSearchOpen(!searchOpen)
    setShowSearchResults(!showSearchResults)
  }

  const searchPopupHandler = () => {
    setSearchOpen(!searchOpen)
    setSearch('')
    translationY.value = 0
  }

  useEffect(() => {
    if (search === '') {
      // setFilterData([])
      const filteredData = []
      deals?.forEach((category) => {
        category.data.forEach((deals) => {
          filteredData.push(deals)
        })
      })
      setFilterData(filteredData)
      setShowSearchResults(false)
    } else if (deals) {
      const escapedSearchText = escapeRegExp(search)
      const regex = new RegExp(escapedSearchText, 'i')
      const filteredData = []
      deals.forEach((category) => {
        category.data.forEach((deals) => {
          const title = deals.title.search(regex)
          if (title < 0) {
            const description = deals.description.search(regex)
            if (description > 0) {
              filteredData.push(deals)
            }
          } else {
            filteredData.push(deals)
          }
        })
      })
      setFilterData(filteredData)
      setShowSearchResults(true)
    }
  }, [search, searchOpen])

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(colors.primary)
    }
    StatusBar.setBarStyle('light-content')
  })
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_RESTAURANTS)
    }
    Track()
  }, [])

  useEffect(() => {
    if (
      data &&
      data?.restaurantCustomer &&
      (!data?.restaurantCustomer.isAvailable || !isOpen())
    ) {
      Alert.alert(
        '',
        t('restaurantClosed'),
        [
          {
            text: t('backToRestaurants'),
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          },
          {
            text: t('seeMenu'),
            onPress: () => console.log('see menu')
          }
        ],
        { cancelable: false }
      )
    }
  }, [data])

  const zIndexAnimation = useAnimatedStyle(() => {
    return {
      zIndex: interpolate(
        translationY.value,
        [0, TOP_BAR_HEIGHT, SCROLL_RANGE / 2],
        [-1, 1, 99],
        Extrapolation.CLAMP
      )
    }
  })

  const isOpen = () => {
    if (data) {
      if (data?.restaurantCustomer?.openingTimes?.length < 1) return false
      const date = new Date()
      const day = date.getDay()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const todaysTimings = data?.restaurantCustomer?.openingTimes?.find(
        (o) => o.day === DAYS[day]
      )
      if (todaysTimings === undefined) return false
      const times = todaysTimings.times.filter(
        (t) =>
          hours >= Number(t.startTime[0]) &&
          minutes >= Number(t.startTime[1]) &&
          hours <= Number(t.endTime[0]) &&
          minutes <= Number(t.endTime[1])
      )

      return times?.length > 0
    } else {
      return false
    }
  }

  const onPressItem = async (food) => {
    if (!data?.restaurantCustomer.isAvailable || !isOpen()) {
      Alert.alert(
        '',
        t('restaurantClosed'),
        [
          {
            text: t('backToRestaurants'),
            onPress: () => {
              navigation.goBack()
            },
            style: 'cancel'
          },
          {
            text: t('seeMenu'),
            onPress: () => console.log('see menu')
          }
        ],
        { cancelable: false }
      )
      return
    }
    if (!restaurantCart || food.restaurant === restaurantCart) {
      await addToCart(food, food.restaurant !== restaurantCart)
    } else if (food.restaurant !== restaurantCart) {
      Alert.alert(
        '',
        t('clearCartText'),
        [
          {
            text: t('Cancel'),
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
          },
          {
            text: t('okText'),
            onPress: async () => {
              await addToCart(food, true)
            }
          }
        ],
        { cancelable: false }
      )
    }
  }

  function wrapContentAfterWords(content, numWords) {
    if (content?.length) {
      const words = content.split(' ')
      const wrappedContent = []

      for (let i = 0; i < words.length; i += numWords) {
        wrappedContent.push(words.slice(i, i + numWords).join(' '))
      }

      return wrappedContent.join('\n')
    }
  }

  const addToCart = async (food, clearFlag) => {
    if (
      food?.variations?.length === 1 &&
      food?.variations[0].addons?.length === 0
    ) {
      await setCartRestaurant(food.restaurant)
      const result = checkItemCart(food._id)
      if (result.exist) await addQuantity(result.key)
      else await addCartItem(food._id, food.variations[0]._id, 1, [], clearFlag)
      animate()
    } else {
      if (clearFlag) await clearCart()
      navigation.navigate('ItemDetail', {
        food,
        addons: restaurant.addons,
        options: restaurant.options,
        restaurant: restaurant._id
      })
    }
  }

  function tagCart(itemId) {
    if (checkItemCart) {
      const cartValue = checkItemCart(itemId)
      if (cartValue.exist) {
        return (
          <>
            <View style={styles(currentTheme).triangleCorner} />
            <TextDefault
              style={styles(currentTheme).tagText}
              numberOfLines={1}
              textColor={currentTheme.fontWhite}
              bold
              small
              center
            >
              {cartValue.quantity}
            </TextDefault>
          </>
        )
      }
    }
    return null
  }

  const scaleValue = useSharedValue(1)

  const scaleStyles = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }))

  // button animation
  function animate() {
    scaleValue.value = withRepeat(withTiming(1.5, { duration: 250 }), 2, true)
  }

  const config = (to) => ({
    duration: 250,
    toValue: to,
    easing: EasingNode.inOut(EasingNode.ease)
  })

  const scrollToSection = (index) => {
    if (scrollRef.current != null) {
      scrollRef.current.scrollToLocation({
        animated: true,
        sectionIndex: index,
        itemIndex: 0,
        viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
        viewPosition: 0
      })
    }
  }

  const onScrollEndSnapToEdge = (event) => {
    event.persist()
    const y = event.nativeEvent.contentOffset.y

    if (y > 0 && y < HALF_HEADER_SCROLL / 2) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(0), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
              viewPosition: 0
            })
          }
        })
      }
    } else if (HALF_HEADER_SCROLL / 2 <= y && y < HALF_HEADER_SCROLL) {
      if (scrollRef.current) {
        withTiming(translationY.value, config(SCROLL_RANGE), (finished) => {
          if (finished) {
            scrollRef.current.scrollToLocation({
              animated: false,
              sectionIndex: 0,
              itemIndex: 0,
              viewOffset: -(HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT),
              viewPosition: 0
            })
          }
        })
      }
    }
    buttonClickedSetter(false)
  }

  const scrollHandler = useAnimatedScrollHandler((event) => {
    translationY.value = event.contentOffset.y
  })

  function changeIndex(index) {
    if (selectedLabel !== index) {
      selectedLabelSetter(index)
      buttonClickedSetter(true)
      scrollToSection(index)
      scrollToNavbar(index)
    }
  }

  function scrollToNavbar(value = 0) {
    if (flatListRef.current != null) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: value,
        viewPosition: 0.5
      })
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    buttonClickedSetter(false)
    if (viewableItems?.length === 0) return
    if (
      selectedLabel !== viewableItems[0].section.index &&
      buttonClicked === false
    ) {
      selectedLabelSetter(viewableItems[0].section.index)
      scrollToNavbar(viewableItems[0].section.index)
    }
  }

  const iconColor = currentTheme.white

  const iconBackColor = currentTheme.white

  const iconRadius = scale(15)

  const iconSize = scale(20)

  const iconTouchHeight = scale(30)

  const iconTouchWidth = scale(30)

  const circleSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(18), scale(24), scale(18)],
    Extrapolation.CLAMP
  )
  const radiusSize = interpolate(
    circle.value,
    [0, 0.5, 1],
    [scale(9), scale(12), scale(9)],
    Extrapolation.CLAMP
  )

  const fontStyles = useAnimatedStyle(() => {
    return {
      fontSize: interpolate(
        circle.value,
        [0, 0.5, 1],
        [8, 12, 8],
        Extrapolation.CLAMP
      )
    }
  })

  if (loading) {
    return (
      <View style={[styles().flex]}>
        <ImageHeader
          iconColor={iconColor}
          iconSize={iconSize}
          iconBackColor={iconBackColor}
          iconRadius={iconRadius}
          iconTouchWidth={iconTouchWidth}
          iconTouchHeight={iconTouchHeight}
          restaurantName={propsData?.name ?? data?.restaurantCustomer?.name}
          restaurantId={propsData?._id}
          restaurantImage={propsData?.image ?? data?.restaurantCustomer?.image}
          restaurant={data?.restaurantCustomer ? data.restaurantCustomer : null}
          topaBarData={[]}
          loading={loading}
          minimumOrder={
            propsData?.minimumOrder ?? data?.restaurantCustomer?.minimumOrder
          }
          tax={propsData?.tax ?? data?.restaurantCustomer?.tax}
          updatedDeals={[]}
          searchOpen={searchOpen}
          showSearchResults={showSearchResults}
          setSearch={setSearch}
          search={search}
          searchHandler={searchHandler}
          searchPopupHandler={searchPopupHandler}
          translationY={translationY}
          businessCategories={
            data?.restaurantCustomer
              ? data.restaurantCustomer.businessCategories
              : null
          }
        />
        <View
          style={[
            styles(currentTheme).navbarContainer,
            styles(currentTheme).flex,
            {
              paddingTop: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT - TOP_BAR_HEIGHT
            }
          ]}
        >
          {Array.from(Array(10), (_, i) => (
            <Placeholder
              key={i}
              Animation={(props) => (
                <Fade
                  {...props}
                  style={{ backgroundColor: currentTheme.gray }}
                  duration={600}
                />
              )}
              Left={PlaceholderMedia}
              style={{
                padding: 12
              }}
            >
              <PlaceholderLine width={80} />
              <PlaceholderLine width={80} />
            </Placeholder>
          ))}
        </View>
      </View>
    )
  }
  if (error) return <TextError text={JSON.stringify(error)} />
  // return <JSONTree data={popularItems} />
  console.log({ restaurant })
  const allDeals = restaurant?.categories?.filter((cat) => cat?.foods?.length)
  const deals = allDeals.map((c, index) => ({
    ...c,
    data: c.foods,
    index: dataList?.length ? index + 1 : index
  }))

  // return <JSONTree data={dataList} />

  const updatedDeals = dataList?.length
    ? [
        {
          title: t('popular'),
          _id: String(new Date().getTime()),
          data: dataList?.slice(0, 4),
          index: 0
        },
        ...deals
      ]
    : [...deals]

  return (
    <>
      <SafeAreaView style={styles(currentTheme).flex}>
        <ScrollView>
          <Animated.View style={styles(currentTheme).flex}>
            <View
              style={{
                height: height * 0.44,
                borderBottomWidth: 1,
                borderBlockColor: colors.lightGray,
                borderRadius: 16
              }}
            >
              <ImageHeader
                ref={flatListRef}
                iconColor={iconColor}
                iconSize={iconSize}
                iconBackColor={iconBackColor}
                iconRadius={iconRadius}
                iconTouchWidth={iconTouchWidth}
                iconTouchHeight={iconTouchHeight}
                restaurantName={
                  propsData?.name ?? data?.restaurantCustomer?.name
                }
                restaurantId={propsData?._id}
                restaurantImage={
                  propsData?.image ?? data?.restaurantCustomer?.image
                }
                restaurant={data?.restaurantCustomer}
                topaBarData={updatedDeals}
                changeIndex={changeIndex}
                selectedLabel={selectedLabel}
                minimumOrder={
                  propsData?.minimumOrder ??
                  data?.restaurantCustomer?.minimumOrder
                }
                tax={propsData?.tax ?? data?.restaurantCustomer?.tax}
                updatedDeals={updatedDeals}
                searchOpen={searchOpen}
                showSearchResults={showSearchResults}
                setSearch={setSearch}
                search={search}
                searchHandler={searchHandler}
                searchPopupHandler={searchPopupHandler}
                translationY={translationY}
                isArabic={isArabic}
              />
            </View>
            <View
              style={{
                height: height * 0.52
              }}
            >
              <>
                {showSearchResults || searchOpen ? (
                  <ScrollView
                    style={{
                      // flexGrow: 1,
                      // marginTop: TOP_BAR_HEIGHT,
                      marginBottom: 150

                      // backgroundColor: currentTheme.themeBackground
                    }}
                  >
                    {filterData.map((item, index) => (
                      <View key={index}>
                        <TouchableOpacity
                          style={[
                            // styles(currentTheme).searchDealSection,
                            {
                              flexDirection: isArabic ? 'row-reverse' : 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: 10,
                              marginBottom: 10,
                              borderColor: colors.lightGray,
                              backgroundColor: colors.white,
                              marginHorizontal: 10,
                              borderWidth: 1,
                              borderRadius: 8
                            }
                          ]}
                          activeOpacity={0.7}
                          onPress={() =>
                            onPressItem({
                              ...item,
                              restaurant: restaurant?._id,
                              restaurantName: restaurant?.name
                            })
                          }
                        >
                          <View
                            style={{
                              flexDirection: isArabic ? 'row-reverse' : 'row',
                              gap: 20,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <View
                              style={{
                                height: scale(60),
                                width: scale(60)
                              }}
                            >
                              {item?.image ? (
                                <Image
                                  style={{
                                    height: scale(60),
                                    width: scale(60),
                                    borderRadius: 30
                                  }}
                                  source={{ uri: item?.image }}
                                />
                              ) : (
                                <></>
                              )}
                            </View>

                            <View style={[styles(currentTheme).flex]}>
                              <TextDefault
                                bolder
                                textColor={currentTheme.fontMainColor}
                                H4
                                style={{
                                  // ...styles(currentTheme).headerText
                                  textAlign: isArabic ? 'right' : 'left'
                                }}
                              >
                                {item.title}
                              </TextDefault>

                              <TextDefault
                                style={[
                                  styles(currentTheme).priceText,
                                  {
                                    textAlign: isArabic ? 'right' : 'left'
                                  }
                                ]}
                                small
                              >
                                {wrapContentAfterWords(item.description, 5)}
                              </TextDefault>
                              <View

                              // style={styles(currentTheme).dealPrice}
                              >
                                <TextDefault
                                  numberOfLines={1}
                                  textColor={currentTheme.fontMainColor}
                                  style={
                                    // [styles(currentTheme).priceText],
                                    {
                                      textAlign: isArabic ? 'right' : 'left',
                                      margin: 5
                                    }
                                  }
                                  bolder
                                  small
                                >
                                  {configuration.currencySymbol}
                                  {/* {item.variations[0].price} */}
                                  {parseFloat(item.variations[0].price).toFixed(
                                    2
                                  )}
                                </TextDefault>
                                {item?.variations[0]?.discounted > 0 && (
                                  <TextDefault
                                    numberOfLines={1}
                                    textColor={currentTheme.fontSecondColor}
                                    // style={styles().priceText}
                                    style={
                                      ([styles(currentTheme).priceText],
                                      {
                                        textAlign: isArabic ? 'right' : 'left'
                                      })
                                    }
                                    small
                                    lineOver
                                  >
                                    {configuration.currencySymbol}
                                    {' fffff'}
                                    {(
                                      item.variations[0].price +
                                      item.variations[0].discounted
                                    ).toFixed(2)}
                                  </TextDefault>
                                )}
                              </View>
                            </View>

                            {/* add */}
                            <View style={styles(currentTheme).addToCart}>
                              <MaterialIcons
                                name='add'
                                size={scale(20)}
                                color={currentTheme.themeBackground}
                              />
                            </View>
                          </View>
                          {tagCart(item?._id)}
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <ScrollView>
                    {updatedDeals?.length === 0 ? (
                      // Show "No Data" message if `updatedDeals` is empty
                      <View style={styles(currentTheme).noDataContainer}>
                        <TextDefault
                          H4
                          textColor={colors.dark}
                          style={{ textAlign: 'center' }}
                        >
                          {t('menu_preparation_message')}
                        </TextDefault>
                      </View>
                    ) : (
                      <SectionList
                        style={[
                          {
                            // flexGrow: 1,
                            // paddingTop: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT,
                            // marginTop: HEADER_MIN_HEIGHT,
                            //backgroundColor: 'blue'
                            // paddingBottom: 50
                          }
                          // zIndexAnimation
                        ]}
                        contentContainerStyle={{
                          // paddingBottom: HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT
                          paddingBottom: 50
                        }}
                        sections={updatedDeals}
                        ref={scrollRef}
                        scrollEventThrottle={1}
                        stickySectionHeadersEnabled={false}
                        showsVerticalScrollIndicator={false}
                        refreshing={networkStatus === 4}
                        onRefresh={() => networkStatus === 7 && refetch()}
                        onViewableItemsChanged={onViewableItemsChanged}
                        onMomentumScrollEnd={(event) => {
                          onScrollEndSnapToEdge(event)
                        }}
                        keyExtractor={(item, index) => index}
                        renderSectionHeader={({ section: { title, data } }) => {
                          if (title === t('popular')) {
                            if (!dataList || dataList?.length === 0) {
                              return null // Don't render the section header if dataList is empty
                            }
                            return (
                              <View
                                style={styles(currentTheme).restaurantItems}
                              >
                                <View
                                  style={{
                                    ...styles().popularHeading,
                                    flexDirection: isArabic
                                      ? 'row-reverse'
                                      : 'row'
                                  }}
                                >
                                  <PopularIcon
                                    color={currentTheme.iconColorDark}
                                  />
                                  <TextDefault
                                    style={styles(currentTheme).popularText}
                                    textColor={currentTheme.fontFourthColor}
                                    bolder
                                  >
                                    {title}
                                  </TextDefault>
                                </View>
                                <TextDefault
                                  textColor={currentTheme.fontFourthColor}
                                  style={{
                                    ...alignment.PLmedium,
                                    ...alignment.PRmedium,
                                    fontSize: scale(12),
                                    fontWeight: '400',
                                    marginTop: scale(3),
                                    textAlign: isArabic ? 'right' : 'left'
                                  }}
                                >
                                  {t('mostOrderedNow')}
                                </TextDefault>
                                <View style={styles().popularItemCards}>
                                  {data?.map((item) => (
                                    <ItemCard
                                      key={item?._id}
                                      item={item}
                                      onPressItem={onPressItem}
                                      restaurant={restaurant}
                                      tagCart={tagCart}
                                    />
                                  ))}
                                </View>
                              </View>
                            )
                          }
                          // Render other section headers as usual
                          return (
                            <View style={styles(currentTheme).sectionHeader}>
                              <TextDefault
                                H3
                                style={{
                                  // textAlign: isArabic ? 'right' : 'left',
                                  // marginInlineEnd: isArabic ? 20 : 0,
                                  margin: 5
                                }}
                                textColor={currentTheme.fontFourthColor}
                                bolder
                              >
                                {title}
                              </TextDefault>
                            </View>
                          )
                        }}
                        renderItem={({ item, section }) => {
                          const imageUrl =
                            item?.image && item?.image?.trim() !== ''
                              ? item.image
                              : IMAGE_LINK
                          if (section.title === t('popular')) {
                            if (!dataList || dataList?.length === 0) {
                              return null
                            }
                            return null
                          }
                          return (
                            <Fragment>
                              <TouchableOpacity
                                onPress={() =>
                                  onPressItem({
                                    ...item,
                                    restaurant: restaurant?._id,
                                    restaurantName: restaurant.name
                                  })
                                }
                                style={{
                                  flexDirection: isArabic
                                    ? 'row-reverse'
                                    : 'row',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: 10,
                                  marginBottom: 10,
                                  borderColor: colors.lightGray,
                                  backgroundColor: colors.white,
                                  marginHorizontal: 10,
                                  borderWidth: 1,
                                  borderRadius: 8
                                }}
                              >
                                <View
                                  style={{
                                    flexDirection: isArabic
                                      ? 'row-reverse'
                                      : 'row',
                                    gap: 20
                                  }}
                                >
                                  {/* Image */}
                                  <View>
                                    <Image
                                      style={{
                                        height: scale(60),
                                        width: scale(60),
                                        borderRadius: 30
                                      }}
                                      source={{ uri: imageUrl }}
                                    />
                                  </View>

                                  <View>
                                    <TextDefault
                                      bolder
                                      textColor={currentTheme.fontMainColor}
                                      H4
                                      style={
                                        {
                                          // ...styles(currentTheme).headerText
                                        }
                                      }
                                    >
                                      {item.title}
                                    </TextDefault>
                                    {isArabic ? (
                                      <TextDefault
                                        textColor={currentTheme.fontMainColor}
                                        style={{
                                          textAlign: isArabic
                                            ? 'right'
                                            : 'left',
                                          margin: 5
                                        }}
                                      >
                                        {parseFloat(
                                          item.variations[0].price
                                        ).toFixed(2)}
                                        {configuration.currencySymbol}
                                      </TextDefault>
                                    ) : (
                                      <TextDefault
                                        style={{
                                          textAlign: isArabic ? 'right' : 'left'
                                        }}
                                      >
                                        {configuration.currencySymbol}{' '}
                                        {parseFloat(
                                          item.variations[0].price
                                        ).toFixed(2)}
                                      </TextDefault>
                                    )}
                                  </View>
                                </View>
                                {/* add */}
                                <View style={styles(currentTheme).addToCart}>
                                  <MaterialIcons
                                    name='add'
                                    size={scale(20)}
                                    color={currentTheme.themeBackground}
                                  />
                                </View>
                              </TouchableOpacity>
                            </Fragment>
                          )
                        }}
                      />
                    )}
                  </ScrollView>
                )}
              </>
              {/* </View> */}
              {cartCount > 0 && (
                <View
                  style={[
                    styles(currentTheme).buttonContainer,
                    Platform.OS === 'ios' && { marginBottom: 70 }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles(currentTheme).button}
                    onPress={() => navigation.navigate('Cart')}
                  >
                    <View style={styles().buttontLeft}>
                      <Animated.View
                        style={[
                          styles(currentTheme).buttonLeftCircle,
                          {
                            width: circleSize,
                            height: circleSize,
                            borderRadius: radiusSize
                          },
                          scaleStyles
                        ]}
                      >
                        <Animated.Text
                          style={[
                            styles(currentTheme).buttonTextLeft,
                            fontStyles
                          ]}
                        >
                          {cartCount}
                        </Animated.Text>
                      </Animated.View>
                    </View>
                    <TextDefault
                      style={styles().buttonText}
                      textColor={currentTheme.buttonTextPink}
                      uppercase
                      center
                      bolder
                      small
                      H5
                    >
                      {t('viewCart')}
                    </TextDefault>
                    <View style={styles().buttonTextRight} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

export default Restaurant
