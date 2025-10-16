import React, { useContext, useState } from 'react'
import { withTranslation } from 'react-i18next'
import OrderComponent from '../components/Order/Order'
import OrdersData from '../components/Order/OrdersData'
import Header from '../components/Headers/Header'
import { useQuery, gql } from '@apollo/client'
import {
  getCityAreas,
  getOrdersByRestaurant,
  getRestaurantProfile
} from '../apollo'
import useGlobalStyles from '../utils/globalStyles'
import { Container, Modal } from '@mui/material'
import CustomLoader from '../components/Loader/CustomLoader'
import { AreaContext } from '../context/AreaContext'

const GET_ORDERS = gql`
  ${getOrdersByRestaurant}
`
const GET_PROFILE = gql`
  ${getRestaurantProfile}
`

const CITY_AREAS = gql`
  ${getCityAreas}
`

const Orders = () => {
  const [detailsModal, setDetailModal] = useState(false)
  const [order, setOrder] = useState(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search] = useState('')
  const { setAreas } = useContext(AreaContext)

  const restaurantId = localStorage.getItem('restaurantId')

  const {
    data,
    error: errorQuery,
    loading: loadingQuery,
    subscribeToMore,
    refetch: refetchOrders
  } = useQuery(GET_ORDERS, {
    variables: {
      restaurant: restaurantId,
      page: page - 1,
      rows: rowsPerPage,
      search
    }
  })

  const { data: dataProfile } = useQuery(GET_PROFILE, {
    variables: { id: restaurantId }
  })

  useQuery(CITY_AREAS, {
    skip: !dataProfile?.restaurant?.city?._id,
    variables: { id: dataProfile?.restaurant?.city?._id },
    onCompleted: fetchedData => {
      console.log({ fetchedData })
      setAreas(fetchedData ? fetchedData.areasByCity : null)
    }
  })

  const toggleModal = order => {
    // setOrder(order)
    // setDetailModal(!detailsModal)
    window.open(`/#/admin/order-details/${order._id}`)
  }

  const globalClasses = useGlobalStyles()

  return (
    <>
      <Header />
      {/* Page content */}
      {/* <OrderComponent order={order} /> */}
      <Container className={globalClasses.flex} fluid>
        {errorQuery && (
          <tr>
            <td>{`${'Error'} ${errorQuery.message}`}</td>
          </tr>
        )}
        <OrdersData
          orders={data && data.ordersByRestId}
          toggleModal={toggleModal}
          subscribeToMore={subscribeToMore}
          loading={loadingQuery}
          selected={order}
          updateSelected={setOrder}
          page={setPage}
          rows={setRowsPerPage}
          refetchOrders={refetchOrders}
        />
        <Modal
          sx={{
            width: { sm: '100%', lg: '75%' },
            marginLeft: { sm: 0, lg: '13%' },
            overflowY: 'auto'
          }}
          open={detailsModal}
          onClose={() => {
            toggleModal(null)
          }}>
          <OrderComponent
            order={order}
            modal={true}
            toggleModal={toggleModal}
          />
        </Modal>
      </Container>
    </>
  )
}
export default withTranslation()(Orders)
