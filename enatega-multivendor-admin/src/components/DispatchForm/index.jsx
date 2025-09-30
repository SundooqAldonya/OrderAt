import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  debounce,
  Input,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'
import React, { useMemo, useState } from 'react'
import useStyles from '../styles'
import useGlobalStyles from '../../utils/globalStyles'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  adminCheckout,
  getCities,
  getCityAreas,
  searchRestaurants,
  searchRiders
} from '../../apollo'
import { useTranslation } from 'react-i18next'

const GET_AREAS = gql`
  ${getCityAreas}
`

const GET_CITIES = gql`
  ${getCities}
`

const DispatchForm = ({ order }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [titleError, setTitleError] = useState(null)
  const [mainError, setMainError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [restaurantOptions, setRestaurantOptions] = useState([])
  const [ridersOptions, setRidersOptions] = useState([])
  const [selectedRestaurants, setSelectedRestaurants] = useState(null)
  const [selectedRiders, setSelectedRiders] = useState(null)

  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities,
    refetch: refetchCities
  } = useQuery(GET_CITIES)

  const cities = dataCities ? dataCities.citiesAdmin : []
  console.log({ cities })

  const [
    fetchAreas,
    { data, loading: loadingAreas, error: errorAreas, refetch: refetchAreas }
  ] = useLazyQuery(GET_AREAS, {
    skip: !selectedCity
  })

  const areas = data ? data.areasByCity : []

  const [fetchRestaurants, { loading: loadingRestaurants }] = useLazyQuery(
    searchRestaurants,
    {
      fetchPolicy: 'no-cache',
      onCompleted: data => {
        console.log({ data })
        setRestaurantOptions(data?.searchRestaurants || [])
      }
    }
  )
  const [fetchRiders, { loading: loadingRiders }] = useLazyQuery(searchRiders, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log({ data })
      setRidersOptions(data?.searchRiders || [])
    }
  })

  const debouncedSearchRestaurants = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchRestaurants({ variables: { search: value } })
        }
      }, 300),
    [fetchRestaurants]
  )

  const handleRestaurantSelect = newValue => {
    console.log({ newValue })
    setSelectedRestaurants(newValue)
  }

  const debouncedSearchRiders = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchRiders({ variables: { search: value } })
        }
      }, 300),
    [fetchRiders]
  )

  const handleRiderselect = newValue => {
    console.log({ newValue })
    setSelectedRiders(newValue)
  }

  const handleChangeCity = e => {
    setSelectedCity(e.target.value)
    fetchAreas({
      variables: {
        id: e.target.value
      }
    })
  }

  const [mutateCreateOrder, { loading: mutateLoading }] = useMutation(
    adminCheckout,
    {
      onCompleted: res => {
        console.log({ res })
      },
      onError: err => {
        console.log({ err })
        // setMainError(err.message)
        // setSuccess(null)
      }
    }
  )

  const handleSubmit = e => {
    e.preventDefault()
    mutateCreateOrder({
      variables: {
        input: {
          restaurant: selectedRestaurants?._id,
          area: selectedArea
        }
      }
    })
  }

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {!order ? t('Create Order') : t('Edit Order')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Select City')}
            </Typography> */}
            <Select
              id="city"
              name="city"
              defaultValue={selectedCity || ''}
              value={selectedCity}
              onChange={handleChangeCity}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}>
              {!selectedCity && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select City')}
                </MenuItem>
              )}
              {cities?.length &&
                cities?.map(city => (
                  <MenuItem
                    value={city._id}
                    key={city._id}
                    style={{ color: 'black' }}>
                    {city.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ mb: 2 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Select Area')}
            </Typography> */}
            <Select
              id="area"
              name="area"
              defaultValue={selectedArea || ''}
              value={selectedArea}
              onChange={e => setSelectedArea(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              className={[globalClasses.input]}>
              {!selectedArea && (
                <MenuItem value="" style={{ color: 'black' }}>
                  {t('Select Area')}
                </MenuItem>
              )}
              {areas?.length &&
                areas?.map(area => (
                  <MenuItem
                    value={area._id}
                    key={area._id}
                    style={{ color: 'black' }}>
                    {area.title}
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ mb: 2, marginInlineStart: 4 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Business')}
            </Typography> */}
            <Autocomplete
              options={restaurantOptions || []}
              value={selectedRestaurants}
              onChange={(e, newValue) => handleRestaurantSelect(newValue)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(event, inputValue) => {
                debouncedSearchRestaurants(inputValue)
              }}
              getOptionLabel={option => option.name}
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Business"
                  className={globalClasses.input}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'black',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    }
                  }}
                />
              )}
              sx={{
                width: 300,
                margin: '0 0 0 0',
                padding: '0px 0px',
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    color: 'black',
                    backgroundColor: 'white'
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 2, marginInlineStart: 4 }}>
            {/* <Typography className={classes.labelText} sx={{ color: 'black' }}>
              {t('Rider')}
            </Typography> */}
            <Autocomplete
              filterOptions={x => x} // 👈 disable built-in filtering
              loading={loadingRiders} // 👈 show spinner
              options={ridersOptions || []}
              value={selectedRiders}
              onChange={(e, newValue) => handleRiderselect(newValue)}
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(event, inputValue) => {
                debouncedSearchRiders(inputValue)
              }}
              getOptionLabel={option =>
                option?.name || option?.phone || option?.username || ''
              }
              renderInput={params => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Select Rider"
                  className={globalClasses.input}
                  sx={{
                    '& .MuiInputBase-input': {
                      color: 'black',
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' }
                    }
                  }}
                />
              )}
              sx={{
                width: 300,
                margin: '0 0 0 0',
                padding: '0px 0px',
                '& .MuiOutlinedInput-root': {
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none'
                  }
                }
              }}
              slotProps={{
                paper: {
                  sx: {
                    color: 'black',
                    backgroundColor: 'white'
                  }
                }
              }}
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

export default DispatchForm
