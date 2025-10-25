import { Divider, Grid, Paper, Typography, useTheme } from '@mui/material'
import clsx from 'clsx'
import React from 'react'
import useStyles from './styles'
import { useTranslation } from 'react-i18next'

function RiderDetails({ rider, order }) {
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
          {t('riderDetail')}
        </Typography>
        <Divider
          orientation="horizontal"
          flexItem
          style={{ backgroundColor: theme.palette.primary.main }}
          variant="middle"
        />

        <Paper
          style={{ padding: theme.spacing(5) }}
          elevation={1}
          className={classes.mt3}>
          {/* first box */}
          <Grid container>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                className={`${clsx(classes.disabledText)} ${clsx(
                  classes.smallText
                )} ${clsx(classes.textBold)}`}>
                {t('driver')}:
              </Typography>
            </Grid>
            <Grid item xs={6} className={classes.ph1}>
              <Typography
                variant="body2"
                color="textSecondary"
                className={`${clsx(classes.textBold)} ${clsx(
                  classes.smallText
                )}`}>
                {rider.name ? rider.name : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
          <Grid container className={classes.mv2}>
            <Grid item xs={6}>
              <Typography
                variant="body2"
                className={`${clsx(classes.disabledText)} ${clsx(
                  classes.smallText
                )} ${clsx(classes.textBold)}`}>
                {t('phone')}:
              </Typography>
            </Grid>
            <Grid item xs={6} className={classes.ph1}>
              <Typography
                variant="body2"
                color="textSecondary"
                className={`${clsx(classes.textBold)} ${clsx(
                  classes.smallText
                )}`}>
                {rider.phone ? rider.phone : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default RiderDetails
