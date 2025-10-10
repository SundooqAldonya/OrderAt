/* eslint-disable react/display-name */
import React, {
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useCallback
} from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  FlatList
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { useQuery, useLazyQuery } from '@apollo/client'
import {
  useCollapsibleSubHeader,
  CollapsibleSubHeaderAnimator
} from 'react-navigation-collapsible'
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder'
import Search from '../../components/Main/Search/Search'
import Item from '../../components/Main/Item/Item'
import UserContext from '../../context/User'
import {
  filterRestaurants,
  getBusinessCategoriesCustomer
} from '../../apollo/queries'
import styles from './styles'
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import { LocationContext } from '../../context/Location'
import { ActiveOrdersAndSections } from '../../components/Main/ActiveOrdersAndSections'
import { useTranslation } from 'react-i18next'
import Filters from '../../components/Filter/FilterSlider'
import { FILTER_TYPE } from '../../utils/enums'
import ErrorView from '../../components/ErrorView/ErrorView'
import { debounce } from 'lodash'
import { moderateScale } from '../../utils/scaling'

export const HighlightValues = ['businesses_with_offers', 'mostOrderedNow', 'featured'];

export const FILTER_VALUES = Object.freeze({
  // Sort: {
  //   type: FILTER_TYPE.RADIO,
  //   values: ['Relevance (Default)', 'Fast Delivery', 'Distance'],
  //   selected: []
  // },
  // Offers: {
  //   selected: [],
  //   type: FILTER_TYPE.CHECKBOX,
  //   values: ['Free Delivery', 'Accept Vouchers', 'Deal']
  // },
  Highlights: {
    type: FILTER_TYPE.RADIO, // only one can be selected
    selected: [],
    values: HighlightValues
  },
  Rating: {
    selected: [],
    type: FILTER_TYPE.RADIO,
    values: ['3+ Rating', '4+ Rating', '5 star Rating']
  },
  categories: {
    selected: [],
    type: FILTER_TYPE.CHECKBOX,
    values: []
  }
});

function MenuV2({ route, props }) {
  // const Analytics = analytics()
  const { selectedType } = route.params || { selectedType: 'restaurant' }
  const { highlight, title } = route.params || {}
  const filteredItem = route.params?.filteredItem || null
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  // const { loadingOrders, isLoggedIn, profile } = useContext(UserContext)
  const { location, setLocation } = useContext(LocationContext)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(() => JSON.parse(JSON.stringify(FILTER_VALUES)));
  const [highlightMain, setHighlightMain] = useState(false)
  // const [titleUI, setTitleUI] = useState('')

  const navigation = useNavigation()
  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const isFocused = useIsFocused();
  const [
    fetchFilterRestaurants,
    { data, refetch, networkStatus, loading, error }
  ] = useLazyQuery(filterRestaurants, {
    fetchPolicy: 'no-cache'
  })


  const {
    data: dataBusinessCategories,
    loading: loadingBusinessCategories,
    error: errorBusinessCategories
  } = useQuery(getBusinessCategoriesCustomer, {
    fetchPolicy: 'no-cache'
  })

  const businessCategories =
    dataBusinessCategories?.getBusinessCategoriesCustomer || null


  useEffect(() => {
    if (highlight || title) {
      setHighlightMain(true)
    }
  }, [highlight, title]);

 useEffect(() => {
  if (isFocused) {
    generateBusinessCategories();
  }
}, [isFocused, businessCategories, filteredItem?._id]);



  useEffect(() => {
  console.log('Applying filter with', title);
  if (title) {
   setFilters(prev => ({
      ...prev,
      Highlights: {
        ...prev.Highlights,
        selected: [title],
      },
    }));
  }
}, [title]);

useEffect(() => {
  applyFilters(filters);
}, [filters]);

// to generate business categories filter values
  const generateBusinessCategories = useCallback(() => {
    if (businessCategories?.length > 0 || filteredItem?._id) {
      setFilters((prev) => ({
        ...prev,
        categories: {
          selected: filteredItem?._id ? [filteredItem?._id] : [],
          type: FILTER_TYPE.CHECKBOX,
          values: businessCategories?.map((item) => item)
        }
      }))
    }
  }, [businessCategories, filteredItem?._id]);
  const applyFilters = useCallback(async (filtersToApply = null) => {
    const activeFilters = filtersToApply || filters;
    const highlights = activeFilters.Highlights.selected
    const ratings = activeFilters.Rating.selected
    const categories = activeFilters.categories?.selected || []

    let minRating = null
    if (ratings.includes('3+ Rating')) minRating = 3
    if (ratings.includes('4+ Rating')) minRating = 4
    if (ratings.includes('5 star Rating')) minRating = 5
    await fetchFilterRestaurants({
      variables: {
        categories,
        highlights,
        minRating,
        maxRating: null, // optional
        search: search || null,
        city: location?.cityId || null,
        isOpen: false, // toggle if you want open-now filter
        mode: title === 'all_businesses' ? null : title, // optional
        longitude: location.longitude || null,
        latitude: location.latitude || null
      }
    })
  }, [filters]);

  const searchRestaurants = async (searchText) => {
    await fetchFilterRestaurants({
      variables: {
        search: searchText,
        categories: filters.categories?.selected || [],
        highlights: filters.Highlights.selected || [],
        minRating: null,
        city: location?.cityId || null,
        longitude: location.longitude || null,
        latitude: location.latitude || null
      }
    })
  }

  const handleSearch = useCallback(
    debounce((text) => {
      console.log('Searching for:', text)
      // call API here
      searchRestaurants(text)
    }, 1000),
    []
  )

  const clearFilters = async () => {
  setSearch('');

  setFilters((prevFilters) => {
    const reset = {
      ...JSON.parse(JSON.stringify(FILTER_VALUES)),
      categories: prevFilters.categories
        ? {
            ...prevFilters.categories,
            selected: [], // clear only selected categories
          }
        : undefined,
    };

    return reset;
  });
  };

  const newheaderColor = currentTheme.newheaderColor

  const {
    // onScroll /* Event handler */,
    containerPaddingTop /* number */,
    scrollIndicatorInsetTop /* number */,
    translateY
  } = useCollapsibleSubHeader()

  const searchPlaceholderText =
    selectedType === 'restaurant' ? t('searchRestaurant') : t('searchGrocery')
  const menuPageHeading =
    selectedType === 'restaurant' ? t('allRestaurant') : t('allGrocery')
  const emptyViewDesc =
    selectedType === 'restaurant' ? t('noRestaurant') : t('noGrocery')

  useFocusEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#fff')
    }
    StatusBar.setBarStyle('dark-content')
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  })


  // const emptyView = () => {
  //   if (loading || loadingOrders) {
  //     return loadingScreen()
  //   } else {
  //     return (
  //       <View style={styles().emptyViewContainer}>
  //         <View style={styles(currentTheme).emptyViewBox}>
  //           <TextDefault bold H4 center textColor={currentTheme.fontMainColor}>
  //             {/* {t('notAvailableinYourArea')} */}
  //             {t('no_search_result')}
  //           </TextDefault>
  //           {/* <TextDefault textColor={currentTheme.fontMainColor} center>
  //             {emptyViewDesc}
  //           </TextDefault> */}
  //         </View>
  //       </View>
  //     )
  //   }
  // }

  function loadingScreen() {
    return (
      <View style={styles(currentTheme).screenBackground}>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
        <Placeholder
          Animation={(props) => (
            <Fade
              {...props}
              style={styles(currentTheme).placeHolderFadeColor}
              duration={600}
            />
          )}
          style={styles(currentTheme).placeHolderContainer}
        >
          <PlaceholderLine style={styles().height200} />
          <PlaceholderLine />
        </Placeholder>
      </View>
    )
  }

  if (error) return <ErrorView />

  return (
    <SafeAreaView style={[styles().flex, { backgroundColor: '#fff' }]}>
      <CollapsibleSubHeaderAnimator translateY={translateY}>
        <View style={styles(currentTheme).searchbar}>
          <View
            style={{
              marginVertical: 10,
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20
            }}
          >
            <TextDefault bold H3 style={{ color: '#000', textAlign: 'right' }}>
              {t('search')}
            </TextDefault>
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                borderWidth: 1,
                borderColor: currentTheme.main,
                paddingVertical: 4,
                paddingHorizontal: 10,
                borderRadius: 12,
                alignSelf: 'flex-start',
                marginVertical: 5
              }}
            >
              <TextDefault textColor={currentTheme.main} bold>
                {t('clear_filters')}
              </TextDefault>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                clearFilters() // reset filters and fetch fresh data
                navigation.goBack() // navigate back
              }}
            >
              <AntDesign
                name={isArabic ? 'arrowleft' : 'arrowright'}
                size={24}
                color='black'
              />
            </TouchableOpacity>
          </View>
          <Search
            backgroundColor={'#fff'}
            setSearch={setSearch}
            search={search}
            handleSearch={handleSearch}
            newheaderColor={newheaderColor}
            placeHolder={searchPlaceholderText}
            refetch={refetch}
          />
        </View>

        <Filters
          filters={filters}
          setFilters={setFilters}
          applyFilters={applyFilters}
          filteredItem={filteredItem}
          showCategory={businessCategories?.length > 0}
        />
      </CollapsibleSubHeaderAnimator>

      {/* Scrollable List */}
      <View style={{ marginTop: moderateScale(190) }}>
        {loading ? (
          <View style={{ marginTop: 20 }}>{loadingScreen()}</View>
        ) : (
          <FlatList
            data={data?.filterRestaurants || []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Item item={item} />}
            // onScroll={onScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              // paddingTop: containerPaddingTop, // consistent padding
              paddingBottom: 140, // give space for footer/modal
              flexGrow: 1
            }}
            style={{
              flexGrow: 1
            }}
            // ListHeaderComponent={
            //   search || restaurantData.length === 0 ? null : (
            //     <ActiveOrdersAndSections
            //       sections={restaurantSections}
            //       menuPageHeading={t('results') || menuPageHeading}
            //       restaurantLength={
            //         search ? resultSearchData.length : restaurantData.length
            //       }
            //     />
            //   )
            // }
            // ListEmptyComponent={emptyView()}
            refreshControl={
              <RefreshControl
                progressViewOffset={containerPaddingTop}
                colors={[currentTheme.iconColorPink]}
                refreshing={networkStatus === 4}
                onRefresh={() => {
                  if (networkStatus === 7) {
                    refetch()
                  }
                }}
              />
            }
            scrollIndicatorInsets={{ top: scrollIndicatorInsetTop }}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

export default MenuV2
