import React, { useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import { Alert, Box, Button, Input, Modal, Typography } from '@mui/material'
import { gql, useMutation } from '@apollo/client'
import { createCity, editCity, getCities } from '../../apollo'

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
  const [title, setTitle] = useState(city ? city.title : '')
  const [titleError, titleErrorSetter] = useState(null)
  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

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

  const handleSubmit = async e => {
    e.preventDefault()
    if (!city) {
      mutate({
        variables: {
          title
        }
      })
    } else {
      mutateUpdate({
        variables: {
          id: city._id,
          title
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
