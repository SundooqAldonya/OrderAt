import { useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { GoogleMap, LoadScript } from '@react-google-maps/api'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { Fragment } from 'react'

const containerStyle = {
  width: '100%',
  height: '600px'
}

const RidersMapComponent = forwardRef(({ riders }, ref) => {
  const mapRef = useRef(null)
  const markerRefs = useRef([])

  const center = { lat: 31.1107, lng: 30.9388 }

  const mapLocations = riders?.map(item => ({
    lat: item?.location?.coordinates[1],
    lng: item?.location?.coordinates[0]
  }))

  const onLoad = useCallback(
    map => {
      mapRef.current = map

      // Clean previous markers
      markerRefs.current.forEach(marker => marker.setMap(null))
      markerRefs.current = []

      const markers = mapLocations.map(position => {
        const marker = new window.google.maps.Marker({
          position,
          map
        })
        markerRefs.current.push(marker)
        return marker
      })

      new MarkerClusterer({ markers, map })
    },
    [mapLocations]
  )

  useImperativeHandle(ref, () => ({
    highlightMarkerByIndex: index => {
      const marker = markerRefs.current[index]
      if (marker && mapRef.current) {
        mapRef.current.panTo(marker.getPosition())
        mapRef.current.setZoom(18)
        marker.setAnimation(window.google.maps.Animation.BOUNCE)
        setTimeout(() => marker.setAnimation(null), 1400)
      }
    }
  }))

  return (
    <Fragment>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        options={{
          scrollwheel: true,
          gestureHandling: 'auto',
          disableDoubleClickZoom: false
        }}
      />
    </Fragment>
  )
})

export default RidersMapComponent
