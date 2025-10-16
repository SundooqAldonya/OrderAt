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
import CustomLoader from '../components/Loader/CustomLoader'
import SearchBar from '../components/TableHeader/SearchBar'
import TableHeader from '../components/TableHeader'
import useGlobalStyles from '../utils/globalStyles'
import { useTranslation } from 'react-i18next'
import { getAreas, getBusinesses, getCities, removeArea } from '../apollo'
import { gql, useMutation, useQuery } from '@apollo/client'
import AreaCreate from '../components/AreaCreate'
import { customStyles } from '../utils/tableCustomStyles'
import orderBy from 'lodash/orderBy'
import DataTable from 'react-data-table-component'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import BusinessCreate from '../components/BusinessCreate'

const REMOVE_AREAS = gql`
  ${removeArea}
`

const Businesses = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('')
  const [openEdit, setOpenEdit] = useState(false)
  const [area, setArea] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleModal = item => {
    setOpenEdit(!openEdit)
    setArea(item)
  }

  const closeEditModal = () => {
    setOpenEdit(false)
  }

  const {
    data,
    loading: loadingBusinesses,
    error: errorBusinesses,
    refetch
  } = useQuery(getBusinesses)

  console.log({ data })

  const [removeArea] = useMutation(REMOVE_AREAS, {
    refetchQueries: getBusinesses,
    onCompleted: data => {
      setMessage(data.removeArea.message)
      setType('success')
      setIsOpen(true)
    }
  })

  const businesses = data?.getBusinesses || null

  const columns = [
    {
      name: t('Name'),
      selector: 'name',
      sortable: true
    },
    {
      name: t('Business Name'),
      selector: 'businessName',
      sortable: true,
      cell: row => <>{row.businessName || 'N/A'}</>
    },
    {
      name: t('phone'),
      selector: 'phone',
      sortable: true,
      cell: row => <>{row.phone || 'N/A'}</>
    },
    {
      name: t('address'),
      selector: 'address',
      sortable: true,
      cell: row => <>{row.address || 'N/A'}</>
    },
    {
      name: t('Action'),
      cell: row => <>{ActionButtons(row, toggleModal)}</>
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

  const onChangeSearch = e => {
    setSearchQuery(e.target.value)
  }

  const handleRemoveArea = itemId => {
    removeArea({
      variables: {
        id: itemId
      }
    })
  }

  const globalClasses = useGlobalStyles()

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
              <MenuItem
                onClick={() => handleRemoveArea(row._id)}
                style={{ height: 25 }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" style={{ color: 'red' }} />
                </ListItemIcon>
                <Typography color="red">{t('Delete')}</Typography>
              </MenuItem>
            </Menu>
          </Paper>
        </div>
      </>
    )
  }

  return (
    <Fragment>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <BusinessCreate />
        {/* Table */}
        {isOpen && (
          <Alert
            className={globalClasses.alertSuccess}
            severity={type}
            variant="filled">
            {message}
          </Alert>
        )}
        {errorBusinesses ? (
          <span>{`Error! ${errorBusinesses.message}`}</span>
        ) : null}
        {loadingBusinesses ? <CustomLoader /> : null}
        {businesses && (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                onClick={() => refetch()}
              />
            }
            title={<TableHeader title={t('businesses')} />}
            columns={columns}
            data={businesses}
            pagination
            progressPending={loadingBusinesses}
            progressComponent={<CustomLoader />}
            sortFunction={customSort}
            defaultSortField="title"
            customStyles={customStyles}
            selectableRows
          />
        )}
        <Modal
          style={{
            width: '70%',
            marginLeft: '15%',
            overflowY: 'auto'
          }}
          open={openEdit}
          onClose={() => {
            toggleModal()
          }}>
          <BusinessCreate area={area} onClose={closeEditModal} />
        </Modal>
      </Container>
    </Fragment>
  )
}

export default Businesses
