import React, { useRef, useState, Fragment, useEffect } from 'react'
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import Header from '../components/Headers/Header'
import useGlobalStyles from '../utils/globalStyles'
import AutocompleteInput from '../components/AutocompleteInput'
import FromIcon from '../assets/delivery_from.png'
import ToIcon from '../assets/delivery_to.png'
import { useTranslation } from 'react-i18next'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  getCities,
  getCityAreas,
  getDeliveryCalculation
} from '../apollo/queries'
import { createDeliveryRequestAdmin } from '../apollo/mutations'
import { NotificationManager } from 'react-notifications'

const containerStyle = {
  width: '100%',
  height: '500px'
}

const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357
}

const GET_CITIES = gql`
  ${getCities}
`
const GET_CITY_AREAS = gql`
  ${getCityAreas}
`

const OtlobMandoob = () => {
  const { t } = useTranslation()
  const globalClasses = useGlobalStyles()
  const mapRef = useRef(null)
  // const [city, setCity] = useState('')
  // const [from, setFrom] = useState('')
  // const [to, setTo] = useState('')
  const [values, setValues] = useState({
    city: '',
    from: '',
    to: ''
  })
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedArea1, setSelectedArea1] = useState('')
  const [selectedArea2, setSelectedArea2] = useState('')
  const { city, from, to } = values
  const [pickup, setPickup] = useState({
    lat: 30.0444,
    lng: 31.2357,
    address: ''
  })
  const [dropoff, setDropoff] = useState({ lat: null, lng: null, address: '' })
  const [details, setDetails] = useState('')
  const [activeField, setActiveField] = useState('pickup')
  const [loaded, setLoaded] = useState(false)

  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities
  } = useQuery(GET_CITIES)

  const [
    getCityAreas1,
    { data: dataAreas1, loading: loadingAreas1, error: errorAreas1 }
  ] = useLazyQuery(GET_CITY_AREAS)

  const [
    getCityAreas2,
    { data: dataAreas2, loading: loadingAreas2, error: errorAreas2 }
  ] = useLazyQuery(GET_CITY_AREAS)

  const areas1 = dataAreas1?.areasByCity || null
  const areas2 = dataAreas2?.areasByCity || null

  const [
    fetchDeliveryCost,
    { data: calcData, loading: calcLoading, error: errorCalc }
  ] = useLazyQuery(getDeliveryCalculation, {
    onCompleted: res => {
      setLoaded(true)
    }
  })

  console.log({ calcData })
  const deliveryAmount = calcData?.getDeliveryCalculation?.amount || null

  useEffect(() => {
    if (from.length && to.length) {
      const foundArea1 = areas1?.find(item => item._id === from)
      const foundArea2 = areas2?.find(item => item._id === to)
      console.log({ foundArea1, foundArea2 })
      fetchDeliveryCost({
        variables: {
          // input: {
          destLong: Number(foundArea1.location.location.coordinates[0]),
          destLat: Number(foundArea1.location.location.coordinates[1]),
          originLong: Number(foundArea2.location.location.coordinates[0]),
          originLat: Number(foundArea2.location.location.coordinates[1])
          // }
        }
      })
    }
  }, [from, to])

  const cities = dataCities?.citiesAdmin || null
  console.log({ dataAreas1, dataAreas2 })

  // const handleMapClick = e => {
  //   const lat = e.latLng.lat()
  //   const lng = e.latLng.lng()

  //   const geocoder = new window.google.maps.Geocoder()
  //   const latLng = { lat, lng }

  //   geocoder.geocode({ location: latLng }, (results, status) => {
  //     if (status === 'OK' && results[0]) {
  //       const address = results[0].formatted_address
  //       if (activeField === 'pickup') {
  //         setPickup({ lat, lng, address })
  //       } else {
  //         setDropoff({ lat, lng, address })
  //       }
  //     }
  //   })
  // }

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
    if (e.target.name === 'city') {
      getCityAreas1({ variables: { id: e.target.value } })
      getCityAreas2({ variables: { id: e.target.value } })
    }
  }

  const [mutate] = useMutation(createDeliveryRequestAdmin, {
    onCompleted: res => {
      console.log({ res })
      setValues({
        city: '',
        from: '',
        to: ''
      })
      setSelectedArea1('')
      setSelectedArea2('')
      setDetails('')
      setLoaded(false)
    },
    onError: err => {
      console.log({ err })
    }
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!phone.length) {
      NotificationManager.error(
        t('Error'),
        t('Phone number is required!'),
        3000
      )
      return
    }
    if (phone.length > 11 || phone.length < 11) {
      NotificationManager.error(
        t('Error'),
        t('Phone number must be less than 11 digits!'),
        3000
      )
      return
    }
    const foundArea1 = areas1?.find(item => item._id === from)
    const foundArea2 = areas2?.find(item => item._id === to)
    const payload = {
      pickupLat: +foundArea1?.location.location.coordinates[1],
      pickupLng: +foundArea1?.location.location.coordinates[0],
      pickupAddressText: '',
      pickupAddressFreeText: '',
      dropoffLat: +foundArea2?.location.location.coordinates[1],
      dropoffLng: +foundArea2?.location.location.coordinates[0],
      dropoffAddressText: '',
      dropoffAddressFreeText: '',
      deliveryFee: deliveryAmount,
      requestChannel: 'admin',
      is_urgent: false,
      notes: details,
      phone,
      name
    }

    mutate({
      variables: {
        input: {
          ...payload
        }
      }
    })
  }

  return (
    <Fragment>
      <Header />
      <Container className={globalClasses.flex} sx={{ mt: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* <GoogleMap
              mapContainerStyle={containerStyle}
              center={
                pickup.lat
                  ? { lat: pickup.lat, lng: pickup.lng }
                  : defaultCenter
              }
              zoom={13}
              onClick={handleMapClick}
              onLoad={map => (mapRef.current = map)}>
              {pickup.lat && (
                <Marker
                  position={{ lat: pickup.lat, lng: pickup.lng }}
                  icon={{
                    url: FromIcon, // this must be a URL or imported image string
                    scaledSize: new window.google.maps.Size(40, 40) // 👈 set the size here
                  }}
                />
              )}
              {dropoff.lat && (
                <Marker
                  position={{ lat: dropoff.lat, lng: dropoff.lng }}
                  icon={{
                    url: ToIcon, // this must be a URL or imported image string
                    scaledSize: new window.google.maps.Size(40, 40) // 👈 set the size here
                  }}
                />
              )}
            </GoogleMap> */}
            </Grid>

            <Grid item xs={12} md={12}>
              {/* <Typography variant="h5">City</Typography> */}
              <FormControl sx={{ backgroundColor: '#fff' }} fullWidth>
                <InputLabel id="demo-simple-select-label">City</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={city}
                  name="city"
                  label="City"
                  onChange={handleChange}
                  sx={{ color: '#000' }}>
                  {cities?.map(item => {
                    return (
                      <MenuItem
                        key={item._id}
                        sx={{ color: '#000' }}
                        value={item._id}>
                        {item.title}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            {city ? (
              <Fragment>
                <Grid item xs={12} md={6}>
                  <FormControl sx={{ backgroundColor: '#fff' }} fullWidth>
                    <InputLabel id="demo-simple-select-label">From</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="from"
                      value={from}
                      label="From"
                      onChange={handleChange}
                      sx={{ color: '#000' }}>
                      {dataAreas1?.areasByCity?.map(item => {
                        return (
                          <MenuItem
                            key={item._id}
                            sx={{ color: '#000' }}
                            value={item._id}>
                            {item.title}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl sx={{ backgroundColor: '#fff' }} fullWidth>
                    <InputLabel id="demo-simple-select-label">To</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      name="to"
                      value={to}
                      label="To"
                      onChange={handleChange}
                      sx={{ color: '#000' }}>
                      {dataAreas1?.areasByCity?.map(item => {
                        return (
                          <MenuItem
                            key={item._id}
                            sx={{ color: '#000' }}
                            value={item._id}>
                            {item.title}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Fragment>
            ) : null}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                label="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxRows={1}
                sx={{
                  background: '#fff',
                  '& .MuiInputBase-input': {
                    color: '#000'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                label="Phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxRows={1}
                sx={{
                  background: '#fff',
                  '& .MuiInputBase-input': {
                    color: '#000'
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                label="Delivery details"
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
                sx={{
                  background: '#fff',
                  '& .MuiInputBase-input': {
                    color: '#000'
                  }
                }}
              />
            </Grid>
            {calcLoading && (
              <Grid item xs={12}>
                <Typography>Calculating price...</Typography>
              </Grid>
            )}
            {deliveryAmount && loaded ? (
              <Grid item xs={12}>
                <Typography>Delivery Amount: {deliveryAmount} EGP</Typography>
              </Grid>
            ) : null}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                disabled={!deliveryAmount}
                type="submit">
                {t('submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </Fragment>
  )
}

export default OtlobMandoob
