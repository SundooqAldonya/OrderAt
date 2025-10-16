import React, { useRef, useState, useEffect } from 'react'
import { withTranslation } from 'react-i18next'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../../constraints/constraints'
import {
  saveStripeConfiguration,
  updateRiderAvailabilityPeriod
} from '../../../apollo'
import useStyles from '../styles'
import useGlobalStyles from '../../../utils/globalStyles'
import { Box, Typography, Input, Button, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

function RiderAvailabilityTime({ availabilityPeriod }) {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [mutatePeriod, { loading }] = useMutation(
    updateRiderAvailabilityPeriod,
    {
      onCompleted: res => {
        console.log({ res })
      },
      onError: err => {
        console.log({ err })
      }
    }
  )

  const [period, setPeriod] = useState(
    availabilityPeriod ? availabilityPeriod : 0
  )

  const handleSubmit = e => {
    e.preventDefault()
    mutatePeriod({
      variables: {
        period: Number(period)
      }
    })
  }

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box item className={classes.heading}>
          <Typography variant="h6" className={classes.text}>
            {/* {t('RiderAvailabilityTime')} */}
            Rider Availability Time
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box>
            {/* <Typography className={classes.labelText}>
              {t('PublishKey')}
            </Typography> */}
            <Input
              style={{ marginTop: -1 }}
              name="period"
              placeholder="For example: 1 or 2 (in hours)"
              type="text"
              value={period}
              disableUnderline
              className={[globalClasses.input]}
              onChange={e => setPeriod(e.target.value)}
            />
          </Box>

          <Box>
            <Button
              className={globalClasses.button}
              disabled={loading}
              type="submit">
              {t('Save')}
            </Button>
          </Box>
          <Box mt={2}>
            {successMessage && (
              <Alert
                className={globalClasses.alertSuccess}
                variant="filled"
                severity="success">
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert
                className={globalClasses.alertError}
                variant="filled"
                severity="error">
                {errorMessage}
              </Alert>
            )}
          </Box>
        </form>
      </Box>
    </Box>
  )
}
export default RiderAvailabilityTime
