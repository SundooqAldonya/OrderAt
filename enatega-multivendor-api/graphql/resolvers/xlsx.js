const XLSX = require('xlsx')
const fs = require('fs')
const { GraphqlUpload } = require('graphql-upload')
const dateScalar = require('../../helpers/dateScalar')
const path = require('path')
const uploadsDir = path.join(__dirname, 'uploads')
const Category = require('../../models/category')
const Food = require('../../models/food')
const Variation = require('../../models/variation')
const Addon = require('../../models/addon')
const Option = require('../../models/option')

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
        const categoriesSheet = XLSX.utils.sheet_to_json(
          workbook.Sheets['Categories'],
          { defval: '' }
        )
        const menuItemsSheet = XLSX.utils.sheet_to_json(
          workbook.Sheets['MenuItems'],
          { defval: '' }
        )
        const addonsSheet = XLSX.utils.sheet_to_json(
          workbook.Sheets['Addons'],
          { defval: '' }
        )

        const categoryMap = {}
        for (const row of categoriesSheet) {
          const title = row['Category Name'].trim()
          let category = await Category.findOne({
            title,
            restaurant: restaurantId
          })
          if (!category) {
            category = await Category.create({
              title,
              restaurant: restaurantId
            })
          }
          categoryMap[title] = category._id
        }

        const foodMap = {}
        const variationMap = {}
        for (const row of menuItemsSheet) {
          const itemName = row['Item Name'].trim()
          const variationName = row['Variation Name'].trim()
          const section = row['Category (Section)'].trim()
          const price = parseFloat(row['Price'])
          const addons =
            row['Addon Group Names']
              ?.split(',')
              .map(a => a.trim())
              .filter(Boolean) || []

          let food = foodMap[itemName]
          if (!food) {
            food = await Food.create({
              title: itemName,
              category: categoryMap[section],
              restaurant: restaurantId,
              isActive: true
            })
            foodMap[itemName] = food
          }

          const variation = await Variation.create({
            title: variationName,
            price,
            food: food._id
          })
          variationMap[variation.title] = variation

          await Food.findByIdAndUpdate(food._id, {
            $addToSet: { variations: variation._id }
          })
        }

        const addonGroupMap = {}
        for (const row of addonsSheet) {
          const groupName = row['Addon Group Name'].trim()
          const optionName = row['Addon Name'].trim()
          const appliesTo = row['Applies To Variations']
            .split(',')
            .map(v => v.trim())
          const price = parseFloat(row['Price'])

          if (!addonGroupMap[groupName]) {
            addonGroupMap[groupName] = await Addon.create({
              title: groupName,
              restaurant: restaurantId,
              quantityMinimum: 0,
              quantityMaximum: parseInt(row['Max Allowed']) || 5
            })
          }

          const option = await Option.findOneAndUpdate(
            { title: optionName, restaurant: restaurantId },
            { title: optionName, price, restaurant: restaurantId },
            { upsert: true, new: true }
          )

          await Addon.findByIdAndUpdate(addonGroupMap[groupName]._id, {
            $addToSet: { options: option._id }
          })

          for (const variationTitle of appliesTo) {
            const variation = variationMap[variationTitle]
            if (variation) {
              await Variation.findByIdAndUpdate(variation._id, {
                $addToSet: { addons: addonGroupMap[groupName]._id }
              })
              await Addon.findByIdAndUpdate(addonGroupMap[groupName]._id, {
                variation: variation._id
              })
            }
          }
        }

        // Clean up temp file
        fs.unlinkSync(tempPath)
        return { message: 'uploaded_file_successfully!' }
      } catch (err) {
        throw err
      }
    }
  }
}
