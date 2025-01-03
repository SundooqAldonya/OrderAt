/* eslint-disable react/display-name */
import React, { useState } from 'react'
import Header from '../components/Headers/Header'
import OptionComponent from '../components/Option/Option'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'

import { useTranslation, withTranslation } from 'react-i18next'
import { useQuery, useMutation, gql } from '@apollo/client'
import { getRestaurantDetail, deleteOption, getOptions } from '../apollo'
import SearchBar from '../components/TableHeader/SearchBar'
import useGlobalStyles from '../utils/globalStyles'
import {
  Container,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Typography,
  ListItemIcon
} from '@mui/material'
import { customStyles } from '../utils/tableCustomStyles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import TableHeader from '../components/TableHeader'
import Alert from '../components/Alert'
import ConfigurableValues from '../config/constants'

const GET_OPTIONS = gql`
  ${getOptions}
`
const DELETE_OPTION = gql`
  ${deleteOption}
`

const Option = props => {
  const { t } = props
  const { PAID_VERSION } = ConfigurableValues()
  const [editModal, setEditModal] = useState(false)
  const [option, setOption] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const toggleModal = option => {
    setEditModal(!editModal)
    setOption(option)
  }
  const closeEditModal = () => {
    setEditModal(false)
  }

  const restaurantId = localStorage.getItem('restaurantId')

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    GET_OPTIONS,
    {
      variables: { id: restaurantId }
    }
  )

  const [mutate, { loading }] = useMutation(DELETE_OPTION, {
    refetchQueries: [{ query: GET_OPTIONS, variables: { id: restaurantId } }]
  })

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field] && isNaN(row[field])) {
        return row[field].toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  const handleSort = (column, sortDirection) =>
    console.log(column.selector, sortDirection)

  const columns = [
    {
      name: t('Title'),
      sortable: true,
      selector: 'title'
    },
    {
      name: t('Description'),
      sortable: true,
      selector: 'description'
    },
    {
      name: t('Price'),
      sortable: true,
      selector: 'price'
    },
    {
      name: t('Action'),
      cell: row => <>{ActionButtons(row, toggleModal, mutate)}</>
    }
  ]

  const onChangeSearch = e => setSearchQuery(e.target.value)

  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null

  const filtered =
    searchQuery.length < 3
      ? data && data.options
      : data &&
        data.options.filter(option => {
          return (
            option.title.toLowerCase().search(regex) > -1 ||
            option.description.toLowerCase().search(regex) > -1
          )
        })

  const globalClasses = useGlobalStyles()
  return (
    <>
      <Header />
      {isOpen && (
        <Alert message={t('AvailableAfterPurchasing')} severity="warning" />
      )}
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <OptionComponent optionsPage={true} onClose={closeEditModal} />
        {errorQuery && (
          <tr>
            <td>{`${'Error'} ${errorQuery.message}`}</td>
          </tr>
        )}
        {loading ? (
          <CustomLoader />
        ) : (
          <DataTable
            subHeader={true}
            subHeaderComponent={
              <SearchBar
                value={searchQuery}
                onChange={onChangeSearch}
                onClick={() => refetch()}
              />
            }
            title={<TableHeader title={t('Options')} />}
            columns={columns}
            data={data && data.options?.length ? filtered : {}}
            pagination
            progressPending={loadingQuery}
            progressComponent={<CustomLoader />}
            onSort={handleSort}
            sortFunction={customSort}
            defaultSortField="title"
            customStyles={customStyles}
            selectableRows
            paginationIconLastPage=""
            paginationIconFirstPage=""
          />
        )}
        <Modal
          open={editModal}
          onClose={() => {
            toggleModal()
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <OptionComponent
            optionsPage={true}
            option={option}
            onClose={closeEditModal}
          />
        </Modal>
      </Container>
    </>
  )
}

const ActionButtons = (row, toggleModal, mutate) => {
  const restaurantId = localStorage.getItem('restaurantId')
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

                toggleModal(row)
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

                mutate({
                  variables: { id: row._id, restaurant: restaurantId }
                })
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

export default withTranslation()(Option)
