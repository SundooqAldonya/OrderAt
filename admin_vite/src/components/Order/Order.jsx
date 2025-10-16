import React, { Fragment, useEffect, useState } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import { validateFunc } from '../../constraints/constraints'
import { updateOrderStatus, getConfiguration, getCityAreas } from '../../apollo'
import Loader from 'react-loader-spinner'
import {
  Box,
  Divider,
  Grid,
  Typography,
  Alert,
  Input,
  Button,
  useTheme
} from '@mui/material'
import useStyles from './styles'
import useGlobalStyles from '../../utils/globalStyles'
import useAcceptOrder from '../../context/useAcceptOrder'

// constants
const UPDATE_STATUS = gql`
  ${updateOrderStatus}
`

const GET_CONFIGURATION = gql`
  ${getConfiguration}
`

function Order({ order, t, modal, toggleModal }) {
  const classes = useStyles()
  const globalClasses = useGlobalStyles()
  const theme = useTheme()
  const [reason, reasonSetter] = useState('')
  const [reasonError, reasonErrorSetter] = useState(null)
  const [error, errorSetter] = useState('')
  const [success, successSetter] = useState('')
  const { acceptOrder } = useAcceptOrder()
  const [selectedTime, setSelectedTime] = useState(30)
  const restaurantId = localStorage.getItem('restaurantId')

  const onCompleted = ({ updateOrderStatus }) => {
    console.log({ updateOrderStatus })
    if (updateOrderStatus) {
      successSetter(t('OrderStatusUpdated'))
      if (updateOrderStatus.orderStatus === 'ACCEPTED') {
        acceptOrder(
          updateOrderStatus._id,
          restaurantId,
          selectedTime.toString()
        )
      }
    }
    setTimeout(onDismiss, 5000)
  }

  const onError = error => {
    errorSetter(error.message)
    setTimeout(onDismiss, 5000)
  }

  const { data } = useQuery(GET_CONFIGURATION)

  const [mutate, { loading }] = useMutation(UPDATE_STATUS, {
    onError,
    onCompleted
  })

  const validateReason = () => {
    const reasonError = !validateFunc({ reason }, 'reason')
    reasonErrorSetter(reasonError)
    return reasonError
  }

  const onDismiss = () => {
    errorSetter('')
    successSetter('')
  }

  if (!order) return null
  return (
    <Box className={[classes.container, classes.pb]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.heading}>
          <Typography variant="h6" className={classes.text}>
            {t('Order')} # {order.orderId} - {t(order.orderStatus)}
          </Typography>
        </Box>
      </Box>
      <Box mt={3} className={[classes.container]}>
        <Typography className={classes.itemHeader} variant="h6">
          {t('delivery_details')}
        </Typography>
        <Box container className={classes.innerContainer}>
          <Grid container mb={1} mt={2} spacing={1}>
            <Grid className={classes.textBlack} item lg={10}>
              {t('name')}:
            </Grid>
            <Grid className={[classes.textBlack]} item lg={2}>
              {order?.user?.name}
            </Grid>
          </Grid>
          <Divider />
          <Grid container mb={1} mt={2} spacing={2}>
            <Grid className={classes.textBlack} item lg={9}>
              {t('phone')}:
            </Grid>
            <Grid className={[classes.textBlack]} item lg={3}>
              {order?.user?.phone}
            </Grid>
          </Grid>
          <Divider />
          <Grid container mb={1} mt={2} spacing={1}>
            <Grid className={classes.textBlack} item lg={12}>
              {t('delivery_address')}:
            </Grid>
            <Grid className={[classes.textBlack]} item lg={12}>
              {order?.deliveryAddress?.deliveryAddress} -{' '}
              <span
                style={{
                  color: 'red'
                }}>{`(${order?.deliveryAddress?.label})`}</span>
            </Grid>
          </Grid>
          <Divider />
          <Grid container mb={1} mt={2} spacing={1}>
            <Grid className={classes.textBlack} item lg={12}>
              {t('delivery_details')}:
            </Grid>
            <Grid className={[classes.textBlack]} item lg={12}>
              {order?.deliveryAddress?.details}
            </Grid>
          </Grid>
          {/* <Divider /> */}
        </Box>
      </Box>

      {order?.rider ? (
        <Box className={[classes.container]}>
          <Typography className={classes.itemHeader} variant="h6">
            {t('rider_information')}
          </Typography>
          <Box container className={classes.innerContainer}>
            <Grid container mb={1} mt={2} spacing={2}>
              <Grid className={classes.textBlack} item lg={9}>
                {t('name')}:
              </Grid>
              <Grid className={[classes.textBlack]} item lg={3}>
                {order?.rider?.name}
              </Grid>
            </Grid>
            <Divider />
            <Grid container mb={1} mt={2} spacing={2}>
              <Grid className={classes.textBlack} item lg={9}>
                {t('phone')}:
              </Grid>
              <Grid className={[classes.textBlack]} item lg={3}>
                {order?.rider?.phone}
              </Grid>
            </Grid>
            <Divider />
          </Box>
        </Box>
      ) : null}
      <Box className={[classes.container]}>
        <Typography className={classes.itemHeader} variant="h6">
          {t('items')}
        </Typography>
        <Box container className={classes.innerContainer}>
          {order?.items.length ? (
            order?.items.map(item => (
              <Fragment key={item._id}>
                <Grid
                  container
                  mb={1}
                  mt={1}
                  sx={{ justifyContent: 'space-between' }}>
                  <Grid
                    item
                    lg={6}
                    sx={{
                      display: 'flex',
                      wrap: 'no-wrap',
                      gap: 1
                    }}>
                    <Box>
                      <Typography
                        className={[classes.quantity, classes.textBlack]}
                        variant="p">
                        {item.quantity}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className={classes.textBlack}>{`${
                        item.title
                      }${
                        item.variation.title ? `(${item.variation.title})` : ''
                      }`}</Typography>
                    </Box>
                  </Grid>
                  <Grid
                    sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    item
                    sm={6}
                    lg={6}>
                    <Typography color={'#000'}>
                      {data && data.configuration.currencySymbol}{' '}
                      {(item.variation.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
                {item.addons?.length
                  ? item.addons.map(addon => {
                      return (
                        <Fragment key={addon._id}>
                          <Grid item sx={{ paddingInline: 7 }}>
                            {addon.title}
                          </Grid>
                          {addon?.options.length
                            ? addon.options.map(option => {
                                return (
                                  <Box
                                    key={option._id}
                                    sx={{
                                      marginInline: 10,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}>
                                    <Box>
                                      <Typography sx={{ color: '#000' }}>
                                        {option.title}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography sx={{ color: '#000' }}>
                                        {data &&
                                          data.configuration
                                            .currencySymbol}{' '}
                                        {option.price}
                                      </Typography>
                                    </Box>
                                  </Box>
                                )
                              })
                            : null}
                        </Fragment>
                      )
                    })
                  : null}
                {item.specialInstructions.length ? (
                  <Fragment>
                    <Grid item lg={12} mt={1}>
                      <Typography
                        variant="text"
                        style={{ fontWeight: 'bold' }}
                        className={classes.textBlack}>
                        {t('SpecialInstructions')}:
                      </Typography>
                    </Grid>
                    <Grid item lg={12} mt={1}>
                      <Typography variant="text" className={classes.textBlack}>
                        {item.specialInstructions}
                      </Typography>
                    </Grid>
                  </Fragment>
                ) : null}
                <Divider />
              </Fragment>
            ))
          ) : (
            <Typography>{t('no_items')}</Typography>
          )}
        </Box>
      </Box>

      <Box mt={3} className={[classes.container]}>
        <Typography className={classes.itemHeader} variant="h6">
          {t('Charges')}
        </Typography>
        <Box className={classes.innerContainer}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            mb={1.5}
            mt={1.5}>
            <Box className={classes.textBlack}>{t('Subtotal')}</Box>
            <Box className={[classes.textBlack]}>
              {data && data.configuration.currencySymbol}{' '}
              {(
                order.orderAmount -
                order.deliveryCharges -
                order.tipping -
                order.taxationAmount
              ).toFixed(2)}
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            mb={1.5}
            mt={1.5}>
            <Box className={classes.textBlack} item lg={10}>
              {t('DeliveryFee')}
            </Box>
            <Box className={[classes.textBlack]} item lg={2}>
              {data && data.configuration.currencySymbol}{' '}
              {order && order.deliveryCharges.toFixed(2)}
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            mb={1.5}
            mt={1.5}>
            <Box className={classes.textBlack} item lg={10}>
              {t('TaxCharges')}
            </Box>
            <Box className={[classes.textBlack]} item lg={2}>
              {data && data.configuration.currencySymbol}{' '}
              {order && order.taxationAmount.toFixed(2)}
            </Box>
          </Box>
          <Divider />

          {/* <Grid container mb={1} mt={1}>
            <Grid className={classes.textBlack} item lg={10}>
              {t('Tip')}
            </Grid>
            <Grid className={[classes.textBlack]} item lg={2}>
              {data && data.configuration.currencySymbol}{' '}
              {order && order.tipping.toFixed(2)}
            </Grid>
          </Grid>
          <Divider /> */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            mb={1.5}
            mt={1.5}>
            <Box
              className={classes.textBlack}
              sx={{ fontWeight: 'bold' }}
              item
              lg={10}>
              {t('Total')}
            </Box>
            <Box
              className={[classes.textBlack]}
              sx={{ fontWeight: 'bold' }}
              item
              lg={2}>
              {data && data.configuration.currencySymbol}{' '}
              {order && order.orderAmount.toFixed(2)}
            </Box>
          </Box>
          <Divider />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            mb={1.5}
            mt={1.5}>
            <Box className={classes.textBlack} item lg={10}>
              {t('PaymentMethod')}
            </Box>
            <Box className={[classes.textBlack]} item lg={2}>
              {order?.paymentMethod}
            </Box>
          </Box>
          {/* <Divider /> */}
        </Box>
      </Box>
      {/* <Box mb={3} className={[classes.container]}>
        <Typography className={classes.itemHeader} variant="h6">
          {t('PaymentMethod')}
        </Typography>
        <Box container className={classes.innerContainer}>
          <Grid container mb={1} mt={1}>
            <Grid item lg={3} />
            <Grid
              className={[classes.price, classes.textPrimary, classes.pd]}
              item
              lg={6}>
              {order.paymentMethod}
            </Grid>
            <Grid item lg={3} />
          </Grid>
          <Divider />
          <Grid container mb={1} mt={2} spacing={2}>
            <Grid item lg={10}>
              <Typography className={[classes.textBlack]} variant="p">
                {t('PaidAmount')}
              </Typography>
            </Grid>
            <Grid className={[classes.price, classes.textPrimary]} item lg={2}>
              {data && data.configuration.currencySymbol}{' '}
              {order && order.paidAmount ? order.paidAmount.toFixed(2) : 0}
            </Grid>
          </Grid>
        </Box>
      </Box> */}
      <Input
        name="reason"
        id="input-reason"
        placeholder={t('PHReasonIfRejected')}
        type="text"
        disableUnderline
        value={(order && order.reason) || reason}
        onChange={event => {
          reasonSetter(event.target.value)
        }}
        className={[globalClasses.input, classes.inputLength]}
      />
      {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
        <>
          {loading && (
            <Loader
              className="text-center"
              type="TailSpin"
              color={theme.palette.error.lightest}
              height={40}
              width={40}
              visible={loading}
            />
          )}
          <Box className={classes.btnBox}>
            <Button
              className={globalClasses.button}
              disabled={
                order.orderStatus !== 'CANCELLED' &&
                order.orderStatus !== 'PENDING'
              }
              onClick={() => {
                mutate({
                  variables: {
                    id: order._id,
                    status: 'ACCEPTED',
                    reason: ''
                  }
                })
              }}>
              {order && order.status === true ? t('Accepted') : t('Accept')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              className={globalClasses.button}
              disabled={order.orderStatus === 'CANCELLED'}
              onClick={() => {
                if (validateReason()) {
                  mutate({
                    variables: {
                      id: order._id,
                      status: 'CANCELLED',
                      reason: order.reason
                    }
                  })
                }
              }}>
              {order.orderStatus === 'CANCELLED' ? t('Rejected') : t('Reject')}
            </Button>
            {modal ? (
              <Button
                variant="outlined"
                color="error"
                className={globalClasses.button}
                onClick={() => {
                  toggleModal()
                }}>
                {t('Cancel')}
              </Button>
            ) : null}
          </Box>
          {reasonError ? null : null}
        </>
      )}
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
  )
}
export default withTranslation()(Order)
