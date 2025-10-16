import React, { useEffect, useRef, useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Alert,
  Box,
  Button,
  Input,
  MenuItem,
  Modal,
  Select,
  Typography
} from '@mui/material'
import { gql, useMutation, useQuery } from '@apollo/client'
import { createArea, editArea, getAreas, getCities } from '../../apollo'
import { GoogleMap, Marker, Polygon } from '@react-google-maps/api'

const CREATE_AREA = gql`
  ${createArea}
`

const EDIT_AREA = gql`
  ${editArea}
`

const GET_CITIES = gql`
  ${getCities}
`

const GET_AREAS = gql`
  ${getAreas}
`

const AreaCreate = ({ onClose, area }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState(area ? area.title : '')
  const [titleError, titleErrorSetter] = useState(null)
  const [address, setAddress] = useState('')
  const [addressError, addressErrorSetter] = useState(null)
  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)
  const [selectedCity, setSelectedCity] = useState(area ? area.city._id : '')
  const [drawBoundsOrMarker, setDrawBoundsOrMarker] = useState('marker')
  const [center, setCenter] = useState({ lat: 31.1107, lng: 30.9388 })
  const [marker, setMarker] = useState({ lat: 31.1107, lng: 30.9388 })

  console.log({ selectedCity })

  const { data, loading: loadingCities, error: errorCities } = useQuery(
    GET_CITIES
  )

  console.log({ area })
  useEffect(() => {
    if (area) {
      setMarker({
        lng: area.location.location.coordinates[0],
        lat: area.location.location.coordinates[1]
      })
      setCenter({
        lng: area.location.location.coordinates[0],
        lat: area.location.location.coordinates[1]
      })
    }
  }, [area])

  const cities = data?.citiesAdmin || null

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  const onCompleted = data => {
    setSuccess('Created an area successfully!')
    setTitle('')
  }

  const [mutate] = useMutation(CREATE_AREA, {
    onCompleted,
    refetchQueries: [{ query: GET_AREAS }]
  })

  const [mutateUpdate] = useMutation(EDIT_AREA, {
    onCompleted: data => {
      console.log({ data })
      setSuccess(data.editArea.message)
    },
    refetchQueries: [{ query: GET_AREAS }]
  })

  useEffect(() => {
    getAddress(marker.lat, marker.lng)
  }, [])

  const getAddress = async (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder()
    const location = { lat, lng }

    geocoder.geocode({ location }, (results, status) => {
      console.log({ results })
      if (status === 'OK') {
        if (results[0]) {
          console.log({ results })
          setAddress(results[0].formatted_address)
        } else {
          console.error('No results found')
        }
      } else {
        console.error(`Geocoder failed due to: ${status}`)
      }
    })
  }

  const onClick = e => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    if (drawBoundsOrMarker === 'marker') {
      setMarker({ lat, lng })
      getAddress(lat, lng)
    }
  }

  const removeMarker = () => {
    setMarker(null)
  }

  const onDragEnd = mapMouseEvent => {
    setMarker({
      lat: mapMouseEvent.latLng.lat(),
      lng: mapMouseEvent.latLng.lng()
    })
  }

  console.log({ marker })

  const handleSubmit = async e => {
    e.preventDefault()
    const coordinates = [marker.lng, marker.lat]

    if (!area) {
      mutate({
        variables: {
          areaInput: {
            title,
            address,
            city: selectedCity,
            coordinates
          }
        }
      })
    } else {
      mutateUpdate({
        variables: {
          id: area._id,
          locationId: area.location._id,
          areaInput: {
            title,
            address,
            city: selectedCity,
            coordinates
          }
        }
      })
    }
    // if it's edit modal
    if (onClose) {
      setTimeout(() => {
        onClose()
      }, 4000)
    }
  }

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t('Add Area')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box className={classes.form}>
            <GoogleMap
              mapContainerStyle={{
                height: '500px',
                width: '100%',
                borderRadius: 30
              }}
              id="google-map"
              zoom={14}
              center={center}
              onClick={onClick}>
              {marker && (
                <Marker
                  position={marker}
                  draggable
                  onRightClick={removeMarker}
                  onDragEnd={onDragEnd}
                />
              )}
            </GoogleMap>
          </Box>
          <Box>
            <Typography className={classes.labelText}>{t('Title')}</Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-title"
              name="input-title"
              placeholder={t('Title')}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              disableUnderline
              className={[
                globalClasses.input,
                titleError === false
                  ? globalClasses.inputError
                  : titleError === true
                  ? globalClasses.inputSuccess
                  : ''
              ]}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('Address')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-address"
              name="input-address"
              placeholder={t('Address')}
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              disableUnderline
              className={[
                globalClasses.input,
                addressError === false
                  ? globalClasses.inputError
                  : addressError === true
                  ? globalClasses.inputSuccess
                  : ''
              ]}
            />
          </Box>
          {loadingCities && <div>Loading...</div>}
          {errorCities && <div>Error {errorCities.message}</div>}
          {console.log({ cities })}
          <Box className={globalClasses.flexRow}>
            <Select
              id="input-city"
              name="input-city"
              defaultValue={selectedCity || ''}
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}>
              {!selectedCity && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select City')}
                </MenuItem>
              )}
              {cities?.map(city => (
                <MenuItem
                  value={city._id}
                  key={city._id}
                  style={{ color: 'black' }}>
                  {city.title}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Button
              className={globalClasses.button}
              // disabled={mutateLoading}
              type="submit">
              {t('Save')}
            </Button>
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
        </form>
      </Box>
    </Box>
  )
}

export default AreaCreate
