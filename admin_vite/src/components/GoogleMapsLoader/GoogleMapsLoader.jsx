import React, { useEffect } from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useJsApiLoader } from '@react-google-maps/api'

const LIBRARIES = [
  'drawing',
  'places',
  'geometry',
  // 'localContext',
  'visualization'
]

const GoogleMapsLoader = ({ children, GOOGLE_MAPS_KEY }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    language: 'ar',
    region: 'EG',
    libraries: LIBRARIES
  })

  useEffect(() => {
    if (window.google) {
      console.log('Google Maps API is loaded')
    } else {
      console.log('Error loading Google Maps API')
    }
  }, [])

  console.log({ loadError })

  if (loadError) {
    return (
      <Box>
        <Typography variant="h1">Error loading google maps</Typography>
      </Box>
    )
  }

  if (!isLoaded) {
    return (
      <Box
        component="div"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw">
        <CircularProgress color="primary" />
      </Box>
    )
  }

  return <>{children}</>
}
export default GoogleMapsLoader
