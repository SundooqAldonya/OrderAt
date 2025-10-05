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
import {
  IconButton,
  ListItemIcon,
  Menu,
  Paper,
  Typography,
  useTheme
} from '@mui/material'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { Box } from '@mui/system'
import AddOrder from './AddOrder'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'

const ORDERCOUNT = gql`
  ${orderCount}
`
const ORDER_PLACED = gql`
  ${subscribePlaceOrder}
`

const OrdersDataAdmin = props => {
  const theme = useTheme()
  const {
    t,
    refetchOrders,
    isAdminPage,
    handleModalVisible,
    updateSelected,
    handleEditModal
  } = props
  const [searchQuery, setSearchQuery] = useState('')
  const [isOrderFormVisible, setIsOrderFormVisible] = useState(false) // Track visibility of the form
  const [orderDetails, setOrderDetails] = useState({
    items: '',
    quantity: 1,
    paymentMethod: '',
    address: ''
  })

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
    {
      name: t('business_name'),
      cell: row => <>{row?.restaurant ? row?.restaurant?.name : 'N/A'}</>
    },
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
      cell: row => (
        <>
          {t(row.orderStatus)}{' '}
          {row.cancelledAt
            ? new Date(row.cancelledAt).toLocaleString('en-GB', {
                hour12: true
              })
            : null}
        </>
      )
    },
    {
      name: t('Datetime'),
      selector: 'createdAt',
      sortable: true,
      cell: row => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, '\n')}</>
      )
    },
    {
      name: t('seen_by'),
      cell: row => (
        <Button
          onClick={() => {
            handleModalVisible(row)
          }}>
          <Typography>{t('seen_by')}</Typography>
        </Button>
      )
    },
    {
      name: t('Action'),
      cell: row => <>{ActionButtons(row, toggleModal)}</>
    }
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

  const toggleModal = item => {
    updateSelected(item)
    handleEditModal()
  }

  const ActionButtons = row => {
    const [anchorEl, setAnchorEl] = useState(null)
    const open = Boolean(anchorEl)

    const handleClick = event => {
      setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
      setAnchorEl(null)
    }

    return (
      <>
        <div>
          <IconButton
            aria-label="more"
            id="long-button"
            aria-haspopup="true"
            onClick={handleClick}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Paper>
            <Menu
              id="long-menu"
              MenuListProps={{
                'aria-labelledby': 'long-button'
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}>
              <MenuItem
                onClick={e => {
                  e.preventDefault()
                  toggleModal(row)
                }}
                style={{ height: 25 }}>
                <ListItemIcon>
                  <EditIcon fontSize="small" style={{ color: 'green' }} />
                </ListItemIcon>
                <Typography color="green">{t('Edit')}</Typography>
              </MenuItem>
              {/* <MenuItem
                onClick={() => handleRemoveCity(row._id)}
                style={{ height: 25 }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" style={{ color: 'red' }} />
                </ListItemIcon>
                <Typography color="red">{t('Delete')}</Typography>
              </MenuItem> */}
            </Menu>
          </Paper>
        </div>
      </>
    )
  }

  return (
    <>
      {/* Add Order Button on the Right Side */}

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
          onRowClicked={props.handleClick}
          // onRowClicked={item => console.log({ item })}
          progressPending={props.loading || loadingQuery}
          pointerOnHover
          progressComponent={<CustomLoader />}
          sortFunction={customSort}
          subHeader
          subHeaderComponent={
            <SearchBar value={searchQuery} onChange={onChangeSearch} />
          }
          // pagination
          // paginationServer
          // paginationTotalRows={data && data.orderCount}
          // onChangeRowsPerPage={handlePerRowsChange}
          // onChangePage={handlePageChange}
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

export default withTranslation()(OrdersDataAdmin)
