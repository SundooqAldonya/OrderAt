import React, { useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import {
  createBusinessCategory,
  editBusinessCategory,
  getBusinessCategories
} from '../../apollo'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Box,
  Typography,
  Input,
  Button,
  Alert,
  Grid,
  Select,
  MenuItem
} from '@mui/material'
import ConfigurableValues from '../../config/constants'

const BusinessCategoryCreate = props => {
  const { CLOUDINARY_UPLOAD_URL, CLOUDINARY_FOOD } = ConfigurableValues()
  const formRef = useRef()
  const name = props.item ? props.item.name : ''
  const description = props.item ? props.item.description : ''
  const mutation = props.item ? editBusinessCategory : createBusinessCategory
  const [mainError, mainErrorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [nameError, setNameError] = useState(null)
  const [descriptionError, setDescriptionError] = useState(null)
  const [shopType, setShopType] = useState(
    props.item ? props.item.shopType : 'restaurant'
  )
  const [file, setFile] = useState(props.item ? props.item.image : '')
  const [fileLoading, setFileLoading] = useState(false)
  const [image, setImage] = useState(null)

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }
  const onCompleted = res => {
    console.log({ res })
    const message = props.item
      ? t(res.editBusinessCategory.message)
      : t(res.createBusinessCategory.message)
    successSetter(message)
    mainErrorSetter('')
    if (!props.item) clearFields()
  }
  const onError = error => {
    console.log('Error => ', error)
    let message = ''
    try {
      message = error.graphQLErrors[0].message
    } catch (err) {
      message = t('ActionFailedTryAgain')
    }
    successSetter('')
    mainErrorSetter(message)
  }

  const [mutateCreate, { loading }] = useMutation(createBusinessCategory, {
    refetchQueries: [{ query: getBusinessCategories }],
    onError,
    onCompleted
  })
  const [mutateUpdate, { loading: loadingUpdate }] = useMutation(
    editBusinessCategory,
    {
      refetchQueries: [{ query: getBusinessCategories }],
      onError,
      onCompleted
    }
  )

  const onSubmitValidaiton = () => {
    const nameError = !validateFunc(
      { name: formRef.current['input-name'].value },
      'name'
    )
    const descriptionError = !validateFunc(
      { description: formRef.current['input-description'].value },
      'description'
    )
    setNameError(nameError)
    setDescriptionError(descriptionError)
    return nameError && descriptionError
  }
  const clearFields = () => {
    formRef.current.reset()
    setNameError(null)
    setDescriptionError(null)
  }

  const { t } = props
  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <Box container className={classes.container}>
      <Box className={classes.flexRow}>
        <Box
          item
          className={props.item ? classes.headingBlack : classes.heading}>
          <Typography
            variant="h6"
            className={props.item ? classes.textWhite : classes.text}>
            {props.item
              ? t('edit_business_category')
              : t('create_business_category')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form ref={formRef}>
          <Box className={globalClasses.flexRow}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  {t('Name')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-name"
                  name="input-name"
                  placeholder={t('Name')}
                  type="text"
                  defaultValue={name}
                  onBlur={event =>
                    onBlur(setNameError, 'name', event.target.value)
                  }
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography className={classes.labelText}>
                  {t('Description')}
                </Typography>
                <Input
                  style={{ marginTop: -1 }}
                  id="input-description"
                  name="input-description"
                  placeholder={t('Description')}
                  type="text"
                  defaultValue={description}
                  onBlur={event => {
                    onBlur(
                      setDescriptionError,
                      'description',
                      event.target.value
                    )
                  }}
                  disableUnderline
                  className={[
                    globalClasses.input,
                    descriptionError === false
                      ? globalClasses.inputError
                      : descriptionError === true
                      ? globalClasses.inputSuccess
                      : ''
                  ]}
                />
              </Grid>
              {/* <Grid item xs={12}>
                <Typography className={classes.labelText}>
                  {t('shopType')}
                </Typography>
                <Select
                  style={{ marginTop: -1 }}
                  // defaultValue={data.action}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  value={shopType}
                  placeholder="Select action"
                  onChange={e => setShopType(e.target.value)}
                  className={[
                    globalClasses.input,
                    !shopType ? globalClasses.inputError : '',
                    shopType && globalClasses.inputSuccess
                  ]}>
                  {['restaurant', 'grocery'].map((item, index) => (
                    <MenuItem
                      style={{ color: 'black', textTransform: 'capitalize' }}
                      value={item}
                      key={item + index}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </Grid> */}
              <Grid item xs={12}>
                <Box
                  mt={3}
                  style={{ alignItems: 'center' }}
                  className={globalClasses.flex}>
                  <img
                    className={classes.image}
                    alt="..."
                    src={
                      image
                        ? URL.createObjectURL(image)
                        : 'https://enatega.com/wp-content/uploads/2023/11/man-suit-having-breakfast-kitchen-side-view.webp'
                    }
                  />
                  <label
                    htmlFor={
                      props.item ? 'edit-category-image' : 'add-category-image'
                    }
                    className={classes.fileUpload}>
                    {t('UploadAnImage')}
                  </label>
                  <input
                    className={classes.file}
                    id={
                      props.item ? 'edit-category-image' : 'add-category-image'
                    }
                    type="file"
                    accept="image/*"
                    onChange={event => {
                      setImage(event.target.files[0])
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {loading || loadingUpdate ? t('Loading') : null}
          <Box>
            <Button
              className={globalClasses.button}
              disabled={loading || fileLoading}
              onClick={async e => {
                e.preventDefault()
                if (onSubmitValidaiton() && !loading) {
                  if (!props.item) {
                    mutateCreate({
                      variables: {
                        input: {
                          name: formRef.current['input-name'].value,
                          description:
                            formRef.current['input-description'].value,
                          file: image
                        }
                      }
                    })
                  } else {
                    mutateUpdate({
                      variables: {
                        input: {
                          name: formRef.current['input-name'].value,
                          description:
                            formRef.current['input-description'].value,
                          file: image
                        },
                        id: props.item._id
                      }
                    })
                  }
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

export default withTranslation()(BusinessCategoryCreate)
