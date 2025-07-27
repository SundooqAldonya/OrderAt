import { Fragment, useRef, useState } from 'react'
import Header from '../components/Headers/Header'
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Paper,
  Select,
  Typography
} from '@mui/material'
import useGlobalStyles from '../utils/globalStyles'
import RidersMapComponent from '../components/RidersMapComponent'
import { useQuery, gql } from '@apollo/client'
import { assignedOrders, getCities, getRidersLocation } from '../apollo'
import DataTable from 'react-data-table-component'
import CustomLoader from '../components/Loader/CustomLoader'
import SearchBar from '../components/TableHeader/SearchBar'
import { useTranslation } from 'react-i18next'
import TableHeader from '../components/TableHeader'
import { orderBy } from 'lodash'
import { customStyles } from '../utils/tableCustomStyles'
import moment from 'moment'
import RiderMapView from '../components/RiderMapView'

const GET_CITIES = gql`
  ${getCities}
`

const RidersMap = () => {
  const { t } = useTranslation()
  const mapRef = useRef()

  const globalClasses = useGlobalStyles()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRider, setSelectedRider] = useState(null)
  const [trackedRiderId, setTrackedRiderId] = useState(null)
  const [selectedCity, setSelectedCity] = useState(null)

  const { data, loading, error, refetch } = useQuery(getRidersLocation, {
    pollInterval: 10000
  })
  const {
    data: dataCities,
    loading: loadingCities,
    error: errorCities
  } = useQuery(GET_CITIES)

  const riders = data?.getRidersLocation || null
  const cities = dataCities?.citiesAdmin || null

  console.log({ dataCities })

  const handleSort = (column, sortDirection) => {
    console.log(column.selector, sortDirection)
  }

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const columns = [
    {
      name: t('Name'),
      sortable: true,
      selector: 'name'
    },
    {
      name: t('Username'),
      sortable: true,
      selector: 'username'
    },
    {
      name: t('Phone'),
      sortable: true,
      selector: 'phone'
    },
    {
      name: t('updatedAt'),
      sortable: false,
      selector: 'updatedAt',
      cell: row => (
        <div>
          {moment(row.lastUpdatedLocationDate).locale('en-eg').format('LLL')}
        </div>
      )
    },
    {
      name: t('assigned_picked'),
      sortable: false,
      cell: row => (
        <div>
          {row.assignedOrdersCount} {t('Orders')}
          {/* <Button onClick={() => handleShow(row)}>Show</Button> */}
          {/* <Button onClick={() => handleGoTo(row)}>Go To</Button> */}
        </div>
      )
    }
  ]

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field]) {
        return row[field].toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? riders
      : riders?.filter(rider => {
          return (
            rider.name.toLowerCase().search(regex) > -1 ||
            rider.username.toLowerCase().search(regex) > -1 ||
            rider.phone.toLowerCase().search(regex) > -1
          )
        })

  const handleGoTo = row => {
    const rider = riders.find(r => r._id === row._id)
    console.log({ rider })
    if (rider) {
      mapRef.current?.highlightMarkerById(rider._id)
      setTrackedRiderId(rider._id)
    }
  }

  // const handleShow = row => {
  //   console.log({ row })
  //   setSelectedRider(row)
  //   setOpen(true)
  // }

  // const toggleModal = () => {
  //   setOpen(!open)
  // }

  // const closeModal = () => {
  //   setOpen(false)
  // }

  const handleChange = e => {
    setSelectedCity(e.target.value)
    refetch({ cityId: e.target.value })
  }

  return (
    <Fragment>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10
          }}>
          <Typography variant="h4">Riders map</Typography>
          <Box sx={{ bgcolor: '#fff', width: 200 }}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">City</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedCity}
                label="City"
                onChange={handleChange}
                sx={{ color: '#000' }}>
                {cities?.map(city => {
                  return (
                    <MenuItem
                      key={city._id}
                      sx={{ color: '#000' }}
                      value={city._id}>
                      {city.title}
                    </MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Box>
        </Box>
        {error && <Typography>Something went wrong!</Typography>}
        {data && (
          <RidersMapComponent
            ref={mapRef}
            riders={riders}
            trackedRiderId={trackedRiderId}
          />
        )}

        {loading ? (
          <CustomLoader />
        ) : (
          <Fragment>
            {data && (
              <Paper sx={{ mt: 3 }}>
                <DataTable
                  subHeader={true}
                  subHeaderComponent={
                    <SearchBar
                      value={searchQuery}
                      onChange={onChangeSearch}
                      onClick={() => refetch()}
                    />
                  }
                  title={<TableHeader title={t('Riders')} />}
                  columns={columns}
                  data={riders ? filtered : []}
                  onRowClicked={handleGoTo}
                  pagination
                  progressPending={loading}
                  progressComponent={<CustomLoader />}
                  onSort={handleSort}
                  sortFunction={customSort}
                  selectableRows
                  customStyles={customStyles}
                />
              </Paper>
            )}
          </Fragment>
        )}
        {/* <Modal
          style={{
            width: '70%',
            marginLeft: '15%',
            overflowY: 'auto'
          }}
          open={open}
          onClose={() => {
            toggleModal()
          }}>
          <RiderMapView rider={selectedRider} onClose={closeModal} />
        </Modal> */}
      </Container>
    </Fragment>
  )
}

export default RidersMap
