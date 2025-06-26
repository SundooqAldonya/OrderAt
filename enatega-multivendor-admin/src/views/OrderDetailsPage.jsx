import React from 'react'
import { withTranslation } from 'react-i18next'

import Header from '../components/Headers/Header'

import {
  getCityAreas,
  getOrderDetails,
  getOrdersByRestaurant,
  getRestaurantProfile,
  singleOrder
} from '../apollo'
import useGlobalStyles from '../utils/globalStyles'
import { Box, Container, Grid, useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import CustomLoader from '../components/Loader/CustomLoader'
import StatusCard from '../components/OrderDetails/StatusCard'
import useStyles from '../components/OrderDetails/styles'
import DetailCard from '../components/OrderDetails/DetailCard'
import AmountCard from '../components/OrderDetails/AmountCard'
import RiderDetails from '../components/OrderDetails/RiderDetails'
import PickedUpImage from '../components/OrderDetails/PickedUpImage'
import CustomerDetailsCard from '../components/OrderDetails/CustomerDetailsCard'
import RiderInteractions from '../components/OrderDetails/RiderInteractions'

const OrderDetailsPage = () => {
  const { id: orderId } = useParams()
  const theme = useTheme()
  const small = useMediaQuery(theme.breakpoints.down('sm'))
  const classes = useStyles()

  const { data, loading, error } = useQuery(singleOrder, {
    variables: {
      id: orderId
    },
    pullInterval: 3000
  })

  const order = data?.singleOrder || null

  console.log({ order })

  const globalClasses = useGlobalStyles()

  if (loading) {
    return <CustomLoader />
  }

  return (
    <>
      <Header />
      <Container className={globalClasses.flex} fluid>
        <Container
          disableGutters
          maxWidth={small ? '100%' : 'md'}
          className={classes.orderStatus}>
          <StatusCard {...order} />
        </Container>

        <Grid container style={{ marginTop: theme.spacing(5) }}>
          <DetailCard {...order} />
        </Grid>
        {/* <Grid container style={{ marginTop: theme.spacing(5) }}>
          <CustomerDetailsCard {...order} />
        </Grid> */}
        {order?.rider ? (
          <Grid container style={{ marginTop: theme.spacing(5) }}>
            <RiderDetails rider={order.rider} order={order} />
          </Grid>
        ) : null}
        {/* image receipt captured by driver */}
        {order?.pickedImage?.url ? (
          <Grid
            container
            style={{
              marginTop: theme.spacing(5)
            }}>
            <PickedUpImage pickedImage={order.pickedImage} />
          </Grid>
        ) : null}
        <Grid
          container
          style={{
            marginTop: theme.spacing(5),
            marginBottom: theme.spacing(5)
          }}>
          <AmountCard {...order} />
        </Grid>

        {order?.riderInteractions && order?.riderInteractions.length > 0 && (
          <Grid container style={{ marginTop: theme.spacing(5) }}>
            <RiderInteractions interactions={order.riderInteractions} />
          </Grid>
        )}
      </Container>
    </>
  )
}
export default withTranslation()(OrderDetailsPage)
