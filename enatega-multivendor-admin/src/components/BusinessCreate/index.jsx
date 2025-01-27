import React, { useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import { Alert, Box, Button, Input, Typography } from '@mui/material'
import { gql, useMutation, useQuery } from '@apollo/client'
import {
  createBusiness,
  editArea,
  getAreas,
  getBusinesses,
  getCities
} from '../../apollo'

const EDIT_AREA = gql`
  ${editArea}
`

const BusinessCreate = ({ onClose, area }) => {
  const { t } = useTranslation()
  const [success, setSuccess] = useState(false)
  const [mainError, setMainError] = useState(false)
  const [values, setValues] = useState({
    name: '',
    businessName: '',
    address: '',
    phone: ''
  })

  const { name, businessName, phone, address } = values

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const onCompleted = data => {
    console.log({ data })
    setSuccess(t(data.createBusiness.message))
    setValues({
      name: '',
      businessName: '',
      address: '',
      phone: ''
    })
  }

  const [mutateCreate] = useMutation(createBusiness, {
    onCompleted,
    refetchQueries: [{ query: getBusinesses }]
  })

  const [mutateUpdate] = useMutation(EDIT_AREA, {
    onCompleted: data => {
      console.log({ data })
      setSuccess(data.editArea.message)
    },
    refetchQueries: [{ query: getBusinesses }]
  })

  const handleSubmit = async e => {
    e.preventDefault()
    mutateCreate({
      variables: {
        businessInput: {
          name,
          businessName,
          phone,
          address
        }
      }
    })
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
            {t('add_business')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Box>
            <Typography className={classes.labelText}>{t('Name')}</Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-name"
              name="name"
              placeholder={t('Name')}
              type="text"
              value={name}
              onChange={handleChange}
              disableUnderline
              className={[globalClasses.input]}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('business_name')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-businessName"
              name="businessName"
              placeholder={t('business_name')}
              type="text"
              value={businessName}
              onChange={handleChange}
              disableUnderline
              className={[globalClasses.input]}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>
              {t('Address')}
            </Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-address"
              name="address"
              placeholder={t('Address')}
              type="text"
              value={address}
              onChange={handleChange}
              disableUnderline
              className={[globalClasses.input]}
            />
          </Box>
          <Box>
            <Typography className={classes.labelText}>{t('Phone')}</Typography>
            <Input
              style={{ marginTop: -1 }}
              id="input-phone"
              name="phone"
              placeholder={t('Phone')}
              type="text"
              value={phone}
              onChange={handleChange}
              disableUnderline
              className={[globalClasses.input]}
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

export default BusinessCreate
