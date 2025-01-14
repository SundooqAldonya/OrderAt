import React, { useState } from 'react'
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
import { createArea, getAreas, getCities } from '../../apollo'

const CREATE_AREA = gql`
  ${createArea}
`
const GET_CITIES = gql`
  ${getCities}
`

const GET_AREAS = gql`
  ${getAreas}
`

const AreaCreate = ({ onClose }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [titleError, titleErrorSetter] = useState(null)
  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')

  const { data, loading: loadingCities, error: errorCities } = useQuery(
    GET_CITIES
  )

  const cities = data?.cities || null

  console.log({ citiesData: data })

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

  const handleSubmit = async e => {
    e.preventDefault()
    mutate({
      variables: {
        areaInput: {
          title,
          city: selectedCity
        }
      }
    })
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
          {loadingCities && <div>Loading...</div>}
          {errorCities && <div>Error {errorCities.message}</div>}

          <Box className={globalClasses.flexRow}>
            <Select
              id="input-city"
              name="input-city"
              defaultValue={[selectedCity || '']}
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              // onBlur={event =>
              //   onBlur(categoryErrorSetter, 'category', event.target.value)
              // }
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[
                globalClasses.input
                // categoryError === false
                //   ? globalClasses.inputError
                //   : categoryError === true
                //   ? globalClasses.inputSuccess
                //   : ''
              ]}>
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
      {/* <Modal
        style={{
          marginLeft: '25%',
          overflowY: 'auto'
        }}
        open={addonModal}
        onClose={() => {
          toggleModal()
        }}></Modal> */}
    </Box>
  )
}

export default AreaCreate
