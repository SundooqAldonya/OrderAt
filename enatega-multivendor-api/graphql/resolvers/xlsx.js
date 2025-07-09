const XLSX = require('xlsx')
const fs = require('fs')
const { GraphqlUpload } = require('graphql-upload')
const dateScalar = require('../../helpers/dateScalar')
const path = require('path')
const uploadsDir = path.join(__dirname, 'uploads')
const Category = require('../../models/category')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir) // ✅ Create 'uploads' if missing
}

module.exports = {
  Upload: GraphqlUpload,
  Date: dateScalar,
  Query: {},
  Mutation: {
    async createBusinessMenu(_, { file, restaurantId }) {
      console.log('createBusinessMenu', { file })
      try {
        const { createReadStream, filename } = await file.file
        const tempPath = path.join(__dirname, 'uploads', filename)
        const stream = createReadStream()

        // Save file temporarily
        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(tempPath)
          stream.pipe(writeStream).on('finish', resolve).on('error', reject)
        })

        // Read Excel file
        const workbook = XLSX.readFile(tempPath)
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName]
          const rows = XLSX.utils.sheet_to_json(sheet)
          console.log(`📄 Sheet: ${sheetName}`)
          console.log({ rows })
          if (sheetName === 'Categories') {
            rows.forEach(async item => {
              const categories = await Category.create({
                title: item['Category Name'],
                restaurant: restaurantId
              })
              console.log({ categories })
            })
          }
          if (sheetName === 'MenuItems') {
            // rows.forEach(async item => {
            // 	const food
            // })
          }
        })

        // Clean up temp file
        fs.unlinkSync(tempPath)
        return { message: 'uploaded_file_successfully!' }
      } catch (err) {
        throw err
      }
    }
  }
}
