// utils/budget.js

/**
 * Fixed daily rate (in INR)
 * @constant
 */
const DAILY_RATE = 27000;

/**
 * Calculates total trip budget based on duration only
 * @param {Array} itinerary - Array of trip items with duration
 * @returns {number} - Total budget in INR
 */
export const calculateTotalBudget = (itinerary) => {
  if (!Array.isArray(itinerary)) return 0;
  
  const totalDays = itinerary.reduce((sum, item) => {
    const days = item?.tripDetails?.duration;
    return sum + (Number.isInteger(days) ? days : 0);
  }, 0);

  return totalDays * DAILY_RATE;
};

/**
 * Formats currency for display
 * @param {number} amount - Amount in INR
 * @returns {string} - Formatted currency string
 */
export const formatBudget = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Optional: For testing/config access
export const _config = {
  DAILY_RATE
};