import React, { useEffect, useRef, useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import {
  Alert,
  Box,
  Button,
  Input,
  MenuItem,
  Modal,
  Select,
  Typography
} from '@mui/material'
import { gql, useMutation, useQuery } from '@apollo/client'
import {
  createShopCategory,
  editArea,
  editShopCategory,
  getShopCategories
} from '../../apollo'

const CREATE_SHOP_CATEGORY = gql`
  ${createShopCategory}
`

const GET_SHOP_CATEGORIES = gql`
  ${getShopCategories}
`
const EDIT_SHOP_CATEGORY = gql`
  ${editShopCategory}
`

const ShopCategoryCreate = ({ onClose, category }) => {
  const { t } = useTranslation()
  const [title, setTitle] = useState(category ? category.title : '')
  const [titleError, titleErrorSetter] = useState(null)

  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  const onCompleted = data => {
    setSuccess(t('shop_category_created'))
    setTitle('')
  }

  const [mutate] = useMutation(CREATE_SHOP_CATEGORY, {
    onCompleted,
    refetchQueries: [{ query: GET_SHOP_CATEGORIES }]
  })

  const [mutateUpdate] = useMutation(EDIT_SHOP_CATEGORY, {
    onCompleted: data => {
      console.log({ data })
      setSuccess(data.editShopCategory.message)
    },
    refetchQueries: [{ query: GET_SHOP_CATEGORIES }]
  })

  console.log({ category })

  const handleSubmit = async e => {
    e.preventDefault()
    if (!category) {
      mutate({
        variables: {
          shopCategoryInput: {
            title
          }
        }
      })
    } else {
      mutateUpdate({
        variables: {
          id: category._id,
          shopCategoryInput: {
            title
          }
        }
      })
    }
    // if it's edit modal
    if (onClose) {
      setTimeout(() => {
        onClose()
      }, 4000)
    }
  }

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t('shop_category_create')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
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
          </Box>

          <Box>
            <Button className={globalClasses.button} type="submit">
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

export default ShopCategoryCreate
