import React, { Fragment, useState } from 'react'
import {
  Container,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Typography
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import { useMutation, useQuery } from '@apollo/client'
import { allDeliveryPrices, createDeliveryPrice } from '../apollo'
import DataTable from 'react-data-table-component'
import CustomLoader from '../components/Loader/CustomLoader'
import SearchBar from '../components/TableHeader/SearchBar'
import TableHeader from '../components/TableHeader'
import { useTranslation } from 'react-i18next'
import orderBy from 'lodash/orderBy'
import Header from '../components/Headers/Header'
import useGlobalStyles from '../utils/globalStyles'
import { customStyles } from '../utils/tableCustomStyles'
import DeleteIcon from '@mui/icons-material/Delete'
import DeliveryPriceCreate from '../components/DeliveryPriceCreate'

const DeliveryPrices = () => {
  const { t } = useTranslation()
  const globalClasses = useGlobalStyles()

  const [isOpen, setIsOpen] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, loading, error, refetch } = useQuery(allDeliveryPrices)

  console.log({ data })

  const prices = data?.allDeliveryPrices || null

  // const [mutate] = useMutation(createDeliveryPrice, {
  //   refetchQueries: [{ query: allDeliveryPrices }],
  //   onCompleted: res => {
  //     console.log({ res })
  //   },
  //   onError: error => {
  //     console.log({ error })
  //   }
  // })

  const columns = [
    {
      name: t('from'),
      sortable: true,
      selector: 'title',
      cell: row => <>{row.originZone?.title ? row.originZone?.title : 'N/A'}</>
    },
    {
      name: t('to'),
      sortable: true,
      selector: 'title',
      cell: row => (
        <>{row.destinationZone?.title ? row.destinationZone?.title : 'N/A'}</>
      )
    },
    {
      name: t('cost'),
      sortable: true,
      selector: 'cost'
    },
    {
      name: t('Action'),
      cell: row => <>{ActionButtons(row, toggleModal, setIsOpen)}</>
    }
  ]

  const toggleModal = zone => {
    setEditModal(!editModal)
    // setZone(zone)
  }

  const closeEditModal = () => {
    setEditModal(false)
  }

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field]) {
        return row[field].toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  return (
    <Fragment>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <DeliveryPriceCreate />
        {error ? <span>{`Error! ${error.message}`}</span> : null}
        {loading ? <CustomLoader /> : null}
        {data?.allDeliveryPrices?.length ? (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                onClick={() => refetch()}
              />
            }
            title={<TableHeader title={t('delivery_prices')} />}
            columns={columns}
            data={prices}
            pagination
            progressPending={loading}
            progressComponent={<CustomLoader />}
            sortFunction={customSort}
            defaultSortField="title"
            customStyles={customStyles}
            selectableRows
          />
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            No delivery prices have been created yet
          </Typography>
        )}
      </Container>
    </Fragment>
  )
}

const ActionButtons = (row, PAID_VERSION, toggleModal, setIsOpen) => {
  const { t } = useTranslation()
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
                if (PAID_VERSION) toggleModal(row)
                else {
                  setIsOpen(true)
                  setTimeout(() => {
                    setIsOpen(false)
                  }, 5000)
                }
              }}
              style={{ height: 25 }}>
              <ListItemIcon>
                <EditIcon fontSize="small" style={{ color: 'green' }} />
              </ListItemIcon>
              <Typography color="green">{t('Edit')}</Typography>
            </MenuItem>
            <MenuItem
              onClick={e => {
                e.preventDefault()
                // mutate({ variables: { id: row._id } })
              }}
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

export default DeliveryPrices
