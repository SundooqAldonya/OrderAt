import { Divider, Grid, Paper, Typography, useTheme } from '@mui/material'
import clsx from 'clsx'
import React from 'react'
import useStyles from './styles'
import { useTranslation } from 'react-i18next'

function PickedUpImage({ pickedImage }) {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Grid container item xs={12}>
      <Grid item xs={1} />
      <Grid item xs={10} sm={6} md={4}>
        <Typography
          className={`${classes.heading} ${classes.textBold}`}
          textAlign="center"
          color={theme.palette.primary.main}>
          {t('picked_up_image')}
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          style={{ backgroundColor: theme.palette.primary.main }}
          variant="middle"
        />

        <Paper elevation={1} className={classes.mt3}>
          {/* first box */}
          <Grid container>
            <img
              src={pickedImage.url}
              alt={pickedImage.publicId}
              style={{ width: '100%', height: '100%' }}
            />
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default PickedUpImage
