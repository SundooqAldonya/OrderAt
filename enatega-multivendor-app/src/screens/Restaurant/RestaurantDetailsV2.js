import React, { useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  findNodeHandle
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RestaurantHeader from '../../components/RestaurantComponents/RestaurantHeader'
import { HEADER_COLLAPSED_HEIGHT, HEADER_EXPANDED_HEIGHT } from './helpers'
import PickCards from '../../components/RestaurantComponents/PickCards'
import AntDesign from '@expo/vector-icons/AntDesign'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Entypo from '@expo/vector-icons/Entypo'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import Categories from '../../components/RestaurantComponents/Categories'
import { colors } from '../../utils/colors'

const ITEM_HEIGHT = 150
const CATEGORY_HEADER_HEIGHT = 50
const CATEGORY_PADDING = 10

const RestaurantDetailsV2 = () => {
  const scrollY = new Animated.Value(0)
  const stickyHeaderAnim = useRef(new Animated.Value(0)).current
  const sectionRefs = useRef({})
  const scrollViewRef = useRef({})

  const [sectionPositions, setSectionPositions] = useState({})
  const [activeCategory, setActiveCategory] = useState('picks')
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event) => {
        const y = event.nativeEvent.contentOffset.y
        setShowStickyHeader(
          y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
        )
        const shouldShow = y > HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT
        // Animate the sticky header visibility
        Animated.timing(stickyHeaderAnim, {
          // Animate the sticky header visibility
          toValue: shouldShow ? 1 : 0,
          duration: 250,
          useNativeDriver: true
        }).start()
      }
    }
  )

  const menuItems = [
    {
      _id: '1',
      title: 'Half Grilled Chicken',
      price: 'EGP 190.00',
      topRated: true,
      image: require('../../assets/restaurant/half_grilled_chicken.jpg'),
      category: 'chicken'
    },
    {
      _id: '2',
      title: 'Grilled Fillet Chicken',
      price: 'EGP 181.00',
      image: require('../../assets/restaurant/grilled_fillet.jpg'),
      category: 'chicken'
    },
    {
      _id: '3',
      title: 'Chicken with Fries',
      price: 'EGP 175.00',
      topRated: true,
      image: require('../../assets/restaurant/chicken_with_fries.jpg'),
      category: 'chicken'
    },
    {
      _id: '4',
      title: 'Bechamel Pasta',
      price: 'EGP 76.50',
      image: require('../../assets/restaurant/bechamel_pasta.jpg'),
      category: 'pasta'
    }
  ]

  const categories = [
    {
      _id: 'picks',
      icon: '🔥',
      title: 'Picks for you',
      desceription: "Trending items we think you'll love"
    },
    { _id: 'burgers', title: 'Burgers' },
    { _id: 'chicken', title: 'Chicken' },
    { _id: 'pasta', title: 'Pasta' },
    { _id: 'cheese', title: 'Cheese' }
  ]

  const itemsByCategory = useMemo(() => {
    const map = {}
    menuItems.forEach((item) => {
      if (!map[item.category]) map[item.category] = []
      map[item.category].push(item)
    })
    return map
  }, [menuItems])

  console.log('Items by category:', itemsByCategory)

  const getScrollOffsetForCategory = (targetCategoryId) => {
    let offset = 0

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      const itemsInThisCategory = itemsByCategory[cat._id]?.length || 0
      console.log(`Category: ${cat._id}, Items: ${itemsInThisCategory}`)

      offset += CATEGORY_HEADER_HEIGHT
      offset += itemsInThisCategory * ITEM_HEIGHT
      offset += CATEGORY_PADDING
      if (cat._id === targetCategoryId) break
    }

    return offset
  }

  const handleCategoryPress = (categoryId) => {
    setActiveCategory(categoryId)
    const y = getScrollOffsetForCategory(categoryId)
    // Scroll to the section of the selected category

    scrollViewRef.current?.scrollTo({
      // y: sectionPositions[categoryId] + y,
      y: y,
      animated: true
    })
  }

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y

    let current = categories[0]._id
    for (let i = 0; i < categories.length; i++) {
      const _id = categories[i]._id
      const nextId = categories[i + 1]?._id
      const currentY = sectionPositions[_id]
      const nextY = sectionPositions[nextId] ?? Infinity

      if (yOffset >= currentY && yOffset < nextY) {
        current = _id
        break
      }
    }
    setActiveCategory(current)
  }

  const renderItem = ({ item }) => {
    return <PickCards item={item} />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        translucent
        backgroundColor='transparent'
        barStyle='dark-content'
      />

      {showStickyHeader && (
        <RestaurantHeader title='El Haty' stickyHeaderAnim={stickyHeaderAnim} />
      )}
      <View style={styles.topHeader}>
        <View style={styles.backIconContainer}>
          <AntDesign name='arrowleft' size={18} color='black' />
        </View>
        <View style={styles.iconsWrapper}>
          <View style={styles.backIconContainer}>
            <MaterialIcons name='favorite-border' size={18} color='black' />
          </View>
          <View style={styles.backIconContainer}>
            <Entypo name='share-alternative' size={18} color='black' />
          </View>
          <View style={styles.backIconContainer}>
            <EvilIcons name='search' size={18} color='black' />
          </View>
        </View>
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 1000 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Image
          source={require('../../assets/restaurant/header_kebab.jpg')}
          style={styles.headerImage}
        />

        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantTitle}>El Haty</Text>
          <Text style={styles.restaurantSubtitle}>
            Grills, Pasta, Chicken, Egyptian
          </Text>
          <Text style={styles.deliveryInfo}>🚲 EGP 35.00 • 60 mins</Text>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>Get free delivery with pro</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.discountBanner}>
            <Text>15% off selected items</Text>
          </TouchableOpacity>
        </View>

        {/* food categories */}
        <Categories
          categories={categories}
          activeCategory={activeCategory}
          onCategoryPress={handleCategoryPress}
          sectionPositions={sectionPositions}
        />

        {/* scroll view for included food categories */}
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {categories?.map((cat) => (
            <View
              key={cat._id}
              // ref={(ref) => (sectionRefs.current[cat._id] = ref)}
              onLayout={(event) => {
                const y = event.nativeEvent.layout.y
                setSectionPositions((prev) => ({ ...prev, [cat._id]: y }))
              }}
              style={styles.menuSection}
            >
              <Text style={styles.sectionTitle}>
                {cat.title} {cat.icon ? cat.icon : null}
              </Text>
              {cat.desceription ? (
                <Text style={styles.sectionSubtitle}>{cat.desceription}</Text>
              ) : null}
              {/* render items for that section */}
              <FlatList
                data={itemsByCategory[cat._id] || []}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
              />
            </View>
          ))}
        </ScrollView>
      </Animated.ScrollView>

      <View style={styles.bottomBanner}>
        <Text style={styles.bottomText}>
          Add EGP 200.00 to start your order
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  topHeader: {
    position: 'absolute',
    zIndex: 20,
    top: 30,
    left: 15,
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  backIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 50,
    padding: 5
  },
  iconsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 110
  },
  headerImage: {
    width: '100%',
    height: HEADER_EXPANDED_HEIGHT,
    resizeMode: 'cover'
  },
  restaurantInfo: {
    padding: 16
  },
  restaurantTitle: {
    fontSize: 22,
    fontWeight: 'bold'
  },
  restaurantSubtitle: {
    color: '#666',
    marginTop: 4
  },
  deliveryInfo: {
    marginTop: 8
  },
  proButton: {
    backgroundColor: '#eaffe8ff',
    marginTop: 12,
    padding: 10,
    borderRadius: 8
  },
  proButtonText: {
    color: colors.primary,
    fontWeight: '500'
  },
  discountBanner: {
    backgroundColor: '#ffeecf',
    padding: 10,
    borderRadius: 8,
    marginTop: 16
  },
  menuSection: {
    padding: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  sectionSubtitle: {
    color: '#999',
    marginBottom: 12
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    paddingHorizontal: 16
  },
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc'
  },
  bottomText: {
    fontWeight: '500'
  }
})

export default RestaurantDetailsV2
