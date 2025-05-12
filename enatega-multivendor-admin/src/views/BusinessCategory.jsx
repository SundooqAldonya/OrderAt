import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { withTranslation } from 'react-i18next'
import Header from '../components/Headers/Header'
import CustomLoader from '../components/Loader/CustomLoader'
import DataTable from 'react-data-table-component'
import orderBy from 'lodash/orderBy'
import {
  getBusinessCategories,
  editBusinessCategory,
  removeBusinessCategory,
  changeActiveBusinessCategory
} from '../apollo'
import SearchBar from '../components/TableHeader/SearchBar'
import useGlobalStyles from '../utils/globalStyles'
import { customStyles } from '../utils/tableCustomStyles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  Paper,
  Switch,
  Typography,
  ListItemIcon
} from '@mui/material'
import { ReactComponent as CouponsIcon } from '../assets/svg/svg/Coupons.svg'
import TableHeader from '../components/TableHeader'
import BusinessCategoryCreate from '../components/BusinessCategoryCreate'
import { Fragment } from 'react'

const BusinessCategory = props => {
  const { t } = props
  const [editModal, setEditModal] = useState(false)
  const [businessCategory, setBusinessCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const onChangeSearch = e => setSearchQuery(e.target.value)
  const [mutateActive] = useMutation(changeActiveBusinessCategory, {
    refetchQueries: [{ query: getBusinessCategories }]
  })
  const [mutateDelete] = useMutation(removeBusinessCategory, {
    refetchQueries: [{ query: getBusinessCategories }]
  })

  const { data, error: errorQuery, loading: loadingQuery, refetch } = useQuery(
    getBusinessCategories
  )

  const toggleModal = item => {
    setEditModal(!editModal)
    setBusinessCategory(item)
  }

  console.log({ data: data?.getBusinessCategories })

  const customSort = (rows, field, direction) => {
    const handleField = row => {
      if (row[field] && isNaN(row[field])) {
        return row[field].toLowerCase()
      }

      return row[field]
    }

    return orderBy(rows, handleField, direction)
  }

  const columns = [
    {
      name: t('Image'),
      cell: row => (
        <>
          <img
            className="img-responsive"
            style={{ width: 30, height: 30, borderRadius: 15 }}
            src={
              row.image
                ? row.image.url
                : 'https://enatega.com/wp-content/uploads/2023/11/man-suit-having-breakfast-kitchen-side-view.webp'
            }
            alt=""
          />
        </>
      )
    },
    {
      name: t('Name'),
      sortable: true,
      selector: 'name'
    },
    {
      name: t('Description'),
      sortable: true,
      selector: 'description'
    },
    {
      name: t('order_number'),
      sortable: true,
      selector: 'order',
      cell: row => <>{row.order ? row.order : 'N/A'}</>
    },
    {
      name: t('Active'),
      cell: row => <>{isActiveStatus(row)}</>
    },
    {
      name: t('Action'),
      cell: row => <>{ActionButtons(row, toggleModal, t, mutateDelete)}</>
    }
  ]
  const regex =
    searchQuery.length > 2 ? new RegExp(searchQuery.toLowerCase(), 'g') : null
  const filtered =
    searchQuery.length < 3
      ? data && data.getBusinessCategories
      : data &&
        data.getBusinessCategories.filter(item => {
          return item.name.toLowerCase().search(regex) > -1
        })

  const globalClasses = useGlobalStyles()

  const isActiveStatus = row => {
    console.log({ isActive: row.isActive })
    return (
      <Fragment>
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

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className={globalClasses.flex} fluid>
        <Grid container>
          <Grid item>
            <BusinessCategoryCreate />
          </Grid>
          <Grid sx={{ display: { xs: 'none', lg: 'block' } }} item mt={2}>
            <CouponsIcon />
          </Grid>
        </Grid>

        {errorQuery ? (
          <span>
            `${t('Error')}! ${errorQuery.message}`
          </span>
        ) : null}
        {loadingQuery ? (
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
            title={<TableHeader title={t('business_categories')} />}
            columns={columns}
            data={filtered}
            pagination
            progressPending={loadingQuery}
            progressComponent={<CustomLoader />}
            sortFunction={customSort}
            defaultSortField="name"
            customStyles={customStyles}
          />
        )}
        <Modal
          open={editModal}
          onClose={() => {
            toggleModal(null)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <BusinessCategoryCreate item={businessCategory} />
        </Modal>
      </Container>
    </>
  )
}

const ActionButtons = (row, toggleModal, t, mutateDelete) => {
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
                mutateDelete({ variables: { id: row._id } })
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

export default withTranslation()(BusinessCategory)
