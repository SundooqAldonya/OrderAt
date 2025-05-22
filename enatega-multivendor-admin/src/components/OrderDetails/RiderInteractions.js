import React from 'react'
import { Grid, Typography, Divider, Paper, useTheme } from '@mui/material'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import useStyles from './styles'
import moment from 'moment'

const RiderInteractions = ({ interactions }) => {
  const { t } = useTranslation()

  const theme = useTheme()
  const classes = useStyles()

  return (
    <Grid
      container
      item
      xs={12}
      justifyContent="center"
      spacing={2}
      style={{ marginTop: theme.spacing(5) }}>
      {interactions.map((interaction, idx) => {
        const rider = interaction.rider || {}
        const seenAtFormatted = interaction.seenAt
          ? moment(interaction.seenAt).format('LLL')
          : 'N/A'
        const openedAtFormatted = interaction.openedAt
          ? moment(interaction.openedAt).format('LLL')
          : 'N/A'
        return (
          <Grid item xs={10} sm={6} md={4} key={interaction._id || idx}>
            <Typography
              className={`${classes.heading} ${classes.textBold}`}
              textAlign="center"
              color={theme.palette.primary.main}>
              {t('riderInteraction')} #{idx + 1}
            </Typography>
            <Divider
              orientation="horizontal"
              flexItem
              style={{ backgroundColor: theme.palette.primary.main }}
              variant="middle"
            />

            <Paper
              style={{ padding: theme.spacing(3), marginTop: theme.spacing(2) }}
              elevation={1}
              className={classes.mt3}>
              <Grid container spacing={1}>
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
                    {rider.name || 'N/A'}
                  </Typography>
                </Grid>

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
                    {rider.phone || 'N/A'}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    className={`${clsx(classes.disabledText)} ${clsx(
                      classes.smallText
                    )} ${clsx(classes.textBold)}`}>
                    {t('seenAt')}:
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.ph1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={`${clsx(classes.textBold)} ${clsx(
                      classes.smallText
                    )}`}>
                    {seenAtFormatted}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="body2"
                    className={`${clsx(classes.disabledText)} ${clsx(
                      classes.smallText
                    )} ${clsx(classes.textBold)}`}>
                    {t('openedAt')}:
                  </Typography>
                </Grid>
                <Grid item xs={6} className={classes.ph1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={`${clsx(classes.textBold)} ${clsx(
                      classes.smallText
                    )}`}>
                    {openedAtFormatted}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default RiderInteractions
