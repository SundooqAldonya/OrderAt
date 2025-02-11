/* eslint-disable react/display-name */
import React, { useState, useEffect } from 'react'
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
import { Container, MenuItem, Select, Box, useTheme } from '@mui/material'
import { ReactComponent as DispatchIcon } from '../assets/svg/svg/Dispatch.svg'
import TableHeader from '../components/TableHeader'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css'
import RiderFunc from '../components/RiderFunc'
import moment from 'moment'

const SUBSCRIPTION_ORDER = gql`
  ${subscriptionOrder}
`
const UPDATE_STATUS = gql`
  ${updateStatus}
`
const GET_ACTIVE_ORDERS = gql`
  ${getActiveOrders}
`

const Orders = props => {
  const theme = useTheme()
  const params = useParams()
  const { t } = props
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateUpdate] = useMutation(UPDATE_STATUS)
  const globalClasses = useGlobalStyles()
  // const [mutateAssign] = useMutation(ASSIGN_RIDER)

  const [restaurantId, seteRestaurantId] = useState(
    localStorage.getItem('restaurantId')
  )
  useEffect(() => {
    if (params.id) seteRestaurantId(params.id)
  }, [])

  const {
    data: dataOrders,
    error: errorOrders,
    loading: loadingOrders,
    refetch: refetchOrders
  } = useQuery(GET_ACTIVE_ORDERS, {
    variables: { restaurantId: null },
    pollInterval: 3000,
    skip: restaurantId === null
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
      cell: row => row?.orderId ? row?.orderId : 'N/A'
    },
    {
      name: t('RestaurantCol'),
      selector: 'restaurant.name'
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
      name: t('OrderTime'),
      cell: row => (
        TimeFunc({row})
      )
    }
  ]

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
      ? dataOrders && dataOrders.getActiveOrders
      : dataOrders &&
        dataOrders.getActiveOrders.filter(order => {
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

  return (
    <>
      <NotificationContainer />
      <Header />
      <Box className={globalClasses.flexRow} mb={3}>
        <DispatchIcon />
      </Box>
      <Container className={globalClasses.flex} fluid>
        {errorOrders ? (
          <tr>
            <td>
              `${'Error'}! ${errorOrders.message}`
            </td>
          </tr>
        ) : null}
        {loadingOrders ? (
          <CustomLoader />
        ) : (
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
            progressPending={loadingOrders}
            pointerOnHover
            progressComponent={<CustomLoader />}
            pagination
            conditionalRowStyles={conditionalRowStyles}
            customStyles={customStyles}
            selectableRows
          />
        )}
      </Container>
    </>
  )
}

const TimeFunc = ({row}) => {
  const { createdAt, preparationTime, orderStatus, acceptedAt } = row;

  const [notAccepted, setNotAccepted] = useState(false);
  const [notAssigned, setNotAssigned] = useState(false);
  const [notDelivered, setNotDelivered] = useState(false);
  const [isPastTen, setIsPastTen] = useState(false)
  const now = moment()
  const orderCreatedAt = moment(createdAt);

  useEffect(() => {
    if (!acceptedAt && orderStatus === "PENDING" && now.diff(orderCreatedAt, "minutes") > 5) {
      setNotAccepted(true)
    }

    // If order is not assigned (status !== ASSIGNED) within (preparationTime - 5) minutes
    const timeLimitForAssignment = orderCreatedAt.add(preparationTime - 5, "minutes");
    console.log({timeLimitForAssignment: now.isAfter(timeLimitForAssignment)})
    if (acceptedAt && orderStatus !== "ASSIGNED" && now.isAfter(timeLimitForAssignment)) {
      setNotAssigned(true)
    }
  }, [])

  console.log({createdAt})
  return (
    <div style={{color: notAccepted || notAssigned ? 'red' : '#000'}}>
      {new Date(createdAt).toLocaleString().replace(/ /g, '\n')}
      {" "}
      {notAccepted ? '(Order is not accepted)' : null}
      {notAssigned ? '(Order is not assigned)' : null}
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
