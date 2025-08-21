import React, { useState, useRef, useImperativeHandle } from 'react'
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform
} from 'react-native'
import { useTranslation } from 'react-i18next'

const CustomPlacesAutocomplete = React.forwardRef((props, ref) => {
  const {
    placeholder,
    onPress,
    query,
    fetchDetails = true,
    enablePoweredByContainer = false,
    predefinedPlaces = [],
    predefinedPlacesAlwaysVisible = false,
    textInputProps = {},
    styles = {}
  } = props
  const { i18n, t } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [input, setInput] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const typingTimeout = useRef(null)

  // expose method to the parent
  useImperativeHandle(ref, () => ({
    setAddressText: (text) => {
      setInput(text)
    },
    getAddressText: () => input,
    clear: () => setInput('')
  }))

  const fetchPredictions = async (text) => {
    if (!text) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        text
      )}&key=${query.key}&language=${query.language || 'en'}&components=${query.components || ''}&region=${
        query.region || ''
      }&sessiontoken=${query.sessiontoken || ''}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.predictions) {
        setResults(data.predictions)
      }
    } catch (err) {
      console.error('Autocomplete error:', err)
    }
    setLoading(false)
  }

  const handleSelect = async (item) => {
    if (fetchDetails) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${item.place_id}&key=${query.key}&language=${
          query.language || 'en'
        }`
        const response = await fetch(detailsUrl)
        const data = await response.json()
        onPress(item, data.result)
      } catch (err) {
        console.error('Details fetch error:', err)
        onPress(item, null)
      }
    } else {
      onPress(item, null)
    }
    setInput(item.description)
    setResults([])
  }

  return (
    <View>
      <View
        style={[
          { flexDirection: 'row', alignItems: 'center' },
          styles.textInputContainer
        ]}
      >
        <TextInput
          ref={ref}
          value={input}
          onChangeText={(text) => {
            setInput(text)
            if (typingTimeout.current) clearTimeout(typingTimeout.current)
            typingTimeout.current = setTimeout(
              () => fetchPredictions(text),
              400
            )
          }}
          placeholder={placeholder}
          style={[{ flex: 1, height: 44, fontSize: 16 }, styles.textInput]}
          {...textInputProps}
        />
        {loading && <ActivityIndicator style={{ marginLeft: 10 }} />}
      </View>

      {(predefinedPlacesAlwaysVisible || input.length > 0) && (
        <FlatList
          data={[...predefinedPlaces, ...results]}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                padding: 12,
                borderBottomWidth: 1,
                borderColor: '#eee',
                backgroundColor: '#fff' // 👈 this fixes transparency
              }}
              onPress={() => handleSelect(item)}
            >
              <Text
                style={{
                  color: '#000',
                  textAlign: isArabic ? 'right' : 'left'
                }}
              >
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
          style={{
            backgroundColor: '#fff', // 👈 add background for the whole list
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 250,
            elevation: 5,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4
          }}
        />
      )}

      {!enablePoweredByContainer && null}
    </View>
  )
})

export default CustomPlacesAutocomplete
