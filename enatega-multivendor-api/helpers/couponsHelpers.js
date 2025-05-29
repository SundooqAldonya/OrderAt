const Food = require('../models/food')

const objectIdToStringList = (ids = []) => ids.map(id => id.toString())

const isInTarget = (targetList = [], value) => {
  return (
    targetList.length === 0 || targetList.map(String).includes(String(value))
  )
}

const intersectsWithTarget = (targetList = [], inputList = []) => {
  if (targetList.length === 0) return true
  const targetStr = objectIdToStringList(targetList)
  return inputList.some(id => targetStr.includes(String(id)))
}

const categoryIdsFromItems = async itemIds => {
  const foodItems = await Food.find({ _id: { $in: itemIds } }).select(
    'category'
  )
  const categoryIds = [
    ...new Set(foodItems.map(f => f.category?.toString()).filter(Boolean))
  ]

  return categoryIds
}

module.exports = {
  objectIdToStringList,
  isInTarget,
  intersectsWithTarget,
  categoryIdsFromItems
}
