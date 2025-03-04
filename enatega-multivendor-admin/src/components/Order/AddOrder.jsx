import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  InputAdornment,
  CircularProgress,
  IconButton,
  useTheme
} from '@mui/material'
import { validateFunc } from '../../constraints/constraints'
import Button from '@mui/material/Button'
import { useQuery, gql, useMutation } from '@apollo/client'
import { Link } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import GooglePlacesAutocomplete from 'react-google-autocomplete'
import DialogTitle from '@mui/material/DialogTitle'
import Alert from '@mui/material/Alert'
import useGlobalStyles from '../../utils/globalStyles'
import { AreaContext } from '../../context/AreaContext'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { UPDATE_USER_ADDRESS, getOrdersByRestaurant } from '../../apollo'
import AddNewAddress from './AddNewAddress'
import PlacesAutocomplete from 'react-places-autocomplete'
import ClearIcon from '@mui/icons-material/Clear'
import useAcceptOrder from '../../context/useAcceptOrder'

const GOOGLE_MAPS_KEY = 'AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY'

const GET_ORDERS = gql`
  ${getOrdersByRestaurant}
`

const CHECKOUT_PLACE_ORDER = gql`
  mutation CheckOutPlaceOrder(
    $userId: ID!
    $resId: String!
    $addressId: ID
    $orderAmount: Float!
    $preparationTime: Float!
  ) {
    CheckOutPlaceOrder(
      userId: $userId
      resId: $resId
      addressId: $addressId
      orderAmount: $orderAmount
      preparationTime: $preparationTime
    ) {
      _id
      orderId
      resId
      user {
        _id
        name
        phone
      }
      deliveryAddress {
        id
        deliveryAddress
        details
        label
      }
      orderAmount
      paymentStatus
      orderStatus
      isActive
      createdAt
      updatedAt
    }
  }
`

const FIND_OR_CREATE_USER = gql`
  mutation FindOrCreateUser($userInput: UserInput!) {
    findOrCreateUser(userInput: $userInput) {
      _id
      name
      phone
      governate
      address_free_text
      addresses {
        _id
        deliveryAddress
        details
        label
        selected
        isActive
      }
      area
    }
  }
`

const GET_USERS_BY_SEARCH = gql`
  query Users($search: String) {
    search_users(search: $search) {
      _id
      name
      email
      phone
      address_free_text
      addresses {
        _id
        deliveryAddress
        details
        label
        selected
        createdAt
        updatedAt
      }
    }
  }
`

const AddOrder = ({ t, refetchOrders }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [PhoneError, setPhoneError] = useState(false)
  const [searchTrigger, setSearchTrigger] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openModalAddress, setOpenModalAddress] = useState(false)
  const [openAddress, setOpenAddress] = useState(false)
  const [longitude, setLongitude] = useState('')
  const [latitude, setLatitude] = useState('')
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phoneNumber: '',
    address: '',
    governate: '',
    address_free_text: ''
  })
  const [cost, setCost] = useState('')
  const [success, setSuccess] = useState('')
  const [orderMode, setOrderMode] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const restaurantId = localStorage.getItem('restaurantId')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search] = useState('')
  const { acceptOrder } = useAcceptOrder()
  const [selectedTime, setSelectedTime] = useState(30)
  const [times, setTimes] = useState([10, 20, 30, 40, 50, 60, 70, 80, 90])

  const [checkOutPlaceOrder] = useMutation(CHECKOUT_PLACE_ORDER, {
    onCompleted: data => {
      setSuccess('Order Created Successfully!')
      refetchOrders()
      setOrderMode(false)
      acceptOrder(
        data.CheckOutPlaceOrder._id,
        restaurantId,
        selectedTime.toString()
      )
    }
  })

  const theme = useTheme()

  const { areas } = useContext(AreaContext)
  const [selectedArea, setSelectedArea] = useState('')
  const [addressFreeText, setAddressFreeText] = useState('')
  const [label, setLabel] = useState('')

  console.log({ areas })

  const handleSearchChange = event => {
    const newValue = event.target.value.replace(/[^0-9+]/g, '')
    setSearchQuery(newValue)
  }
  const [validationErrors, setValidationErrors] = useState({
    name: false,
    phoneNumber: false,
    address: false,
    governate: false,
    address_free_text: false
  })

  const globalClasses = useGlobalStyles()

  const handleSearchClick = e => {
    e.preventDefault()
    if (searchQuery.trim() == '') {
      setPhoneError(true)
      return
    } else {
      setPhoneError(false)
    }
    console.log({ searchQuery })
    setSearchTrigger(searchQuery)
  }

  const { loading, error, data } = useQuery(GET_USERS_BY_SEARCH, {
    variables: { search: searchTrigger },
    skip: !searchTrigger
  })

  console.log({ dataUser: data })

  useEffect(() => {
    if (data && data.search_users && data.search_users.length > 0) {
      setSelectedCustomer(data.search_users[0])
      setAddressFreeText(data.search_users[0].addresses[0].details)
      // Set selected address when selectedCustomer is available
      if (
        data.search_users[0].addresses &&
        data.search_users[0].addresses.length > 0
      ) {
        setSelectedAddress(data.search_users[0].addresses[0].deliveryAddress)
      }

      setOrderMode(true)
    }
  }, [data])

  // Handle selectedAddress update when selectedCustomer changes
  useEffect(() => {
    if (
      selectedCustomer &&
      selectedCustomer.addresses &&
      selectedCustomer.addresses.length > 0
    ) {
      setSelectedAddress(selectedCustomer.addresses[0].deliveryAddress)
    }
  }, [selectedCustomer])

  const [findOrCreateUser] = useMutation(FIND_OR_CREATE_USER)

  const handleAddCustomer = event => {
    event.preventDefault()
    setOpenModal(true)
  }

  const handleInputChange = event => {
    const {
      name,
      governate,
      address_free_text,
      address,
      latitude,
      longitude,
      value
    } = event.target

    console.log(
      name,
      governate,
      address_free_text,
      address,
      value,
      latitude,
      longitude,
      'uiusdiuaiduai'
    )

    if (latitude) {
      setLatitude(latitude)
    }
    if (longitude) {
      setLongitude(longitude)
    }
    // Regular expression to allow only alphabets and spaces
    const regex = /^[A-Za-z\s]*$/

    // If the value matches the regex or is empty (to allow deletion), update the state

    setNewCustomer(prevCustomer => ({
      ...prevCustomer,
      [name]: value,
      [governate]: value,
      [address_free_text]: value,
      [address]: value
    }))
  }

  const validateForm = () => {
    const errors = {}
    errors.name = newCustomer.name.trim() === '' // Validate name
    // errors.address = newCustomer.address.trim() === '';  // Validate address
    // errors.governate = newCustomer.governate.trim() === '' // Validate address
    errors.address_free_text = newCustomer.address_free_text.trim() === '' // Validate address

    setValidationErrors(errors)

    // Return true if no errors, false otherwise
    return !Object.values(errors).includes(true)
  }

  const searchAddressFreeText = address => {
    console.log({ address: selectedCustomer?.addresses[0] })
    const foundAddressFree = selectedCustomer?.addresses?.find(
      item => item.deliveryAddress === address
    )
    console.log({ foundAddressFree })
    setAddressFreeText(foundAddressFree.details)
  }

  const getLabel = address => {
    console.log({ address: selectedCustomer?.addresses[0] })
    const foundAddressFree = selectedCustomer?.addresses?.find(
      item => item.deliveryAddress === address
    )
    console.log({ foundAddressFree })
    setLabel(foundAddressFree.label)
  }

  const handleSubmitCustomer = async e => {
    e.preventDefault()

    if (!validateForm()) {
      console.log('Form validation failed')
      return
    }
    let addresses = []
    if (latitude || longitude || newCustomer?.address) {
      addresses = [
        {
          latitude: latitude?.toString(),
          longitude: longitude?.toString(),
          deliveryAddress: newCustomer?.address ? newCustomer?.address : '',
          label: 'Home',
          selected: true
        }
      ]
    }
    console.log('submitted')
    try {
      const { data } = await findOrCreateUser({
        variables: {
          userInput: {
            name: newCustomer.name,
            // governate: newCustomer.governate,
            address_free_text: newCustomer.address_free_text,
            phone: searchQuery,
            area: selectedArea,
            addresses
          }
        }
      })
      console.log({ data })
      // Clear the form after successful creation
      setNewCustomer({
        name: '',
        phoneNumber: '',
        address: '',
        // governate: '',
        address_free_text: ''
      })

      // Display success message
      setSuccess('Customer Created Successfully!')

      const createdCustomer = data.findOrCreateUser
      setSelectedCustomer(createdCustomer)
      setAddressFreeText(createdCustomer.addresses[0].details)

      setOrderMode(true)
    } catch (error) {
      console.error('Error adding customer:', error)
      setSuccess(
        'An error occurred while creating the customer. Please try again.'
      )
    }
  }

  const handleCostChange = event => {
    const value = event.target.value
    if (value === '' || !isNaN(value)) {
      setCost(value)
    }
  }

  useEffect(() => {
    if (success) {
      let timeout = setTimeout(() => {
        setOpenModal(false)
        setSuccess('')
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [success])

  const handleSubmitOrder = async e => {
    e.preventDefault()
    try {
      if (!cost || !selectedCustomer) {
        throw new Error('Cost, customer details, and address are required!')
      }

      const { _id, addresses } = selectedCustomer

      // Find the addressId based on the selected address
      const selectedAddressData = addresses.find(
        address => address.deliveryAddress === selectedAddress
      )
      // if (!selectedAddressData) {
      //   throw new Error('Selected address not found.')
      // }
      const addressId = selectedAddressData?._id || null

      const orderAmount = parseFloat(cost)
      if (isNaN(orderAmount) || orderAmount <= 0) {
        throw new Error('Please enter a valid cost greater than 0.')
      }

      // Call the checkout mutation
      await checkOutPlaceOrder({
        variables: {
          userId: _id,
          addressId,
          details: addressFreeText,
          resId: restaurantId,
          preparationTime: selectedTime,
          orderAmount
        }
      })
      setSearchQuery('')
      setSearchTrigger('')
      setCost('')
      // console.log('Order placement response:', data)
      // const orderId = data.CheckOutPlaceOrder.orderId
      // console.log('Order ID:', orderId)

      // setSuccess('Order Created Successfully!')
      // console.log('Order placed:', data.CheckOutPlaceOrder)
      // setOrderMode(false)
    } catch (err) {
      console.error('Error placing order:', err)
      setSuccess(`Error: ${err.message}`)
    }
  }

  const handleClearClick = () => {
    // setLocationAddress('')
  }

  const handleLocationSelection = selectedLocation => {
    // setLocationAddress(selectedLocation)
    const encodedLocation = encodeURIComponent(selectedLocation)
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedLocation}&key=${GOOGLE_MAPS_KEY}`
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location
          const latitude = location.lat
          const longitude = location.lng
          console.log({ longitude, latitude })
          setLatitude(latitude)
          setLongitude(longitude)
          setNewCustomer(prevCustomer => ({
            ...prevCustomer,
            address: selectedLocation
          }))
        } else {
          console.error('Location not found')
        }
      })
  }

  const handleTimeChange = e => {
    setSelectedTime(e.target.value)
  }

  if (orderMode) {
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 2,
          marginTop: 2,
          marginBottom: 2,
          borderRadius: 2,
          transition: 'all 0.3s ease-in-out',
          boxShadow: 3
        }}
        component="form"
        onSubmit={handleSubmitOrder}>
        {success && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              color: 'white', // Text color
              backgroundColor: '#32620e', // Background color
              fontWeight: 'bold',
              '& .MuiAlert-icon': {
                color: 'white' // Icon color
              }
            }}>
            {success}
          </Alert>
        )}

        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          {t('Create Order')}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Phone Number
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedCustomer?.phone || ''}
            disabled
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Name
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={selectedCustomer?.name || ''}
            disabled
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </Box>
        {selectedCustomer?.addresses?.length ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Address
            </Typography>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <Select
                labelId="address-select-label"
                value={selectedAddress || ''}
                onChange={e => {
                  console.log({ target: e.target.value })
                  setSelectedAddress(e.target.value)
                  searchAddressFreeText(e.target.value)
                }}
                sx={{
                  '& .MuiInputBase-input': { color: 'black' },
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}>
                {selectedCustomer?.addresses.map((address, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={address.deliveryAddress}
                      sx={{ color: 'black' }}>
                      {`${address.deliveryAddress} -- `}{' '}
                      <span
                        style={{
                          fontWeight: 'bold',
                          color: 'red'
                        }}>{` (${address.label}) `}</span>
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>
        ) : null}
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <Button onClick={() => setOpenModalAddress(true)}>
            Add new address
          </Button>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Address free text
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              value={addressFreeText}
              onChange={e => setAddressFreeText(e.target.value)}
              disabled
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': { borderRadius: 2 }
              }}
            />
          </FormControl>
        </Box>
        <Box mb={2}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
            Time of preparation
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Time</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={selectedTime}
              label="Time"
              onChange={handleTimeChange}
              sx={{ color: '#000' }}>
              {times?.map((time, index) => {
                return (
                  <MenuItem key={index} value={time} sx={{ color: '#000' }}>
                    {time}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Cost
          </Typography>
          <TextField
            variant="outlined"
            fullWidth
            margin="normal"
            value={cost}
            onChange={handleCostChange}
            error={!!cost && (isNaN(cost) || parseFloat(cost) <= 0)} // Error when cost is invalid
            helperText={
              cost && (isNaN(cost) || parseFloat(cost) <= 0)
                ? 'Please enter a valid cost greater than 0'
                : ''
            }
            sx={{
              '& .MuiInputBase-input': { color: 'black' },
              '& .MuiOutlinedInput-root': { borderRadius: 2 }
            }}
          />
        </Box>
        {/* Submit and Cancel Buttons */}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" fullWidth type="submit">
            Submit Order
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            sx={{ mt: 1, color: '#32620E', borderColor: '#32620E' }}
            onClick={() => {
              setOrderMode(false)
              setSearchQuery('')
              setSearchTrigger('')
              setCost('')
            }}>
            Cancel
          </Button>
        </Box>
        {/* Add new address component */}
        <AddNewAddress
          openModalAddress={openModalAddress}
          setOpenModalAddress={setOpenModalAddress}
          userId={selectedCustomer._id}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        padding: 2,
        marginTop: 2,
        marginBottom: 2,
        borderRadius: 2,
        transition: 'all 0.3s ease-in-out',
        boxShadow: 3
      }}>
      {/* Success  Message Alert */}
      {success && (
        <Alert
          className="alertSuccess"
          variant="filled"
          severity="success"
          style={{ marginBottom: '20px' }}>
          {success}
        </Alert>
      )}
      <h2>{t('Search Customer')}</h2>
      <Box component="form" onSubmit={handleSearchClick}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
          Phone Number
        </Typography>
        <TextField
          placeholder="Phone Number"
          variant="outlined"
          type="text"
          fullWidth
          margin="normal"
          sx={{
            '& .MuiInputBase-input': { color: 'black' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': { borderColor: '#ccc' },
              '&:hover fieldset': { borderColor: '#888' },
              '&.Mui-focused fieldset': { borderColor: '#000' }
            }
          }}
          value={searchQuery}
          onChange={handleSearchChange}
          // onInput={e => {
          //   // Only allow numeric characters
          //   e.target.value = e.target.value
          //     .replace(/(?!^)\+/g, '')
          //     .replace(/[^0-9+]/g, '') // Replace any non-numeric character with an empty string
          // }}
          className={
            PhoneError !== undefined &&
            (PhoneError ? globalClasses.inputError : globalClasses.inputSuccess)
          }
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          style={{ marginTop: '10px' }}>
          {t('Search Customer')}
        </Button>
      </Box>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {loading && <p>Loading...</p>}
        {!success && error && (
          <>
            <div>
              <p style={{ color: 'red', margin: '0 0 10px 0' }}>
                User does not exist.
              </p>
            </div>
            {error.message.includes(
              'No users found matching the search criteria'
            ) && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddCustomer}>
                {t('Add Customer')}
              </Button>
            )}
          </>
        )}
      </div>
      {/* add new address */}
      {/* here */}

      {/* add new customer */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="sm"
        component={'form'}
        onSubmit={handleSubmitCustomer}>
        <DialogTitle sx={{ color: 'black' }}>Add New Customer</DialogTitle>
        <DialogContent>
          {/* Phone Number Field */}
          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
              Phone Number
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#ccc', // No validation styles now
                    borderWidth: 1
                  },
                  '&:hover fieldset': { borderColor: '#888' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#000',
                    borderWidth: 1
                  }
                }
              }}
              name="phoneNumber"
              value={searchQuery} // Ensure the phone number value comes from searchQuery
              onChange={handleInputChange} // Handle input change
            />
          </Box>
          {/* Name Field */}
          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
              Name
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: validationErrors.name ? 'red' : '#ccc',
                    borderWidth: validationErrors.name ? 2 : 1
                  },
                  '&:hover fieldset': {
                    borderColor: validationErrors.name ? 'red' : '#888'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: validationErrors.name ? 'red' : '#000',
                    borderWidth: validationErrors.name ? 2 : 1
                  }
                }
              }}
              name="name"
              value={newCustomer.name}
              onChange={handleInputChange}
              error={
                validationErrors.name ||
                (newCustomer.name && !/^[A-Za-z\s]*$/.test(newCustomer.name))
              }
            />
          </Box>
          {/* Areas Field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 'bold', color: 'black' }}>
              {t('Select Area')}
            </Typography>
            <Select
              id="input-area"
              name="input-area"
              defaultValue={[selectedArea || '']}
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}
              style={{ height: '70px', width: '100%' }}>
              {!selectedArea && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select Area')}
                </MenuItem>
              )}
              {areas?.map(area => (
                <MenuItem
                  value={area._id}
                  key={area._id}
                  style={{ color: 'black' }}>
                  {area.title}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
              Address Free Text
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              margin="normal"
              sx={{
                '& .MuiInputBase-input': { color: 'black' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: validationErrors.address_free_text
                      ? 'red'
                      : '#ccc',
                    borderWidth: validationErrors.address_free_text ? 2 : 1
                  },
                  '&:hover fieldset': {
                    borderColor: validationErrors.address_free_text
                      ? 'red'
                      : '#888'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: validationErrors.address_free_text
                      ? 'red'
                      : '#000',
                    borderWidth: validationErrors.address_free_text ? 2 : 1
                  }
                }
              }}
              name="address_free_text"
              value={newCustomer.address_free_text}
              onChange={handleInputChange}
              error={
                validationErrors.address_free_text ||
                (newCustomer.address_free_text &&
                  !/^[A-Za-z\s]*$/.test(newCustomer.address_free_text))
              }
            />
          </Box>
          {/* Address Field */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
            <Divider
              orientation="horizontal"
              sx={{ background: '#6b8d51', width: '40%' }}
            />
            <Button
              onClick={() => {
                setOpenAddress(!openAddress)
              }}>
              {!openAddress ? <AddCircleIcon /> : <RemoveCircleIcon />}
            </Button>
            <Divider
              orientation="horizontal"
              sx={{ background: '#6b8d51', width: '40%' }}
            />
          </Box>

          {openAddress && (
            <Box sx={{ position: 'relative', width: '95%' }}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 1, fontWeight: 'bold', color: 'black' }}>
                Address
              </Typography>
              <PlacesAutocomplete
                value={newCustomer.address}
                onChange={text =>
                  setNewCustomer({ ...newCustomer, address: text })
                }
                onSelect={handleLocationSelection}>
                {({
                  getInputProps,
                  suggestions,
                  getSuggestionItemProps,
                  loading
                }) => (
                  <div>
                    <TextField
                      variant="outlined"
                      label={t('your_area')}
                      inputProps={{ style: { color: '#000' } }}
                      fullWidth
                      {...getInputProps()}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {loading ? (
                              <CircularProgress size={24} />
                            ) : (
                              <>
                                {newCustomer.address && (
                                  <IconButton onClick={handleClearClick}>
                                    <ClearIcon color="primary" />
                                  </IconButton>
                                )}
                                {/* <IconButton size="large">
                                <GpsFixedIcon color="primary" />
                              </IconButton> */}
                              </>
                            )}
                          </InputAdornment>
                        )
                      }}
                    />
                    <div>
                      {loading ? <div>Loading...</div> : null}
                      {suggestions.map(suggestion => {
                        const style = {
                          backgroundColor: suggestion.active
                            ? theme.palette.primary.main
                            : theme.palette.common.white,
                          color: 'black',
                          fontSize: '16px',
                          padding: '10px 16px'
                        }
                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, { style })}
                            key={suggestion.placeId}>
                            {suggestion.description}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </PlacesAutocomplete>
              {/* <GooglePlacesAutocomplete
                apiKey="AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY"
                onPlaceSelected={place => {
                  const selectedAddress = place.formatted_address || place.name

                  const latitude = place.geometry?.location?.lat() ?? null // Get latitude
                  const longitude = place.geometry?.location?.lng() ?? null // Get longitude

                  handleInputChange({
                    target: {
                      name: 'address',
                      value: selectedAddress,
                      latitude: latitude,
                      longitude: longitude
                    }
                  })
                }}
                options={{
                  types: '(regions)',
                  componentRestrictions: { country: 'eg' },
                  language: 'ar'
                }}
                style={{
                  width: '100%',
                  padding: '16.5px 14px',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  color: 'black',
                  fontSize: '16px',
                  outline: 'none'
                }}
                containerStyle={{
                  position: 'absolute', // Dropdown will appear right under the input
                  top: '100%',
                  left: 0,
                  zIndex: 2000 // Ensures dropdown is above the modal
                }}
                className="custom-autocomplete-input"
              /> */}
            </Box>
          )}

          {/* Address free text Field */}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)} color="secondary">
            Cancel
          </Button>
          <Button
            // onClick={handleSubmitCustomer}
            type="submit"
            color="primary"
            variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
AddOrder.propTypes = {
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
}
export default AddOrder
