import React, { useRef, useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { getDispatchOptions, updateDispatchOptions } from '../../../apollo'
import useStyles from '../styles'
import useGlobalStyles from '../../../utils/globalStyles'
import { Box, Typography, Input, Button, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'

function DispatchOptions() {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [values, setValues] = useState({
    delayDispatch: 0,
    firstAttemptRiders: 0,
    secondAttemptRiders: 0,
    thirdAttemptRiders: 0
  })

  const {
    delayDispatch,
    firstAttemptRiders,
    secondAttemptRiders,
    thirdAttemptRiders
  } = values

  const { data, loading: loadingQuery, error } = useQuery(getDispatchOptions)

  useEffect(() => {
    if (data) {
      setValues({ ...data.getDispatchOptions })
    }
  }, [data])

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const [mutateDispatchOptions, { loading }] = useMutation(
    updateDispatchOptions,
    {
      onCompleted: res => {
        console.log({ res })
      },
      onError: err => {
        console.log({ err })
      }
    }
  )

  const handleSubmit = e => {
    e.preventDefault()
    mutateDispatchOptions({
      variables: {
        input: {
          delayDispatch: parseInt(delayDispatch),
          firstAttemptRiders: parseInt(firstAttemptRiders),
          secondAttemptRiders: parseInt(secondAttemptRiders),
          thirdAttemptRiders: parseInt(thirdAttemptRiders)
        }
      }
    })
  }

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box item className={classes.heading}>
          <Typography variant="h6" className={classes.text}>
            {t('DispatchOptions')}
          </Typography>
        </Box>
      </Box>

      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box>
            <Typography className={classes.labelText}>
              {t('dispatch_delay')} {`(in seconds)`}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              name="delayDispatch"
              placeholder="For example: 1 or 2 (in hours)"
              type="text"
              value={delayDispatch}
              disableUnderline
              className={[globalClasses.input]}
              onChange={handleChange}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('first_attempt_riders')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              name="firstAttemptRiders"
              placeholder="For example: 1 or 2 (in hours)"
              type="text"
              value={firstAttemptRiders}
              disableUnderline
              className={[globalClasses.input]}
              onChange={handleChange}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('second_attempt_riders')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              name="secondAttemptRiders"
              placeholder="For example: 1 or 2 (in hours)"
              type="text"
              value={secondAttemptRiders}
              disableUnderline
              className={[globalClasses.input]}
              onChange={handleChange}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('third_attempt_riders')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              name="thirdAttemptRiders"
              placeholder="For example: 1 or 2 (in hours)"
              type="text"
              value={thirdAttemptRiders}
              disableUnderline
              className={[globalClasses.input]}
              onChange={handleChange}
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
export default DispatchOptions
