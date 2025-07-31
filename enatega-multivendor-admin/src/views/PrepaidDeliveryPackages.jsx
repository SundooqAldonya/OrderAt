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
import { useMutation, useQuery } from '@apollo/client'
import {
  getPrepaidDeliveryPackages,
  removePrepaidDeliveryPackage,
  toggleCityActive,
  updateActivePrepaidDeliveryPackage
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
import PrepaidPackageForm from '../components/PrepaidPackageForm'

const PrepaidDeliveryPackages = () => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [item, setItem] = useState(null)
  const [type, setType] = useState('')

  const globalClasses = useGlobalStyles()

  const { data, loading, refetch } = useQuery(getPrepaidDeliveryPackages)

  console.log({ data, loading })

  const [removeCity] = useMutation(removePrepaidDeliveryPackage, {
    onCompleted: res => {
      console.log({ res })
      setSuccess(true)
      setType('success')
      setMessage(res.removePrepaidDeliveryPackage.message)
    },
    refetchQueries: [{ query: getPrepaidDeliveryPackages }]
  })

  const [mutateActive] = useMutation(updateActivePrepaidDeliveryPackage, {
    refetchQueries: [{ query: getPrepaidDeliveryPackages }],
    awaitRefetchQueries: true,
    onCompleted: ({ updateActivePrepaidDeliveryPackage }) => {
      console.log({ updateActivePrepaidDeliveryPackage })
    },
    onError: err => {
      console.log({ err })
    }
  })

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = item => {
    setOpenEdit(!openEdit)
    setItem(item)
  }
  const closeEditModal = () => {
    setOpenEdit(false)
  }
  const packages = data?.getPrepaidDeliveryPackages || null
  const columns = [
    {
      name: t('Name'),
      selector: 'name',
      sortable: true,
      cell: row => <span>{row.business?.name || 'N/A'}</span>
    },
    {
      name: t('Total Deliveries'),
      selector: 'totalDeliveries',
      sortable: true,
      cell: row => <span>{row.totalDeliveries}</span>
    },
    {
      name: t('Used Deliveries'),
      selector: 'usedDeliveries',
      sortable: true,
      cell: row => <span>{row.usedDeliveries}</span>
    },
    {
      name: t('Remaining Deliveries'),
      selector: 'remainingDeliveries',
      sortable: true,
      cell: row => <span>{row.remainingDeliveries || 'N/A'}</span>
    },
    {
      name: t('Amount'),
      selector: 'amount',
      sortable: true,
      cell: row => <span>{row.price || 'N/A'}</span>
    },
    {
      name: t('Active'),
      cell: row => <>{isActiveStatus(row)}</>
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

  const handleRemoveCity = itemId => {
    removeCity({
      variables: {
        id: itemId
      }
    })
  }

  const isActiveStatus = row => {
    return (
      <Fragment>
        {/* {row.isActive} */}
        <Switch
          size="small"
          defaultChecked={row.isActive}
          onChange={_event => {
            mutateActive({ variables: { id: row._id } })
          }}
          style={{ color: 'black' }}
        />
      </Fragment>
    )
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
              <MenuItem
                onClick={() => handleRemoveCity(row._id)}
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
      <Container className={globalClasses.flex} fluid>
        <PrepaidPackageForm />
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
            title={<TableHeader title={t('Packages')} />}
            columns={columns}
            data={packages}
            pagination
            progressPending={loading}
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
            overflowY: 'auto',
            marginTop: 150
          }}
          open={openEdit}
          onClose={() => {
            toggleModal()
          }}>
          <PrepaidPackageForm item={item} onClose={closeEditModal} />
        </Modal>
      </Container>
    </Fragment>
  )
}

export default PrepaidDeliveryPackages
