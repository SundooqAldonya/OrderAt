export function withTimeout(promise, ms = 4000) {
  let timeoutId
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('timeout')), ms)
  })

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  )
}
