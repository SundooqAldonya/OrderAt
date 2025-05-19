/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation, useTranslation } from 'react-i18next'
// core components
import Header from '../components/Headers/Header'
import { getRestaurantProfile, updateTimings } from '../apollo'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker'
import CustomLoader from '../components/Loader/CustomLoader'
import useGlobalStyles from '../utils/globalStyles'
import { Container, Grid, Box, Button, Alert, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DayComponent from '../components/DayComponent'
const GET_RESTAURANT_PROFILE = gql`
  ${getRestaurantProfile}
`
const UPDATE_TIMINGS = gql`
  ${updateTimings}
`
const Timings = props => {
  const { t } = useTranslation()
  const [value, setValues] = useState({})
  const restaurantId = localStorage.getItem('restaurantId')

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const onChangeTime = (day, values) => {
    console.log({ day, values })

    value[day] = values
    setValues(value)
  }

  console.log({ value })

  const getTransformedTimings = e => {
    const openingTimes = Object.keys(value).map(day => {
      console.log({ day })
      return {
        day,
        times: value[day].map(timings => ({
          startTime: timings[0].split(':'),
          endTime: timings[1].split(':')
        }))
      }
    })

    console.log({ openingTimes })

    return openingTimes
  }

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_RESTAURANT_PROFILE,
    {
      variables: { id: restaurantId }
    }
  )

  const transformedTimes = {}

  const [mutate, { loading }] = useMutation(UPDATE_TIMINGS)

  data &&
    data.restaurant.openingTimes.forEach(value => {
      transformedTimes[value.day] = value.times.map(t => [
        `${t.startTime[0]}:${t.startTime[1]}`,
        `${t.endTime[0]}:${t.endTime[1]}`
      ])
    })
  const globalClasses = useGlobalStyles()

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        {errorQuery ? <span>Error! {errorQuery.message}</span> : null}
        {loadingQuery ? (
          <CustomLoader />
        ) : (
          <Box className={globalClasses.timing}>
            <Grid container className={globalClasses.timingHeader}>
              <Grid item md={2} lg={2}>
                {t('Days')}
              </Grid>
              <Grid item md={7} lg={7}>
                {t('OpenTimes')}
              </Grid>
            </Grid>
            <DayComponent
              day={t('MON')}
              value={transformedTimes.MON || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('TUE')}
              value={transformedTimes.TUE || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('WED')}
              value={transformedTimes.WED || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('THU')}
              value={transformedTimes.THU || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('FRI')}
              value={transformedTimes.FRI || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('SAT')}
              value={transformedTimes.SAT || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <DayComponent
              day={t('SUN')}
              value={transformedTimes.SUN || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
            />
            <Button
              onClick={e => {
                e.preventDefault()
                const openingTimes = getTransformedTimings()
                mutate({
                  variables: {
                    id: restaurantId,
                    openingTimes
                  },
                  onCompleted: () => {
                    setSuccessMessage(t('TimeSavedSuccessfully'))
                    setTimeout(() => setSuccessMessage(''), 5000)
                    setErrorMessage('')
                  },
                  onError: error => {
                    setErrorMessage(t('ErrorWhileSavingTime'))
                    setTimeout(() => setErrorMessage(''), 5000)
                    setSuccessMessage('')
                  }
                })
              }}
              className={[globalClasses.button, globalClasses.mb]}>
              {loading ? t('SavingDots') : t('Save')}
            </Button>
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
        )}
      </Container>
    </>
  )
}

export default withTranslation()(Timings)
