import React, { Fragment, useState } from 'react'
import Header from '../components/Headers/Header'
import {
  Alert,
  Box,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material'
import useGlobalStyles from '../utils/globalStyles'
import { useTranslation } from 'react-i18next'
import CityForm from '../components/CityForm'
import { gql, useMutation, useQuery } from '@apollo/client'
import {
  REMOVE_CITY,
  getAllContactus,
  getAllNotifications,
  getCities,
  toggleCityActive
} from '../apollo'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import SearchBar from '../components/TableHeader/SearchBar'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import orderBy from 'lodash/orderBy'
import TableHeader from '../components/TableHeader'
import { customStyles } from '../utils/tableCustomStyles'
import { Switch } from '@mui/material'
import ContactUsShow from '../components/ContactUsShow'
import NotificationRow from '../components/Notifications/NotificationRow'

const NotificationsScreen = () => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [type, setType] = useState('')
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const globalClasses = useGlobalStyles()

  const { data, loading, refetch } = useQuery(getAllNotifications, {
    variables: {
      page: page + 1,
      limit
    }
  })
  console.log({ data })

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = item => {
    setOpenEdit(!openEdit)
    setSelectedContact(item)
  }
  const closeEditModal = () => {
    setOpenEdit(false)
  }
  const notificationsList = data?.getAllNotifications.docs || null
  const columns = [
    {
      name: t('Name'),
      selector: 'body',
      sortable: true
    },
    {
      name: t('Email'),
      selector: 'email',
      cell: row => <div>{row.email ? row.email : 'N/A'}</div>
    },
    {
      name: t('Phone'),
      selector: 'phone'
    },
    {
      name: t('CreatedAt'),
      selector: 'createdAt',
      sortable: true,
      cell: row => (
        <div>
          {new Date(row.createdAt).toLocaleString('en-GB', { hour12: true })}
        </div>
      )
    }
  ]

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

  const handlePageChange = (event, value) => {
    setPage(value)
    refetch({ page: value + 1, limit })
  }

  const handleChangeRowsPerPage = event => {
    const newLimit = parseInt(event.target.value, 10)
    setPage(0)
    refetch({ page: 1, limit: newLimit })
  }

  return (
    <Fragment>
      <Header />
      <Container className={globalClasses.flex} fluid>
        {success && (
          <Alert
            className={globalClasses.alertSuccess}
            variant="filled"
            severity={type}>
            {message}
          </Alert>
        )}
        {error ? <span>{`Error! ${error.message}`}</span> : null}
        {loading ? <CustomLoader /> : null}
        <TableContainer sx={{ color: '#000' }} component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#32620E' }}>
              <TableRow sx={{ color: '#000' }}>
                <TableCell />
                <TableCell sx={{ color: '#000' }}>Title</TableCell>
                <TableCell sx={{ color: '#000' }}>Body</TableCell>
                <TableCell sx={{ color: '#000' }}>Created At</TableCell>
                {/* <TableCell sx={{ color: '#000' }}>Type</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {notificationsList?.map(notif => (
                <NotificationRow key={notif._id} row={notif} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box mt={3} display="flex" justifyContent="center">
          <TablePagination
            component="div"
            count={data?.getAllNotifications?.totalDocs || 0}
            page={data?.getAllNotifications?.page - 1 || page}
            onPageChange={handlePageChange}
            rowsPerPage={data?.getAllNotifications?.limit || limit}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
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
        </Box>
        {/* {data && (
          <Paper>
            <DataTable
              subHeader={true}
              subHeaderComponent={
                <SearchBar
                  value={searchQuery}
                  onChange={onChangeSearch}
                  onClick={() => refetch()}
                />
              }
              title={<TableHeader title={t('notifications')} />}
              columns={columns}
              data={notificationsList}
              progressPending={loading}
              progressComponent={<CustomLoader />}
              sortFunction={customSort}
              defaultSortField="title"
              customStyles={customStyles}
              onRowClicked={item => toggleModal(item)}
              selectableRows
            />
            
          </Paper>
        )} */}
        <Modal
          style={{
            width: '70%',
            marginLeft: '15%',
            overflowY: 'auto',
            marginTop: 150
          }}
          open={openEdit}
          onClose={() => {
            toggleModal()
          }}>
          <ContactUsShow
            selectedContact={selectedContact}
            onClose={closeEditModal}
          />
        </Modal>
      </Container>
    </Fragment>
  )
}

export default NotificationsScreen
