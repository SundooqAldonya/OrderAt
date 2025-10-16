import React, { useEffect, useState } from 'react'
import { Box, Button, Grid, useTheme } from '@mui/material'
import TimeRangePicker from '@wojtekmaj/react-timerange-picker'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'

const DayComponent = ({ day, value, onChangeTime, idx }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [values, setValues] = useState(value)

  const globalClasses = useGlobalStyles()

  // useEffect(() => {
  //   onChangeTime(day, values)
  // }, [value, data, onChangeTime])

  const handleChange = (index, newTimeRange) => {
    console.log({ newTimeRange })
    console.log('change', index)
    const updatedValues = [...values]
    updatedValues[index] = newTimeRange
    setValues(updatedValues)
    // onChangeTime(day, updatedValues)
    onChangeTime({ index: idx, day, values: updatedValues })
  }

  return (
    <Grid container className={globalClasses.dayComponent}>
      <Grid item lg={2} md={2} className={globalClasses.day}>
        {day}
      </Grid>
      <Grid item lg={7} md={7}>
        {values.map((value, index) => (
          <Box key={index}>
            <TimeRangePicker
              required
              rangeDivider="to"
              disableClock
              format="hh:mm a"
              clearIcon={null}
              style={{ backgroundColor: 'red', color: 'green' }}
              value={value}
              // onChange={newValue => {
              //   const updatedValues = [...values]
              //   updatedValues[index] = newValue
              //   setValues(updatedValues)
              // }}
              onChange={newTimeRange => handleChange(index, newTimeRange)}
            />
            {index === values.length - 1 && (
              <AddIcon
                style={{
                  backgroundColor: theme.palette.warning.dark,
                  color: theme.palette.common.black,
                  borderRadius: '50%',
                  marginBottom: -5,
                  marginLeft: 10
                }}
                onClick={e => {
                  e.preventDefault()
                  setValues([...values, ['00:00', '23:59']])
                }}
              />
            )}
            {values.length > 1 && (
              <RemoveIcon
                style={{
                  backgroundColor: theme.palette.common.black,
                  color: theme.palette.warning.dark,
                  borderRadius: '50%',
                  marginLeft: 10,
                  marginRight: 10,
                  marginBottom: -5
                }}
                onClick={e => {
                  e.preventDefault()
                  values.splice(index, 1)
                  setValues([...values])
                }}
              />
            )}
          </Box>
        ))}
        {values.length === 0 && <span>{t('ClosedAllDay')}</span>}
      </Grid>
      <Grid item lg={3} md={3}>
        {values.length > 0 ? (
          <Button
            onClick={e => {
              e.preventDefault()
              setValues([])
              onChangeTime({ index: idx, day, values: [] })
            }}
            className={globalClasses.closeBtn}>
            {t('ClosedAllDay')}
          </Button>
        ) : null}
        {values.length === 0 ? (
          <Button
            onClick={e => {
              e.preventDefault()
              setValues([['00:00', '23:59']])
              onChangeTime({ index: idx, day, values: [['00:00', '23:59']] })
            }}
            className={globalClasses.openBtn}>
            {t('Open')}
          </Button>
        ) : null}
      </Grid>
    </Grid>
  )
}
export default React.memo(DayComponent)
