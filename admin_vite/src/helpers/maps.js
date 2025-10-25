export const handleGoogleMaps = ({ long, lat }) => {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`
  window.open(url, '_blank') // Opens in a new tab
}
