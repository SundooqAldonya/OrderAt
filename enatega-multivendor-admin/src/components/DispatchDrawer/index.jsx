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

const DispatchDrawer = ({ open, order, toggleDrawer }) => {
  const list = () => (
    <Box
      sx={{ width: 'auto' }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}>
      <List>
        {order?.riderInteractions?.map(item => {
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
        {list()}
      </Drawer>
    </div>
  )
}

export default DispatchDrawer
