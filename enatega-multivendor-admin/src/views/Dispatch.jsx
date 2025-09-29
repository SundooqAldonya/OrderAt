/* eslint-disable react/display-name */
import React, { useState, useEffect, Fragment } from 'react'
import { withTranslation } from 'react-i18next'
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client'
import DataTable from 'react-data-table-component'
import {
  getActiveOrders,
  getRidersByZone,
  subscriptionOrder,
  updateStatus,
  assignRider
} from '../apollo'
import Header from '../components/Headers/Header'
import { useParams } from 'react-router-dom'
import CustomLoader from '../components/Loader/CustomLoader'
import { transformToNewline } from '../utils/stringManipulations'
import SearchBar from '../components/TableHeader/SearchBar'
import useGlobalStyles from '../utils/globalStyles'
import { customStyles } from '../utils/tableCustomStyles'
import {
  Container,
  MenuItem,
  Select,
  Box,
  useTheme,
  TablePagination,
  Paper,
  Typography,
  Button
} from '@mui/material'
import { ReactComponent as DispatchIcon } from '../assets/svg/svg/Dispatch.svg'
import TableHeader from '../components/TableHeader'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import RiderFunc from '../components/RiderFunc'
import moment from 'moment'
import DispatchDrawer from '../components/DispatchDrawer'
import DispatchForm from '../components/DispatchForm'

const SUBSCRIPTION_ORDER = gql`
  ${subscriptionOrder}
`
const UPDATE_STATUS = gql`
  ${updateStatus}
`

const Orders = props => {
  const theme = useTheme()
  const params = useParams()
  const { t } = props
  const [searchQuery, setSearchQuery] = useState('')
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateUpdate] = useMutation(UPDATE_STATUS)
  const globalClasses = useGlobalStyles()
  const [selectedInteraction, setSelectedInteraction] = useState(null)
  const [modalVisible, setModalVisible] = useState(null)

  const [restaurantId, setRestaurantId] = useState(
    localStorage.getItem('restaurantId')
  )

  useEffect(() => {
    if (params.id) setRestaurantId(params.id)
  }, [])

  const {
    data: dataOrders,
    error: errorOrders,
    loading: loadingOrders,
    refetch: refetchOrders
  } = useQuery(getActiveOrders, {
    variables: { restaurantId: null, page, limit },
    pollInterval: 3000
  })

  const statusFunc = row => {
    const handleStatusSuccessNotification = status => {
      NotificationManager.success(
        t('Status updated to {{status}}', { status: t(status) }),
        t('StatusUpdated'),
        3000
      )
    }

    const handleStatusErrorNotification = error => {
      NotificationManager.error(t('Error'), t('Failed to update status!'), 3000)
    }

    return (
      <>
        <Select
          id="input-status"
          name="input-status"
          displayEmpty
          inputProps={{ 'aria-label': 'Without label' }}
          style={{ width: '50px' }}
          className={globalClasses.selectInput}>
          {row.orderStatus === 'PENDING' && (
            <MenuItem
              style={{ color: 'black' }}
              onClick={() => {
                mutateUpdate({
                  variables: {
                    id: row._id,
                    orderStatus: 'ACCEPTED'
                  },
                  onCompleted: data => {
                    handleStatusSuccessNotification('ACCEPTED')
                    refetchOrders()
                  },
                  onError: error => {
                    console.error('Mutation error:', error)
                    handleStatusErrorNotification('Error')
                  }
                })
              }}>
              {t('Accept')}
            </MenuItem>
          )}
          {['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'].includes(
            row.orderStatus
          ) && (
            <MenuItem
              style={{ color: 'black' }}
              onClick={() => {
                mutateUpdate({
                  variables: {
                    id: row._id,
                    orderStatus: 'CANCELLED'
                  },
                  onCompleted: data => {
                    handleStatusSuccessNotification('REJECTED')
                    refetchOrders()
                  },
                  onError: error => {
                    console.error('Mutation error:', error)
                    handleStatusErrorNotification('Error')
                  }
                })
              }}>
              {t('Reject')}
            </MenuItem>
          )}
          {['PENDING', 'ACCEPTED', 'PICKED', 'ASSIGNED'].includes(
            row.orderStatus
          ) && (
            <MenuItem
              style={{ color: 'black' }}
              onClick={() => {
                mutateUpdate({
                  variables: {
                    id: row._id,
                    orderStatus: 'DELIVERED'
                  },
                  onCompleted: data => {
                    handleStatusSuccessNotification('DELIVERED')
                    refetchOrders()
                  },
                  onError: error => {
                    console.error('Mutation error:', error)
                    handleStatusErrorNotification('Error')
                  }
                })
              }}>
              {t('Delivered')}
            </MenuItem>
          )}
        </Select>
      </>
    )
  }

  const columns = [
    {
      name: t('OrderInformation'),
      sortable: true,
      selector: 'orderId',
      cell: row => (row?.orderId ? row?.orderId : 'N/A')
    },
    {
      name: t('RestaurantCol'),
      selector: 'restaurant.name',
      cell: row => (row?.restaurant ? row.restaurant.name : 'N/A')
    },
    {
      name: t('Payment'),
      selector: 'paymentMethod'
    },
    {
      name: t('Status'),
      selector: 'orderStatus',
      cell: row => (
        <div style={{ overflow: 'visible' }}>
          {t(row.orderStatus)}
          <br />
          {!['CANCELLED', 'DELIVERED'].includes(row.orderStatus) &&
            statusFunc(row)}
        </div>
      )
    },
    {
      name: t('Rider'),
      selector: 'rider',
      cell: row => (
        <div style={{ overflow: 'visible' }}>
          {row.rider ? row.rider.name : ''}
          <br />
          {!row.isPickedUp &&
            !['CANCELLED', 'DELIVERED'].includes(row.orderStatus) &&
            RiderFunc(row)}
        </div>
      )
    },
    {
      name: t('createdAt'),
      selector: 'createdAt',
      sortable: true,
      cell: row => (
        <>{new Date(row.createdAt).toLocaleString().replace(/ /g, '\n')}</>
      )
    },
    {
      name: t('OrderTimeAdvance'),
      cell: row => TimeFunc({ row })
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
    }
  ]

  const handleModalVisible = item => {
    setSelectedInteraction(item)
    setModalVisible(true)
  }
  const toggleDrawer = () => {
    setSelectedInteraction(null)
    setModalVisible(false)
  }

  console.log({ selectedInteraction })

  const conditionalRowStyles = [
    {
      when: row => ['DELIVERED', 'CANCELLED'].includes(row.orderStatus),
      style: {
        backgroundColor: theme.palette.success.dark
      }
    }
  ]
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? dataOrders && dataOrders.getActiveOrders?.docs
      : dataOrders &&
        dataOrders.getActiveOrders?.docs.filter(order => {
          return (
            order.restaurant.name.toLowerCase().search(regex) > -1 ||
            order.orderId.toLowerCase().search(regex) > -1 ||
            order.deliveryAddress.deliveryAddress.toLowerCase().search(regex) >
              -1 ||
            order.orderId.toLowerCase().search(regex) > -1 ||
            order.paymentMethod.toLowerCase().search(regex) > -1 ||
            order.orderStatus.toLowerCase().search(regex) > -1 ||
            (order.rider !== null
              ? order.rider.name.toLowerCase().search(regex) > -1
              : false)
          )
        })

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

  const handleGoTo = row => {
    window.open(`/#/admin/order-details/${row._id}`)
  }

  return (
    <Fragment>
      <NotificationContainer />
      <Header />
      <Box className={globalClasses.flexRow} mb={3}>
        <DispatchIcon />
      </Box>
      <Container className={globalClasses.flex} fluid>
        {errorOrders ? (
          <tr>
            <td>{`${'Error'}! ${errorOrders.message}`}</td>
          </tr>
        ) : null}
        {loadingOrders ? (
          <CustomLoader />
        ) : (
          <Paper>
            {/* <DispatchForm /> */}
            <DataTable
              subHeader={true}
              subHeaderComponent={
                <SearchBar
                  value={searchQuery}
                  onChange={onChangeSearch}
                  onClick={() => refetchOrders()}
                />
              }
              title={<TableHeader title={t('Dispatch')} />}
              columns={columns}
              data={filtered}
              onRowClicked={handleGoTo}
              progressPending={loadingOrders}
              pointerOnHover
              progressComponent={<CustomLoader />}
              conditionalRowStyles={conditionalRowStyles}
              customStyles={customStyles}
              selectableRows
            />
            <TablePagination
              component="div"
              count={dataOrders?.getActiveOrders?.totalDocs}
              page={dataOrders?.getActiveOrders?.page}
              onPageChange={handleChangePage}
              rowsPerPage={dataOrders?.getActiveOrders?.limit}
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
        )}
        <DispatchDrawer
          open={modalVisible}
          order={selectedInteraction}
          toggleDrawer={toggleDrawer}
        />
      </Container>
    </Fragment>
  )
}

const TimeFunc = ({ row }) => {
  const {
    createdAt,
    preparationTime,
    orderStatus,
    acceptedAt,
    assignedAt,
    pickedAt,
    deliveredAt
  } = row

  console.log({ createdAt })

  const [notAccepted, setNotAccepted] = useState(false)
  const [notAssigned, setNotAssigned] = useState(false)
  const [notPicked, setNotPicked] = useState(false)
  const [notDelivered, setNotDelivered] = useState(false)
  // const now = moment()
  const [now, setNow] = useState(moment())
  const orderCreatedAt = moment(createdAt, moment.ISO_8601, true).clone()
  const orderAcceptedAt = moment(acceptedAt).clone()

  useEffect(() => {
    let interval = setInterval(() => {
      setNow(moment())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (
      !acceptedAt &&
      orderStatus === 'PENDING' &&
      now.diff(orderCreatedAt, 'minutes') > 10
    ) {
      setNotAccepted(true)
    }

    // If order is not assigned (status !== ASSIGNED) within (preparationTime - 5) minutes
    if (acceptedAt) {
      // If no rider assigned within (preparationTime - 5 minutes)
      const assignmentDeadline = moment(preparationTime).subtract(5, 'minutes')
      console.log('Assignment Deadline:', assignmentDeadline.format('HH:mm:ss'))
      if (!assignedAt && now.isAfter(assignmentDeadline)) {
        setNotAssigned(true)
      }
    }
    // If order is NOT PICKED after (preparationTime + 10 minutes)
    const pickUpDeadline = moment(preparationTime).add(10, 'minutes')
    if (assignedAt && orderStatus !== 'PICKED' && now.isAfter(pickUpDeadline)) {
      setNotPicked(true)
    }

    if (pickedAt) {
      const deliveryDeadline = moment(pickedAt).add(30, 'minutes')
      if (!deliveredAt && now.isAfter(deliveryDeadline)) {
        setNotDelivered(true)
      }
    }
  }, [now])

  return (
    <div
      style={{
        color:
          notDelivered || notPicked || notAccepted || notAssigned
            ? 'red'
            : '#000'
      }}>
      {new Date(createdAt).toLocaleString().replace(/ /g, '\n')}{' '}
      {notAccepted ? '(Order is not accepted)' : null}
      {notAssigned ? '(Order is not assigned)' : null}
      {notPicked ? '(Order is not picked)' : null}
      {notDelivered ? '(Order is not delivered)' : null}
    </div>
  )
}

// const SubscribeFunc = row => {
//   const { data: dataSubscription } = useSubscription(SUBSCRIPTION_ORDER, {
//     variables: { id: row._id }
//   })
//   console.log(dataSubscription)
//   return (
//     <div style={{ overflow: 'visible', whiteSpace: 'pre' }}>
//       {row.orderId}
//       <br />
//       {transformToNewline(row.deliveryAddress.deliveryAddress, 3)}
//     </div>
//   )
// }

export default withTranslation()(Orders)
