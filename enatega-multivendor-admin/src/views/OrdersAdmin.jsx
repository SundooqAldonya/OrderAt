import React, { useContext, useState } from 'react'
import { withTranslation } from 'react-i18next'
import OrderComponent from '../components/Order/Order'
import Header from '../components/Headers/Header'
import { useQuery, gql } from '@apollo/client'
import { getCityAreas, getOrdersByAdmin, getRestaurantProfile } from '../apollo'
import useGlobalStyles from '../utils/globalStyles'
import { Container, Modal, Paper, TablePagination } from '@mui/material'
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
  const [limit, setLimit] = useState(10)
  // const [search] = useState('')
  const { setAreas } = useContext(AreaContext)

  const {
    data,
    error: errorQuery,
    loading: loadingQuery,
    subscribeToMore,
    refetch: refetchOrders
  } = useQuery(GET_ORDERS, {
    variables: {
      page,
      limit
      // search
    }
  })
  const orders = data?.getOrdersByAdmin?.docs || null

  const toggleModal = order => {
    // console.log({ order })
    // setOrder(order)
    // setDetailModal(!detailsModal)
    window.open(`/#/admin/order-details/${order._id}`)
  }

  const handleChangePage = (e, newPage) => {
    setPage(newPage)
    refetchOrders({
      restaurantId: null,
      page: newPage,
      limit
    })
  }
  const handleChangeRowsPerPage = e => {
    setLimit(e.target.value)
    refetchOrders({
      restaurantId: null,
      page: 1,
      limit: parseInt(e.target.value, 10)
    })
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
        <Paper sx={{ background: '#fff' }}>
          <OrdersDataAdmin
            orders={data && orders}
            toggleModal={toggleModal}
            subscribeToMore={subscribeToMore}
            loading={loadingQuery}
            selected={order}
            updateSelected={setOrder}
            page={setPage}
            rows={setLimit}
            refetchOrders={refetchOrders}
            isAdminPage={true}
          />

          <TablePagination
            component="div"
            count={data?.getOrdersByAdmin?.totalDocs}
            page={data?.getOrdersByAdmin?.page}
            onPageChange={handleChangePage}
            rowsPerPage={limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            sx={{
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: '#000' // Change text color for labels
              },
              '& .MuiSelect-select': {
                color: '#000' // Change selected dropdown text color
              },
              '& .MuiMenuItem-root': {
                color: '#000 !important' // Change text color inside dropdown list
              },
              '& .MuiSvgIcon-root': {
                color: '#000' // Change dropdown arrow color
              }
            }}
            slotProps={{
              select: {
                MenuProps: {
                  PaperProps: {
                    sx: {
                      backgroundColor: '#f5f5f5', // Background color of dropdown
                      '& .MuiMenuItem-root': {
                        color: '#000', // Text color of options
                        '&:hover': {
                          backgroundColor: '#ddd' // Hover background color
                        }
                      }
                    }
                  }
                }
              }
            }}
          />
        </Paper>
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
