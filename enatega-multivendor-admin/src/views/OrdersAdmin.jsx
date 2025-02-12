import React, { useContext, useState } from 'react'
import { withTranslation } from 'react-i18next'
import OrderComponent from '../components/Order/Order'
import Header from '../components/Headers/Header'
import { useQuery, gql } from '@apollo/client'
import { getCityAreas, getOrdersByAdmin, getRestaurantProfile } from '../apollo'
import useGlobalStyles from '../utils/globalStyles'
import { Container, Modal } from '@mui/material'
import CustomLoader from '../components/Loader/CustomLoader'
import { AreaContext } from '../context/AreaContext'
import OrdersDataAdmin from '../components/Order/OrdersDataAdmin'

const GET_ORDERS = gql`
  ${getOrdersByAdmin}
`
const GET_PROFILE = gql`
  ${getRestaurantProfile}
`

const CITY_AREAS = gql`
  ${getCityAreas}
`

const OrdersAdmin = () => {
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
      page: page - 1,
      rows: rowsPerPage,
      search
    }
  })
  const orders = data?.getOrdersByAdmin || null
  // const { data: dataProfile } = useQuery(GET_PROFILE, {
  //   variables: { id: restaurantId }
  // })

  // useQuery(CITY_AREAS, {
  //   skip: !dataProfile?.restaurant?.city?._id,
  //   variables: { id: dataProfile?.restaurant?.city?._id },
  //   onCompleted: fetchedData => {
  //     console.log({ fetchedData })
  //     setAreas(fetchedData ? fetchedData.areasByCity : null)
  //   }
  // })

  const toggleModal = order => {
    setOrder(order)
    setDetailModal(!detailsModal)
  }

  const globalClasses = useGlobalStyles()
  return (
    <>
      <Header />
      {/* Page content */}
      <OrderComponent order={order} />
      <Container className={globalClasses.flex} fluid>
        {errorQuery && (
          <tr>
            <td>{`${'Error'} ${errorQuery.message}`}</td>
          </tr>
        )}
        <OrdersDataAdmin
          orders={data && orders}
          toggleModal={toggleModal}
          subscribeToMore={subscribeToMore}
          loading={loadingQuery}
          selected={order}
          updateSelected={setOrder}
          page={setPage}
          rows={setRowsPerPage}
          refetchOrders={refetchOrders}
          isAdminPage={true}
        />
        <Modal
          sx={{
            width: { sm: '100%', lg: '75%' }, // 90% width on extra-small screens, 75% on small and up
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
export default withTranslation()(OrdersAdmin)
