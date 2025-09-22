const mongoose = require('mongoose')
const { Schema } = mongoose

const dispatchOptions = new Schema(
  {
    delayDispatch: {
      type: Number,
      default: 30000
    },
    firstAttemptRiders: {
      type: Number,
      default: 1
    },
    secondAttemptRiders: {
      type: Number,
      default: 10
    },
    thirdAttemptRiders: {
      type: Number,
      default: 2
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('DispatchOptions', dispatchOptions)
