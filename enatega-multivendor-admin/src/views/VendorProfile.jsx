import React, { useState, useRef, useMemo, useEffect } from 'react'
import { validateFunc } from '../constraints/constraints'
import { withTranslation, useTranslation } from 'react-i18next'
import Header from '../components/Headers/Header'
import { useQuery, useMutation, gql } from '@apollo/client'
import {
  getRestaurantProfile,
  editRestaurant,
  getCuisines,
  getCities,
  getShopCategories,
  getBusinessCategories
} from '../apollo'
import ConfigurableValues from '../config/constants'
import useStyles from '../components/Restaurant/styles'
import useGlobalStyles from '../utils/globalStyles'
import defaultLogo from '../assets/img/defaultLogo.png'
import {
  Box,
  Alert,
  Typography,
  Button,
  Input,
  Grid,
  Checkbox,
  Select,
  OutlinedInput,
  MenuItem,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material'
import { Container } from '@mui/system'
import CustomLoader from '../components/Loader/CustomLoader'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { SHOP_TYPE } from '../utils/enums'
import Dropdown from '../components/Dropdown'

const GET_PROFILE = gql`
  ${getRestaurantProfile}
`
const EDIT_RESTAURANT = gql`
  ${editRestaurant}
`
const CUISINES = gql`
  ${getCuisines}
`
const GET_CITIES = gql`
  ${getCities}
`

const GET_SHOP_CATEGORIES = gql`
  ${getShopCategories}
`
const UPLOAD_FILE = gql`
  mutation uploadFile($id: ID!, $file: Upload!) {
    uploadFile(id: $id, file: $file) {
      message
    }
  }
`
const UPLOAD_LOGO = gql`
  mutation uploadRestaurantLogo($id: ID!, $file: Upload!) {
    uploadRestaurantLogo(id: $id, file: $file) {
      message
    }
  }
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

const VendorProfile = () => {
  const { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } = ConfigurableValues()
  // console.log('here')
  const { t } = useTranslation()
  const [uploadFile] = useMutation(UPLOAD_FILE)
  const [uploadRestaurantLogo] = useMutation(UPLOAD_LOGO)

  const restaurantId = localStorage.getItem('restaurantId')
  console.log({ restaurantId })
  const [showPassword, setShowPassword] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [nameError, setNameError] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [addressError, setAddressError] = useState(null)
  const [prefixError, setPrefixError] = useState(null)
  const [deliveryTimeError, setDeliveryTimeError] = useState(null)
  const [minimumOrderError, setMinimumOrderError] = useState(null)
  const [salesTaxError, setSalesTaxError] = useState(null)
  const [errors, setErrors] = useState('')
  const [success, setSuccess] = useState('')
  const [restaurantCuisines, setRestaurantCuisines] = useState([])
  const [restaurantCategories, setRestaurantCategories] = useState([])
  const [image, setImage] = useState(null)
  const [logo, setLogo] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [category, setCategory] = useState('')
  const [salesPersonName, setSalesPersonName] = useState('')
  const [responsiblePersonName, setResponsiblePersonName] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [featured, setFeatured] = useState(false)

  const onCompleted = data => {
    setNameError(null)
    setAddressError(null)
    setPrefixError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setErrors('')
    setSuccess(t('RestaurantUpdatedSuccessfully'))
    setTimeout(hideAlert, 5000)
  }

  const onError = ({ graphQLErrors, networkError }) => {
    setNameError(null)
    setAddressError(null)
    setPrefixError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setSuccess('')
    if (graphQLErrors) {
      setErrors(graphQLErrors[0].message)
    }
    if (networkError) {
      setErrors(networkError.result.errors[0].message)
    }
    setTimeout(hideAlert, 5000)
  }
  const hideAlert = () => {
    setErrors('')
    setSuccess('')
  }

  const { data, error: errorQuery, loading: loadingQuery } = useQuery(
    GET_PROFILE,
    {
      variables: { id: restaurantId }
    }
  )

  console.log({ data })

  const {
    data: dataCategories,
    loading: loadingCategories,
    error: errorCategories
  } = useQuery(GET_SHOP_CATEGORIES)

  const {
    data: dataCities,
    error: errorCities,
    loading: loadingCities
  } = useQuery(GET_CITIES)

  const cities = dataCities?.citiesAdmin || null
  const restaurantImage = data?.restaurant?.image
  const restaurantLogo = data?.restaurant?.logo
  const shopCategories = dataCategories?.getShopCategories || null

  const [mutate, { loading }] = useMutation(EDIT_RESTAURANT, {
    onError,
    onCompleted,
    refetchQueries: [GET_PROFILE]
  })

  useEffect(() => {
    if (data?.restaurant?.shopCategory) {
      setCategory(data?.restaurant.shopCategory._id)
    }
    if (data?.restaurant?.salesPersonName) {
      setSalesPersonName(data?.restaurant.salesPersonName)
    }
    if (data?.restaurant?.responsiblePersonName) {
      setResponsiblePersonName(data?.restaurant.responsiblePersonName)
    }
    if (data?.restaurant?.contactNumber) {
      setContactNumber(data?.restaurant.contactNumber)
    }
    if (data?.restaurant?.isVisible) {
      setIsVisible(data?.restaurant?.isVisible)
    }
    if (data?.restaurant?.featured) {
      setFeatured(data?.restaurant?.featured)
    }
  }, [data?.restaurant])

  const formRef = useRef(null)

  const handleFileSelect = (event, type) => {
    setImage(event.target.files[0])
    let result
    result = filterImage(event)
    if (result) imageToBase64(result, type)
  }
  const handleLogoSelect = (event, type) => {
    setLogo(event.target.files[0])
    let result
    result = filterImage(event)
    if (result) imageToBase64(result, type)
  }

  const filterImage = event => {
    let images = []
    for (var i = 0; i < event.target.files.length; i++) {
      images[i] = event.target.files.item(i)
    }
    images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
    return images.length ? images[0] : undefined
  }

  const imageToBase64 = (imgUrl, type) => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      if (type === 'image' && fileReader.result) {
        setImgUrl(fileReader.result)
      } else if (type === 'logo' && fileReader.result) {
        setLogoUrl(fileReader.result)
      }
    }
    fileReader.readAsDataURL(imgUrl)
  }

  const onSubmitValidaiton = data => {
    const form = formRef.current
    const name = form.name.value
    const address = form.address.value
    const username = form.username.value
    const password = form.password.value
    // IMPORTANT!!!!
    const prefix = form.prefix.value
    const deliveryTime = form.deliveryTime.value
    const minimumOrder = form.minimumOrder.value
    const salesTax = +form.salesTax.value

    // Check if deliveryTime, minimumOrder, and salesTax are negative
    if (deliveryTime < 0) {
      setDeliveryTimeError(true)
      setErrors(t('DeliveryTime cannot be negative'))
      return false
    }
    if (minimumOrder < 0) {
      setMinimumOrderError(true)
      setErrors(t('Minimum Order cannot be negative'))
      return false
    }
    if (salesTax < 0) {
      setSalesTaxError(true)
      setErrors(t('Sales Tax cannot be negative'))
      return false
    }

    const nameErrors = !validateFunc({ name }, 'name')
    const addressErrors = !validateFunc({ address }, 'address')
    const prefixErrors = !validateFunc({ prefix: prefix }, 'prefix')
    const deliveryTimeErrors = !validateFunc(
      { deliveryTime: deliveryTime },
      'deliveryTime'
    )
    const minimumOrderErrors = !validateFunc(
      { minimumOrder: minimumOrder },
      'minimumOrder'
    )
    const usernameErrors = !validateFunc({ name: username }, 'name')
    const passwordErrors = !validateFunc({ password }, 'password')
    const salesTaxError = !validateFunc({ salesTax }, 'salesTax')
    setNameError(nameErrors)
    setAddressError(addressErrors)
    setPrefixError(prefixErrors)
    setUsernameError(usernameErrors)
    setPasswordError(passwordErrors)
    setDeliveryTimeError(deliveryTimeErrors)
    setMinimumOrderError(minimumOrderErrors)
    setSalesTaxError(salesTaxError)
    if (
      !(
        nameErrors &&
        addressErrors &&
        prefixErrors &&
        usernameErrors &&
        passwordErrors &&
        deliveryTimeErrors &&
        minimumOrderErrors &&
        salesTaxError
      )
    ) {
      setErrors(t('FieldsRequired'))
    }
    return (
      nameErrors &&
      addressErrors &&
      prefixErrors &&
      usernameErrors &&
      passwordErrors &&
      deliveryTimeErrors &&
      minimumOrderErrors &&
      salesTaxError
    )
  }

  const { data: cuisines } = useQuery(CUISINES)
  const { data: businessCategoriesData } = useQuery(getBusinessCategories)

  console.log({ businessCategoriesData })

  const businessCategories =
    businessCategoriesData?.getBusinessCategories || null

  useEffect(() => {
    if (
      businessCategories?.length &&
      data?.restaurant?.businessCategories?.length
    ) {
      const initialObjects = data.restaurant.businessCategories
        // for each saved ID, find the matching full object
        .map(item => businessCategories.find(cat => cat._id === item._id))
        // drop any IDs that didn’t match
        .filter(Boolean)

      console.log({ initialObjects })

      setRestaurantCategories(initialObjects)
    }
  }, [businessCategories, data?.restaurant?.businessCategories])

  console.log({ restaurantCategories })

  const cuisinesInDropdown = useMemo(
    () => cuisines?.cuisines?.map(item => item.name),
    [cuisines]
  )
  const handleCuisineChange = event => {
    const {
      target: { value }
    } = event
    setRestaurantCuisines(typeof value === 'string' ? value.split(',') : value)
  }

  const handleBusinessCategoryChange = e => {
    console.log({ values: e.target.value })
    setRestaurantCategories(e.target.value)
  }

  useEffect(() => {
    setRestaurantCuisines(data?.restaurant?.cuisines)
  }, [data?.restaurant?.cuisines])

  useEffect(() => {
    setSelectedCity(data?.restaurant?.city?._id)
  }, [data])

  useEffect(() => {
    if (restaurantImage) setImgUrl(restaurantImage)
    if (restaurantLogo) setLogoUrl(restaurantLogo)
  }, [restaurantImage, restaurantLogo])

  const handleSubmit = async e => {
    e.preventDefault()

    if (onSubmitValidaiton()) {
      const form = formRef.current
      const name = form.name.value
      const address = form.address.value
      const prefix = form.prefix.value // can we not update this?
      const deliveryTime = form.deliveryTime.value
      const minimumOrder = form.minimumOrder.value
      const username = form.username.value
      const password = form.password.value
      const salesTax = form.salesTax.value
      const shopType = !category ? data?.restaurant.shopCategory._id : category
      const city = selectedCity

      mutate({
        variables: {
          restaurantInput: {
            _id: restaurantId,
            name,
            address,
            orderPrefix: prefix,
            deliveryTime: Number(deliveryTime),
            minimumOrder: Number(minimumOrder),
            username: username,
            password: password,
            salesTax: +salesTax,
            shopType,
            cuisines: restaurantCuisines,
            businessCategories: restaurantCategories.map(item => item._id),
            city,
            salesPersonName,
            responsiblePersonName,
            contactNumber,
            isVisible,
            featured
          }
        }
      })
    }
    if (image) {
      console.log({ image })
      const restaurantImage = await uploadFile({
        variables: { id: restaurantId, file: image }
      })
      console.log('File uploaded:', restaurantImage.data)
    }
    if (logo) {
      console.log({ logo })
      const restaurantLogo = await uploadRestaurantLogo({
        variables: { id: restaurantId, file: logo }
      })
      console.log('Logo uploaded:', restaurantLogo.data)
    }
  }

  const handleCategoryChange = e => {
    setCategory(e.target.value)
  }

  const foundBusinessCategory = singleItem => {
    const foundItem = restaurantCategories?.find(
      item => item._id === singleItem
    )
    if (foundItem) {
      return true
    }
    return false
  }

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <>
      <Header />
      <Container className={globalClasses.flex} fluid>
        <Box container className={classes.container}>
          <Box style={{ alignItems: 'start' }} className={classes.flexRow}>
            <Box item className={classes.heading2}>
              <Typography variant="h6" className={classes.textWhite}>
                {t('UpdateProfile')}
              </Typography>
            </Box>
          </Box>
          {errorQuery && <span>{errorQuery.message}</span>}
          {loadingQuery ? (
            <CustomLoader />
          ) : (
            <Box className={classes.form}>
              <form ref={formRef}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('RestaurantUsername')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="username"
                        id="input-type-username"
                        placeholder={t('RestaurantUsername')}
                        type="text"
                        defaultValue={(data && data.restaurant.username) || ''}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          usernameError === false
                            ? globalClasses.inputError
                            : usernameError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                        onChange={event => {
                          if (event.target.value.includes(' ')) {
                            const usernameWithoutSpaces = event.target.value.replace(
                              / /g,
                              ''
                            )
                            event.target.value = usernameWithoutSpaces
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Password')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="password"
                        id="input-type-password"
                        placeholder={t('PHRestaurantPassword')}
                        type={showPassword ? 'text' : 'password'}
                        defaultValue={(data && data.restaurant.password) || ''}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          passwordError === false
                            ? globalClasses.inputError
                            : passwordError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                        endAdornment={
                          <InputAdornment position="end">
                            <Checkbox
                              checked={showPassword}
                              onChange={() => setShowPassword(!showPassword)}
                              color="primary"
                              icon={<VisibilityOffIcon />}
                              checkedIcon={<VisibilityIcon />}
                            />
                          </InputAdornment>
                        }
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Name')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="name"
                        id="input-type-name"
                        placeholder={t('PHRestaurantName')}
                        type="text"
                        defaultValue={(data && data.restaurant.name) || ''}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          nameError === false
                            ? globalClasses.inputError
                            : nameError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Address')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="address"
                        id="input-type-address"
                        placeholder={t('PHRestaurantAddress')}
                        type="text"
                        defaultValue={(data && data.restaurant.address) || ''}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          addressError === false
                            ? globalClasses.inputError
                            : addressError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('DeliveryTime')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="deliveryTime"
                        id="input-type-delivery-time"
                        placeholder={t('DeliveryTime')}
                        type="number"
                        defaultValue={data && data.restaurant.deliveryTime}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          deliveryTimeError === false
                            ? globalClasses.inputError
                            : deliveryTimeError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('MinOrder')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="minimumOrder"
                        id="input-type-minimum-order"
                        placeholder={t('MinOrder')}
                        type="number"
                        disableUnderline
                        defaultValue={data && data.restaurant.minimumOrder}
                        className={[
                          globalClasses.input,
                          minimumOrderError === false
                            ? globalClasses.inputError
                            : minimumOrderError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('SalesTax')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="salesTax"
                        id="input-type-sales-tax"
                        placeholder={t('SalesTax')}
                        type="number"
                        defaultValue={data && data.restaurant.tax}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          salesTaxError === false
                            ? globalClasses.inputError
                            : salesTaxError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('OrderPrefix')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="prefix"
                        id="input-type-order_id_prefix"
                        placeholder={t('OrderPrefix')}
                        type="text"
                        defaultValue={data && data.restaurant.orderPrefix}
                        disableUnderline
                        className={[
                          globalClasses.input,
                          prefixError === false
                            ? globalClasses.inputError
                            : prefixError === true
                            ? globalClasses.inputSuccess
                            : ''
                        ]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('sales_person')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        placeholder={t('sales_person')}
                        type="text"
                        disableUnderline
                        name="salesPersonName"
                        value={salesPersonName}
                        onChange={e => setSalesPersonName(e.target.value)}
                        className={[globalClasses.input]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('responsiblePersonName')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="responsiblePersonName"
                        value={responsiblePersonName}
                        onChange={e => setResponsiblePersonName(e.target.value)}
                        placeholder={t('responsiblePersonName')}
                        type="text"
                        disableUnderline
                        className={[globalClasses.input]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('contactNumber')}
                      </Typography>
                      <Input
                        style={{ marginTop: -1 }}
                        name="contactNumber"
                        value={contactNumber}
                        onChange={e => setContactNumber(e.target.value)}
                        placeholder={t('contactNumber')}
                        type="text"
                        disableUnderline
                        className={[globalClasses.input]}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography className={classes.labelText}>
                      {t('Select City')}
                    </Typography>
                    <Select
                      id="input-city"
                      name="input-city"
                      defaultValue={data?.restaurant?.city?._id || ''}
                      value={selectedCity || data?.restaurant?.city?._id || ''}
                      onChange={e => setSelectedCity(e.target.value)}
                      displayEmpty
                      inputProps={{ 'aria-label': 'Without label' }}
                      className={[globalClasses.input]}>
                      {!selectedCity && !data?.restaurant.city?._id && (
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {loadingCategories && <Typography>Loading...</Typography>}
                    {errorCategories && (
                      <Typography>Error fetching categories</Typography>
                    )}
                    {shopCategories?.length && !loadingCategories ? (
                      <Box>
                        <Typography className={classes.labelText}>
                          {t('Shop Category')}
                        </Typography>
                        <Select
                          style={{ margin: '0 0 0 0', padding: '0px 0px' }}
                          defaultValue={
                            data?.restaurant?.shopCategory?._id
                              ? data?.restaurant.shopCategory._id
                              : category
                          }
                          className={[globalClasses.input]}
                          onChange={handleCategoryChange}>
                          {shopCategories?.map(item => (
                            <MenuItem
                              value={item._id}
                              key={item._id}
                              style={{ color: 'black' }}>
                              {item.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    ) : (
                      <Typography>Add shop categories</Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Cuisines')}
                      </Typography>
                      <Select
                        multiple
                        onChange={handleCuisineChange}
                        input={<OutlinedInput />}
                        value={restaurantCuisines}
                        renderValue={selected => selected.join(', ')}
                        defaultValue={data?.restaurant?.cuisines}
                        MenuProps={MenuProps}
                        className={[globalClasses.input]}
                        style={{ margin: '0 0 0 -20px', padding: '0px 0px' }}>
                        {cuisinesInDropdown?.map(cuisine => (
                          <MenuItem
                            key={'restaurant-cuisine-' + cuisine}
                            value={cuisine}
                            style={{
                              color: '#000000',
                              textTransform: 'capitalize'
                            }}>
                            <Checkbox
                              checked={
                                restaurantCuisines?.indexOf(cuisine) > -1
                              }
                            />
                            <ListItemText primary={cuisine} />
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Visibility')}
                      </Typography>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          marginInlineStart: 20
                        }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={isVisible}
                              onChange={e => setIsVisible(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Restaurant Visible"
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('Featured')}
                      </Typography>
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          marginInlineStart: 20
                        }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={featured}
                              onChange={e => setFeatured(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Featured"
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography className={classes.labelText}>
                        {t('business_categories')}
                      </Typography>
                      <Select
                        multiple
                        value={restaurantCategories}
                        defaultChecked={data?.restaurant?.businessCategories}
                        defaultValue={data?.restaurant?.businessCategories}
                        onChange={handleBusinessCategoryChange}
                        input={<OutlinedInput />}
                        renderValue={selected =>
                          selected.map(item => item.name).join(', ')
                        }
                        isOptionEqualToValue={(option, value) =>
                          option._id === value._id
                        }
                        MenuProps={MenuProps}
                        className={[globalClasses.input]}
                        style={{ margin: '0 0 0 -20px', padding: '0px 0px' }}>
                        {businessCategories?.map(item => (
                          <MenuItem
                            key={item._id}
                            value={item}
                            style={{
                              color: '#000000',
                              textTransform: 'capitalize'
                            }}>
                            <Checkbox
                              checked={restaurantCategories.some(
                                cat => cat._id === item._id
                              )}
                            />
                            <ListItemText primary={item.name} />
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      mt={3}
                      style={{ alignItems: 'center' }}
                      className={globalClasses.flex}>
                      <img
                        className={classes.image}
                        alt="..."
                        src={
                          imgUrl ||
                          'https://enatega.com/wp-content/uploads/2023/11/man-suit-having-breakfast-kitchen-side-view.webp'
                        }
                      />
                      <label
                        htmlFor="file-upload"
                        className={classes.fileUpload}>
                        {t('UploadAnImage')}
                      </label>
                      <input
                        className={classes.file}
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          handleFileSelect(e, 'image')
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      mt={3}
                      style={{ alignItems: 'center' }}
                      className={globalClasses.flex}>
                      <img
                        className={classes.image}
                        alt="..."
                        src={logoUrl || defaultLogo}
                      />
                      <label
                        htmlFor="logo-upload"
                        className={classes.fileUpload}>
                        {t('UploadaLogo')}
                      </label>
                      <input
                        className={classes.file}
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          handleLogoSelect(e, 'logo')
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                <Box>
                  <Button
                    className={globalClasses.button}
                    disabled={loading}
                    onClick={handleSubmit}>
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
                {errors && (
                  <Alert
                    className={globalClasses.alertError}
                    variant="filled"
                    severity="error">
                    {errors}
                  </Alert>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </>
  )
}
export default withTranslation()(VendorProfile)
