import React, { useState, useRef, useCallback } from 'react'
import { useMutation, gql, useQuery } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { useTranslation, withTranslation } from 'react-i18next'

import { GoogleMap, Polygon } from '@react-google-maps/api'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Box,
  Typography,
  Input,
  Button,
  Alert,
  Grid,
  Select,
  MenuItem
} from '@mui/material'

// core components
import {
  createDeliveryZone,
  editZone,
  getAllDeliveryZones,
  getCities,
  getZones,
  updateDeliveryZone
} from '../../apollo'
import { transformPath, transformPolygon } from '../../utils/coordinates'
import ConfigurableValues from '../../config/constants'

const CREATE_ZONE = gql`
  ${createDeliveryZone}
`
const EDIT_ZONE = gql`
  ${editZone}
`
const GET_ZONE = gql`
  ${getAllDeliveryZones}
`

const GET_CITIES = gql`
  ${getCities}
`

const DeliveryZoneCreate = ({ zone, edit }) => {
  console.log({ zone })
  const [path, setPath] = useState(
    zone ? transformPolygon(zone.location.coordinates[0]) : []
  )
  const { PAID_VERSION } = ConfigurableValues()
  const [title, setTitle] = useState(zone ? zone.title : '')
  const [description, setDescription] = useState(zone ? zone.description : '')
  const listenersRef = useRef([])
  const [errors, setErrors] = useState('')
  const [success, setSuccess] = useState('')
  const [titleError, setTitleError] = useState(null)
  const [descriptionError, setDescriptionError] = useState(null)
  const [selectedCity, setSelectedCity] = useState(
    edit && zone ? zone.city : ''
  )

  console.log({ title })

  const { data, loading: loadingCities, error: errorCities } = useQuery(
    GET_CITIES
  )

  const cities = data?.citiesAdmin || null

  console.log({ cities: data })

  const onCompleted = data => {
    if (!zone) clearFields()
    const message = zone
      ? t('ZoneUpdatedSuccessfully')
      : t('ZoneAddedSuccessfully')
    setErrors('')
    setSuccess(message)
    setTimeout(hideAlert, 3000)
  }

  const onError = error => {
    setErrors(error.message)
    setSuccess('')
    setTimeout(hideAlert, 3000)
  }

  const [mutate] = useMutation(CREATE_ZONE, {
    refetchQueries: [{ query: GET_ZONE }],
    onError,
    onCompleted
  })

  const [mutateUpdate] = useMutation(updateDeliveryZone, {
    refetchQueries: [{ query: GET_ZONE }],
    onError,
    onCompleted
  })

  const [center] = useState(
    zone
      ? setCenter(zone.location.coordinates[0])
      : { lat: 31.1107, lng: 30.9388 }
  )

  const polygonRef = useRef()

  const onClick = e => {
    setPath([...path, { lat: e.latLng.lat(), lng: e.latLng.lng() }])
  }

  // Call setPath with new edited path
  const onEdit = useCallback(() => {
    if (polygonRef.current) {
      const nextPath = polygonRef.current
        .getPath()
        .getArray()
        .map(latLng => {
          return { lat: latLng.lat(), lng: latLng.lng() }
        })
      setPath(nextPath)
    }
  }, [setPath])

  const onLoadPolygon = useCallback(
    polygon => {
      polygonRef.current = polygon
      const path = polygon.getPath()
      listenersRef.current.push(
        path.addListener('set_at', onEdit),
        path.addListener('insert_at', onEdit),
        path.addListener('remove_at', onEdit)
      )
    },
    [onEdit]
  )

  const onUnmount = useCallback(() => {
    listenersRef.current.forEach(lis => lis.remove())
    polygonRef.current = null
  }, [])

  function setCenter(coordinates) {
    return { lat: coordinates[0][1], lng: coordinates[0][0] }
  }

  const onSubmitValidation = () => {
    setErrors('')
    const titleErrors = !validateFunc({ title: title }, 'title')
    const descriptionErrors = !validateFunc(
      { description: description },
      'description'
    )
    let zoneErrors = true
    if (path.length < 3) {
      zoneErrors = false
      setErrors(t('SetZoneOnMap'))
      return false
    }

    setTitleError(titleErrors)
    setDescriptionError(descriptionErrors)
    return titleErrors && descriptionErrors && zoneErrors
  }

  const clearFields = () => {
    setTitle('')
    setDescription('')
    setTitleError(null)
    setDescriptionError(null)
    setPath([])
  }

  const hideAlert = () => {
    setErrors('')
    setSuccess('')
  }

  const { t } = useTranslation()

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box item className={zone ? classes.headingBlack : classes.heading}>
          <Typography
            variant="h6"
            className={zone ? classes.textWhite : classes.text}
            sx={{ textTransform: 'capitalize' }}>
            {zone ? t('EditDeliveryZone') : t('AddDeliveryZone')}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t('Title')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-title"
                  placeholder={t('Title')}
                  type="text"
                  value={title}
                  onChange={event => {
                    setTitle(event.target.value)
                  }}
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t('Description')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-description"
                  placeholder={t('Description')}
                  type="text"
                  value={description}
                  onChange={event => {
                    setDescription(event.target.value)
                  }}
                  disableUnderline
                  className={[
                    globalClasses.input,
                    descriptionError === false
                      ? globalClasses.inputError
                      : descriptionError === true
                      ? globalClasses.inputSuccess
                      : ''
                  ]}
                />
              </Box>
            </Grid>
            <Box
              sx={{ width: '100%', flexDirection: 'column' }}
              className={globalClasses.flexRow}>
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
          </Grid>
          <Box mt={2} className={globalClasses.flexRow}>
            <GoogleMap
              mapContainerStyle={{
                height: '500px',
                width: '100%'
              }}
              id="example-map"
              zoom={14}
              center={center}
              onClick={onClick}>
              <Polygon
                // Make the Polygon editable / draggable
                editable
                draggable
                path={path}
                // Event used when manipulating and adding points
                onMouseUp={onEdit}
                // Event used when dragging the whole Polygon
                onDragEnd={onEdit}
                onLoad={onLoadPolygon}
                onUnmount={onUnmount}
              />
            </GoogleMap>
          </Box>
          <Box>
            <Button
              className={globalClasses.button}
              disabled={!PAID_VERSION}
              onClick={async e => {
                e.preventDefault()
                if (onSubmitValidation()) {
                  if (!edit) {
                    mutate({
                      variables: {
                        deliveryZoneInput: {
                          _id: '',
                          title,
                          description,
                          coordinates: transformPath(path),
                          city: selectedCity
                        }
                      }
                    })
                  } else {
                    mutateUpdate({
                      variables: {
                        deliveryZoneInput: {
                          _id: zone ? zone._id : '',
                          title,
                          description,
                          coordinates: transformPath(path),
                          city: selectedCity
                        }
                      }
                    })
                  }
                }
              }}>
              {edit ? t('Update') : t('Save')}
            </Button>
          </Box>
        </form>
        <Box mt={2}>
          {success && (
            <Alert
              className={globalClasses.alertSuccess}
              variant="filled"
              severity="success">
              {success}
            </Alert>
          )}
          {errors && (
            <Alert
              className={globalClasses.alertError}
              variant="filled"
              severity="error">
              {errors}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default withTranslation()(DeliveryZoneCreate)
