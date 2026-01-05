/**
 * Currency formatting utilities for Nepali Rupees (NPR)
 */

/**
 * Format a number as Nepali Rupees currency
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatNPR = (amount, options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useSymbol = true
  } = options

  if (amount === null || amount === undefined || isNaN(amount)) {
    return useSymbol ? 'NPR 0' : '0'
  }

  try {
    // Use Nepali locale for number formatting
    const formatted = new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(amount)
    
    return formatted
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const numberFormatted = amount.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    })
    
    return useSymbol ? `NPR ${numberFormatted}` : numberFormatted
  }
}

/**
 * Format a price range as Nepali Rupees
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @param {object} options - Formatting options
 * @returns {string} Formatted price range string
 */
export const formatPriceRange = (min, max, options = {}) => {
  const minFormatted = formatNPR(min, options)
  const maxFormatted = formatNPR(max, options)
  
  return `${minFormatted} - ${maxFormatted}`
}

/**
 * Simple NPR symbol prefix formatting
 * @param {number} amount - The amount to format
 * @returns {string} Amount with NPR symbol
 */
export const formatSimpleNPR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'NPR 0'
  }
  
  return `NPR ${amount.toLocaleString()}`
}

export default {
  formatNPR,
  formatPriceRange,
  formatSimpleNPR
}