import React, { useState, useRef, useEffect, Fragment } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { validateFuncForRider } from '../../constraints/constraints'
import { useTranslation, withTranslation } from 'react-i18next'
// core components
import {
  createRider,
  editRider,
  getRiders,
  getZones,
  getAvailableRiders,
  getCities
} from '../../apollo'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Box,
  Switch,
  Typography,
  Input,
  Alert,
  Select,
  MenuItem,
  Button,
  Grid,
  Checkbox,
  FormControl,
  InputLabel
} from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const CREATE_RIDER = gql`
  ${createRider}
`
const EDIT_RIDER = gql`
  ${editRider}
`
const GET_RIDERS = gql`
  ${getRiders}
`
const GET_ZONES = gql`
  ${getZones}
`
const GET_AVAILABLE_RIDERS = gql`
  ${getAvailableRiders}
`

const GET_CITIES = gql`
  ${getCities}
`

function Rider({ rider, onClose }) {
  const formRef = useRef()
  const mutation = rider ? EDIT_RIDER : CREATE_RIDER
  const name = rider ? rider.name : ''
  const userName = rider ? rider.username : ''
  const password = rider ? rider.password : ''
  const phone = rider ? rider.phone : ''
  const zone = rider ? rider.zone._id : ''
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [nameError, nameErrorSetter] = useState(null)
  const [usernameError, usernameErrorSetter] = useState(null)
  const [passwordError, passwordErrorSetter] = useState(null)
  const [phoneError, phoneErrorSetter] = useState(null)
  const [userNameErrorMessage, setUserNameErrorMessage] = useState('')
  const [zoneError, zoneErrorSetter] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [riderAvailable, setRiderAvailable] = useState(
    rider ? rider.available : true
  )
  const [riderZone, setRiderZone] = useState(rider ? rider.zone._id : '')
  const [selectedCity, setSelectedCity] = useState(rider ? rider.city : '')
  const [profileImage, setProfileImage] = useState(null)
  const [nationalIdImage, setNationalIdImage] = useState(null)

  const [savedProfileImage, setSavedProfileImage] = useState(null)
  const [savedNationalIdImage, setSavedNationalIdImage] = useState(null)

  useEffect(() => {
    if (rider) {
      if (rider.profileImage?.url) {
        setSavedProfileImage(rider.profileImage?.url)
      }
      if (rider.nationalIdImage?.url) {
        setSavedNationalIdImage(rider.nationalIdImage?.url)
      }
    }
  }, [rider])

  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities
  } = useQuery(GET_CITIES)
  const cities = dataCities?.citiesAdmin || null

  const onCompleted = data => {
    if (!rider) clearFields()
    const message = rider
      ? t('RiderUpdatedSuccessfully')
      : t('RiderAddedSuccessfully')
    mainErrorSetter('')
    successSetter(message)
    setTimeout(hideAlert, 3000)
  }
  const onError = ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      mainErrorSetter(graphQLErrors[0].message)
    }
    if (networkError) {
      mainErrorSetter(networkError.result.errors[0].message)
    }
    successSetter('')
    setTimeout(hideAlert, 3000)
  }
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_RIDERS }, { query: GET_AVAILABLE_RIDERS }],
    onError,
    onCompleted
  })
  const { data } = useQuery(GET_ZONES)

  const onBlur = (setter, field, state) => {
    const validationResult = validateFuncForRider({ [field]: state }, field)
    setter(validationResult.isValid)
  }
  const onSubmitValidaiton = () => {
    const nameError = validateFuncForRider(
      { name: formRef.current['input-name'].value },
      'name'
    )
    const usernameError = validateFuncForRider(
      { username: formRef.current['input-userName'].value },
      'username'
    )
    const passwordError = validateFuncForRider(
      { password: formRef.current['input-password'].value },
      'password'
    )
    const phoneError = validateFuncForRider(
      { phone: formRef.current['input-phone'].value },
      'phone'
    )
    const zoneError = validateFuncForRider(
      { zone: formRef.current['input-zone'].value },
      'zone'
    )

    nameErrorSetter(nameError.isValid)
    usernameErrorSetter(usernameError.isValid)
    setUserNameErrorMessage(usernameError.errorMessage)
    phoneErrorSetter(phoneError.isValid)
    passwordErrorSetter(passwordError.isValid)
    zoneErrorSetter(zoneError.isValid)
    return (
      nameError.isValid &&
      usernameError.isValid &&
      phoneError.isValid &&
      passwordError.isValid &&
      zoneError.isValid
    )
  }
  const clearFields = () => {
    formRef.current.reset()
    nameErrorSetter(null)
    usernameErrorSetter(null)
    passwordErrorSetter(null)
    phoneErrorSetter(null)
    zoneErrorSetter(null)
    setProfileImage(null)
    setNationalIdImage(null)
  }

  const hideAlert = () => {
    mainErrorSetter('')
    successSetter('')
  }
  const { t } = useTranslation()

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  const handlePhoneInput = e => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Remove any non-numeric characters
    e.target.value = value
  }

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box item className={rider ? classes.headingBlack : classes.heading}>
          <Typography
            variant="h6"
            className={rider ? classes.textWhite : classes.text}>
            {rider ? t('EditRider') : t('AddRider')}
          </Typography>
        </Box>
        <Box ml={10} mt={1}>
          <label>{t('Available')}</label>
          <Switch
            defaultChecked={riderAvailable}
            value={riderAvailable}
            onChange={e => setRiderAvailable(e.target.checked)}
            id="input-available"
            name="input-available"
            style={{ color: 'black' }}
          />
        </Box>
      </Box>

      {/* <Box className={classes.form}> */}
      <form ref={formRef}>
        <Box className={globalClasses.flexRow}>
          <Grid container spacing={-4} style={{ maxWidth: '600px' }}>
            <Grid item xs={12} sm={6} style={{ alignItems: 'center' }}>
              {/* <Box> */}
              <Typography className={classes.labelText}>{t('Name')}</Typography>
              <Input
                style={{ marginTop: -1 }}
                id="input-name"
                name="input-name"
                placeholder={t('PHRiderName')}
                type="text"
                defaultValue={name}
                onBlur={event => {
                  onBlur(nameErrorSetter, 'name', event.target.value)
                }}
                disableUnderline
                className={[
                  globalClasses.input,
                  nameError === false
                    ? globalClasses.inputError
                    : nameError === true
                    ? globalClasses.inputSuccess
                    : ''
                ]}
              />
              {/* </Box> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <Box> */}
              <Typography className={classes.labelText}>
                {t('Username')}
              </Typography>
              <Input
                style={{ marginTop: -1 }}
                id="input-username"
                name="input-userName"
                placeholder={t('Username')}
                type="text"
                defaultValue={userName}
                onBlur={event =>
                  onBlur(usernameErrorSetter, 'username', event.target.value)
                }
                disableUnderline
                className={[
                  globalClasses.input,
                  usernameError === false
                    ? globalClasses.inputError
                    : usernameError === true
                    ? globalClasses.inputSuccess
                    : ''
                ]}
              />
              {usernameError === false && (
                <Typography
                  variant="p"
                  style={{
                    color: 'red',
                    fontSize: '12px',
                    float: 'left',
                    marginTop: '5px',
                    textAlign: 'left',
                    marginLeft: '10px'
                  }}>
                  {t(userNameErrorMessage)}
                </Typography>
              )}
              {/* </Box> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <Box> */}
              <Typography className={classes.labelText}>
                {t('Password')}
              </Typography>
              <Input
                style={{ marginTop: -1 }}
                id="input-password"
                name="input-password"
                placeholder={t('Password')}
                type={showPassword ? 'text' : 'password'}
                defaultValue={password}
                onBlur={event =>
                  onBlur(passwordErrorSetter, 'password', event.target.value)
                }
                disableUnderline
                className={[
                  globalClasses.input,
                  passwordError === false
                    ? globalClasses.inputError
                    : passwordError === true
                    ? globalClasses.inputSuccess
                    : ''
                ]}
                endAdornment={
                  <InputAdornment position="end">
                    <Checkbox
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      color="primary"
                      icon={<VisibilityOffIcon />}
                      checkedIcon={<VisibilityIcon />}
                    />
                  </InputAdornment>
                }
              />
              {/* </Box> */}
            </Grid>
            <Grid item xs={12} sm={6}>
              {/* <Box> */}
              <Typography className={classes.labelText}>
                {t('Number')}
              </Typography>
              <Input
                style={{ marginTop: -1 }}
                ref={formRef}
                id="input-phone"
                name="input-phone"
                placeholder={t('PhoneNumber')}
                type="number"
                defaultValue={phone}
                onInput={handlePhoneInput}
                onBlur={event =>
                  onBlur(phoneErrorSetter, 'phone', event.target.value)
                }
                disableUnderline
                className={[
                  globalClasses.input,
                  phoneError === false
                    ? globalClasses.inputError
                    : phoneError === true
                    ? globalClasses.inputSuccess
                    : ''
                ]}
              />
              {/* </Box> */}
            </Grid>
          </Grid>
        </Box>

        <Box className={globalClasses.flexRow}>
          <Select
            labelId="rider-zone"
            id="input-zone"
            name="input-zone"
            defaultValue={riderZone}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            value={riderZone}
            onChange={e => setRiderZone(e.target.value)}
            className={[
              globalClasses.input,
              zoneError === false
                ? globalClasses.inputError
                : zoneError === true
                ? globalClasses.inputSuccess
                : ''
            ]}>
            {!zone && (
              <MenuItem sx={{ color: 'black' }} value={''}>
                {t('RiderZone')}
              </MenuItem>
            )}
            {data &&
              data.zones.map(zone => (
                <MenuItem
                  style={{ color: 'black' }}
                  value={zone._id}
                  key={zone._id}>
                  {zone.title}
                </MenuItem>
              ))}
          </Select>
        </Box>
        <Box className={globalClasses.flexRow}>
          <Select
            labelId="rider-city"
            id="input-city"
            name="input-city"
            value={selectedCity}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            onChange={e => setSelectedCity(e.target.value)}
            className={[globalClasses.input]}>
            {!selectedCity && (
              <MenuItem sx={{ color: 'black' }} value={''}>
                {t('City')}
              </MenuItem>
            )}
            {cities?.map(zone => (
              <MenuItem
                style={{ color: 'black' }}
                value={zone._id}
                key={zone._id}>
                {zone.title}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {/* Uploads Section */}
        <Box style={{ marginTop: 24, padding: 20 }}>
          <Box>
            <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
              {t('UploadDocuments')}
            </Typography>
          </Box>

          <Box>
            <Typography
              className={classes.labelText}
              sx={{ marginInline: '0 !important' }}>
              {t('Profile Picture')}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              style={{ justifyContent: 'flex-start' }}>
              {profileImage ? profileImage.name : t('ChooseImage')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => setProfileImage(e.target.files[0])}
              />
            </Button>
            {profileImage ? (
              <img
                src={URL.createObjectURL(profileImage)}
                alt="Profile Preview"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  marginTop: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            ) : (
              <Fragment>
                {savedProfileImage && (
                  <img
                    src={savedProfileImage}
                    alt="Profile Preview"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      marginTop: 10,
                      borderRadius: 6,
                      border: '1px solid #ddd'
                    }}
                  />
                )}
              </Fragment>
            )}
          </Box>

          <Box>
            <Typography
              className={classes.labelText}
              sx={{ marginInline: '0 !important' }}>
              {t('National ID Picture')}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              style={{ justifyContent: 'flex-start' }}>
              {nationalIdImage ? nationalIdImage.name : t('ChooseImage')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => setNationalIdImage(e.target.files[0])}
              />
            </Button>
            {nationalIdImage ? (
              <img
                src={URL.createObjectURL(nationalIdImage)}
                alt="National ID Preview"
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  marginTop: 10,
                  borderRadius: 6,
                  border: '1px solid #ddd'
                }}
              />
            ) : (
              <Fragment>
                {savedNationalIdImage && (
                  <img
                    src={savedNationalIdImage}
                    alt="Profile Preview"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      marginTop: 10,
                      borderRadius: 6,
                      border: '1px solid #ddd'
                    }}
                  />
                )}
              </Fragment>
            )}
          </Box>
        </Box>

        <Box>
          <Button
            className={globalClasses.button}
            disabled={loading}
            onClick={async e => {
              e.preventDefault()
              if (onSubmitValidaiton()) {
                mutate({
                  variables: {
                    riderInput: {
                      _id: rider ? rider._id : '',
                      name: formRef.current['input-name'].value,
                      username: formRef.current['input-userName'].value,
                      password: formRef.current['input-password'].value,
                      phone: formRef.current['input-phone'].value,
                      zone: riderZone,
                      available: riderAvailable,
                      city: selectedCity,
                      profileImage,
                      nationalIdImage
                    }
                  }
                })
                // Close the modal after 3 seconds by calling the parent's onClose callback
                if (onClose) {
                  setTimeout(() => {
                    onClose() // Close the modal
                  }, 4000)
                }
              }
            }}>
            {t('Save')}
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
        {mainError && (
          <Alert
            className={globalClasses.alertSuccess}
            variant="filled"
            severity="error">
            {mainError}
          </Alert>
        )}
      </Box>
      {/* </Box> */}
    </Box>
  )
}
export default withTranslation()(Rider)
