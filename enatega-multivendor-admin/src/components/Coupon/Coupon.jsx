import React, { useMemo, useRef, useState } from 'react'
import { useMutation, gql, useQuery, useLazyQuery } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import {
  editCoupon,
  createCoupon,
  getCoupons,
  getCities,
  searchRestaurants,
  searchCategories,
  searchUsers,
  searchFood,
  getCouponEnums,
  getCouponDiscountTypeEnums,
  getCouponStatuses
} from '../../apollo'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Box,
  Switch,
  Typography,
  Input,
  Button,
  Alert,
  Grid,
  Select,
  OutlinedInput,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Autocomplete
} from '@mui/material'
import { debounce } from 'lodash'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './customDatePickerStyle.css'

const CREATE_COUPON = gql`
  ${createCoupon}
`
const EDIT_COUPON = gql`
  ${editCoupon}
`
const GET_COUPONS = gql`
  ${getCoupons}
`
const GET_CITIES = gql`
  ${getCities}
`

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
}

function CouponComponent(props) {
  const { t, coupon } = props
  console.log({ coupon })
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const formRef = useRef()
  // const title = props.coupon ? props.coupon.title : ''
  // const discount = props.coupon ? props.coupon.discount : ''
  const [code, setCode] = useState(coupon ? coupon.code : '')
  const [discount, setDiscount] = useState(
    coupon ? coupon.rules.discount_value : ''
  )
  // const [enabled, setEnabled] = useState(
  //   props.coupon ? props.coupon.enabled : false
  // )
  const mutation = props.coupon ? EDIT_COUPON : CREATE_COUPON
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [titleError, titleErrorSetter] = useState(null)
  const [discountError, discountErrorSetter] = useState(null)
  const [selectedCities, setSelectedCities] = useState(
    coupon && coupon.target.cities?.length ? [...coupon.target.cities] : []
  )
  const [restaurantOptions, setRestaurantOptions] = useState([])
  const [selectedRestaurants, setSelectedRestaurants] = useState(
    coupon && coupon.target.businesses?.length
      ? [...coupon.target.businesses]
      : []
  )
  const [selectedCategories, setSelectedCategories] = useState(
    coupon && coupon.target.categories?.length
      ? [...coupon.target.categories]
      : []
  )
  const [userOptions, setUserOptions] = useState([])
  const [selectedUsers, setSelectedUsers] = useState(
    coupon && coupon.target.customers?.length
      ? [...coupon.target.customers]
      : []
  )
  const [foodOptions, setFoodOptions] = useState([])
  const [selectedFoods, setSelectedFoods] = useState(
    coupon && coupon.target.foods?.length ? [...coupon.target.foods] : []
  )
  const [selectedAppliedTo, setSelectedAppliedTo] = useState(
    coupon ? coupon.rules.applies_to : ''
  )
  const [selectedDiscountType, setSelectedDiscountType] = useState(
    coupon ? coupon.rules.discount_type : ''
  )
  const [minimumOrder, setMinimumOrder] = useState(
    coupon ? coupon.rules.min_order_value : ''
  )
  const [maxDiscount, setMaxDiscount] = useState(
    coupon ? coupon.rules.max_discount : ''
  )
  const [startDate, setStartDate] = useState(
    coupon ? coupon.rules.start_date : ''
  )
  const [endDate, setEndDate] = useState(coupon ? coupon.rules.end_date : '')
  const [limitTotal, setLimitTotal] = useState(
    coupon ? coupon.rules.limit_total : ''
  )
  const [limitByUser, setLimitByUser] = useState(
    coupon ? coupon.rules.limit_per_user : ''
  )
  const [selectedStatus, setSelectedStatus] = useState(
    coupon ? coupon.status : ''
  )

  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities
  } = useQuery(GET_CITIES)

  const {
    data: dataCategories,
    loading: loadingCategories,
    error: errorCategories
  } = useQuery(searchCategories)

  const {
    data: dataAppliesTo,
    loading: loadingAppliesTo,
    error: errorAppliesTo
  } = useQuery(getCouponEnums)

  const appliesToList = dataAppliesTo?.getCouponEnums || null

  const {
    data: dataStatuses,
    loading: loadingStatus,
    error: errorStatus
  } = useQuery(getCouponStatuses)

  console.log({ dataStatuses })
  const statuses = dataStatuses?.getCouponStatuses || null

  const {
    data: dataDiscountTypes,
    loading: loadingDiscountTypes,
    error: errorDiscountTypes
  } = useQuery(getCouponDiscountTypeEnums)

  console.log({ dataDiscountTypes })

  const discountTypes = dataDiscountTypes?.getCouponDiscountTypeEnums || null

  const [fetchUsers, { loading: loadingUsers }] = useLazyQuery(searchUsers, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log({ data })
      setUserOptions(data?.searchUsers || [])
    }
  })

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

  const [fetchFoods, { loading: loadingFoods }] = useLazyQuery(searchFood, {
    fetchPolicy: 'no-cache',
    onCompleted: data => {
      console.log({ data })
      setFoodOptions(data?.searchFood || [])
    }
  })

  const cities = dataCities?.cities || null
  const categories = dataCategories?.getBusinessCategories || null

  console.log({ cities, categories })
  console.log({ selectedUsers })

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }

  const onCompleted = data => {
    console.log({ data })
    // const message = props.coupon ? t('CouponUpdated') : t('CouponAdded')
    // successSetter(message)
    // mainErrorSetter('')
    // if (!props.coupon) clearFields()
  }

  const onError = error => {
    console.log({ error })
    let message = ''
    try {
      message = error.graphQLErrors[0].message
    } catch (err) {
      message = t('ActionFailedTryAgain')
    }
    successSetter('')
    mainErrorSetter(message)
  }

  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_COUPONS }],
    onError,
    onCompleted
  })
  const [mutateUpdate, { loading: loadingUpdate }] = useMutation(EDIT_COUPON, {
    refetchQueries: [{ query: GET_COUPONS }],
    onError,
    onCompleted: res => {
      console.log({ res })
      props.onClose()
    }
  })

  const onSubmitValidaiton = () => {
    // const titleError = !validateFunc(
    //   { title: formRef.current['input-code'].value },
    //   'title'
    // )
    // const discountError = !validateFunc(
    //   { discount: formRef.current['input-discount'].value },
    //   'discount'
    // )
    // titleErrorSetter(titleError)
    // discountErrorSetter(discountError)
    // return titleError && discountError
  }
  const clearFields = () => {
    formRef.current.reset()
    titleErrorSetter(null)
    discountErrorSetter(null)
  }

  const handleDiscountInput = e => {
    const value = e.target.value.replace(/[^0-9]/g, '') // Remove any non-numeric characters
    e.target.value = value
  }

  const handleCitiesSelect = newValue => {
    console.log({ newValue })
    setSelectedCities(newValue)
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

  const handleRestaurantSelect = newValue => {
    console.log({ newValue })
    setSelectedRestaurants(newValue)
  }

  const handleCategorySelect = newValue => {
    console.log({ newValue })
    setSelectedCategories(newValue)
  }

  const debouncedSearchUsers = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchUsers({ variables: { search: value } })
        }
      }, 300),
    [fetchUsers]
  )

  const handleUserSelect = newValue => {
    console.log({ newValue })
    setSelectedUsers(newValue)
  }
  const debouncedSearchFoods = useMemo(
    () =>
      debounce(value => {
        if (value.trim()) {
          fetchFoods({ variables: { search: value } })
        }
      }, 300),
    [fetchFoods]
  )

  const handleFoodSelect = newValue => {
    console.log({ newValue })
    setSelectedFoods(newValue)
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (coupon) {
      // if (onSubmitValidaiton() && !loading) {
      mutateUpdate({
        variables: {
          id: coupon._id,
          couponInput: {
            code,
            status: selectedStatus,
            target: {
              cities: selectedCities.map(item => item._id),
              businesses: selectedRestaurants.map(item => item._id),
              foods: selectedFoods.map(item => item._id),
              categories: selectedCategories.map(item => item._id),
              customers: selectedUsers.map(item => item._id)
            },
            rules: {
              discount_type: selectedDiscountType,
              discount_value: Number(discount),
              applies_to: selectedAppliedTo,
              min_order_value: Number(minimumOrder),
              max_discount: Number(maxDiscount),
              start_date: startDate,
              end_date: endDate,
              limit_total: Number(limitTotal),
              limit_per_user: Number(limitByUser)
            }
          }
        }
      })
    } else {
      mutate({
        variables: {
          couponInput: {
            code,
            status: selectedStatus,
            target: {
              cities: selectedCities.map(item => item._id),
              businesses: selectedRestaurants.map(item => item._id),
              foods: selectedFoods.map(item => item._id),
              categories: selectedCategories.map(item => item._id),
              customers: selectedUsers.map(item => item._id)
            },
            rules: {
              discount_type: selectedDiscountType,
              discount_value: Number(discount),
              applies_to: selectedAppliedTo,
              min_order_value: Number(minimumOrder),
              max_discount: Number(maxDiscount),
              start_date: startDate,
              end_date: endDate,
              limit_total: Number(limitTotal),
              limit_per_user: Number(limitByUser)
            }
          }
        }
      })
    }
  }

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box
          item
          className={props.coupon ? classes.headingBlack : classes.heading}>
          <Typography
            variant="h6"
            className={props.coupon ? classes.textWhite : classes.text}>
            {props.coupon ? t('EditCoupon') : t('AddCoupon')}
          </Typography>
        </Box>
        {/* <Box ml={10} mt={1}>
          <label>{enabled ? t('Disable') : t('Enable')}</label>
          <Switch
            defaultChecked={enabled}
            value={enabled}
            onChange={e => setEnabled(e.target.checked)}
            id="input-enabled"
            name="input-enabled"
            style={{ color: 'black' }}
          />
        </Box> */}
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box className={globalClasses.flexRow}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  {t('Code')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-code"
                  name="input-code"
                  placeholder={t('PHCode')}
                  type="text"
                  defaultValue={code}
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  {t('Discount')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-discount"
                  name="input-discount"
                  placeholder={t('Discount')}
                  type="number"
                  onInput={handleDiscountInput}
                  defaultValue={discount}
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  Minimum order
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="minimuOrder"
                  name="minimumOrder"
                  placeholder={t('Minimum Order')}
                  type="number"
                  onInput={handleDiscountInput}
                  defaultValue={minimumOrder}
                  value={minimumOrder}
                  onChange={e => setMinimumOrder(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  Max Discount
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="maxDiscount"
                  name="maxDiscount"
                  placeholder={t('Max Discount')}
                  type="number"
                  onInput={handleDiscountInput}
                  defaultValue={maxDiscount}
                  value={maxDiscount}
                  onChange={e => setMaxDiscount(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  Limit Total
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="limitTotal"
                  name="limitTotal"
                  placeholder={t('Max Discount')}
                  type="number"
                  onInput={handleDiscountInput}
                  defaultValue={limitTotal}
                  value={limitTotal}
                  onChange={e => setLimitTotal(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  Limit by user
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="limitByUser"
                  name="limitByUser"
                  placeholder={t('Max Discount')}
                  type="number"
                  onInput={handleDiscountInput}
                  defaultValue={limitByUser}
                  value={limitByUser}
                  onChange={e => setLimitByUser(e.target.value)}
                  disableUnderline
                  className={[globalClasses.input]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  Start date
                </Typography>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select a start date"
                  className="custom_datepicker"
                  calendarClassName="custom-calendar"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>End date</Typography>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select a end date"
                  className="custom_datepicker"
                  calendarClassName="custom-calendar"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  id="discountType"
                  name="discountType"
                  defaultValue={selectedDiscountType || ''}
                  value={selectedDiscountType}
                  onChange={e => setSelectedDiscountType(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  className={[globalClasses.input]}>
                  {!selectedDiscountType && (
                    <MenuItem value="" disabled style={{ color: 'black' }}>
                      Discount type
                    </MenuItem>
                  )}
                  {discountTypes?.map((item, i) => (
                    <MenuItem value={item} key={i} style={{ color: 'black' }}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  id="status"
                  name="status"
                  defaultValue={selectedStatus || ''}
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  className={[globalClasses.input]}>
                  {!selectedStatus && (
                    <MenuItem value="" disabled style={{ color: 'black' }}>
                      Select status
                    </MenuItem>
                  )}
                  {statuses?.map((item, i) => (
                    <MenuItem value={item} key={i} style={{ color: 'black' }}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  id="appliedTo"
                  name="appliedTo"
                  defaultValue={selectedAppliedTo || ''}
                  value={selectedAppliedTo}
                  onChange={e => setSelectedAppliedTo(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  className={[globalClasses.input]}>
                  {!selectedAppliedTo && (
                    <MenuItem value="" disabled style={{ color: 'black' }}>
                      Select to which should be applied
                    </MenuItem>
                  )}
                  {appliesToList?.map((item, i) => (
                    <MenuItem value={item} key={i} style={{ color: 'black' }}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography className={classes.labelText}>
                    {t('cities')}
                  </Typography>
                  <Autocomplete
                    multiple
                    options={cities || []}
                    value={selectedCities}
                    onChange={(e, newValue) => handleCitiesSelect(newValue)}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={option => option.title}
                    renderInput={params => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Select Cities"
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
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option._id}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <ListItemText
                          primary={option.title}
                          style={{ textTransform: 'capitalize', color: '#000' }}
                        />
                      </li>
                    )}
                    disableCloseOnSelect
                    sx={{
                      width: 300, // ✅ or a fixed width like '300px'
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        paddingRight: '8px',
                        alignItems: 'flex-start' // keeps label up
                      },
                      '& .MuiAutocomplete-tag': {
                        maxWidth: '100%' // ensures long chip labels wrap or truncate
                      },
                      '& .MuiChip-root': {
                        margin: '2px' // spacing between chips
                      },
                      margin: '0 0 0 0',
                      padding: '0px 0px',
                      '& .MuiOutlinedInput-root': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none' // ✅ remove border including on focus
                        }
                      },
                      '& .MuiChip-root': {
                        backgroundColor: '#f0f0f0', // ✅ light background
                        color: '#000', // ✅ black text
                        fontWeight: 500
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#888', // Optional: change delete icon color
                        '&:hover': {
                          color: '#000'
                        }
                      }
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          color: 'black', // Text color
                          backgroundColor: 'white' // Optional: background for contrast
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography className={classes.labelText}>
                    {t('businesses')}
                  </Typography>
                  <Autocomplete
                    multiple
                    options={restaurantOptions || []}
                    value={selectedRestaurants}
                    onChange={(e, newValue) => handleRestaurantSelect(newValue)}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
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
                            '& fieldset': { border: 'none' }, // ❌ remove border
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: 'none' }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option._id}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <ListItemText
                          primary={option.name}
                          style={{ textTransform: 'capitalize', color: '#000' }}
                        />
                      </li>
                    )}
                    disableCloseOnSelect
                    sx={{
                      width: 300, // ✅ or a fixed width like '300px'
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        paddingRight: '8px',
                        alignItems: 'flex-start' // keeps label up
                      },
                      '& .MuiAutocomplete-tag': {
                        maxWidth: '100%' // ensures long chip labels wrap or truncate
                      },
                      '& .MuiChip-root': {
                        margin: '2px' // spacing between chips
                      },
                      margin: '0 0 0 0',
                      padding: '0px 0px',
                      '& .MuiOutlinedInput-root': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none' // ✅ remove border including on focus
                        }
                      },
                      '& .MuiChip-root': {
                        backgroundColor: '#f0f0f0', // ✅ light background
                        color: '#000', // ✅ black text
                        fontWeight: 500
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#888', // Optional: change delete icon color
                        '&:hover': {
                          color: '#000'
                        }
                      }
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          color: 'black', // Text color
                          backgroundColor: 'white' // Optional: background for contrast
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography className={classes.labelText}>
                    {t('Categories')}
                  </Typography>
                  <Autocomplete
                    multiple
                    options={categories || []}
                    value={selectedCategories}
                    onChange={(e, newValue) => handleCategorySelect(newValue)}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    getOptionLabel={option => option.name}
                    renderInput={params => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Select Categories"
                        className={globalClasses.input}
                        sx={{
                          '& .MuiInputBase-input': {
                            color: 'black',
                            '& fieldset': { border: 'none' }, // ❌ remove border
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: 'none' }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option._id}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <ListItemText
                          primary={option.name}
                          style={{ textTransform: 'capitalize', color: '#000' }}
                        />
                      </li>
                    )}
                    disableCloseOnSelect
                    sx={{
                      width: 300, // ✅ or a fixed width like '300px'
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        paddingRight: '8px',
                        alignItems: 'flex-start' // keeps label up
                      },
                      '& .MuiAutocomplete-tag': {
                        maxWidth: '100%' // ensures long chip labels wrap or truncate
                      },
                      '& .MuiChip-root': {
                        margin: '2px' // spacing between chips
                      },
                      margin: '0 0 0 0',
                      padding: '0px 0px',
                      '& .MuiOutlinedInput-root': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none' // ✅ remove border including on focus
                        }
                      },
                      '& .MuiChip-root': {
                        backgroundColor: '#f0f0f0', // ✅ light background
                        color: '#000', // ✅ black text
                        fontWeight: 500
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#888', // Optional: change delete icon color
                        '&:hover': {
                          color: '#000'
                        }
                      }
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          color: 'black', // Text color
                          backgroundColor: 'white' // Optional: background for contrast
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography className={classes.labelText}>
                    {t('Users')}
                  </Typography>
                  <Autocomplete
                    multiple
                    options={userOptions || []}
                    value={selectedUsers}
                    onChange={(e, newValue) => handleUserSelect(newValue)}
                    isOptionEqualToValue={(option, value) =>
                      option._id === value._id
                    }
                    onInputChange={(event, inputValue) => {
                      debouncedSearchUsers(inputValue)
                    }}
                    getOptionLabel={option => option.name}
                    renderInput={params => (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Select Users"
                        className={globalClasses.input}
                        sx={{
                          '& .MuiInputBase-input': {
                            color: 'black',
                            '& fieldset': { border: 'none' }, // ❌ remove border
                            '&:hover fieldset': { border: 'none' },
                            '&.Mui-focused fieldset': { border: 'none' }
                          }
                        }}
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option._id}>
                        <Checkbox
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        <ListItemText
                          primary={option.name}
                          style={{ textTransform: 'capitalize', color: '#000' }}
                        />
                      </li>
                    )}
                    disableCloseOnSelect
                    sx={{
                      width: 300, // ✅ or a fixed width like '300px'
                      '& .MuiAutocomplete-inputRoot': {
                        flexWrap: 'wrap',
                        paddingRight: '8px',
                        alignItems: 'flex-start' // keeps label up
                      },
                      '& .MuiAutocomplete-tag': {
                        maxWidth: '100%' // ensures long chip labels wrap or truncate
                      },
                      '& .MuiChip-root': {
                        margin: '2px' // spacing between chips
                      },
                      margin: '0 0 0 0',
                      padding: '0px 0px',
                      '& .MuiOutlinedInput-root': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none' // ✅ remove border including on focus
                        }
                      },
                      '& .MuiChip-root': {
                        backgroundColor: '#f0f0f0', // ✅ light background
                        color: '#000', // ✅ black text
                        fontWeight: 500
                      },
                      '& .MuiChip-deleteIcon': {
                        color: '#888', // Optional: change delete icon color
                        '&:hover': {
                          color: '#000'
                        }
                      }
                    }}
                    slotProps={{
                      paper: {
                        sx: {
                          color: 'black', // Text color
                          backgroundColor: 'white' // Optional: background for contrast
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>
              {selectedAppliedTo === 'items' && (
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography className={classes.labelText}>
                      {t('Food')}
                    </Typography>
                    <Autocomplete
                      multiple
                      options={foodOptions || []}
                      value={selectedFoods}
                      onChange={(e, newValue) => handleFoodSelect(newValue)}
                      isOptionEqualToValue={(option, value) =>
                        option._id === value._id
                      }
                      onInputChange={(event, inputValue) => {
                        debouncedSearchFoods(inputValue)
                      }}
                      getOptionLabel={option => option.title}
                      renderInput={params => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Select Food"
                          className={globalClasses.input}
                          sx={{
                            '& .MuiInputBase-input': {
                              color: 'black',
                              '& fieldset': { border: 'none' }, // ❌ remove border
                              '&:hover fieldset': { border: 'none' },
                              '&.Mui-focused fieldset': { border: 'none' }
                            }
                          }}
                        />
                      )}
                      renderOption={(props, option, { selected }) => (
                        <li {...props} key={option._id}>
                          <Checkbox
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          <ListItemText
                            primary={option.title}
                            style={{
                              textTransform: 'capitalize',
                              color: '#000'
                            }}
                          />
                        </li>
                      )}
                      disableCloseOnSelect
                      sx={{
                        width: 300, // ✅ or a fixed width like '300px'
                        '& .MuiAutocomplete-inputRoot': {
                          flexWrap: 'wrap',
                          paddingRight: '8px',
                          alignItems: 'flex-start' // keeps label up
                        },
                        '& .MuiAutocomplete-tag': {
                          maxWidth: '100%' // ensures long chip labels wrap or truncate
                        },
                        '& .MuiChip-root': {
                          margin: '2px' // spacing between chips
                        },
                        margin: '0 0 0 0',
                        padding: '0px 0px',
                        '& .MuiOutlinedInput-root': {
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none' // ✅ remove border including on focus
                          }
                        },
                        '& .MuiChip-root': {
                          backgroundColor: '#f0f0f0', // ✅ light background
                          color: '#000', // ✅ black text
                          fontWeight: 500
                        },
                        '& .MuiChip-deleteIcon': {
                          color: '#888', // Optional: change delete icon color
                          '&:hover': {
                            color: '#000'
                          }
                        }
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            color: 'black', // Text color
                            backgroundColor: 'white' // Optional: background for contrast
                          }
                        }
                      }}
                    />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {loading ? t('Loading') : null}
          <Box>
            <Button
              type="submit"
              className={globalClasses.button}
              disabled={loading}
              // onClick={async e => {
              //   e.preventDefault()

              // }}
            >
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
              className={globalClasses.alertError}
              variant="filled"
              severity="error">
              {mainError}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default withTranslation()(CouponComponent)
