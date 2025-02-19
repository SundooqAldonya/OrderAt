/*eslint-disable*/
import React, { Fragment } from 'react'
import { withTranslation } from 'react-i18next'
// nodejs library to set properties for components

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  Link,
  SvgIcon,
  useTheme
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import routes from '../../routes'
import useStyles from './styles'
// import { ReactComponent as Logo } from '../../assets/svg/logo.svg'
import { useLocation } from 'react-router-dom'
import Logo from '../../assets/logo.png'

const drawerWidth = 240
function Sidebar(props) {
  const theme = useTheme()
  const location = useLocation()
  const classes = useStyles()
  const restaurantId = localStorage.getItem('restaurantId')
  const restaurantImage = localStorage.getItem('restaurantImage')
  const restaurantName = localStorage.getItem('restaurantName')
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { window, t } = props

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }
  const container =
    window !== undefined ? () => window().document.body : undefined

  const createLinks = (
    <Box className={classes.sidebarBox}>
      <Toolbar className={[classes.rowDisplay, classes.logo]}>
        {/* <Logo /> */}
        <Box
          style={{
            width: 300,
            height: 100
          }}>
          <img src={Logo} style={{ width: '100%' }} />
        </Box>
      </Toolbar>
      {restaurantName && restaurantImage ? (
        <Box className={[classes.rowDisplay, classes.restContainer]}>
          <img
            src={restaurantImage}
            className={classes.restImage}
            alt=""
            width="25px"
            height="25px"
          />
          <Typography
            variant="h2"
            sx={{ color: 'common.black' }}
            className={[classes.restText]}>
            {restaurantName}
          </Typography>
        </Box>
      ) : null}

      <Box className={classes.sidebarList}>
        {routes.map((prop, key) => {
          if (
            JSON.parse(localStorage.getItem('user-enatega')).userType ===
            'ADMIN'
          ) {
            return prop.appearInSidebar && !prop.admin ? (
              <Fragment key={key}>
                {key === 14 ? (
                  <Typography className={classes.headingText} variant="h3">
                    {t('RESTAURANT')}
                  </Typography>
                ) : null}
                {key === 19 ? (
                  <Typography className={classes.headingText} variant="h3">
                    {t('MANAGEMENT')}
                  </Typography>
                ) : null}
                <Link
                  className={[
                    classes.rowDisplay,
                    classes.sidebarLink,
                    location.pathname === `${prop.layout}${prop.path}` &&
                      classes.active
                  ]}
                  href={
                    '#' + prop.layout + prop.path.replace(':id', restaurantId)
                  }
                  underline="none">
                  <SvgIcon component={prop.icon} fontSize="small" />
                  <Typography
                    variant="h6"
                    className={[
                      classes.linkText,
                      location.pathname !== `${prop.layout}${prop.path}`
                        ? classes.blackText
                        : classes.whiteText
                    ]}>
                    {t(prop.name)}
                  </Typography>
                </Link>
              </Fragment>
            ) : null
          } else {
            return prop.appearInSidebar &&
              !prop.admin &&
              prop.name != t('BackToAdmin') ? (
              <>
                <Link
                  className={[
                    classes.rowDisplay,
                    classes.sidebarLink,
                    location.pathname === `${prop.layout}${prop.path}` &&
                      classes.active
                  ]}
                  href={
                    '#' + prop.layout + prop.path.replace(':id', restaurantId)
                  }
                  underline="none">
                  <SvgIcon component={prop.icon} fontSize="small" />
                  <Typography
                    variant="h6"
                    className={[
                      classes.linkText,
                      location.pathname !== `${prop.layout}${prop.path}`
                        ? classes.blackText
                        : classes.whiteText
                    ]}>
                    {t(prop.name)}
                  </Typography>
                </Link>
              </>
            ) : null
          }
        })}
      </Box>
    </Box>
  )

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { sm: 'none' }
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: '70%' }
          }}>
          {createLinks}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: `linear-gradient(180deg, ${theme.palette.warning.dark} 50%, transparent 50%);`,
              borderRight: 'none'
            }
          }}
          open>
          {createLinks}
        </Drawer>
      </Box>
    </>
  )
}

export default withTranslation()(Sidebar)
