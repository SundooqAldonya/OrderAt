const express = require('express')
const path = require('path')

const app = express()
const port = process.env.PORT || 3000

// Serve static files from the build folder
app.use(express.static(path.join(__dirname, 'build')))

// Serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(port, () => {
  console.log(`React app is running on port ${port}`)
})
