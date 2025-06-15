import React, { useEffect, useRef, useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import { Box, Typography } from '@mui/material'
import { useQuery } from '@apollo/client'
import { assignedOrders } from '../../apollo'

const RiderMapView = ({ onClose, rider }) => {
  const { t } = useTranslation()
  const classes = useStyles()
  const { data, loading, error } = useQuery(assignedOrders, {
    variables: {
      id: rider._id
    },
    pollInterval: 10000,
    skip: !rider
  })

  console.log({ dataRider: data })

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t('rider_orders')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}></Box>
    </Box>
  )
}

export default RiderMapView
