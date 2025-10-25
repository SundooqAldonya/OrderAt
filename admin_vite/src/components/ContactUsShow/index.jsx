import React, { useState } from 'react'
import useStyles from '../styles'
import { useTranslation } from 'react-i18next'
import useGlobalStyles from '../../utils/globalStyles'
import { Alert, Box, Button, Input, Modal, Typography } from '@mui/material'

const ContactUsShow = ({ onClose, selectedContact }) => {
  const { t } = useTranslation()

  const classes = useStyles()
  const globalClasses = useGlobalStyles()

  return (
    <Box container className={[classes.container, classes.width60]}>
      <Box className={classes.flexRow}>
        <Box item className={classes.headingBlack}>
          <Typography variant="h6" className={classes.textWhite}>
            {t('Selected Contact')}
          </Typography>
        </Box>
      </Box>
      <Box className={classes.form}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 5,
            marginBottom: 15
          }}>
          <Typography>{t('Name')}:</Typography>
          <Typography>{selectedContact.name}</Typography>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 5,
            marginBottom: 15
          }}>
          <Typography>{t('Phone')}:</Typography>
          <Typography>{selectedContact.phone}</Typography>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 5,
            marginBottom: 15
          }}>
          <Typography>{t('Email')}:</Typography>
          <Typography>{selectedContact.email}</Typography>
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 5,
            marginBottom: 15
          }}>
          <Typography>{t('Message')}:</Typography>
          <Typography>{selectedContact.message}</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default ContactUsShow
