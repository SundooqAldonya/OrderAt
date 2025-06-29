import React, { useRef, useState, Fragment } from 'react'
import { Container, Grid, TextField, Button } from '@mui/material'
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'
import Header from '../components/Headers/Header'
import useGlobalStyles from '../utils/globalStyles'
import AutocompleteInput from '../components/AutocompleteInput'
import FromIcon from '../assets/delivery_from.png'
import ToIcon from '../assets/delivery_to.png'

const containerStyle = {
  width: '100%',
  height: '500px'
}

const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357
}

const OtlobMandoob = () => {
  const globalClasses = useGlobalStyles()
  const mapRef = useRef(null)

  const [pickup, setPickup] = useState({
    lat: 30.0444,
    lng: 31.2357,
    address: ''
  })
  const [dropoff, setDropoff] = useState({ lat: null, lng: null, address: '' })
  const [details, setDetails] = useState('')
  const [activeField, setActiveField] = useState('pickup')

  const handleMapClick = e => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    const geocoder = new window.google.maps.Geocoder()
    const latLng = { lat, lng }

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address
        if (activeField === 'pickup') {
          setPickup({ lat, lng, address })
        } else {
          setDropoff({ lat, lng, address })
        }
      }
    })
  }

  return (
    <Fragment>
      <Header />
      <Container className={globalClasses.flex} sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GoogleMap
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
            </GoogleMap>
          </Grid>

          <Grid item xs={12} md={6}>
            <AutocompleteInput
              label="Pickup Address"
              value={pickup.address}
              onSelect={selected => {
                setPickup(selected)
                setActiveField('pickup')
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AutocompleteInput
              label="Drop-off Address"
              value={dropoff.address}
              onSelect={selected => {
                setDropoff(selected)
                setActiveField('dropoff')
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              label="Details of items"
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

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              disabled={!pickup.lat || !dropoff.lat}
              onClick={() => {
                console.log('Pickup:', pickup)
                console.log('Drop-off:', dropoff)
              }}>
              Next
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Fragment>
  )
}

export default OtlobMandoob
