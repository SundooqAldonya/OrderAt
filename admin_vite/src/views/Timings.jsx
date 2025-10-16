/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation, useTranslation } from 'react-i18next'
// core components
import Header from '../components/Headers/Header'
import { defaultTimings, getRestaurantProfile, updateTimings } from '../apollo'
// import TimeRangePicker from '@wojtekmaj/react-timerange-picker'
import CustomLoader from '../components/Loader/CustomLoader'
import useGlobalStyles from '../utils/globalStyles'
import { Container, Grid, Box, Button, Alert, useTheme } from '@mui/material'
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

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_RESTAURANT_PROFILE,
    {
      variables: { id: restaurantId }
    }
  )

  const onChangeTime = ({ index, day, values }) => {
    console.log({ index, values, day })
    // here its not objects anymore, its array of objects
    setValues(prev => ({
      ...prev,
      [day]: values
    }))
  }

  console.log({ value })

  const getTransformedTimings = e => {
    return Object.entries(value).map(([day, timeRanges]) => ({
      day,
      times: timeRanges.map(([start, end]) => ({
        startTime: start.split(':'),
        endTime: end.split(':')
      }))
    }))
    // const openingTimes = Object.keys(value).map(day => {
    //   console.log({ day })
    //   return {
    //     day,
    //     times: value[day].map(timings => ({
    //       startTime: timings[0].split(':'),
    //       endTime: timings[1].split(':')
    //     }))
    //   }
    // })

    // console.log({ openingTimes })

    // return openingTimes
  }

  // console.log({ getTransformedTimings: getTransformedTimings() })

  const generateValues = () => {
    const newValue = {}
    data.restaurant.openingTimes.forEach(item => {
      newValue[item.day] = item.times.map(t => [
        `${t.startTime[0]}:${t.startTime[1]}`,
        `${t.endTime[0]}:${t.endTime[1]}`
      ])
    })
    setValues(newValue)
  }

  useEffect(() => {
    if (data?.restaurant) {
      generateValues()
    }
  }, [data?.restaurant])

  const transformedTimes = {}

  console.log({ transformedTimes })

  const [mutate, { loading }] = useMutation(UPDATE_TIMINGS)
  const [mutateDefault, { loading: loadingDefaultTiming }] = useMutation(
    defaultTimings,
    {
      refetchQueries: [{ query: GET_RESTAURANT_PROFILE }],
      onCompleted: res => {
        console.log({ res })
      },
      onError: error => {
        console.log({ error })
      }
    }
  )

  data &&
    data.restaurant.openingTimes?.forEach(value => {
      transformedTimes[value.day] = value.times.map(t => [
        `${t.startTime[0]}:${t.startTime[1]}`,
        `${t.endTime[0]}:${t.endTime[1]}`
      ])
    })

  console.log({ times: data?.restaurant?.openingTimes })
  const globalClasses = useGlobalStyles()

  const handleSaveTiming = e => {
    e.preventDefault()
    const openingTimes = getTransformedTimings()
    console.log({ openingTimes })
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
  }

  const dayKeys = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

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
            {dayKeys.map((dayKey, idx) => (
              <DayComponent
                key={dayKey}
                day={t(dayKey)}
                value={transformedTimes[dayKey] || [['00:00', '23:59']]}
                onChangeTime={onChangeTime}
                idx={idx}
              />
            ))}
            {/* <DayComponent
              day={t('MON')}
              value={transformedTimes.MON || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={0}
            />
            <DayComponent
              day={t('TUE')}
              value={transformedTimes.TUE || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={1}
            />
            <DayComponent
              day={t('WED')}
              value={transformedTimes.WED || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={2}
            />
            <DayComponent
              day={t('THU')}
              value={transformedTimes.THU || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={3}
            />
            <DayComponent
              day={t('FRI')}
              value={transformedTimes.FRI || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={4}
            />
            <DayComponent
              day={t('SAT')}
              value={transformedTimes.SAT || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={5}
            />
            <DayComponent
              day={t('SUN')}
              value={transformedTimes.SUN || [['00:00', '23:59']]}
              onChangeTime={onChangeTime}
              idx={6}
            /> */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3
              }}>
              <Button
                onClick={handleSaveTiming}
                className={[globalClasses.button, globalClasses.mb]}>
                {loading ? t('SavingDots') : t('Save')}
              </Button>
              <Button
                onClick={e => {
                  e.preventDefault()
                  mutateDefault({
                    variables: {
                      id: restaurantId
                    }
                  })
                }}
                className={[globalClasses.button, globalClasses.mb]}>
                {loadingDefaultTiming ? t('SavingDots') : t('restore_default')}
              </Button>
            </Box>
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
