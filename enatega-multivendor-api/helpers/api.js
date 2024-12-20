const axios = require('axios')
const config = require('../config')

const sendUserInfoToZapier = data => {
  const queryParams = jsonToQueryString(data)
  const urlWithParams = `${config.ZAPIER_WEBHOOK_URL}${queryParams}`
  console.log('sendUserInfoToZapier', urlWithParams)
  axios
    .get(urlWithParams)
    .then(response => {
      console.log('ZAPIER data sent', JSON.stringify(data))
    })
    .catch(error => {
      console.error(`ZAPIER Error: ${error.message}`)
    })
}

const jsonToQueryString = json => {
  return Object.keys(json)
    .map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
    })
    .join('&')
}

module.exports = { sendUserInfoToZapier }
