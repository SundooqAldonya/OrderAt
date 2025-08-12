import React, { useState, useRef } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import ConfigurableValues from '../../config/constants'
import {
  getRestaurantDetail,
  createFood,
  editFood,
  categoriesByRestaurants,
  getFoodListByRestaurant,
  getAddonsByRestaurant,
  getStockUnits
} from '../../apollo'
import AddonComponent from '../Addon/Addon'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Box,
  Typography,
  Input,
  Alert,
  Modal,
  Button,
  Select,
  MenuItem,
  Grid,
  Checkbox,
  FormControlLabel,
  useTheme
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import foodPlaceholder from '../../assets/food_placeholder.jpeg'

const GET_FOODS = gql`
  ${getFoodListByRestaurant}
`

const CREATE_FOOD = gql`
  ${createFood}
`
const EDIT_FOOD = gql`
  ${editFood}
`
const GET_CATEGORIES = gql`
  ${categoriesByRestaurants}
`
const GET_ADDONS = gql`
  ${getAddonsByRestaurant}
`

function Food(props) {
  const theme = useTheme()
  // const { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } = ConfigurableValues()
  const formRef = useRef()
  const mutation = props.food ? EDIT_FOOD : CREATE_FOOD
  const [title, setTitle] = useState(props.food ? props.food.title : '')
  const [description, setDescription] = useState(
    props.food ? props.food.description : ''
  )
  const [category, setCategory] = useState(
    props.food ? props.food.category._id : ''
  )
  const [editModal, setEditModal] = useState(false)
  const [image, setImage] = useState({})
  const [selectedStockUnit, setSelectedStockUnit] = useState(
    props?.food?.stock ? props.food.stock : ''
  )
  const [selectedStockVariation, setSelectedStockVariation] = useState(
    props?.food?.stock ? props.food.stock : ''
  )
  // const [stockAmount, setStockAmount] = useState('')

  const [imgMenu, imgMenuSetter] = useState(props.food ? props.food.image : '')
  const [variationIndex, variationIndexSetter] = useState(0)
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [titleError, titleErrorSetter] = useState(null)
  const [categoryError, categoryErrorSetter] = useState(null)
  const [addonModal, addonModalSetter] = useState(false)
  const [variation, setVariation] = useState(
    props.food && props.food.variations.length
      ? props.food?.variations?.map(
          ({ _id, title, price, discounted, addons, stock }) => {
            return {
              _id,
              title,
              price,
              discounted,
              addons,
              titleError: null,
              priceError: null,
              stock
            }
          }
        )
      : [
          {
            title: '',
            price: '',
            discounted: '',
            addons: [],
            titleError: null,
            priceError: null,
            stock: ''
          }
        ]
  )

  const restaurantId = localStorage.getItem('restaurantId')

  // const {
  //   data: dataStockUnits,
  //   loading: loadingStockUnits,
  //   error: errorStockUnits
  // } = useQuery(getStockUnits)

  // console.log({ dataStockUnits })
  // const stockUnits = dataStockUnits?.getStockEnumValues || null
  const stockUnits = ['In Stock', 'Low Stock', 'Out of Stock']

  const clearFields = () => {
    // formRef.current.reset()
    setVariation([
      {
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      }
    ])
    imgMenuSetter('')
    titleErrorSetter(null)
    categoryErrorSetter(null)
  }

  const onDismiss = () => {
    successSetter('')
    mainErrorSetter('')
  }

  const onError = error => {
    mainErrorSetter(`${t('ActionFailedTryAgain')} ${error}`)
    successSetter('')
    setTimeout(onDismiss, 3000)
  }
  const onCompleted = data => {
    console.log({ data })

    if (!props.food) clearFields()
    const message = props.food
      ? t('FoodUpdatedSuccessfully')
      : t('FoodAddedSuccessfully')
    mainErrorSetter('')
    successSetter(message)
    setTitle('')
    setDescription('')
    setSelectedStockUnit('')
    setTimeout(onDismiss, 3000)
  }

  const [mutate, { loading: mutateLoading }] = useMutation(mutation, {
    onError,
    onCompleted,
    refetchQueries: [{ query: GET_FOODS, variables: { id: restaurantId } }]
  })

  const {
    data: dataCategories,
    error: errorCategories,
    loading: loadingCategories
  } = useQuery(GET_CATEGORIES, {
    variables: {
      id: restaurantId
    }
  })

  const {
    data: dataAddons,
    error: errorAddons,
    loading: loadingAddons
  } = useQuery(GET_ADDONS, {
    variables: {
      id: restaurantId
    }
  })

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const filterImage = event => {
    let images = []
    for (var i = 0; i < event.target.files.length; i++) {
      images[i] = event.target.files.item(i)
    }
    images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
    return images.length ? images[0] : undefined
  }

  const imageToBase64 = imgUrl => {
    const fileReader = new FileReader()
    fileReader.onloadend = () => {
      imgMenuSetter(fileReader.result)
    }
    fileReader.readAsDataURL(imgUrl)
  }

  const selectImage = (event, state) => {
    const result = filterImage(event)
    if (result) imageToBase64(result)
  }

  const onAdd = index => {
    const variations = variation
    if (index === variations.length - 1) {
      variations.push({
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      })
    } else {
      variations.splice(index + 1, 0, {
        title: '',
        price: '',
        discounted: '',
        addons: [],
        titleError: null,
        priceError: null
      })
    }
    setVariation([...variations])
  }

  const onRemove = index => {
    if (variation.length === 1 && index === 0) {
      return
    }
    const variations = variation
    variations.splice(index, 1)
    setVariation([...variations])
  }

  console.log({ variation })

  const handleVariationChange = (event, index, type) => {
    setVariation(prev => {
      const updated = [...prev] // shallow copy array
      const updatedItem = { ...updated[index] } // shallow copy the item
      const value = event.target.value

      if (type === 'title') {
        updatedItem[type] = value.length === 1 ? value.toUpperCase() : value
      } else if (type === 'discounted') {
        const newValue = Math.max(0, parseFloat(value))
        if (newValue > 0) {
          updatedItem[type] = newValue
        }
      } else {
        updatedItem[type] = value
      }

      updated[index] = updatedItem // replace with cloned and modified item
      return updated
    })
  }

  const onSubmitValidaiton = () => {
    const titleError = !validateFunc(
      { title: formRef.current['input-title'].value },
      'title'
    )
    const categoryError = !validateFunc(
      { category: formRef.current['input-category'].value },
      'category'
    )
    // const variations = variation
    // variations.map(variationItem => {
    //   variationItem.priceError = !validateFunc(
    //     { price: variationItem.price },
    //     'price'
    //   )
    //   let error = false
    //   const occ = variation.filter(v => v.title === variationItem.title)
    //   if (occ.length > 1) error = true
    //   variationItem.titleError = error
    //     ? !error
    //     : variations.length > 1
    //     ? !validateFunc({ title: variationItem.title }, 'title')
    //     : true

    //   return variationItem
    // })
    // const variationsError = !variation.filter(
    //   variationItem => !variationItem.priceError || !variationItem.titleError
    // ).length
    titleErrorSetter(titleError)
    categoryErrorSetter(categoryError)
    // setVariation([...variations])
    // return titleError && categoryError && variationsError
    return titleError && categoryError
  }

  const onBlurVariation = (index, type) => {
    const variations = [...variation]
    if (type === 'title') {
      const occ = variations.filter(v => v.title === variations[index][type])
      if (occ.length > 1) {
        variations[index][type + 'Error'] = false
      } else {
        variations[index][type + 'Error'] =
          variations.length > 1
            ? !validateFunc({ [type]: variations[index][type] }, type)
            : true
      }
    }

    if (type === 'price') {
      variations[index][type + 'Error'] = !validateFunc(
        { [type]: variations[index][type] },
        type
      )
    }
    setVariation([...variations])
  }

  const updateAddonsList = ids => {
    const variations = variation
    variations[variationIndex].addons = variations[
      variationIndex
    ].addons.concat(ids)
    setVariation([...variations])
  }

  // show Create Addon modal
  const toggleModal = index => {
    addonModalSetter(prev => !prev)
    variationIndexSetter(index)
  }

  const onSelectAddon = (index, id) => {
    const variations = variation
    // const addon = variations[index].addons.indexOf(id)
    const foundAddon = variations[index].addons.find(item => item === id)
    console.log({ foundAddon })
    if (foundAddon) {
      const newArr = variations[index].addons.filter(item => item !== id)
      variations[index].addons = newArr
      console.log({ newArr })
      setVariation([...variations])
    } else {
      variations[index].addons = [...variations[index].addons, id]
      setVariation([...variations])
    }

    // if (addon < 0) variations[index].addons.push(id)
    // else variations[index].addons.splice(addon, 1)
  }

  const foundAddon = (index, id) => {
    const variations = variation
    const foundAddon = variations[index].addons.find(item => item === id)
    if (foundAddon) return true
    return false
  }

  const closeEditModal = () => {
    setEditModal(false)
  }

  const { t } = props
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box
          item
          className={props.food ? classes.headingBlack : classes.heading}>
          <Typography variant="h6" className={classes.textWhite}>
            {props.food ? t('Edit Food') : t('Add Food')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form ref={formRef}>
          <Box>
            <Typography className={classes.labelText}>{t('Title')}</Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-title"
              name="input-title"
              placeholder={t('Title')}
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={event =>
                onBlur(titleErrorSetter, 'title', event.target.value)
              }
              disableUnderline
              className={[
                globalClasses.input,
                titleError === false
                  ? globalClasses.inputError
                  : titleError === true
                  ? globalClasses.inputSuccess
                  : ''
              ]}
            />
            <Typography className={classes.labelText}>
              {t('Description')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-description"
              name="input-description"
              placeholder={t('Description')}
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              disableUnderline
              className={[globalClasses.input]}
            />
            {loadingCategories && <div>Loading...</div>}
            {errorCategories && <div>Error {errorCategories.message}</div>}

            <Box className={globalClasses.flexRow}>
              <Select
                id="input-category"
                name="input-category"
                defaultValue={[category || '']}
                value={category}
                onChange={e => setCategory(e.target.value)}
                onBlur={event =>
                  onBlur(categoryErrorSetter, 'category', event.target.value)
                }
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                className={[
                  globalClasses.input,
                  categoryError === false
                    ? globalClasses.inputError
                    : categoryError === true
                    ? globalClasses.inputSuccess
                    : ''
                ]}>
                {!category && (
                  <MenuItem value="" style={{ color: 'black' }}>
                    {t('SelectCategory')}
                  </MenuItem>
                )}
                {dataCategories?.categoriesByRestaurant
                  .filter(category => {
                    return category.title !== 'Default Category'
                  })
                  .map(category => (
                    <MenuItem
                      value={category._id}
                      key={category._id}
                      style={{ color: 'black' }}>
                      {category.title}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
            {/* <Typography className={classes.labelText}>
              {t('stock_amount')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-stockAmount"
              name="input-stockAmount"
              placeholder={t('stock_amount')}
              type="text"
              value={stockAmount}
              onChange={e => setStockAmount(e.target.value)}
              disableUnderline
              className={[globalClasses.input]}
            /> */}
            <Box className={globalClasses.flexRow}>
              <Select
                id="input-stockUnit"
                name="input-stockUnit"
                defaultValue={[selectedStockUnit || '']}
                value={selectedStockUnit}
                onChange={e => setSelectedStockUnit(e.target.value)}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
                className={[globalClasses.input]}>
                {!selectedStockUnit && (
                  <MenuItem value="" style={{ color: 'black' }}>
                    {t('select_stock')}
                  </MenuItem>
                )}
                {stockUnits?.map((item, index) => (
                  <MenuItem value={item} key={index} style={{ color: 'black' }}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box
              mt={3}
              style={{ alignItems: 'center' }}
              className={globalClasses.flex}>
              <img
                className={classes.image}
                alt="..."
                src={imgMenu || foodPlaceholder}
              />
              <label
                htmlFor={props.food ? 'edit-food-image' : 'add-food-image'}
                className={classes.fileUpload}>
                {t('UploadAnImage')}
              </label>
              <input
                className={classes.file}
                id={props.food ? 'edit-food-image' : 'add-food-image'}
                type="file"
                accept="image/*"
                onChange={e => {
                  selectImage(e, 'imgMenu')
                  setImage(e.target.files[0])
                }}
              />
            </Box>

            <Box className={classes.container}>
              <Box className={classes.flexRow}>
                <Box item className={classes.heading}>
                  <Typography variant="p" className={classes.textWhite}>
                    {t('Variations')}
                  </Typography>
                </Box>
              </Box>
              <Box classes={classes.form}>
                {variation?.map((variationItem, index) => {
                  console.log(
                    `stock value for index ${index}:`,
                    variationItem.stock
                  )

                  return (
                    <Box key={index} pl={1} pr={1}>
                      <Box className={globalClasses.flexRow}>
                        <Grid container>
                          <Grid item xs={12} sm={6}>
                            <Box mt={2}>
                              <Typography className={classes.labelText}>
                                {t('UniqueTitle')}
                              </Typography>
                              <Input
                                style={{ marginTop: -1 }}
                                id="input-type"
                                placeholder={t('Title')}
                                type="text"
                                value={variationItem.title}
                                onChange={event => {
                                  handleVariationChange(
                                    event,
                                    index,
                                    'title',
                                    'variations'
                                  )
                                }}
                                onBlur={event => {
                                  onBlurVariation(index, 'title')
                                }}
                                disableUnderline
                                className={[
                                  globalClasses.input,
                                  variationItem.titleError === false
                                    ? globalClasses.inputError
                                    : variationItem.titleError === true
                                    ? globalClasses.inputSuccess
                                    : ''
                                ]}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box mt={2}>
                              <Typography className={classes.labelText}>
                                {t('Price')}
                              </Typography>
                              <Input
                                style={{ marginTop: -1 }}
                                value={variationItem.price}
                                id="input-price"
                                placeholder={t('Price')}
                                type="number"
                                onChange={event => {
                                  handleVariationChange(
                                    event,
                                    index,
                                    'price',
                                    'variations'
                                  )
                                }}
                                onBlur={event => {
                                  onBlurVariation(index, 'price')
                                }}
                                disableUnderline
                                className={[
                                  globalClasses.input,
                                  variationItem.priceError === false
                                    ? globalClasses.inputError
                                    : variationItem.priceError === true
                                    ? globalClasses.inputSuccess
                                    : ''
                                ]}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box mt={2}>
                              <Typography className={classes.labelText}>
                                {t('Discounted')}
                              </Typography>
                              <Input
                                style={{ marginTop: -1 }}
                                value={variationItem.discounted}
                                id="input-discounted"
                                placeholder={t('Discounted')}
                                type="number"
                                onChange={event => {
                                  handleVariationChange(
                                    event,
                                    index,
                                    'discounted',
                                    'variations'
                                  )
                                }}
                                onBlur={event => {
                                  onBlurVariation(index, 'discounted')
                                }}
                                disableUnderline
                                className={[globalClasses.input]}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography className={classes.labelText}>
                                {t('select_stock')}
                              </Typography>
                              <Select
                                id="input-stockUnit"
                                name="input-stockUnit"
                                value={variationItem.stock || ''}
                                onChange={e =>
                                  handleVariationChange(
                                    e,
                                    index,
                                    'stock',
                                    'variations'
                                  )
                                }
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                                className={[globalClasses.input]}
                                sx={{ marginTop: '5px !important' }}>
                                {!variationItem.stock && (
                                  <MenuItem value="" style={{ color: 'black' }}>
                                    {t('select_stock')}
                                  </MenuItem>
                                )}
                                {stockUnits?.map((item, index) => (
                                  <MenuItem
                                    value={item}
                                    key={index}
                                    style={{ color: 'black' }}>
                                    {item}
                                  </MenuItem>
                                ))}
                              </Select>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box>
                        <RemoveIcon
                          style={{
                            backgroundColor: theme.palette.common.black,
                            color: theme.palette.warning.dark,
                            borderRadius: '50%',
                            marginTop: 12,
                            marginRight: 10
                          }}
                          onClick={() => {
                            onRemove(index)
                          }}
                        />
                        <AddIcon
                          style={{
                            backgroundColor: theme.palette.warning.dark,
                            color: theme.palette.common.black,
                            borderRadius: '50%',
                            marginTop: 12
                          }}
                          onClick={() => {
                            onAdd(index)
                          }}
                        />
                      </Box>
                      <Box>
                        {loadingAddons && t('LoadingDots')}
                        {errorAddons && t('ErrorDots')}
                        {dataAddons?.getAddonsByRestaurant.map(addon => {
                          return (
                            <Grid
                              item
                              xs={12}
                              md={6}
                              key={addon._id}
                              style={{ textAlign: 'left', paddingLeft: 20 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    value={addon._id}
                                    checked={foundAddon(index, addon._id)}
                                    onChange={() =>
                                      onSelectAddon(index, addon._id)
                                    }
                                  />
                                }
                                label={`${addon.title} (Description: ${addon.description})(Min: ${addon.quantityMinimum})(Max: ${addon.quantityMaximum})`}
                              />
                            </Grid>
                          )
                        })}
                      </Box>
                      <Button
                        className={classes.button}
                        onClick={() => toggleModal(index)}>
                        {t('NewAddon')}
                      </Button>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          </Box>
          <Box>
            <Button
              className={globalClasses.button}
              disabled={mutateLoading}
              onClick={async e => {
                e.preventDefault()
                if (onSubmitValidaiton() && !mutateLoading) {
                  mutate({
                    variables: {
                      foodInput: {
                        restaurant: restaurantId,
                        _id: props.food ? props.food._id : '',
                        title: formRef.current['input-title'].value,
                        description: formRef.current['input-description'].value,
                        file: image,
                        stock: selectedStockUnit,
                        category: formRef.current['input-category'].value,
                        variations: variation.map(
                          ({
                            _id,
                            title,
                            price,
                            discounted,
                            addons,
                            stock
                          }) => {
                            console.log({ _id })
                            const obj = {
                              title,
                              price: +price,
                              discounted: +discounted,
                              addons,
                              stock
                            }
                            if (_id) {
                              obj._id = _id // only include if truthy
                            }
                            return obj
                          }
                        )
                      }
                    }
                  })

                  // Close the modal after 3 seconds by calling the parent's onClose callback
                  setTimeout(() => {
                    props.onClose() // Close the modal
                  }, 4000)
                }
              }}>
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
      <Modal
        style={{
          // width: '75%',
          marginLeft: '25%',
          overflowY: 'auto'
        }}
        open={addonModal}
        onClose={() => {
          toggleModal()
        }}>
        <AddonComponent
          updateAddonsList={updateAddonsList}
          onClose={closeEditModal}
        />
      </Modal>
    </Box>
  )
}
export default withTranslation()(Food)
