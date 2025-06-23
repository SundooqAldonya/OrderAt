import React, { Fragment, useState } from 'react'
import Header from '../components/Headers/Header'
import {
  Alert,
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Typography
} from '@mui/material'
import useGlobalStyles from '../utils/globalStyles'
import { useTranslation } from 'react-i18next'
import CityForm from '../components/CityForm'
import { gql, useMutation, useQuery } from '@apollo/client'
import {
  REMOVE_CITY,
  getAllContactus,
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

const ContactUs = () => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedContact, setSelectedContact] = useState(null)
  const [type, setType] = useState('')

  const globalClasses = useGlobalStyles()

  const { data, loading, refetch } = useQuery(getAllContactus)
  console.log({ data })

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = item => {
    setOpenEdit(!openEdit)
    setSelectedContact(item)
  }
  const closeEditModal = () => {
    setOpenEdit(false)
  }
  const contactUsList = data?.getAllContactus || null
  const columns = [
    {
      name: t('Name'),
      selector: 'name',
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

  return (
    <Fragment>
      <Header />
      <Container className={globalClasses.flex} fluid>
        {/* <CityForm /> */}
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
        {data && (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                onClick={() => refetch()}
              />
            }
            title={<TableHeader title={t('contact_us')} />}
            columns={columns}
            data={contactUsList}
            pagination
            progressPending={loading}
            progressComponent={<CustomLoader />}
            sortFunction={customSort}
            defaultSortField="title"
            customStyles={customStyles}
            onRowClicked={item => toggleModal(item)}
            selectableRows
          />
        )}
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

export default ContactUs
