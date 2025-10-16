import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useState, Fragment } from 'react'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'

const NotificationRow = ({ row }) => {
  const [open, setOpen] = useState(false)

  return (
    <Fragment>
      <TableRow
        onClick={() => setOpen(!open)}
        sx={{
          '& > *': { borderBottom: 'unset', color: '#000', cursor: 'pointer' }
        }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: '#000' }}>{row.title}</TableCell>
        <TableCell sx={{ color: '#000' }}>{row.data.orderId}</TableCell>
        <TableCell sx={{ color: '#000' }}>{row.body}</TableCell>
        <TableCell sx={{ color: '#000' }}>
          {new Date(row.createdAt).toLocaleString('en-GB', { hour12: true })}
        </TableCell>
        <TableCell sx={{ color: '#000' }}>
          {row.data?.type === 'User' || row.data?.type === 'user'
            ? 'Customer'
            : row.data?.type === 'Rider'
            ? 'Rider'
            : 'Business'}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={5} sx={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography
                sx={{ color: '#000' }}
                variant="subtitle1"
                gutterBottom>
                Recipients
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#000' }}>Kind</TableCell>
                    <TableCell sx={{ color: '#000' }}>Name</TableCell>
                    <TableCell sx={{ color: '#000' }}>Status</TableCell>
                    <TableCell sx={{ color: '#000' }}>Last Attempt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.recipients.map((recipient, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ color: '#000' }}>
                        {recipient.kind}
                      </TableCell>
                      <TableCell sx={{ color: '#000' }}>
                        {recipient.item?.name}
                      </TableCell>
                      <TableCell sx={{ color: '#000' }}>
                        <Chip
                          label={recipient.status.toUpperCase()}
                          color={
                            recipient.status === 'failed' ? 'error' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#000' }}>
                        {new Date(recipient.lastAttempt).toLocaleString(
                          'en-GB',
                          { hour12: true }
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

export default NotificationRow
