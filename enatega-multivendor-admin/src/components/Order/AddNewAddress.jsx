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
  Divider
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
import { UPDATE_USER_ADDRESS } from '../../apollo'
import { useTranslation } from 'react-i18next'

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

const AddNewAddress = ({ openModalAddress, setOpenModalAddress, userId }) => {
  const { t } = useTranslation()
  const globalClasses = useGlobalStyles()

  const [openAddress, setOpenAddress] = useState(false)
  const [locationAddress, setLocationAddress] = useState('')
  const [details, setDetails] = useState('')
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [selectedArea, setSelectedArea] = useState('')
  const { areas } = useContext(AreaContext)
  console.log({ areas })
  const [updateUserAddress] = useMutation(UPDATE_USER_ADDRESS, {
    // refetchQueries: GET_USERS_BY_SEARCH,
    onCompleted: () => {
      setLocationAddress('')
      setDetails('')
      setLatitude('')
      setLongitude('')
      setSelectedArea('')
      setOpenAddress(false)
      setOpenModalAddress(false)
    }
  })

  console.log({ selectedArea })

  const handleSubmitAddress = e => {
    e.preventDefault()
    console.log('adding new address')
    let addresses = []
    if (locationAddress) {
      const addressItem = {
        deliveryAddress: `${locationAddress}`,
        details: details || 'No address detail is given',
        label: 'Home',
        selected: true,
        latitude: String(latitude),
        longitude: String(longitude)
      }
      addresses.push(addressItem)
    }
    // if(selectedArea) {
    //   const addressItem = {
    //     // deliveryAddress: `${locationAddress}`,
    //     details: details || 'No address detail is given',
    //     label: 'Home',
    //     selected: true,
    //     latitude: String(latitude),
    //     longitude: String(longitude)
    //   }
    //   addresses.push(addressItem)
    // }
    updateUserAddress({
      variables: {
        userInput: {
          userId,
          area: selectedArea,
          details: details,
          addresses,
          type: locationAddress.length ? 'google_api' : 'area'
        }
      }
    })
  }

  return (
    <Dialog
      open={openModalAddress}
      onClose={() => setOpenModalAddress(false)}
      fullWidth
      maxWidth="sm"
      component={'form'}
      onSubmit={handleSubmitAddress}>
      <DialogTitle sx={{ color: 'black' }}>Add New Address</DialogTitle>
      <DialogContent>
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
              '& .MuiInputBase-input': { color: 'black' }
              // '& .MuiOutlinedInput-root': {
              //   borderRadius: 2,
              //   '& fieldset': {
              //     borderColor: validationErrors.address_free_text
              //       ? 'red'
              //       : '#ccc',
              //     borderWidth: validationErrors.address_free_text ? 2 : 1
              //   },
              //   '&:hover fieldset': {
              //     borderColor: validationErrors.address_free_text
              //       ? 'red'
              //       : '#888'
              //   },
              //   '&.Mui-focused fieldset': {
              //     borderColor: validationErrors.address_free_text
              //       ? 'red'
              //       : '#000',
              //     borderWidth: validationErrors.address_free_text ? 2 : 1
              //   }
              // }
            }}
            name="address_free_text"
            value={details}
            onChange={e => setDetails(e.target.value)}
            // error={
            //   validationErrors.address_free_text ||
            //   (newCustomer.address_free_text &&
            //     !/^[A-Za-z\s]*$/.test(newCustomer.address_free_text))
            // }
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
            <GooglePlacesAutocomplete
              apiKey="AIzaSyCaXzEgiEKTtQgQhy0yPuBDA4bD7BFoPOY" // Replace this with your Google API key
              onPlaceSelected={place => {
                const selectedAddress = place.formatted_address || place.name
                const newLatitude = place.geometry?.location?.lat() ?? null // Get latitude
                const newLongitude = place.geometry?.location?.lng() ?? null // Get longitude
                setLocationAddress(selectedAddress)
                setLatitude(newLatitude)
                setLongitude(newLongitude)
              }}
              options={{
                types: ['address'],
                componentRestrictions: { country: 'eg' }
              }}
              style={{
                width: '100%',
                padding: '16.5px 14px',
                borderRadius: '4px',
                //  border: `1px solid ${validationErrors.address ? "red" : "#ccc"}`,
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
            />
          </Box>
        )}

        {/* Address free text Field */}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpenModalAddress(false)} color="secondary">
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
  )
}

export default AddNewAddress
