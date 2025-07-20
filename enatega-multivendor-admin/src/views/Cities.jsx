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
import { REMOVE_CITY, getCities, toggleCityActive } from '../apollo'
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

const GET_CITIES = gql`
  ${getCities}
`

const Cities = () => {
  const { t } = useTranslation()
  const [openEdit, setOpenEdit] = useState(false)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [city, setCity] = useState(null)
  const [type, setType] = useState('')

  const globalClasses = useGlobalStyles()

  const { data, loading, refetch } = useQuery(GET_CITIES)

  const [removeCity] = useMutation(REMOVE_CITY, {
    onCompleted: data => {
      console.log({ dataResponse: data })
      setSuccess(true)
      setType('success')
      setMessage(data.removeCity.message)
    },
    refetchQueries: [{ query: GET_CITIES }]
  })

  const [mutateActive] = useMutation(toggleCityActive, {
    refetchQueries: [{ query: GET_CITIES }],
    awaitRefetchQueries: true,
    onCompleted: ({ toggleCityActive }) => {
      console.log({ toggleCityActive })
    },
    onError: err => {
      console.log({ err })
    }
  })

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const toggleModal = item => {
    setOpenEdit(!openEdit)
    setCity(item)
  }
  const closeEditModal = () => {
    setOpenEdit(false)
  }
  const cities = data?.citiesAdmin || null
  const columns = [
    {
      name: t('Title'),
      selector: 'title',
      sortable: true
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
        <CityForm />
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
            title={<TableHeader title={t('Cities')} />}
            columns={columns}
            data={cities}
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
          <CityForm city={city} onClose={closeEditModal} />
        </Modal>
      </Container>
    </Fragment>
  )
}

export default Cities
