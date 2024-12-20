import { ImageBackground, Modal, ScrollView, StatusBar, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors, scale } from '../../utilities'
import { TextDefault } from '../../components'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Montserrat_200ExtraLight } from '@expo-google-fonts/montserrat'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'react-native'
import { getCities, getGovernate } from '../../utilities/apiServices'
import { useNavigation, useRoute } from '@react-navigation/native'
import { FIND_OR_CREATE_USER } from '../../apollo'
import { useMutation } from '@apollo/client'
const { width, height } = Dimensions.get("window")
const token = "nzu3zF6IpFPbvb-8-JY6dwcOJsKDhqXbW4bLkbWjrtt0ldh0ZHc0tTkr0GfqOSdaM4U"
const RegisterUser = () => {
  const {phone} = useRoute().params;
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [checkoutModal, setCheckoutModal] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    governate: "",
    phone: phone,
    address: "",
  })
  const [cities, setCities] = useState([])
  const [currentData, setCurrentData] = useState([])
  const [governate, setGovernate] = useState([])
  const cityRef = useRef < TextInput > (null)
  const stateRef = useRef < TextInput > (null)
  const [selectedGovernate, setSelectedGovernate] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [locationAddress, setLocationAddress] = useState("")
  const navigation = useNavigation();
  const laodGovernates = async () => {
    await getGovernate().then(res => {
      if (res) {
        setGovernate(res.data)
      }
    }).catch(res => console.log(res))
  }
  const loadCities = async () => {
    await getCities(selectedGovernate).then(res => {
      if (res) {
        console.log(res.data)
        setCities(res.data)
      }
    }).catch(res => console.log(res))
  }
  const [findOrCreateUser, { loading, error }] = useMutation(FIND_OR_CREATE_USER, {
    onCompleted: (data) => {
      // Alert.alert('Success', `User ID: ${data.findOrCreateUser._id}`);
      console.log("User created =========>>>>>>>>>>>>>>", data)
    },
    onError:(error)=>{
      console.log("Error======>>>>>>>>", error.message)
    }
  });
  useEffect(() => {
    laodGovernates()
  }, [])
  const onSave = () => {
    Object.keys(userData).map((item) => {
      if (userData[item] == '') {
        Alert.alert("Validation Error", "All fields required you need to feel all fields")
      } else {
        console.log('teewgg')
        const addresses = [{deliveryAddress:`${userData.address}, ${userData.governate}`,
          details: locationAddress || "APT 1" ,
          label: "Home",
          selected: true,
          latitude:selectedLocation.latitude,
          longitude:selectedLocation.longitude,
        }]
        findOrCreateUser({
          variables: {
            userInput: { name:userData.name, phone:userData.phone, addresses },
          },
        }).then(res=> {
          if(res?.data?.findOrCreateUser){
            setUserData({
              name: "",
              governate: "",
              phone: "",
              address: "",
            })
            setLocationAddress('')
            setSelectedLocation(null)
            Alert.alert("User Created!", "User successfully created.")
            navigation.navigate("Checkout",{userData:res.data?.findOrCreateUser})
          }
        })
      }
      console.log("lllll", item, '=', userData[item])
    })
  }
  const SelectBox = ({ data, title }) => (
    <View>
      <TouchableOpacity onPress={() => {
        setIsVisible(true)
      }} style={styles.inputs} >
        <Text style={{
          fontFamily: 'Montserrat_400Regular',
          fontSize: 16,
          color: "#666"
        }}>{userData.governate ?? 'Select Governate'}</Text>
      </TouchableOpacity>
      <Modal visible={isVisible} style={{ flex: 1, height: height }} transparent animationType='slide'>
        <View style={{ flex: 1, width: width, height: height, backgroundColor: colors.green }}>
          <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: scale(18), margin: 10 }}>Select {title}</Text>
          <TouchableOpacity onPress={() => setIsVisible(false)} style={{ position: 'absolute', left: '90%', top: 10 }}>
            <Ionicons name='close' size={scale(25)} />
          </TouchableOpacity>
          <FlatList
            data={governate}
            style={{ height: height / 1.1 }}
            ListHeaderComponent={
              <TextInput placeholder={`Search ${title}`} style={{ backgroundColor: "#fff", paddingHorizontal: 10, margin: 10, borderRadius: 5, color: "#333" }} />
            }
            ItemSeparatorComponent={<View style={{ height: 1, backgroundColor: colors.borderColor }} />}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setUserData({ ...userData, governate: item?.state_name })
                  setSelectedGovernate(item?.state_name)
                  loadCities()
                  setIsVisible(false)
                }}
                style={{ flex: 1, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.buttonBackground, paddingVertical: 10 }}>
                <Text style={{ flex: 1 }}>{item?.state_name}</Text>
                {item?.state_name == selectedGovernate && <Ionicons name='checkmark' size={scale(20)} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  )
  const SelectBox2 = ({ data, title }) => (
    <View>
      <TouchableOpacity onPress={() => {
        if (selectedGovernate) {
          setIsVisible2(true)
        } else {
          Alert.alert("Please select govermate first", "It help us to fetch the cities accordingly.")
        }
      }} style={styles.inputs} >
        <Text style={{
          fontFamily: 'Montserrat_400Regular',
          fontSize: 16,
          color: "#666"
        }}>{userData.city ?? 'Select City'}</Text>
      </TouchableOpacity>
      <Modal visible={isVisible2} style={{ flex: 1, height: height }} transparent animationType='slide'>
        <View style={{ flex: 1, width: width, height: height, backgroundColor: colors.green }}>
          <Text style={{ fontFamily: 'Montserrat_500Medium', fontSize: scale(18), margin: 10 }}>Select {title}</Text>
          <TouchableOpacity onPress={() => setIsVisible2(false)} style={{ position: 'absolute', left: '90%', top: 10 }}>
            <Ionicons name='close' size={scale(25)} />
          </TouchableOpacity>
          <FlatList
            data={data}
            style={{ height: height / 1.1 }}
            ListHeaderComponent={
              <TextInput placeholder={`Search City`} style={{ backgroundColor: "#fff", paddingHorizontal: 10, margin: 10, borderRadius: 5, color: "#333" }} />
            }
            ItemSeparatorComponent={<View style={{ height: 1, backgroundColor: colors.borderColor }} />}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCity(item?.city_name)
                  setUserData({ ...userData, city: item?.city_name })
                  setIsVisible2(false)

                }}
                style={{ flex: 1, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.buttonBackground, paddingVertical: 10 }}>
                <Text style={{ flex: 1 }}>{item?.city_name}</Text>
                {item?.city_name == selectedCity && <Ionicons name='checkmark' size={scale(20)} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  )
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
       <KeyboardAvoidingView
            style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' , zIndex:99999999999999999}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            enabled>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>

        <TouchableOpacity style={{ marginRight: 10 }}><Ionicons name='arrow-back-outline' size={scale(25)} color={"#000"} /></TouchableOpacity>
      </View>
      <Image source={require('../../assets/orders.png')} resizeMode='center' style={{ height: scale(100), width: scale(200), alignSelf: 'center' }} />
      
     
        <View style={{flex: 1}}>
        <TextDefault H5 bold style={{ marginHorizontal: 10, textAlign: 'center', marginHorizontal: scale(30) }} textColor={"#000"}>Save user details and continue to complete the order.</TextDefault>
       <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <View>
        <TextInput value={userData.phone} onChangeText={(text) => setUserData({ ...userData, phone: text })} placeholder='Enter Phone' style={styles.inputs} />
        <TextInput value={userData.name} onChangeText={(text) => setUserData({ ...userData, name: text })} placeholder='Full Name' style={styles.inputs} />
        <TextInput value={userData.governate} onChangeText={(text) => setUserData({ ...userData, governate: text })} placeholder='Enter Governate' style={styles.inputs} />
       
        <GooglePlacesAutocomplete
        placeholder="Search for a place"
        onPress={(data, details = null) => {
          setLocationAddress(details?.formatted_address)
          setSelectedLocation({
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
          });
        }}
        query={{
          key: 'AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY',
          language: 'en',
        }}
        fetchDetails={true}
        styles={{
          container: {
            flex: 1, // Ensure the input field itself takes full width
          },
          listView: {
            height: 500, // Adjust the height of the FlatList container
          },
          textInput: styles.inputs
        }}
        flatListProps={{
          scrollEnabled: true, // Disable FlatList internal scrolling
        }}
      />
        {/* <TextInput value={userData.city} onChangeText={(text) => setUserData({ ...userData, city: text })} placeholder='Enter City' style={styles.inputs} /> */}
        {/* <SelectBox data={governate} title="Governate" />
        <SelectBox2 data={cities} title="Cities" /> */}
        {/* <TextInput value={userData.area} onChangeText={(text) => setUserData({ ...userData, area: text })} placeholder='Enter Area' style={styles.inputs} /> */}
        <TextInput value={userData.address} onChangeText={(text) => setUserData({ ...userData, address: text })} multiline numberOfLines={4} placeholder='Address' style={styles.inputs} />
        </View>
        <TouchableOpacity onPress={onSave} style={{ backgroundColor: "#000", flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: scale(100), padding: 10, marginHorizontal: 16, borderRadius: 10 }}>
        <TextDefault H4 bold textColor={"#fff"}>Save & Continue</TextDefault></TouchableOpacity>
      </ScrollView>
      
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default RegisterUser

const styles = StyleSheet.create({
  inputs: {
    backgroundColor: "#fff",
    marginHorrizontal: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ffffff",
    marginVertical: 10,
    marginHorizontal: 16,
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16
  }
})