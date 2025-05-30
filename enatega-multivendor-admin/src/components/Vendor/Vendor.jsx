import React, { useRef, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { validateFunc } from '../../constraints/constraints'
import { withTranslation } from 'react-i18next'
import { createVendor, editVendor, getVendors } from '../../apollo'
import { Input, Button, Alert, Box, Typography, Checkbox } from '@mui/material'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const CREATE_VENDOR = gql`
  ${createVendor}
`
const EDIT_VENDOR = gql`
  ${editVendor}
`
const GET_VENDORS = gql`
  ${getVendors}
`

function Vendor(props) {
  const formRef = useRef()
  const [showPassword, setShowPassword] = useState(false)
  const mutation = props.vendor ? EDIT_VENDOR : CREATE_VENDOR

  const [values, setValues] = useState({
    email: props.vendor ? props.vendor.email : '',
    name: props.vendor ? props.vendor.name : '',
    phone: props.vendor ? props.vendor.phone : '',
    password: ''
  })

  const { email, phone, name, password } = values

  const [error, errorSetter] = useState('')
  const [success, successSetter] = useState('')
  const [emailError, emailErrorSetter] = useState(null)
  const [passError, passErrorSetter] = useState(null)
  const { t } = props
  console.log('vendor props: ', props)
  const onCompleted = data => {
    if (!props.vendor) clearFields()
    const message = props.vendor
      ? t('VendorUpdatedSuccessfully')
      : t('VendorAddedSuccessfully')
    errorSetter('')
    successSetter(message)
    setTimeout(hideAlert, 3000)
  }

  const onError = ({ graphQLErrors, networkError }) => {
    successSetter('')
    if (graphQLErrors) errorSetter(graphQLErrors[0].message)
    else if (networkError) errorSetter(networkError.result.errors[0].message)
    else errorSetter('Something went wrong!')
    setTimeout(hideAlert, 3000)
  }
  const [mutate, { loading: mutateLoading }] = useMutation(mutation, {
    refetchQueries: [{ query: GET_VENDORS }],
    onError,
    onCompleted
  })

  const onBlur = (setter, field, state) => {
    setter(!validateFunc({ [field]: state }, field))
  }

  const onSubmitValidaiton = () => {
    const emailErrors = !validateFunc({ email }, 'email')
    // const passwordError = props.vendor
    //   ? true
    //   : !validateFunc({ password }, 'password')

    emailErrorSetter(emailErrors)
    // passErrorSetter(passwordError)
    // return emailError && passwordError
    return emailErrors
  }

  const clearFields = () => {
    emailErrorSetter('')
    passErrorSetter('')
    setValues({
      email: '',
      name: '',
      phone: '',
      password: ''
    })
  }

  const hideAlert = () => {
    errorSetter('')
    successSetter('')
  }

  const handleChange = e => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (onSubmitValidaiton() && !mutateLoading) {
      if (!props.vendor && !password) {
        passErrorSetter(true)
      }
      mutate({
        variables: {
          vendorInput: {
            _id: props.vendor ? props.vendor._id : '',
            email,
            name,
            phone,
            password
          }
        }
      })
      // Close the modal after 3 seconds by calling the parent's onClose callback
      setTimeout(() => {
        if (typeof props.onClose === 'function') {
          props.onClose() // Close the modal
        }
      }, 4000)
    }
  }

  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  return (
    <Box className={classes.container}>
      <Box className={props.vendor ? classes.headingBlack : classes.heading}>
        <Typography className={props.vendor ? classes.textWhite : classes.text}>
          {props.vendor ? t('EditVendor') : t('AddVendor')}
        </Typography>
      </Box>
      {/* <Box item lg={12} className={[globalClasses.flex, classes.form]}> */}
      <Box className={classes.form}>
        <form onSubmit={handleSubmit}>
          <Typography className={classes.labelText}>{t('Email')}</Typography>
          <Input
            style={{ marginTop: -1 }}
            id="input-email"
            name="email"
            placeholder={t('Email')}
            margin="0px"
            type="email"
            disableUnderline
            className={[
              globalClasses.input,
              emailError === false
                ? globalClasses.inputError
                : emailError === true
                ? globalClasses.inputSuccess
                : ''
            ]}
            value={email}
            onChange={handleChange}
            onBlur={event =>
              onBlur(emailErrorSetter, 'email', event.target.value)
            }
          />
          <Typography
            sx={{ textTransform: 'capitalize' }}
            className={classes.labelText}>
            {t('phone')}
          </Typography>
          <Input
            style={{ marginTop: 5 }}
            id="input-phone"
            name="phone"
            placeholder={t('Phone')}
            margin="0px"
            type="text"
            disableUnderline
            className={[
              globalClasses.input,
              emailError === false
                ? globalClasses.inputError
                : emailError === true
                ? globalClasses.inputSuccess
                : ''
            ]}
            value={phone}
            onChange={handleChange}
            // onBlur={event =>
            //   onBlur(emailErrorSetter, 'email', event.target.value)
            // }
          />
          <Typography
            sx={{ textTransform: 'capitalize' }}
            className={classes.labelText}>
            {t('name')}
          </Typography>
          <Input
            style={{ marginTop: 5 }}
            id="input-name"
            name="name"
            placeholder={t('Name')}
            margin="0px"
            type="text"
            disableUnderline
            className={[
              globalClasses.input,
              emailError === false
                ? globalClasses.inputError
                : emailError === true
                ? globalClasses.inputSuccess
                : ''
            ]}
            value={name}
            onChange={handleChange}
            // onBlur={event =>
            //   onBlur(emailErrorSetter, 'email', event.target.value)
            // }
          />
          <Typography className={classes.labelText}>{t('Password')}</Typography>
          <Input
            style={{ marginTop: -1 }}
            placeholder={t('Password')}
            disableUnderline
            className={[
              globalClasses.input,
              passError === false
                ? globalClasses.inputError
                : passError === true
                ? globalClasses.inputSuccess
                : ''
            ]}
            id="input-password"
            name="password"
            value={password}
            onChange={handleChange}
            type={showPassword ? 'text' : 'password'}
            onBlur={event => {
              onBlur(passErrorSetter, 'password', event.target.value)
            }}
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
          <Button
            className={globalClasses.button}
            disabled={mutateLoading}
            type="submit">
            {props.vendor ? t('Update') : t('Save')}
          </Button>
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
          {error && (
            <Alert
              className={globalClasses.alertError}
              variant="filled"
              severity="error">
              {error}
            </Alert>
          )}
        </Box>
      </Box>
    </Box>
  )
}
export default withTranslation()(Vendor)
