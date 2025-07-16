import { getItinerary, removeFromItinerary, getFlightPreferences } from '../../utils/state.js';
import { calculateTotalBudget } from '../../utils/budget.js';
import { showDestinationAdded } from '../../ui/feedback.js';
import { renderFlightForm, setupFlightForm } from '../flights/flightForm.js';
import { renderAddOnsForm, setupAddOnsForm } from '../add-ons/addOns.js';

// Function to format itinerary data in a beautiful way
const formatItinerary = (itinerary, flightPrefs, customerData) => {
  const formatDuration = (days) => {
    return days === 1 ? `${days} day` : `${days} days`;
  };

  const formatActivities = (activities) => {
    if (!activities || activities.length === 0) return 'No activities selected';
    return activities.join(', ').replace(/,([^,]*)$/,' and$1');
  };

  const formatAccommodation = (type) => {
    const types = {
      'budget': 'Budget Accommodation',
      'standard': 'Standard Hotel',
      'luxury': 'Luxury Resort',
      'private-villa': 'Private Villa'
    };
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDietary = (preferences) => {
    if (!preferences || preferences.length === 0) return 'No dietary restrictions';
    return preferences.join(', ').replace(/,([^,]*)$/,' and$1');
  };

  // Create a beautiful string representation
  let itineraryString = `
  =======================================
  🌟 GREECE DREAM HOLIDAY ITINERARY 🌟
  =======================================
  
  📅 TRAVEL DETAILS
  -----------------
  ✈️ Departure from: ${flightPrefs.departureCity}
  📅 Travel Date: ${flightPrefs.departureDate}
  ⏰ Preferred Time: ${formatFlightTime(flightPrefs.departureTime)}
  🛫 Travel Class: ${formatTravelClass(flightPrefs.travelClass)}
  
  🍽️ Dietary Preferences:
  ${formatDietary(flightPrefs.dietaryPreferences)}

  
  🌍 DESTINATION DETAILS
  ---------------------
  `;

  itinerary.forEach((destination, index) => {
    itineraryString += `
  ${index + 1}. ${destination.destination.name}
     ⏳ Duration: ${formatDuration(destination.tripDetails.duration)}
     🏨 Accommodation: ${formatAccommodation(destination.tripDetails.accommodation)}
     🎯 Activities:
     ${destination.tripDetails.activities.map(a => `     • ${a}`).join('\n')}
  `;
  });

  itineraryString += `
  
  💰 BUDGET SUMMARY
  -----------------
  ${renderBudgetSummary(itinerary)}

  
  📞 CUSTOMER DETAILS
  ------------------
  🙋 Name: ${customerData.name}
  📧 Email: ${customerData.email}
  ☎️ Phone: ${customerData.phone}

  =======================================
  `;

  return itineraryString;
};

// DOM Targets
const summaryContent = document.querySelector('.summary-content');
const budgetSummary = document.getElementById('budget-summary');
const DAILY_RATE = 27000;

// Helper functions
const generateActivityList = (activities) => `
  <ul>
    ${activities.slice(0, 3).map(act => `<li>${act}</li>`).join('')}
    ${activities.length > 3 ? 
      `<li class="more-activities">+${activities.length - 3} more</li>` : ''}
  </ul>
`;

const generateSummaryCard = (item, index) => {
  // Check if we're past the initial destination selection phase
  const isInitialDestinationPhase = !getFlightPreferences().departureCity && 
                                  document.querySelector('.destinations-grid');

  return `
    <div class="summary-card" data-index="${index}">
      <div class="summary-card__header">
        <h3>${item.destination.name}</h3>
        <span>${item.tripDetails.duration} days</span>
      </div>
      <div class="summary-card__content">
        <div class="summary-card__activities">
          <h4>Activities (${item.tripDetails.activities.length})</h4>
          ${generateActivityList(item.tripDetails.activities)}
        </div>
        <div class="summary-card__accommodation">
          <span>${item.tripDetails.accommodation.replace(/-/g, ' ')}</span>
        </div>
      </div>

      <!-- Always show info button -->
<div class="summary-card__actions">
  <button class="summary-card__info" data-index="${index}">
    <i class="fa-solid fa-info"></i>
  </button>

  ${isInitialDestinationPhase ? `
    <!-- Show delete button ONLY in initial destination selection -->
    <button class="summary-card__remove" data-index="${index}">
      <i class="fa-solid fa-trash"></i>
    </button>
  ` : ''}
</div>
</div>
  `;
};

const renderBudgetSummary = (itinerary) => {
  if (!itinerary.length) {
    budgetSummary.style.display = 'none';
    return;
  }

  const totalBudget = calculateTotalBudget(itinerary);
  const totalDays = itinerary.reduce((sum, item) => sum + item.tripDetails.duration, 0);

  budgetSummary.innerHTML = `
    <h3>Budget Estimate (including flights)</h3>
    <p><strong>Total Days:</strong> ${totalDays}</p>
    <p><strong>Estimated Cost:</strong> ₹${totalBudget.toLocaleString('en-IN')}</p>
  `;
  budgetSummary.style.display = 'block';
};

const setupRemoveHandlers = () => {
  document.querySelectorAll('.summary-card__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      removeFromItinerary(index);
      updateItinerarySummary();
    });
  });
};

const formatFlightTime = (time) => {
  const timeMap = {
    morning: 'Morning (4:00am - 11:00am)',
    afternoon: 'Afternoon (11:00am - 4:00pm)',
    evening: 'Evening (4:00pm - 9:00pm)',
    night: 'Night (9:00pm - 4:00am)'
  };
  return timeMap[time] || time;
};

const formatTravelClass = (cls) => {
  const classMap = {
    economy: 'Economy',
    'premium-economy': 'Premium Economy',
    business: 'Business Class',
    first: 'First Class'
  };
  return classMap[cls] || cls;
};

// Smooth scroll helper function
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

const handleItinerarySubmit = () => {
  const itinerary = getItinerary();
  const flightPrefs = getFlightPreferences();
  
  if (!itinerary || itinerary.length === 0) {
    showAlert('Please add at least one destination');
    return;
  }

  // Format and log the beautiful itinerary
  console.log(formatItinerary(itinerary, flightPrefs, {
    name: 'John Doe', // Replace with actual customer data
    email: 'john@example.com',
    phone: '+1 234 567 890'
  }));

  showDestinationAdded(itinerary[0]);
  document.getElementById('destinations-selection').innerHTML = renderFlightForm();
  setupFlightForm();
  updateItinerarySummary();
  scrollToTop(); // Scroll to top after form update
};

const handleCompleteTripSubmit = () => {
  // Just transition to add-ons, don't show completion alert yet
  document.getElementById('itinerary-form').innerHTML = renderAddOnsForm();
  setupAddOnsForm();
  scrollToTop(); // Scroll to top after form update
};

const setupCardInteractions = () => {
  // Delete button - only in initial phase
  document.querySelectorAll('.summary-card__remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.dataset.index);
      removeFromItinerary(index);
    });
  });

  // Info button - all other phases
  document.querySelectorAll('.summary-card__info').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const index = parseInt(btn.dataset.index);
      const destination = getItinerary()[index];
      
      // Create modal content
      const modalContent = `
        <div class="destination-details">
          <p><strong>Duration:</strong> ${destination.tripDetails.duration} days</p>
          <p><strong>Accommodation:</strong> ${destination.tripDetails.accommodation}</p>
          <div class="full-activities">
            <h4>All Activities (${destination.tripDetails.activities.length}):</h4>
            <ul>
              ${destination.tripDetails.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;
      
      // Show the modal
      await Swal.fire({
        title: `${destination.destination.name} Details`,
        html: modalContent,
        showConfirmButton: true,
        confirmButtonText: 'Ok',
        customClass: {
          popup: 'destination-details-modal',
          title: 'destination-details-title',
          confirmButton: 'destination-details-confirm'
        },
        showCloseButton: false,
        allowOutsideClick: true,
        allowEscapeKey: true,
        buttonsStyling: false,
        didOpen: (modal) => {
          // Ensure the modal is properly initialized
          const confirmBtn = modal.querySelector('.swal2-confirm');
          if (confirmBtn) {
            confirmBtn.onclick = () => Swal.close();
          }
        }
      });
    });
  });
};


const getCurrentStage = () => {
  if (document.getElementById('addons-form')) return 'addons';
  if (getFlightPreferences().departureCity) return 'flights-complete';
  return 'destinations';
};

export function updateItinerarySummary() {
  const itinerary = getItinerary();
  const flightPrefs = getFlightPreferences();

  // Empty State
  if (!itinerary.length) {
    summaryContent.innerHTML = '<p class="empty-message">Select destinations to begin</p>';
    budgetSummary.style.display = 'none';
    return;
  }

  // Generate Content

  // Add Event Listeners
  
  // Update Budget
  

  summaryContent.innerHTML = `
    ${itinerary.map((item, index) => generateSummaryCard(item, index)).join('')}

    <!-- Flight Summary Section -->
    ${flightPrefs.departureCity ? `
      <div class="flight-summary">
        <h3><i class="fas fa-plane"></i> Flight Details</h3>
        <div class="flight-details">
          <p><strong>From:</strong> ${flightPrefs.departureCity}</p>
          <p><strong>Date:</strong> ${flightPrefs.departureDate}</p>
          <p><strong>Time:</strong> ${formatFlightTime(flightPrefs.departureTime)}</p>
          <p><strong>Class:</strong> ${formatTravelClass(flightPrefs.travelClass)}</p>
          ${flightPrefs.dietaryPreferences?.length ? `
            <p><strong>Dietary Needs:</strong>
              <div class="dietary-tags">
                ${flightPrefs.dietaryPreferences.map(pref => 
                  `<span class="dietary-tag">${pref}</span>`
                ).join('')}
              </div>
            </p>` : ''}
        </div>
      </div>
    ` : ''}

    <div class="summary-actions">
      ${getCurrentStage() === 'destinations' ? `
        <button id="submit-itinerary" class="btn-primary">
          Submit & Next
        </button>
      ` : getCurrentStage() === 'flights-complete' ? `
        <button id="submit-complete-trip" class="btn-primary">
          Continue to Add-ons
        </button>
      ` : ''}
    </div>
  `;

  setupCardInteractions();
  renderBudgetSummary(itinerary);

  setupRemoveHandlers();
  document.getElementById('submit-itinerary')?.addEventListener('click', handleItinerarySubmit);
  document.getElementById('submit-complete-trip')?.addEventListener('click', handleCompleteTripSubmit);

}

document.addEventListener('itineraryUpdated', updateItinerarySummary);