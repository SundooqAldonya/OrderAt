import {
  useState,
  useRef,
  Fragment,
  useEffect,
  useImperativeHandle,
  forwardRef
} from 'react'
import { GoogleMap, LoadScript } from '@react-google-maps/api'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

const containerStyle = {
  width: '100%',
  height: '600px'
}

const RidersMapComponent = forwardRef(({ riders, trackedRiderId }, ref) => {
  const mapRef = useRef(null)
  const markerRefs = useRef({})
  const clustererRef = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [center, setCenter] = useState({ lat: 31.1107, lng: 30.9388 })

  useEffect(() => {
    if (!mapRef.current || !riders) return
    if (!trackedRiderId && riders.length) {
      const defaultCenter = {
        lat: riders[0].location.coordinates[1],
        lng: riders[0].location.coordinates[0]
      }
      setCenter(defaultCenter)
    }
    // Clear old markers
    Object.values(markerRefs.current).forEach(marker => marker.setMap(null))
    markerRefs.current = {}

    if (clustererRef.current) {
      clustererRef.current.clearMarkers()
    }

    const markers = riders
      .map(rider => {
        const coords = rider?.location?.coordinates
        if (
          !coords ||
          coords.length < 2 ||
          isNaN(coords[0]) ||
          isNaN(coords[1])
        )
          return null

        const position = {
          lat: coords[1],
          lng: coords[0]
        }

        const marker = new window.google.maps.Marker({
          position,
          map: mapRef.current
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="font-weight:bold;">${rider.name}</div>`
        })

        marker.addListener('mouseover', () =>
          infoWindow.open(mapRef.current, marker)
        )
        marker.addListener('mouseout', () => infoWindow.close())

        markerRefs.current[rider._id] = marker
        return marker
      })
      .filter(Boolean)

    clustererRef.current = new MarkerClusterer({ markers, map: mapRef.current })
  }, [riders, mapReady])

  useImperativeHandle(ref, () => ({
    highlightMarkerById: id => {
      const marker = markerRefs.current[id]
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
        onLoad={map => {
          mapRef.current = map
          setMapReady(true)
        }}
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
