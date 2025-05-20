import React, { useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { transformToNewline } from '../../utils/stringManipulations'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import CustomLoader from '../Loader/CustomLoader'
import { subscribePlaceOrder, orderCount } from '../../apollo'
import { useQuery, gql } from '@apollo/client'
import SearchBar from '../TableHeader/SearchBar'
import { customStyles } from '../../utils/tableCustomStyles'
import TableHeader from '../TableHeader'
import { Alert, useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'
import AddOrder from './AddOrder'
import AddNewOrder from './AddNewOrder'

const ORDERCOUNT = gql`
  ${orderCount}
`
const ORDER_PLACED = gql`
  ${subscribePlaceOrder}
`

const OrdersData = props => {
  const theme = useTheme()
  const { t, refetchOrders, isAdminPage } = props
  const [searchQuery, setSearchQuery] = useState('')
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false)
  const [newFormVisible, setNewFormVisible] = useState(false)
  const [orderDetails, setOrderDetails] = useState({
    items: '',
    quantity: 1,
    paymentMethod: '',
    address: ''
  })
  const [success, setSuccess] = useState(null)

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const handleOpenOrderForm = () => setIsOrderFormVisible(true)
  const handleCloseOrderForm = () => setIsOrderFormVisible(false)

  const handleOrderChange = e => {
    const { name, value } = e.target
    setOrderDetails(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmitOrder = () => {
    console.log('Order submitted:', orderDetails)
    // Implement the order submission logic here
    setIsOrderFormVisible(false) // Hide the form and show the table again
  }

  const getItems = items => {
    return items
      .map(
        item =>
          `${item.quantity}x${item.title}${
            item.variation.title ? `(${item.variation.title})` : ''
          }`
      )
      .join('\n')
  }

  const restaurantId = localStorage.getItem('restaurantId')

  const { data, loading: loadingQuery } = useQuery(ORDERCOUNT, {
    variables: { restaurant: restaurantId }
  })

  const propExists = (obj, path) => {
    return path.split('.').reduce((obj, prop) => {
      return obj && obj[prop] ? obj[prop] : ''
    }, obj)
  }

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (field && isNaN(propExists(row, field))) {
        return propExists(row, field).toLowerCase()
      }
      return row[field]
    }
    return orderBy(rows, handleField, direction)
  }

  const handlePerRowsChange = (perPage, page) => {
    props.page(page)
    props.rows(perPage)
  }

  const handlePageChange = async page => {
    props.page(page)
  }

  const columns = [
    {
      name: t('OrderID'),
      sortable: true,
      selector: 'orderId'
    },
    // {
    //   name: t('Items'),
    //   cell: row => <>{getItems(row.items)}</>
    // },
    {
      name: t('name'),
      cell: row => <>{row.user && row.user.name ? row.user.name : 'N/A'}</>
    },
    {
      name: t('phone'),
      cell: row => <>{row.user && row.user.phone ? row.user.phone : 'N/A'}</>
    },
    {
      name: t('Payment'),
      selector: 'paymentMethod',
      sortable: true,
      cell: row => <>{t(row.paymentMethod)}</>
    },
    {
      name: t('Status'),
      selector: 'orderStatus',
      sortable: true,
      cell: row => <>{t(row.orderStatus)}</>
    },
    {
      name: t('Datetime'),
      cell: row => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, '\n')}</>
      )
    }
    // {
    //   name: t('Address'),
    //   cell: row => (
    //     <>{transformToNewline(row?.deliveryAddress?.deliveryAddress, 3)}</>
    //   )
    // }
  ]

  const conditionalRowStyles = [
    {
      when: row =>
        row.orderStatus !== 'DELIVERED' && row.orderStatus !== 'CANCELLED',
      style: {
        backgroundColor: theme.palette.warning.lightest
      }
    }
  ]

  useEffect(() => {
    props.subscribeToMore({
      document: ORDER_PLACED,
      variables: { id: restaurantId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        if (subscriptionData.data.subscribePlaceOrder.origin === 'new') {
          return {
            ordersByRestId: [
              subscriptionData.data.subscribePlaceOrder.order,
              ...prev.ordersByRestId
            ]
          }
        } else {
          const orderIndex = prev.ordersByRestId.findIndex(
            o => subscriptionData.data.subscribePlaceOrder.order._id === o._id
          )
          prev.ordersByRestId[orderIndex] =
            subscriptionData.data.subscribePlaceOrder.order
          return { ordersByRestId: [...prev.ordersByRestId] }
        }
      },
      onError: error => {
        console.log('onError', error)
      }
    })
  }, [])

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? props && props.orders
      : props.orders &&
        props.orders.filter(order => {
          return order.orderId.toLowerCase().search(regex) > -1
        })

  return (
    <>
      {/* Add Order Button on the Right Side */}
      {!isAdminPage ? (
        <Grid container spacing={2} style={{ marginBottom: '20px' }}>
          <Grid item xs={9}></Grid>{' '}
          <Grid item xs={3}>
            <Button
              variant="contained"
              color="primary"
              // onClick={handleOpenOrderForm}
              onClick={() => setNewFormVisible(true)}
              fullWidth>
              {t('Addorder')}
            </Button>
          </Grid>
        </Grid>
      ) : null}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            color: 'white', // Text color
            backgroundColor: '#32620e', // Background color
            fontWeight: 'bold',
            '& .MuiAlert-icon': {
              color: 'white' // Icon color
            }
          }}>
          {success}
        </Alert>
      )}

      {/* Order Form (Appears Below the Table) */}
      {/* {isOrderFormVisible && <AddOrder t={t} refetchOrders={refetchOrders} />} */}
      {newFormVisible && (
        <AddNewOrder
          refetchOrders={refetchOrders}
          setNewFormVisible={setNewFormVisible}
          success={success}
          setSuccess={setSuccess}
        />
      )}

      {/* Data Table (Slides Up when Order Form is Visible) */}
      <div
        className={`table-container ${isOrderFormVisible ? 'slide-up' : ''}`}
        style={{
          transition: 'transform 0.3s ease-in-out',
          marginTop: isOrderFormVisible ? '20px' : '0px' // Adds space above table when form is visible
        }}>
        <DataTable
          title={<TableHeader title={t('Orders')} />}
          columns={columns}
          data={filtered}
          onRowClicked={props.toggleModal}
          progressPending={props.loading || loadingQuery}
          pointerOnHover
          progressComponent={<CustomLoader />}
          sortFunction={customSort}
          subHeader
          subHeaderComponent={
            <SearchBar value={searchQuery} onChange={onChangeSearch} />
          }
          pagination
          paginationServer
          paginationTotalRows={data && data.orderCount}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          conditionalRowStyles={conditionalRowStyles}
          customStyles={customStyles}
          selectableRows
          paginationIconLastPage=""
          paginationIconFirstPage=""
        />
      </div>
    </>
  )
}

export default withTranslation()(OrdersData)
