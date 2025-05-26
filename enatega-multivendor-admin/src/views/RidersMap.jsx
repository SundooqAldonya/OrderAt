import { Fragment, useRef, useState } from 'react'
import Header from '../components/Headers/Header'
import { Container, Paper, Typography } from '@mui/material'
import useGlobalStyles from '../utils/globalStyles'
import RidersMapComponent from '../components/RidersMapComponent'
import { useQuery } from '@apollo/client'
import { getRidersLocation } from '../apollo'
import DataTable from 'react-data-table-component'
import CustomLoader from '../components/Loader/CustomLoader'
import SearchBar from '../components/TableHeader/SearchBar'
import { useTranslation } from 'react-i18next'
import TableHeader from '../components/TableHeader'
import { orderBy } from 'lodash'
import { customStyles } from '../utils/tableCustomStyles'
import moment from 'moment'

const RidersMap = () => {
  const { t } = useTranslation()
  const mapRef = useRef()

  const globalClasses = useGlobalStyles()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error, refetch } = useQuery(getRidersLocation, {
    pollInterval: 10000
  })
  console.log({ data })

  const riders = data?.getRidersLocation || null

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
      cell: row => <div>{moment(row.updatedAt).format('LLL')}</div>
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
      ? data && data.getRidersLocation
      : data &&
        data.getRidersLocation.filter(rider => {
          return (
            rider.name.toLowerCase().search(regex) > -1 ||
            rider.username.toLowerCase().search(regex) > -1 ||
            rider.phone.toLowerCase().search(regex) > -1
          )
        })

  const handleRowClick = (row, event) => {
    console.log({ row })
    const index = riders.findIndex(r => r._id === row._id)
    if (index !== -1) {
      mapRef.current?.highlightMarkerByIndex(index)
    }
  }

  return (
    <Fragment>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <Typography variant="h4">Riders map</Typography>
        {error && <Typography>Something went wrong!</Typography>}
        {riders && <RidersMapComponent ref={mapRef} riders={riders} />}

        {loading ? (
          <CustomLoader />
        ) : (
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
              data={filtered}
              onRowClicked={handleRowClick}
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
      </Container>
    </Fragment>
  )
}

export default RidersMap
