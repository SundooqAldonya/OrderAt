const mongoose = require('mongoose')
const { Schema } = mongoose

const dispatchOptions = new Schema(
  {
    delayDispatch: {
      type: Number,
      default: 90 // Delay in SECONDS between dispatch cycles (1.5 minutes)
    },
    firstAttemptRiders: {
      type: Number,
      default: 2 // Cycle 1: Top 2 riders
    },
    secondAttemptRiders: {
      type: Number,
      default: 5 // Cycle 2: Top 5 riders
    },
    thirdAttemptRiders: {
      type: Number,
      default: 10 // Cycle 3: Top 10 riders
    }
    // Cycle 4: All remaining riders (handled by code logic)
  },
  { timestamps: true }
)

module.exports = mongoose.model('DispatchOptions', dispatchOptions)
