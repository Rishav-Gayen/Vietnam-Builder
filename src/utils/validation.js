// utils/validation.js

export const validateDuration = (days) => {
  const num = parseInt(days);
  const isValid = !isNaN(num) && num >= 1 && num <= 14;
  return {
    isValid,
    message: isValid ? '' : 'Duration must be between 1-14 days'
  };
};

export const validateActivities = (activities) => {
  const isValid = Array.isArray(activities) && activities.length > 0;
  return {
    isValid,
    message: isValid ? '' : 'Select at least one activity'
  };
};

export const validateAccommodation = (accommodation, options) => {
  const isValid = options.includes(accommodation);
  return {
    isValid,
    message: isValid ? '' : 'Invalid accommodation selected'
  };
};