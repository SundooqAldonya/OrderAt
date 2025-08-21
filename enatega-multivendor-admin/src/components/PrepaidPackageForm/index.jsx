import React, { useEffect, useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Alert,
  Box,
  Button,
  Input,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  ListItemText
} from '@mui/material'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import {
  createPrepaidDeliveryPackage,
  getPrepaidDeliveryPackages,
  searchRestaurants,
  updatePrepaidDeliveryPackage
} from '../../apollo'
import { debounce } from 'lodash'
import { useMemo } from 'react'
import moment from 'moment'

const PrepaidPackageForm = ({ onClose, item }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const [restaurantOptions, setRestaurantOptions] = useState([])
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    item?.business || ''
  )
  const [totalDeliveries, setTotalDeliveries] = useState(
    item?.totalDeliveries || ''
  )
  const [price, setPrice] = useState(item?.price || '')
  const [maxDeliveryAmount, setMaxDeliveryAmount] = useState(
    item?.maxDeliveryAmount || ''
  )
  const [expiresAt, setExpiresAt] = useState(
    item?.expiresAt
      ? moment(Number(item.expiresAt)).format('YYYY-MM-DDTHH:mm')
      : ''
  )
  const [isActive, setIsActive] = useState(item?.isActive || false)

  console.log({ item })
  console.log({ expiresAt })

  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)

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

  const [mutateCreate] = useMutation(createPrepaidDeliveryPackage, {
    refetchQueries: [{ query: getPrepaidDeliveryPackages }],
    onCompleted: () => {
      setSuccess('Created a package successfully!')
      if (onClose) {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    },
    onError: err => {
      setMainError(err.message)
    }
  })
  const [mutateUpdate] = useMutation(updatePrepaidDeliveryPackage, {
    refetchQueries: [{ query: getPrepaidDeliveryPackages }],
    onCompleted: () => {
      setSuccess('Updated a package successfully!')
      if (onClose) {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    },
    onError: err => {
      setMainError(err.message)
    }
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!selectedRestaurant) {
      setMainError('Please select a restaurant.')
      return
    }
    if (item) {
      // updating an existing package
      mutateUpdate({
        variables: {
          id: item._id,
          input: {
            business: selectedRestaurant?._id,
            totalDeliveries: parseInt(totalDeliveries),
            price: parseFloat(price),
            maxDeliveryAmount: parseFloat(maxDeliveryAmount),
            isActive,
            expiresAt: expiresAt || null
          }
        }
      })
    } else {
      // creating a new package
      mutateCreate({
        variables: {
          input: {
            business: selectedRestaurant?._id,
            totalDeliveries: parseInt(totalDeliveries),
            price: parseFloat(price),
            maxDeliveryAmount: parseFloat(maxDeliveryAmount),
            isActive,
            expiresAt: expiresAt || null
          }
        }
      })
    }
    setSelectedRestaurant('')
    setTotalDeliveries('')
    setPrice('')
    setExpiresAt('')
    setIsActive(true)
  }

  const debouncedSearchRestaurants = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchRestaurants({ variables: { search: value } })
        }
      }, 300),
    [fetchRestaurants]
  )

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t('add_delivery_package')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <Typography className={classes.labelText}>Business</Typography>
            <Autocomplete
              options={restaurantOptions || []}
              value={selectedRestaurant} // ✅ single value (object or null)
              onChange={(e, newValue) => setSelectedRestaurant(newValue)} // ✅ update single item
              isOptionEqualToValue={(option, value) => option._id === value._id}
              onInputChange={(event, inputValue) => {
                debouncedSearchRestaurants(inputValue)
              }}
              getOptionLabel={option => option?.name || ''}
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
                '& .MuiAutocomplete-inputRoot': {
                  paddingRight: '8px',
                  alignItems: 'center'
                },
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
          <Box mb={2}>
            <Typography className={classes.labelText}>
              Total Deliveries
            </Typography>
            <Input
              value={totalDeliveries}
              onChange={e => setTotalDeliveries(e.target.value)}
              placeholder="100"
              type="number"
              disableUnderline
              className={globalClasses.input}
            />
          </Box>
          <Box mb={2}>
            <Typography className={classes.labelText}>Package Price</Typography>
            <Input
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="1500"
              type="number"
              disableUnderline
              className={globalClasses.input}
            />
          </Box>
          <Box mb={2}>
            <Typography className={classes.labelText}>
              Max Delivery Amount
            </Typography>
            <Input
              value={maxDeliveryAmount}
              onChange={e => setMaxDeliveryAmount(e.target.value)}
              placeholder="25"
              type="number"
              disableUnderline
              className={globalClasses.input}
            />
          </Box>
          <Box mb={2}>
            <Typography className={classes.labelText}>Expires At</Typography>
            <TextField
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                sx: {
                  color: 'black'
                }
              }}
            />
          </Box>
          <Box mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  color="primary"
                />
              }
              label="Is Active"
            />
          </Box>

          <Button className={globalClasses.button} type="submit">
            {t('Save')}
          </Button>

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

export default PrepaidPackageForm
