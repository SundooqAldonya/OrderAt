import React, { Fragment, useState } from 'react'
import Header from '../components/Headers/Header'
import {
  Alert,
  Box,
  Container,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import useGlobalStyles from '../utils/globalStyles'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client'
import { getAllNotifications } from '../apollo'
import CustomLoader from '../components/Loader/CustomLoader'
import NotificationRow from '../components/Notifications/NotificationRow'

const NotificationsScreen = () => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [type, setType] = useState('')
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState('')

  const globalClasses = useGlobalStyles()

  const { data, loading, refetch } = useQuery(getAllNotifications, {
    variables: {
      page: page + 1,
      limit
    },
    pollInterval: 10000
  })

  console.log({ data })

  const notificationsList = data?.getAllNotifications?.docs || null

  const handlePageChange = (event, value) => {
    setPage(value)
    refetch({ page: value + 1, limit })
  }

  const handleChangeRowsPerPage = event => {
    const newLimit = parseInt(event.target.value, 10)
    setPage(0)
    refetch({ page: 1, limit: newLimit })
  }

  const filteredNotifications = notificationsList?.filter(notification => {
    const searchLower = search.toLowerCase()

    const matchesRecipient = notification.recipients.some(r =>
      r.item?.name?.toLowerCase().includes(searchLower)
    )

    const matchesOrderId = notification.data?.orderId
      ?.toString()
      .toLowerCase()
      .includes(searchLower)

    return matchesRecipient || matchesOrderId
  })

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
        <Paper>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ color: '#000', mx: 2, mt: 2 }}>
              Search
            </Typography>
            <TextField
              label="Search recipient"
              variant="outlined"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{
                marginBlock: 2,
                background: '#fff',
                input: { color: 'black' },
                width: '98%',
                marginInline: 'auto'
              }}
            />
          </Box>
          <TableContainer sx={{ color: '#000' }} component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#32620E' }}>
                <TableRow sx={{ color: '#000' }}>
                  <TableCell />
                  <TableCell sx={{ color: '#000' }}>Title</TableCell>
                  <TableCell sx={{ color: '#000' }}>Order ID</TableCell>
                  <TableCell sx={{ color: '#000' }}>Body</TableCell>
                  <TableCell sx={{ color: '#000' }}>Created At</TableCell>
                  <TableCell sx={{ color: '#000' }}>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications?.map(notif => (
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
        </Paper>
      </Container>
    </Fragment>
  )
}

export default NotificationsScreen
