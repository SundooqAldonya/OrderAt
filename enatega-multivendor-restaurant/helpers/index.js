export const detectLanguageDir = lang => {
  let dir = 'ltr'
  if (lang === 'ar') {
    dir = 'rtl'
  }
  return dir
}
