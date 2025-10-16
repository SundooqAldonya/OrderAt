import React, { useEffect, useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import { Alert, Box, Button, Input, Modal, Typography } from '@mui/material'
import { gql, useMutation } from '@apollo/client'
import { createCity, editCity, getCities } from '../../apollo'
import { GoogleMap, Marker, Polygon } from '@react-google-maps/api'

const CREATE_CITY = gql`
  ${createCity}
`
const EDIT_CITY = gql`
  ${editCity}
`
const GET_CITIES = gql`
  ${getCities}
`

const CityForm = ({ onClose, city }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  console.log({ city })

  const [title, setTitle] = useState(city ? city.title : '')
  const [titleError, titleErrorSetter] = useState(null)
  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)
  const [drawBoundsOrMarker, setDrawBoundsOrMarker] = useState('marker')
  const [center, setCenter] = useState({ lat: 31.1107, lng: 30.9388 })
  const [marker, setMarker] = useState({ lat: 31.1107, lng: 30.9388 })

  useEffect(() => {
    if (city && city.location) {
      setMarker({
        lng: city.location.location.coordinates[0],
        lat: city.location.location.coordinates[1]
      })
      setCenter({
        lng: city.location.location.coordinates[0],
        lat: city.location.location.coordinates[1]
      })
    }
  }, [city])

  const onCompleted = data => {
    if (!city) {
      setSuccess('Created a city successfully!')
    } else {
      setSuccess('Updated city successfully!')
    }
  }
  const [mutate] = useMutation(CREATE_CITY, {
    onCompleted,
    refetchQueries: [{ query: GET_CITIES }]
  })

  const [mutateUpdate] = useMutation(EDIT_CITY, {
    onCompleted,
    refetchQueries: [{ query: GET_CITIES }]
  })

  const onClick = e => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    if (drawBoundsOrMarker === 'marker') {
      setMarker({ lat, lng })
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

  const handleSubmit = async e => {
    e.preventDefault()
    const coordinates = [+marker.lng, +marker.lat]
    if (!city) {
      mutate({
        variables: {
          title,
          coordinates
        }
      })
    } else {
      mutateUpdate({
        variables: {
          id: city._id,
          title,
          locationId: city.location?._id,
          coordinates
        }
      })
    }
    setTitle('')
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
            {!city ? t('Add City') : t('Edit City')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box>
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

export default CityForm
