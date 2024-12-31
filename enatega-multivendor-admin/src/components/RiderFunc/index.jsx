import { MenuItem, Select } from '@mui/material'
import { assignRider, getRidersByZone } from '../../apollo'
import { gql, useMutation, useQuery } from '@apollo/client'
import useGlobalStyles from '../../utils/globalStyles'
import { NotificationManager } from 'react-notifications'

const GET_RIDERS_BY_ZONE = gql`
  ${getRidersByZone}
`

const ASSIGN_RIDER = gql`
  ${assignRider}
`
const RiderFunc = row => {
  const { data: dataZone } = useQuery(GET_RIDERS_BY_ZONE, {
    variables: { id: row.zone._id }
  })
  const [mutateAssign] = useMutation(ASSIGN_RIDER)
  const globalClasses = useGlobalStyles()

  return (
    <Select
      id="input-rider"
      name="input-rider"
      value=""
      displayEmpty
      inputProps={{ 'aria-label': 'Without label' }}
      style={{ width: '50px' }}
      className={globalClasses.selectInput}>
      {dataZone &&
        dataZone.ridersByZone.map(rider => (
          <MenuItem
            style={{ color: 'black' }}
            onClick={() => {
              mutateAssign({
                variables: {
                  id: row._id,
                  riderId: rider._id
                },
                onCompleted: data => {
                  console.error('Mutation success data:', data)
                  NotificationManager.success(
                    'Successful',
                    'Rider updated!',
                    3000
                  )
                },
                onError: error => {
                  console.error('Mutation error:', error)
                  NotificationManager.error(
                    'Error',
                    'Failed to update rider!',
                    3000
                  )
                }
              })
            }}
            key={rider._id}>
            {rider.name}
          </MenuItem>
        ))}
    </Select>
  )
}

export default RiderFunc
