import React, { useState, useEffect, useRef } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Box,
  Alert,
  Typography,
  Input,
  Button,
  Grid,
  Link,
  Checkbox,
  FormGroup,
  FormControlLabel
} from '@mui/material'

import { useMutation, gql } from '@apollo/client'
import { ownerLogin } from '../apollo'
import { validateFunc } from '../constraints/constraints'
import useStyles from '../components/Configuration/styles'
import useGlobalStyles from '../utils/globalStyles'
import LoginBg from '../assets/img/loginBg.png'
import LoginPageIcon from '../assets/img/LoginPageIcon.png'
import InputAdornment from '@mui/material/InputAdornment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { authenticate } from '../helpers/user'
import { useHistory } from 'react-router-dom'

const LOGIN = gql`
  ${ownerLogin}
`
const Login = props => {
  const [showPassword, setShowPassword] = useState(false)
  const [stateData, setStateData] = useState({
    email: '',
    password: '',
    // emailError: null,
    // passwordError: null,
    // error: null,
    type: null, /// 0 for vendor
    redirectToReferrer: !!localStorage.getItem('user-enatega')
  })
  const [error, setError] = useState(null)
  const [emailError, setEmailError] = useState(null)
  const [passwordError, setPasswordError] = useState(null)
  const formRef = useRef()
  const { t } = props
  const history = useHistory()
  const [isLogged, setIsLogged] = useState(false)
  const onBlur = (event, field) => {
    setStateData({
      ...stateData,
      [field + 'Error']: !validateFunc({ [field]: stateData[field] }, field)
    })
  }
  const validate = () => {
    // const emailError = !validateFunc({ email: stateData.email }, 'email')
    const passwordErrors = !validateFunc(
      { password: stateData.password },
      'password'
    )
    // setStateData({ ...stateData, passwordError })
    setPasswordError(passwordErrors)
    // return emailError && passwordError
    return passwordErrors
  }
  const { redirectToReferrer, type } = stateData

  useEffect(() => {
    if (isLogged) {
      if (redirectToReferrer && type === 0) {
        // props.history.replace('/restaurant/list')
        history.push('/restaurant/list')
        // window.location.reload()
      }
      if (redirectToReferrer && type === 1) {
        // props.history.replace('/super_admin/vendors')
        history.push('/super_admin/vendors')
      }
      window.location.reload()
    }
  }, [isLogged])

  console.log({ isLogged })

  const onCompleted = data => {
    // localStorage.setItem('user-enatega', JSON.stringify(data.ownerLogin))

    console.log({ data })
    authenticate(data.ownerLogin, () => {
      console.log('user logged in')

      const userType = data.ownerLogin.userType
      if (userType === 'VENDOR') {
        setStateData({
          ...stateData,
          redirectToReferrer: true,
          type: 0,
          emailError: null,
          passwordError: null
        })
      } else {
        setStateData({
          ...stateData,
          redirectToReferrer: true,
          type: 1,
          emailError: null,
          passwordError: null
        })
      }
      setIsLogged(true)
      setTimeout(hideAlert, 5000)
    })
  }
  const hideAlert = () => {
    setError(null)
    setEmailError(null)
    setPasswordError(null)
  }

  const onError = error => {
    console.log({ error })
    if (error.graphQLErrors.length) {
      setError(error.graphQLErrors[0].message)
    }
    if (error.networkError) {
      setError(error.message)
    }
    setIsLogged(false)
    setTimeout(hideAlert, 5000)
  }
  const [mutate] = useMutation(LOGIN, { onError, onCompleted })

  const handleChange = e => {
    setStateData({ ...stateData, [e.target.name]: e.target.value })
  }

  const loginFunc = e => {
    e.preventDefault()
    if (validate()) {
      mutate({ variables: { ...stateData } })
    }
  }

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <>
      <Grid
        container
        sx={{
          backgroundImage: `url(${LoginBg})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh', // Full screen height
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, md: 6 } // Responsive padding
        }}>
        {/* Left Side Image (Hidden on Small Screens) */}
        <Grid
          item
          lg={5}
          sm={12}
          sx={{
            display: { xs: 'none', md: 'none', lg: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            p: { lg: 5, md: 3 }
          }}>
          <img
            src={LoginPageIcon}
            alt="login img"
            style={{
              maxHeight: '60%',
              maxWidth: '80%'
            }}
          />
        </Grid>

        {/* Login Form */}
        <Grid
          item
          lg={7}
          sm={12}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 4, md: 6 }, // Responsive horizontal padding
            width: '100%'
          }}>
          <Typography
            sx={{
              fontSize: { xs: 18, sm: 22, md: 24 },
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
            {t('enterYourDetailsBelow')}
          </Typography>

          <Box
            sx={{ width: { xs: '100%', sm: '80%', md: 600 } }}
            className={classes.container}>
            <Box className={classes.flexRow}>
              <Box item className={classes.heading}>
                <Typography variant="h6" className={classes.text}>
                  {t('LogintoEnatega')}
                </Typography>
              </Box>
            </Box>

            <Box className={classes.form}>
              <form ref={formRef} onSubmit={loginFunc}>
                <Grid container>
                  {/* Email Input */}
                  <Grid item xs={12}>
                    <Typography className={classes.labelText}>
                      {t('email_or_phone')}
                    </Typography>
                    <Input
                      id="input-email"
                      name="email"
                      value={stateData.email}
                      onChange={handleChange}
                      onBlur={event => onBlur(event, 'email')}
                      placeholder={t('Email')}
                      type="text"
                      disableUnderline
                      fullWidth
                      className={[
                        globalClasses.input,
                        emailError === false
                          ? globalClasses.inputError
                          : emailError === true
                          ? globalClasses.inputSuccess
                          : ''
                      ]}
                    />
                  </Grid>

                  {/* Password Input */}
                  <Grid item xs={12}>
                    <Typography className={classes.labelText}>
                      {t('Password')}
                    </Typography>
                    <Input
                      id="input-password"
                      name="password"
                      placeholder={t('Password')}
                      value={stateData.password}
                      type={showPassword ? 'text' : 'password'}
                      onChange={handleChange}
                      onBlur={event => onBlur(event, 'password')}
                      disableUnderline
                      fullWidth
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
                  </Grid>
                </Grid>

                {/* Remember Me & Forgot Password */}
                <Grid
                  container
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2
                  }}>
                  <Grid item xs={12} md={6}>
                    <FormGroup>
                      <FormControlLabel
                        control={<Checkbox defaultChecked />}
                        label={t('RememberMe')}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                      display: 'flex',
                      justifyContent: { xs: 'flex-start', md: 'flex-end' }
                    }}>
                    <Link
                      href="/#/auth/reset"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}>
                      {t('ForgotYourPassword')}
                    </Link>
                  </Grid>
                </Grid>

                {/* Login Button */}
                <Box mt={3}>
                  <Button type="submit" className={globalClasses.button100}>
                    {t('Login')}
                  </Button>
                </Box>
              </form>

              {/* Error Message */}
              {error && (
                <Box mt={2}>
                  <Alert
                    className={globalClasses.alertError}
                    variant="filled"
                    severity="error">
                    {error}
                  </Alert>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}
export default withTranslation()(Login)
