exports.dateToString = date =>
  date ? new Date(date).toISOString() : new Date().toISOString()
