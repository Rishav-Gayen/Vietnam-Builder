import { saveFlightPreferences, getFlightPreferences } from '../../utils/state.js';
import { updateItinerarySummary } from '../builder/summary.js';
import { renderAddOnsForm, setupAddOnsForm } from '../add-ons/addOns.js';

// Helper functions
const formatTimeWindow = (time) => {
  const times = {
    morning: 'Morning (4:00am - 11:00am)',
    afternoon: 'Afternoon (11:00am - 4:00pm)',
    evening: 'Evening (4:00pm - 9:00pm)',
    night: 'Night (9:00pm - 4:00am)'
  };
  return times[time] || time;
};

const formatTravelClass = (cls) => {
  const classes = {
    economy: 'Economy',
    'premium-economy': 'Premium Economy',
    business: 'Business Class',
    first: 'First Class'
  };
  return classes[cls] || cls;
};

// Form Rendering
export const renderFlightForm = () => {
  const flightPrefs = getFlightPreferences();
  
  return `
    <h2>Flight Preferences</h2>
    <form id="flight-preferences-form" class="flight-form">
      <div class="form-group">
        <label for="departure-city">City of Departure</label>
        <input type="text" id="departure-city" 
               value="${flightPrefs.departureCity || ''}" required>
      </div>

      <div class="form-group">
        <label for="departure-date">Preferred Date</label>
        <input type="date" id="departure-date" 
               value="${flightPrefs.departureDate || ''}" required>
      </div>

      <div class="form-group">
        <label>Preferred Time</label>
        <div class="radio-group">
          ${['morning', 'afternoon', 'evening', 'night'].map(time => `
            <label>
              <input type="radio" name="departure-time" 
                     value="${time}" 
                     ${flightPrefs.departureTime === time ? 'checked' : ''}
                     required>
              ${formatTimeWindow(time)}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label for="travel-class">Class of Travel</label>
        <select id="travel-class" required>
          <option value="">Select Class</option>
          ${['economy', 'premium-economy', 'business', 'first'].map(cls => `
            <option value="${cls}" 
                    ${flightPrefs.travelClass === cls ? 'selected' : ''}>
              ${formatTravelClass(cls)}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Dietary Preferences</label>
        <div class="checkbox-group">
          ${['Vegetarian', 'Non Vegetarian', 'No Preferences'].map(pref => `
            <label>
              <input type="checkbox" name="dietary-prefs" 
                     value="${pref}"
                     ${(flightPrefs.dietaryPreferences || []).includes(pref) ? 'checked' : ''}>
              ${pref.charAt(0).toUpperCase() + pref.slice(1).replace('-', ' ')}
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="save-flight-prefs-btn">
          <i class="fas fa-save"></i> Save Flight Preferences
        </button>
      </div>
    </form>
  `;
};

// Form Handling
export const setupFlightForm = () => {
  const form = document.getElementById('flight-preferences-form');
  if (!form) return;

  // Initialize date picker with min date set to today
  const departureDateInput = form.querySelector('#departure-date');
  if (departureDateInput) {
    const today = new Date().toISOString().split('T')[0];
    departureDateInput.setAttribute('min', today);
  }

  // Set up single-select behavior for dietary preferences
  const dietaryCheckboxes = form.querySelectorAll('input[name="dietary-prefs"]');
  dietaryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        // Uncheck all other dietary preference checkboxes
        dietaryCheckboxes.forEach(otherCheckbox => {
          if (otherCheckbox !== e.target) {
            otherCheckbox.checked = false;
          }
        });
      }
    });
  });

  const getFormData = () => {
    return {
      departureCity: form.querySelector('#departure-city').value.trim(),
      departureDate: form.querySelector('#departure-date').value,
      departureTime: form.querySelector('input[name="departure-time"]:checked')?.value,
      travelClass: form.querySelector('#travel-class').value,
      dietaryPreferences: Array.from(
        form.querySelectorAll('input[name="dietary-prefs"]:checked')
      ).map(el => el.value)
    };
  };

  const validateForm = (formData) => {
    const errors = [];
    if (!formData.departureCity) errors.push('Please enter a departure city');
    if (!formData.departureDate) errors.push('Please select a departure date');
    else {
      const selectedDate = new Date(formData.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (selectedDate < today) {
        errors.push('Departure date cannot be in the past');
      }
    }
    if (!formData.departureTime) errors.push('Please select a preferred time window');
    if (!formData.travelClass) errors.push('Please select a travel class');
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData();
    const errors = validateForm(formData);
    
    if (errors.length > 0) {
      Swal.fire({
        title: 'Invalid Form Data',
        html: `Please correct the following:<br><br>• ${errors.join('<br>• ')}`,
        icon: 'error',
        confirmButtonText: 'Got it!',
        confirmButtonColor: '#00afef'
      });
      return;
    }
    
    try {
      await saveFlightPreferences(formData);
      updateItinerarySummary();
      showSaveConfirmation();
    } catch (error) {
      console.error('Error saving flight preferences:', error);
      Swal.fire({
        title: 'Error',
        text: 'There was an error saving your preferences. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#00afef'
      });
    }
  };

  form.addEventListener('submit', handleFormSubmit);
  form.addEventListener('change', debounce(() => {
    const formData = getFormData();
    // Only auto-save if date is valid
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!formData.departureDate || new Date(formData.departureDate) >= today) {
      saveFlightPreferences(formData);
    }
  }, 300));
};
// Temporary add-ons placeholder until you create the actual module

// Save Confirmation
const showSaveConfirmation = () => {
  const confirmation = document.createElement('div');
  confirmation.className = 'save-confirmation';
  confirmation.innerHTML = `
    <i class="fas fa-check-circle"></i> Flight preferences saved!
  `;
  
  const formActions = document.querySelector('.form-actions');
  if (formActions) {
    formActions.appendChild(confirmation);
    setTimeout(() => confirmation.remove(), 2000);
  }
};

// Debounce Helper
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};