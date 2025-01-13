import React, { Fragment, useState } from 'react'
import Header from '../components/Headers/Header'
import { Alert, Container, Modal } from '@mui/material'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import SearchBar from '../components/TableHeader/SearchBar'
import TableHeader from '../components/TableHeader'
import useGlobalStyles from '../utils/globalStyles'
import { useTranslation } from 'react-i18next'

const DeliveryZones = () => {
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const globalClasses = useGlobalStyles()

  const cities = [
    {
      name: 'Cairo'
    },
    {
      name: 'Kafr Elshaikh'
    },
    {
      name: 'Alexandria'
    }
  ]

  return (
    <Fragment>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        {/* <ZoneComponent /> */}
        {/* Table */}
        {isOpen && (
          <Alert message={t('AvailableAfterPurchasing')} severity="warning" />
        )}
        {error ? <span>{`Error! ${error.message}`}</span> : null}
        {/* {loading ? <CustomLoader /> : null}
        <DataTable
          subHeader={true}
          subHeaderComponent={
            <SearchBar
              value={searchQuery}
              onChange={onChangeSearch}
              onClick={() => refetch()}
            />
          }
          title={<TableHeader title={t('Zones')} />}
          columns={columns}
          data={filtered}
          pagination
          progressPending={loadingQuery}
          progressComponent={<CustomLoader />}
          sortFunction={customSort}
          defaultSortField="title"
          customStyles={customStyles}
          selectableRows
        /> */}
        {/* <Modal
          style={{
            width: '70%',
            marginLeft: '15%',
            overflowY: 'auto'
          }}
          open={editModal}
          onClose={() => {
            toggleModal()
          }}>
          <ZoneComponent zone={zones} onClose={closeEditModal} />
        </Modal> */}
      </Container>
    </Fragment>
  )
}

export default DeliveryZones
