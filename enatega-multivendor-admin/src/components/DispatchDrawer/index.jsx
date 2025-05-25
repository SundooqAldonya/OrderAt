import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import PersonIcon from '@mui/icons-material/Person'
import moment from 'moment'
import { orderRidersInteractions } from '../../apollo'
import { useQuery } from '@apollo/client'
import { Typography } from '@mui/material'
import Loader from 'react-loader-spinner'

const DispatchDrawer = ({ open, order, toggleDrawer }) => {
  console.log({ order })
  const { data, loading, error } = useQuery(orderRidersInteractions, {
    variables: {
      id: order?._id
    },
    skip: !order,
    pollInterval: 10000
  })

  console.log({ data })

  const riderInteractions = data?.orderRidersInteractions || null

  const list = () => (
    <Box
      sx={{ width: 'auto' }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}>
      <List>
        {riderInteractions?.map(item => {
          console.log({ item })
          return (
            <ListItem key={item._id} disablePadding>
              <ListItemButton
                style={{
                  justifyContent: 'space-between'
                }}>
                <Box
                  style={{
                    display: 'flex'
                  }}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.rider.name}
                    style={{ color: '#000' }}
                  />
                </Box>
                {item.seenAt && (
                  <Box>
                    <ListItemText primary={'Seen'} style={{ color: 'green' }} />
                    <ListItemText
                      primary={moment(item.seenAt).format('LLL')}
                      style={{ color: '#000' }}
                    />
                  </Box>
                )}
                {item.openedAt && (
                  <Box>
                    <ListItemText
                      primary={'Opened'}
                      style={{ color: 'green' }}
                    />
                    <ListItemText
                      primary={moment(item.openedAt).format('LLL')}
                      style={{ color: '#000' }}
                    />
                  </Box>
                )}
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider />
    </Box>
  )

  return (
    <div>
      <Drawer anchor={'bottom'} open={open} onClose={toggleDrawer}>
        {loading && (
          <Box
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Loader type="ThreeDots" />
          </Box>
        )}
        {error && (
          <Typography style={{ color: '#000', textAlign: 'center' }}>
            No rider interaction for the selected order
          </Typography>
        )}
        {list()}
      </Drawer>
    </div>
  )
}

export default DispatchDrawer
