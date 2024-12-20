import { Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextDefault } from '../../components'
import { colors, scale } from '../../utilities'
import { TabActions, useNavigation, useRoute } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import FontAwesome from 'react-native-vector-icons/FontAwesome'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'react-native'
import { useMutation } from '@apollo/client'
const { width, height } = Dimensions.get("window")
import {CHECK_OUT_PLACE_ORDER} from '../../apollo/mutations'
const Checkout = () => {
    const { userData  } = useRoute().params;
    const navigation = useNavigation();
    const [selectedAddress, setSelectedAddress] = useState({})
    const [amount, setAmount] = useState(null)
    useEffect(() =>{
        setSelectedAddress(userData.addresses[0])
        console.log(userData)
    },[])
    const [checkoutPlaceOrder, { loading, error, data }] = useMutation(CHECK_OUT_PLACE_ORDER, {
        onCompleted: (data) => {
          console.log('Order Placed', `Order ID: ${data.CheckOutPlaceOrder.orderId}`);
        },
      });
      const createOrder = async () =>{
        console.log("helllll", userData, selectedAddress, amount)
        if (!userData._id || !selectedAddress._id || !amount) {
            console.log('Error', 'Please fill all fields');
            return;
          }

          const restaurant = await AsyncStorage.getItem('restaurantId')
      console.log('restaurant@@@@@@@@@#$%', restaurant)
          // Execute the mutation
          checkoutPlaceOrder({
            variables: {
              userId: userData._id,
              addressId : selectedAddress?._id,
              orderAmount: parseFloat(amount), // Ensure orderAmount is a Float
              resId: restaurant
            },
          }).then(res=>{
            console.log("res", res)
            if(res.data){
                navigation.replace("Orders")
                Alert.alert("Order successfully created!",`Order Number : ${res?.data?.CheckOutPlaceOrder?.orderId}`)
            }
          }).catch((err) => {
            console.log('errrr@@@@@@@@@@', err)
          })
      }
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.green }}>
            <ScrollView>
            <Image source={require('../../assets/orders.png')} style={{ width: width, height: scale(width/2) , backgroundColor:"#fff"}} />
            <TextDefault H3 bold textColor={colors.fontMainColor} style={{ marginHorizontal: 10, marginVertical:10 }}>Confirm Order</TextDefault>
            <View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 10, margin: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Ionicons name='person-circle' size={scale(18)} /><TextDefault H5>{userData?.name}</TextDefault>
                </View>
                <View style={{ height: 1, backgroundColor: colors.green, marginVertical: 10, opacity: 0.2 }} />
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <FontAwesome name='location-arrow' size={scale(18)} /><TextDefault H5>Choose address</TextDefault>
                </View>
                {userData?.addresses?.map((item,index) =>(
                    <TouchableOpacity style={{backgroundColor:"whitesmoke", flexDirection:'row', alignItems:'center', padding:10, margin:5, marginTop:10, borderRadius:10,borderWidth:1, borderColor:"powderblue"}}>
                        <View style={{flex:1}}><TextDefault>{item.deliveryAddress}</TextDefault></View>
                    <View style={{height:20, width:20,borderWidth:3, borderColor:colors.green, borderRadius:20}}>
                        {selectedAddress?.deliveryAddress == item?.deliveryAddress && <View style={{flex:1, backgroundColor:colors.green, margin:2, borderRadius:20}}/>}</View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ backgroundColor: "#fff", marginHorizontal:10, marginVertical: 10, paddingHorizontal: 10, borderRadius: 10, borderWidth: 2, borderColor: colors.darkgreen, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <FontAwesome5 name='pound-sign' size={scale(20)} style={{ flex: 0.1 }} />
                <TextInput value={amount} onChangeText={setAmount} keyboardType='number-pad' placeholder='Enter cost' style={{ flex: 1, alignSelf: 'flex-start', fontFamily:"Montserrat_500Medium" }} />
            </View>
           
            </ScrollView>
            <TouchableOpacity onPress={createOrder} style={{ backgroundColor: "#000",marginBottom:scale(80), marginHorizontal:10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 10 }}>
                <TextDefault H4 bold textColor={"#fff"}>Create Order</TextDefault>
            </TouchableOpacity>
        </SafeAreaView>

    )
}

export default Checkout

const styles = StyleSheet.create({})