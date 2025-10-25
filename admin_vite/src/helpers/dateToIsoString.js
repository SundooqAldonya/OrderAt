export const dateToString = date => {
  return date ? new Date(date).toISOString() : new Date().toISOString()
}
