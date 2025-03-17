import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import React from 'react'
import { useState } from 'react'
import { newCheckoutPlaceOrder } from '../../apollo'
import { useMutation } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'
import { AreaContext } from '../../context/AreaContext'
import useGlobalStyles from '../../utils/globalStyles'
import useAcceptOrder from '../../context/useAcceptOrder'

const AddNewOrder = ({
  refetchOrders,
  setNewFormVisible,
  success,
  setSuccess
}) => {
  const restaurantId = localStorage.getItem('restaurantId')
  const globalClasses = useGlobalStyles()
  const { t } = useTranslation()
  const [times, setTimes] = useState([10, 20, 30, 40, 50, 60, 70, 80, 90])
  const [selectedTime, setSelectedTime] = useState(times[1])
  const [cost, setCost] = useState(0)
  const [selectedArea, setSelectedArea] = useState(null)
  const [values, setValues] = useState({
    phone: '',
    name: '',
    addressDetails: ''
  })
  const { areas } = useContext(AreaContext)
  const { acceptOrder } = useAcceptOrder()

  const { phone, name, addressDetails } = values

  const [mutateCreateOrder] = useMutation(newCheckoutPlaceOrder, {
    onCompleted: data => {
      console.log({ data })
      setSuccess('Order Created Successfully!')
      refetchOrders()
      acceptOrder(
        data.newCheckoutPlaceOrder._id,
        restaurantId,
        selectedTime.toString()
      )
      setNewFormVisible(false)
    }
  })

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleTimeChange = e => {
    setSelectedTime(e.target.value)
  }

  console.log({ selectedArea })

  const handleSubmitOrder = e => {
    e.preventDefault()
    if (!phone) {
      alert('Please add phone number')
      return
    }
    if (!selectedArea) {
      alert('Please select area')
      return
    }
    mutateCreateOrder({
      variables: {
        input: {
          name,
          phone,
          restaurantId,
          addressDetails,
          areaId: selectedArea,
          preparationTime: selectedTime,
          orderAmount: parseFloat(cost) ? parseFloat(cost) : 0
        }
      }
    })
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
          Phone Number *
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          name="phone"
          value={phone || ''}
          sx={{
            '& .MuiInputBase-input': { color: 'black' },
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
          onChange={handleChange}
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
          name="name"
          value={name || ''}
          sx={{
            '& .MuiInputBase-input': { color: 'black' },
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
          onChange={handleChange}
        />
      </Box>
      {/* Areas Field */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color: 'black' }}>
          {t('Select Area')} *
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
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 'bold', color: 'black' }}>
          Address Free Text
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          placeholder={'ex: 2nd floor'}
          sx={{
            '& .MuiInputBase-input': { color: 'black' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '& fieldset': {
                color: '#ccc',
                borderWidth: 1
              },
              '&:hover fieldset': {
                borderColor: '#888'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#000',
                borderWidth: 1
              }
            }
          }}
          name="addressDetails"
          value={addressDetails}
          onChange={handleChange}
        />
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
          type="number"
          variant="outlined"
          fullWidth
          margin="normal"
          value={cost}
          onChange={e => setCost(e.target.value)}
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
            setCost('')
          }}>
          Cancel
        </Button>
      </Box>
      {/* Add new address component */}
      {/* <AddNewAddress
        openModalAddress={openModalAddress}
        setOpenModalAddress={setOpenModalAddress}
        userId={selectedCustomer._id}
      /> */}
    </Box>
  )
}

export default AddNewOrder
