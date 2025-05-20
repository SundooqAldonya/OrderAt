const normalizeAndValidatePhoneNumber = phoneNum => {
  let phone = phoneNum.replace(' ', '')
  const arabicToEnglishDigits = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9'
  }

  // Convert Arabic to English digits
  let normalized
  if (containsArabicDigits(phone)) {
    normalized = phone.replace(/[٠-٩]/g, d => arabicToEnglishDigits[d])
  } else {
    normalized = phone
  }

  console.log({ normalizedBefore: normalized })
  if (normalized.startsWith('+2001')) {
    console.log({ sliced: normalized.slice(3) })
    normalized = normalized.slice(3) // remove "00", keep "10..."
  }
  // Remove leading "002" or "2" if present
  else if (normalized.startsWith('002')) {
    normalized = normalized.slice(3)
  } else if (normalized.startsWith('+')) {
    normalized = normalized.slice(2)
  } else if (normalized.startsWith('02')) {
    normalized = normalized.slice(2)
  }
  console.log({ normalizedAfter: normalized })

  // Remove non-digit characters (spaces, dashes, parentheses)
  normalized = normalized.replace(/\D/g, '')

  // Check that it's a valid local Egyptian number
  const isValid = /^01\d{9}$/.test(normalized)
  console.log({ normalizedTest: isValid })

  if (isValid) {
    return `+2${normalized}`
  }

  return null // Invalid number
}

function containsArabicDigits(input) {
  return /[٠-٩]/.test(input)
}

module.exports = { normalizeAndValidatePhoneNumber }
