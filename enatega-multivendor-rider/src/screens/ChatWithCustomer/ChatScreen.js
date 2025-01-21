import React, { Fragment } from 'react'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import { useChatScreen } from './useChatScreen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Ionicons, Entypo } from '@expo/vector-icons'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import styles from './styles'
import colors from '../../utilities/colors'

import { useTranslation } from 'react-i18next'

const ChatScreen = ({ navigation, route }) => {
  const { phoneNumber, id } = route.params
  const {
    messages,
    onSend,
    image,
    setImage,
    inputMessage,
    setInputMessage,
    profile,
    phone
  } = useChatScreen({ navigation, route })

  console.log({ phone: phoneNumber })

  const { t } = useTranslation()
  const filterImages = src => {
    setImage(image.filter(item => item !== src))
  }

  const renderAccessory = props => {
    return (
      <View style={styles.rowDisplay}>
        {image.map(item => (
          <View key={item.uri} style={styles.accessoryContainer}>
            <Image source={{ uri: item }} style={styles.accessoryImg} />
            <Entypo
              onPress={() => filterImages(item)}
              name="circle-with-cross"
              size={18}
              style={styles.accessoryIcon}
              color="black"
            />
          </View>
        ))}
      </View>
    )
  }

  const renderSend = props => {
    return (
      <Send {...props} sendButtonProps={{ ...props, onPress: onSend }}>
        <View>
          <Ionicons
            name="send"
            size={30}
            color={colors.black}
            style={styles.sendIcon}
          />
        </View>
      </Send>
    )
  }

  const renderChatEmpty = props => {
    return (
      <View>
        <TextDefault
          style={styles.emptyChat}
          textColor={colors.fontSecondColor}
          H3>
          {t('chatWithRider')}
        </TextDefault>
      </View>
    )
  }

  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: colors.white
          },
          left: {
            color: colors.black
          }
        }}
        wrapperStyle={{
          right: styles.bubbleRight,
          left: styles.bubbleLeft
        }}
        usernameStyle={{ color: colors.fontSecondColor }}
      />
    )
  }

  const scrollToBottomComponent = () => {
    return (
      <FontAwesome name="angle-double-down" size={22} color={colors.primary} />
    )
  }

  return (
    <Fragment>
      {/* Custom Header */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Chat with Customer</Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+1234567890')}>
          <TextDefault style={styles.phoneNumber}>+1234567890</TextDefault>
        </TouchableOpacity>
      </View> */}
      <GiftedChat
        messages={messages}
        user={{
          _id: profile.rider._id
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={scrollToBottomComponent}
        renderAvatar={null}
        renderUsernameOnMessage
        renderChatEmpty={renderChatEmpty}
        inverted={Platform.OS !== 'web' || messages.length === 0}
        timeTextStyle={{
          left: { color: colors.fontMainColor },
          right: { color: colors.horizontalLine }
        }}
        placeholder={t('message')}
        textInputStyle={{ paddingTop: 10 }}
        renderAccessory={image.length > 0 ? renderAccessory : null}
        text={inputMessage}
        onInputTextChanged={m => setInputMessage(m)}
      />
    </Fragment>
  )
}

export default ChatScreen
