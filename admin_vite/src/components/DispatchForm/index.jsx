import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  debounce,
  FormControl,
  Grid,
  Input,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import useStyles from '../styles'
import useGlobalStyles from '../../utils/globalStyles'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  adminCheckout,
  adminOrderUpdate,
  getCities,
  getCityAreas,
  getDeliveryCalculation,
  searchRestaurants,
  searchRiders
} from '../../apollo'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

const GET_AREAS = gql`
  ${getCityAreas}
`

const GET_CITIES = gql`
  ${getCities}
`

const DispatchForm = ({ order, refetchOrders }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [titleError, setTitleError] = useState(null)
  const [mainError, setMainError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [restaurantOptions, setRestaurantOptions] = useState([])
  const [ridersOptions, setRidersOptions] = useState([])
  const [selectedRestaurants, setSelectedRestaurants] = useState(null)
  const [selectedRiders, setSelectedRiders] = useState(null)
  const [times, setTimes] = useState([10, 20, 30, 40, 50, 60, 70, 80, 90])
  const [cost, setCost] = useState(
    order?.orderAmount && order?.deliveryCharges
      ? order?.orderAmount - order?.deliveryCharges
      : ''
  )
  const [selectedTime, setSelectedTime] = useState(times[1])
  const [loaded, setLoaded] = useState(false)

  console.log({ order })

  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities,
    refetch: refetchCities
  } = useQuery(GET_CITIES)

  const cities = dataCities ? dataCities.citiesAdmin : []
  console.log({ cities })

  const [
    fetchAreas,
    { data, loading: loadingAreas, error: errorAreas, refetch: refetchAreas }
  ] = useLazyQuery(GET_AREAS, {
    skip: !selectedCity
  })

  const areas = data ? data.areasByCity : []

  useEffect(() => {
    if (order) {
      fetchAreas({
        variables: {
          id: selectedCity || order?.restaurant?.city?._id || ''
        }
      })
      setSelectedCity(order?.restaurant?.city?._id || '')
      setSelectedRestaurants(order?.restaurant || null)
      setSelectedRiders(order?.rider || null)
      setSelectedTime(order?.preparationTime || times[1])
    }
  }, [order])

  useEffect(() => {
    // when areas arrive, validate current area id
    if (areas?.length && order?.area) {
      const found = areas.some(a => a._id === order.area)
      setSelectedArea(found ? order.area : '')
    }
  }, [areas])

  const [
    fetchRestaurants,
    { data: dataRestaurants, loading: loadingRestaurants }
  ] = useLazyQuery(searchRestaurants, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log({ data })
      setRestaurantOptions(data?.searchRestaurants || [])
    }
  })
  const [fetchRiders, { loading: loadingRiders }] = useLazyQuery(searchRiders, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log({ data })
      setRidersOptions(data?.searchRiders || [])
    }
  })

  const [
    fetchDeliveryCost,
    { data: calcData, loading: calcLoading, error: errorCalc }
  ] = useLazyQuery(getDeliveryCalculation, {
    onCompleted: res => {
      console.log({ resDelivery: res })
      setLoaded(true)
    },
    nextFetchPolicy: 'network-only',
    pollInterval: 10000
  })

  const deliveryAmount = calcData?.getDeliveryCalculation?.amount || 0

  console.log({ deliveryAmount })

  useEffect(() => {
    if (selectedArea && areas && selectedRestaurants) {
      const foundArea = areas.find(item => item._id === selectedArea)
      console.log({ foundArea })
      fetchDeliveryCost({
        variables: {
          // input: {
          destLong: foundArea?.location?.location?.coordinates
            ? Number(foundArea?.location?.location?.coordinates[0])
            : null,
          destLat: foundArea?.location?.location?.coordinates
            ? Number(foundArea?.location?.location?.coordinates[1])
            : null,
          originLong: selectedRestaurants?.location?.coordinates
            ? Number(selectedRestaurants?.location?.coordinates[0])
            : null,
          originLat: selectedRestaurants?.location?.coordinates
            ? Number(selectedRestaurants?.location?.coordinates[1])
            : null,
          restaurantId: selectedRestaurants?._id
          // }
        }
      })
    }
  }, [selectedArea, selectedRestaurants])

  const debouncedSearchRestaurants = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchRestaurants({ variables: { search: value } })
        }
      }, 300),
    [fetchRestaurants]
  )

  const handleRestaurantSelect = newValue => {
    console.log({ newValue })
    setSelectedRestaurants(newValue)
  }

  const debouncedSearchRiders = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchRiders({ variables: { search: value } })
        }
      }, 300),
    [fetchRiders]
  )

  const handleRiderselect = newValue => {
    console.log({ newValue })
    setSelectedRiders(newValue)
  }

  const handleChangeCity = e => {
    setSelectedCity(e.target.value)
    fetchAreas({
      variables: {
        id: e.target.value
      }
    })
  }

  const handleTimeChange = e => {
    setSelectedTime(e.target.value)
  }

  const [mutateCreateOrder] = useMutation(adminCheckout, {
    onCompleted: res => {
      console.log({ res })
      setMainError(null)
      setSuccess('Order created successfully')
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
      setSelectedArea('')
      setSelectedCity('')
      setCost('')
      setSelectedRestaurants(null)
      setSelectedRiders(null)
      setSelectedTime(times[1])
      setLoaded(false)
      refetchOrders()
    },
    onError: err => {
      console.log({ err })
      // setMainError(err.message)
      // setSuccess(null)
    }
  })
  const [mutateUpdateOrder] = useMutation(adminOrderUpdate, {
    onCompleted: res => {
      console.log({ res })
      setMainError(null)
      setSuccess('Order created successfully')
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
      setSelectedArea('')
      setSelectedCity('')
      setCost('')
      setSelectedRestaurants(null)
      setSelectedRiders(null)
      setSelectedTime(times[1])
      setLoaded(false)
      refetchOrders()
    },
    onError: err => {
      console.log({ err })
      // setMainError(err.message)
      // setSuccess(null)
    }
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!selectedCity) {
      setMainError('Please select city')
      return
    }
    if (!selectedArea) {
      setMainError('Please select area')
      return
    }
    if (!selectedRestaurants) {
      setMainError('Please select business')
      return
    }
    if (!order) {
      mutateCreateOrder({
        variables: {
          input: {
            restaurant: selectedRestaurants?._id,
            area: selectedArea,
            time: selectedTime,
            rider: selectedRiders?._id,
            deliveryAmount: parseInt(deliveryAmount) || 0,
            cost: parseFloat(cost) || 0
          }
        }
      })
    } else {
      mutateUpdateOrder({
        variables: {
          id: order._id,
          input: {
            // restaurant: selectedRestaurants?._id,
            area: selectedArea,
            time: selectedTime,
            rider: selectedRiders?._id,
            deliveryAmount: parseInt(deliveryAmount) || 0,
            cost: parseFloat(cost) || 0
          }
        }
      })
    }
  }

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {!order ? t('Create Order') : t('Edit Order')}
          </Typography>
        </Box>
      </Box>
      <Box mt={2}>
        {success && (
          <Alert
            className={globalClasses.alertSuccess}
            variant="filled"
            severity="success">
            {success}
          </Alert>
        )}
        {mainError && (
          <Alert
            className={globalClasses.alertError}
            variant="filled"
            severity="error">
            {mainError}
          </Alert>
        )}
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Select City')}
            </Typography> */}
            <Select
              id="city"
              name="city"
              defaultValue={selectedCity || ''}
              value={selectedCity}
              onChange={handleChangeCity}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}>
              {!selectedCity && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select City')}
                </MenuItem>
              )}
              {cities?.length &&
                cities?.map(city => (
                  <MenuItem
                    value={city._id}
                    key={city._id}
                    style={{ color: 'black' }}>
                    {city.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ mb: 2 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Select Area')}
            </Typography> */}
            <Select
              id="area"
              name="area"
              defaultValue={order?.area || ''}
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}>
              {!selectedArea && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select Area')}
                </MenuItem>
              )}
              {areas?.length &&
                areas?.map(area => (
                  <MenuItem
                    value={area._id}
                    key={area._id}
                    style={{ color: 'black' }}>
                    {area.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ mb: 2, marginInlineStart: 4 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Business')}
            </Typography> */}
            <Autocomplete
              options={restaurantOptions || []}
              value={selectedRestaurants}
              onChange={(e, newValue) => handleRestaurantSelect(newValue)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(event, inputValue) => {
                debouncedSearchRestaurants(inputValue)
              }}
              getOptionLabel={option => option.name}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Business"
                  className={globalClasses.input}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'black',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    }
                  }}
                />
              )}
              sx={{
                width: '100%',
                margin: '0 0 0 0',
                padding: '0px 0px',
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    color: 'black',
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2, marginInlineStart: 4 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Rider')}
            </Typography> */}
            <Autocomplete
              filterOptions={x => x} // 👈 disable built-in filtering
              loading={loadingRiders} // 👈 show spinner
              options={ridersOptions || []}
              value={selectedRiders}
              onChange={(e, newValue) => handleRiderselect(newValue)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(event, inputValue) => {
                debouncedSearchRiders(inputValue)
              }}
              getOptionLabel={option =>
                option?.name || option?.phone || option?.username || ''
              }
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Rider"
                  className={globalClasses.input}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'black',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    }
                  }}
                />
              )}
              sx={{
                width: '100%',
                margin: '0 0 0 0',
                padding: '0px 0px',
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    color: 'black',
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Box>

          <Box mb={2}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                color: '#000',
                textAlign: 'left'
              }}>
              {t('time_preparation')}
            </Typography>
            <FormControl fullWidth>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedTime}
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
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', color: '#000', textAlign: 'left' }}>
              {t('cost')}
            </Typography>
            <TextField
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="e.g. 15"
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

          {calcLoading && (
            <Grid item xs={12}>
              <Typography>Calculating price...</Typography>
            </Grid>
          )}
          {deliveryAmount && loaded && dataRestaurants ? (
            <Grid item xs={12}>
              <Typography style={{ color: '#000' }}>
                Delivery Amount: {deliveryAmount} EGP
              </Typography>
            </Grid>
          ) : null}

          <Box>
            <Button
              className={globalClasses.button}
              // disabled={mutateLoading}
              type="submit">
              {t('Save')}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  )
}

export default DispatchForm
