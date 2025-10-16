import React, { useState, useRef, useMemo } from 'react'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import { useMutation, gql, useQuery } from '@apollo/client'
import {
  createRestaurant,
  getBusinessCategories,
  getCities,
  getCuisines,
  getShopCategories,
  restaurantByOwner
} from '../../apollo'
import defaultLogo from '../../assets/img/defaultLogo.png'
import { FormControlLabel, IconButton } from '@mui/material'
import Close from '@mui/icons-material/Close'

import {
  Box,
  Alert,
  Typography,
  Button,
  Input,
  Switch,
  Grid,
  Checkbox,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  ListItemText
} from '@mui/material'

import ConfigurableValues from '../../config/constants'

import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { SHOP_TYPE } from '../../utils/enums'
import Dropdown from '../Dropdown'
import { useEffect } from 'react'

const CREATE_RESTAURANT = gql`
  ${createRestaurant}
`
const RESTAURANT_BY_OWNER = gql`
  ${restaurantByOwner}
`
const CUISINES = gql`
  ${getCuisines}
`
const GET_SHOP_CATEGORIES = gql`
  ${getShopCategories}
`

const GET_CITIES = gql`
  ${getCities}
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

const CreateRestaurant = props => {
  const { t } = props
  const owner = props.owner
  const [showPassword, setShowPassword] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [nameError, setNameError] = useState(null)
  const [usernameError, setUsernameError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const [addressError, setAddressError] = useState(null)
  const [deliveryTimeError, setDeliveryTimeError] = useState(null)
  const [minimumOrderError, setMinimumOrderError] = useState(null)
  const [salesTaxError, setSalesTaxError] = useState(null)
  const [restaurantCuisines, setRestaurantCuisines] = React.useState([])
  const [image, setImage] = useState(null)
  const [logo, setLogo] = useState(null)
  const [salesPersonName, setSalesPersonName] = useState('')
  const [responsiblePersonName, setResponsiblePersonName] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  const [uploadFile] = useMutation(UPLOAD_FILE)
  const [uploadRestaurantLogo] = useMutation(UPLOAD_LOGO)
  // const [shopType, setShopType] = useState(SHOP_TYPE.RESTAURANT)
  const [errors, setErrors] = useState('')
  const [success, setSuccess] = useState('')
  const [category, setCategory] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [restaurantCategories, setRestaurantCategories] = useState([])
  const [featured, setFeatured] = useState(false)

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

  const { data: businessCategoriesData } = useQuery(getBusinessCategories)

  console.log({ businessCategoriesData })

  const businessCategories =
    businessCategoriesData?.getBusinessCategories || null

  const cities = dataCities?.citiesAdmin || null
  console.log({ cities })
  const shopCategories = dataCategories?.getShopCategories || null

  const onCompleted = async data => {
    console.log({ data })
    const restaurantId = data.createRestaurant._id
    setTimeout(async () => {
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
    }, 3000)

    console.log('on complete here')
    setNameError(null)
    setAddressError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setErrors('')
    setSalesTaxError(null)
    setSuccess(t('RestaurantAdded'))
    clearFormValues()
    setTimeout(hideAlert, 5000)
  }
  const onError = ({ graphQLErrors, networkError }) => {
    console.log('graphQLErrors', graphQLErrors)
    console.log('networkErrors', networkError)
    setNameError(null)
    setAddressError(null)
    setUsernameError(null)
    setPasswordError(null)
    setDeliveryTimeError(null)
    setMinimumOrderError(null)
    setSalesTaxError(null)
    setSuccess('')
    if (graphQLErrors && graphQLErrors.length) {
      setErrors(graphQLErrors[0].message)
    }
    if (networkError) {
      setErrors(t('NetworkError'))
    }
    setTimeout(hideAlert, 5000)
  }
  const hideAlert = () => {
    setErrors('')
    setSuccess('')
  }

  useEffect(() => {
    if (shopCategories?.length) {
      setCategory(shopCategories[0]._id)
    }
  }, [shopCategories])

  const { data: cuisines } = useQuery(CUISINES)
  const cuisinesInDropdown = useMemo(
    () => cuisines?.cuisines?.map(item => item.name),
    [cuisines]
  )
  console.log({ owner })

  const [mutate, { loading }] = useMutation(CREATE_RESTAURANT, {
    onError,
    onCompleted
    // update
  })

  const formRef = useRef(null)

  const handleImage = e => {
    setImage(e.target.files[0])
  }
  const handleLogo = e => {
    setLogo(e.target.files[0])
  }

  const handleFileSelect = (event, type) => {
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

  const handleCloseModal = () => {
    props.onClose() // Update state to close modal
  }

  const onSubmitValidaiton = data => {
    const form = formRef.current
    const name = form.name.value
    const address = form.address.value
    const username = form.username.value
    const password = form.password.value
    // IMPORTANT!!!!
    const deliveryTime = form.deliveryTime.value
    const minimumOrder = form.minimumOrder.value
    const salesTax = +form.salesTax.value

    const nameError = !validateFunc({ name }, 'name')
    const addressError = !validateFunc({ address }, 'address')

    const deliveryTimeError = !validateFunc(
      { deliveryTime: deliveryTime },
      'deliveryTime'
    )
    const minimumOrderError = !validateFunc(
      { minimumOrder: minimumOrder },
      'minimumOrder'
    )
    const usernameError = !validateFunc({ name: username }, 'name')
    const passwordError = !validateFunc({ password }, 'password')
    const salesTaxError = !validateFunc({ salesTax }, 'salesTax')

    if (deliveryTime < 0 || minimumOrder < 0 || salesTax < 0) {
      setDeliveryTimeError(true)
      setMinimumOrderError(true)
      setSalesTaxError(true)
      setErrors(t('Negative Values Not Allowed'))
      return false
    }

    setNameError(nameError)
    setAddressError(addressError)
    setUsernameError(usernameError)
    setPasswordError(passwordError)
    setDeliveryTimeError(deliveryTimeError)
    setMinimumOrderError(minimumOrderError)
    setSalesTaxError(salesTaxError)
    if (
      !(
        nameError &&
        addressError &&
        usernameError &&
        passwordError &&
        deliveryTimeError &&
        minimumOrderError &&
        salesTaxError
      )
    ) {
      setErrors(t('FieldsRequired'))
    }
    return (
      nameError &&
      addressError &&
      usernameError &&
      passwordError &&
      deliveryTimeError &&
      minimumOrderError &&
      salesTaxError
    )
  }
  function update(cache, { data: { createRestaurant } }) {
    const { restaurantByOwner } = cache.readQuery({
      query: RESTAURANT_BY_OWNER,
      variables: { id: owner }
    })
    cache.writeQuery({
      query: RESTAURANT_BY_OWNER,
      variables: { id: owner },
      data: {
        restaurantByOwner: {
          ...restaurantByOwner,
          restaurants: [...restaurantByOwner.restaurants, createRestaurant]
        }
      }
    })
  }
  const clearFormValues = () => {
    const form = formRef.current
    form.name.value = ''
    form.address.value = ''
    form.username.value = ''
    form.password.value = ''
    form.deliveryTime.value = 20
    form.minimumOrder.value = 0
    setImgUrl('')
  }

  const handleCategoryChange = e => {
    setCategory(e.target.value)
  }

  console.log({ salesTax: formRef?.current?.salesTax?.value })

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

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <Box container className={classes.container}>
      <Box style={{ alignItems: 'start' }} className={classes.flexRow}>
        <Box item className={classes.heading}>
          <Typography variant="h6" className={classes.text}>
            {t('AddRestaurant')}
          </Typography>
        </Box>
        <Box ml={10} mt={1}>
          <label>{t('Available')}</label>
          <Switch defaultChecked style={{ color: 'black' }} />
        </Box>
        <IconButton
          onClick={handleCloseModal}
          style={{ position: 'absolute', right: 5, top: 35 }}>
          <Close />
        </IconButton>
      </Box>

      <Box className={classes.form}>
        <form ref={formRef}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t('Username')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  name="username"
                  id="input-type-username"
                  placeholder={t('RestaurantUsername')}
                  type="text"
                  defaultValue={''}
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
                    event.target.value = event.target.value
                      .trim()
                      .replace(/\s/g, '')
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
                  placeholder={t('RestaurantPassword')}
                  type={showPassword ? 'text' : 'password'}
                  defaultValue={''}
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
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography className={classes.labelText}>
                  {t('Name')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  name="name"
                  id="input-type-name"
                  placeholder={t('RestaurantName')}
                  type="text"
                  defaultValue={''}
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
                  placeholder={t('RestaurantAddress')}
                  type="text"
                  defaultValue={''}
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
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                className={[globalClasses.input]}>
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
                    defaultValue={shopCategories[0]._id}
                    className={[globalClasses.input]}
                    onChange={handleCategoryChange}>
                    {shopCategories?.map(item => (
                      <MenuItem
                        value={item._id}
                        key={item._id}
                        style={{ color: 'black' }}>
                        {item.title.toUpperCase()}
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
                  value={restaurantCuisines}
                  onChange={handleCuisineChange}
                  input={<OutlinedInput />}
                  renderValue={selected => selected.join(', ')}
                  MenuProps={MenuProps}
                  className={[globalClasses.input]}
                  style={{ margin: '0 0 0 -20px', padding: '0px 0px' }}>
                  {cuisinesInDropdown?.map(cuisine => (
                    <MenuItem
                      key={'restaurant-cuisine-' + cuisine}
                      value={cuisine}
                      style={{ color: '#000000', textTransform: 'capitalize' }}>
                      <Checkbox
                        checked={restaurantCuisines.indexOf(cuisine) > -1}
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
                  {t('business_categories')}
                </Typography>
                <Select
                  multiple
                  value={restaurantCategories}
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
                <label htmlFor="file-upload" className={classes.fileUpload}>
                  {t('UploadAnImage')}
                </label>
                <input
                  className={classes.file}
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={event => {
                    handleFileSelect(event, 'image')
                    handleImage(event)
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
                <label htmlFor="logo-upload" className={classes.fileUpload}>
                  {t('UploadaLogo')}
                </label>
                <input
                  className={classes.file}
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={event => {
                    handleFileSelect(event, 'logo')
                    handleLogo(event)
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          {console.log({ selectedCity })}
          <Box>
            <Button
              className={globalClasses.button}
              disabled={loading}
              onClick={async e => {
                e.preventDefault()
                if (onSubmitValidaiton()) {
                  // const imgUpload = await uploadImageToCloudinary(imgUrl)
                  // const logoUpload = await uploadImageToCloudinary(logoUrl)
                  let img, lgo
                  const form = formRef.current
                  const name = form.name.value
                  const address = form.address.value
                  const deliveryTime = form.deliveryTime.value
                  const minimumOrder = form.minimumOrder.value
                  const username = form.username.value
                  const password = form.password.value
                  const salesTax = form.salesTax.value
                  const shopType = category
                  console.log({ salesTax })
                  mutate({
                    variables: {
                      owner,
                      restaurant: {
                        name,
                        address,
                        image:
                          img ||
                          'https://enatega.com/wp-content/uploads/2023/11/man-suit-having-breakfast-kitchen-side-view.webp',
                        logo: lgo || defaultLogo,
                        deliveryTime: Number(deliveryTime),
                        minimumOrder: Number(minimumOrder),
                        username,
                        password,
                        shopType,
                        cuisines: restaurantCuisines,
                        salesTax: parseInt(form.salesTax.value),
                        city: selectedCity,
                        businessCategories: restaurantCategories.map(
                          item => item._id
                        ),
                        salesPersonName,
                        responsiblePersonName,
                        contactNumber,
                        featured
                      }
                    }
                  })
                }
              }}>
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
    </Box>
  )
}
export default withTranslation()(CreateRestaurant)
