import { Box, Divider, Grid, Paper, Typography, useTheme } from '@mui/material'
import clsx from 'clsx'
import React, { useContext, useState, useEffect } from 'react'
import { calculatePrice } from '../../utils/customFunction'
import useStyles from './styles'
import { useTranslation } from 'react-i18next'
import { calculateDistance, calculateAmount } from '../../utils/customFunction'
import ConfigurationContext from '../../context/Configuration'

export default function AmountCard(props) {
  const { t } = useTranslation()
  const classes = useStyles()
  const configuration = useContext(ConfigurationContext)
  const theme = useTheme()

  const subtotal =
    props.orderAmount -
    props.deliveryCharges -
    props.taxationAmount -
    props.tipping

  return (
    <>
      <Grid container item xs={12}>
        <Grid item xs={1} />
        <Grid item xs={10} sm={6} md={4}>
          <Typography
            className={`${classes.heading} ${classes.textBold}`}
            textAlign="center"
            color={theme.palette.primary.main}>
            {t('amount_details')}
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
            <Grid
              container
              className={clsx(classes.cardRow, classes.mv2)}
              // sx={{ height: "auto" }}
            >
              {props.items.map(item => (
                <React.Fragment key={item._id}>
                  <Grid item xs={1}>
                    <Typography
                      variant="caption"
                      className={`${classes.disabledText} ${classes.mediumBoldText}`}>
                      {`${item.quantity}x`}
                    </Typography>
                  </Grid>
                  <Grid item xs={7}>
                    <Typography
                      variant="caption"
                      style={{ marginLeft: 5 }}
                      className={`${classes.disabledText} ${classes.mediumText}`}>
                      {`${item.title} ${
                        item.variation.title ? `(${item.variation.title})` : ''
                      }`}
                    </Typography>
                    <Box display="flex" flexDirection="column">
                      {item.addons.map((addon, index) => (
                        <Typography
                          key={index}
                          variant="caption"
                          className={`${classes.disabledText}`}>
                          {addon.options.map(option => {
                            return (
                              <Box
                                key={option._id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2
                                }}>
                                <Typography>{option.title}</Typography>
                                <Typography>+{option.price}</Typography>
                              </Box>
                            )
                          })}
                        </Typography>
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography
                      variant="caption"
                      className={`${classes.disabledText} ${classes.smallText}`}>
                      {`${configuration.currencySymbol} ${parseFloat(
                        calculatePrice(item)
                      ).toFixed(2)}`}
                    </Typography>
                  </Grid>
                  <Grid md={12} my={2}>
                    <Typography
                      sx={{ fontSize: 18, fontWeight: 'bold', color: '#000' }}>
                      {t('specialInstructions')}
                    </Typography>
                    <Typography sx={{ color: '#000' }}>
                      {item.specialInstructions
                        ? item.specialInstructions
                        : null}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} mb={2}>
                    <Divider />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
            <Grid
              container
              className={clsx(classes.cardRow, classes.mv2)}
              mb={5}
              style={{
                flexWrap: 'nowrap',
                justifyContent: 'space-between'
              }}>
              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {t('subTotal')}
                </Typography>
              </Grid>
              {props.originalSubtotal > subtotal ? (
                <Grid item xs={4}>
                  <Typography
                    variant="body2"
                    className={clsx(classes.disabledText, classes.smallText)}
                    style={{
                      textDecorationLine: 'line-through',
                      textAlign: 'center'
                    }}>
                    {`${configuration.currencySymbol} ${parseFloat(
                      props.originalSubtotal
                    ).toFixed(2)}`}
                  </Typography>
                </Grid>
              ) : null}
              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {/* {`${configuration.currencySymbol} ${parseFloat(
                    props.orderAmount -
                    deliveryChargesdata -
                      props.taxationAmount -
                      props.tipping
                  ).toFixed(2)}`} */}
                  {`${configuration.currencySymbol} ${parseFloat(
                    Math.abs(subtotal)
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>

            <Grid container className={clsx(classes.cardRow, classes.mv2)}>
              <Grid item xs={9}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {t('tip')}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.tipping
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
            <Grid container className={clsx(classes.cardRow, classes.mv2)}>
              <Grid item xs={9}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {t('taxFee')}
                </Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  className={clsx(classes.disabledText, classes.smallText)}>
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.taxationAmount
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
            {!props.isPickedUp && (
              <>
                <Grid
                  container
                  style={{
                    flexWrap: 'nowrap',
                    justifyContent: 'space-between'
                  }}
                  className={clsx(classes.cardRow, classes.mv2)}>
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      className={clsx(classes.disabledText, classes.smallText)}>
                      {t('deliveryFee')}
                    </Typography>
                  </Grid>
                  {/* <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexDirection: 'row',
                      gap: 10,
                      flexWrap: 'no-wrap'
                    }}> */}
                  {props.originalDeliveryCharges > props.deliveryCharges ? (
                    <Grid item xs={4}>
                      <Typography
                        variant="body2"
                        className={clsx(
                          classes.disabledText,
                          classes.smallText
                        )}
                        style={{
                          textDecorationLine: 'line-through',
                          textAlign: 'center'
                        }}>
                        {`${configuration.currencySymbol} ${parseFloat(
                          props.originalDeliveryCharges
                        ).toFixed(2)}`}
                      </Typography>
                    </Grid>
                  ) : null}
                  <Grid item xs={4}>
                    <Typography
                      variant="body2"
                      className={clsx(classes.disabledText, classes.smallText)}
                      style={{ textAlign: 'center' }}>
                      {`${configuration.currencySymbol} ${parseFloat(
                        props.deliveryCharges
                      ).toFixed(2)}`}
                    </Typography>
                  </Grid>

                  {/* </Box> */}
                </Grid>
              </>
            )}

            <Grid
              container
              className={clsx(classes.cardRow, classes.mv2)}
              style={{
                flexWrap: 'nowrap',
                justifyContent: 'space-between'
              }}>
              <Grid item xs={4}>
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className={clsx(classes.textBold, classes.smallText)}>
                    {t('total')}
                  </Typography>
                  {/* <Typography
                    variant="caption"
                    className={classes.disabledText}>
                    (Incl. TAX)
                  </Typography> */}
                </Box>
              </Grid>
              {props.originalPrice > props.orderAmount ? (
                <Grid item xs={4}>
                  <Typography
                    variant="body2"
                    className={clsx(classes.disabledText, classes.smallText)}
                    style={{
                      textDecorationLine: 'line-through',
                      textAlign: 'center'
                    }}>
                    {`${configuration.currencySymbol} ${parseFloat(
                      props.originalPrice
                    ).toFixed(2)}`}
                  </Typography>
                </Grid>
              ) : null}
              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={clsx(classes.textBold, classes.smallText)}>
                  {`${configuration.currencySymbol} ${parseFloat(
                    props.orderAmount
                  ).toFixed(2)}`}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}
