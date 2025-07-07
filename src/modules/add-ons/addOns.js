import { setAddOns, getAddOns, getBuilderPhase } from '../../utils/state.js';
import { getItinerary, getFlightPreferences } from '../../utils/state.js';
import { calculateTotalBudget } from '../../utils/budget.js';
import { saveTripToSheety, getTripsFromSheety } from './sheety.js';

// Add-ons configuration
const ADDONS_CONFIG = [
  {id: 'travel-insurance', label: 'Comprehensive Travel Insurance'},
  { id: 'visa', label: 'Visa Assistance' },
  { id: 'forex', label: 'Foreign Exchange' },
  { id: 'concierge', label: 'Concierge Service' },
  { id: 'local-guide', label: 'Local Guide' },
  { id: 'elderly', label: 'Elderly Assistance' },
  { id: 'medical', label: 'Medical Assistance' },
  { id: 'financing', label: 'Easy Financing' },
  {id: 'local-transport', label: 'Local Transport' },
];

// Form rendering
export const renderAddOnsForm = () => {
  const savedAddOns = getAddOns();
  
  // Only remove the continue button if we're in the add-ons phase
  const currentPhase = getBuilderPhase();
  if (currentPhase === 'addons') {
    document.querySelector('#submit-complete-trip')?.remove();
  }
  
  return `
    <div class="addons-form-container">
      <h2>Select Add-Ons (Optional)</h2>
      <form id="addons-form" class="addons-form">
        <div class="addons-grid">
          ${ADDONS_CONFIG.map(addon => `
            <label class="addon-option">
              <input type="checkbox" 
                     name="addon" 
                     value="${addon.id}"
                     ${savedAddOns[addon.id] ? 'checked' : ''}>
              <div class="addon-card">
                <h4>${addon.label}</h4>
              </div>
            </label>
          `).join('')}
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" id="continue-summary">
            Continue to Summary
          </button>
        </div>
      </form>
    </div>
  `;
};

// Form setup

export const setupAddOnsForm = () => {
  const form = document.getElementById('addons-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const selectedAddOns = {};
    
    // Convert to boolean map
    ADDONS_CONFIG.forEach(addon => {
      selectedAddOns[addon.id] = formData.getAll('addon').includes(addon.id);
    });

    setAddOns(selectedAddOns);
    
    // Show final completion
    showFinalCompletion();
  });
};

const showFinalCompletion = () => {
  // First show trip summary
  const tripData = {
    destinations: getItinerary(),
    flights: getFlightPreferences(),
    addOns: getAddOns(),
    summary: {
      totalDays: getItinerary().reduce((sum, item) => sum + item.tripDetails.duration, 0),
      estimatedCost: calculateTotalBudget(getItinerary())
    }
  };

  // Build trip summary HTML
  const tripSummaryHtml = `
    <div class="trip-summary">
      <div class="summary-section">
        <h3>Trip Overview</h3>
        <p><strong>Destinations:</strong> ${tripData.destinations.length}</p>
        <p><strong>Total Duration:</strong> ${tripData.summary.totalDays} days</p>
        <p><strong>Estimated Cost:</strong> ₹${tripData.summary.estimatedCost.toLocaleString('en-IN')}</p>
      </div>
    </div>
  `;

  // Show trip summary first
  Swal.fire({
    title: 'Trip Summary',
    html: tripSummaryHtml,
    customClass: {
      popup: 'trip-summary-modal',
      title: 'trip-summary-title',
      confirmButton: 'trip-summary-confirm',
      cancelButton: 'trip-summary-cancel',
      closeButton: 'swal2-close-hide'  // Hide close button
    },
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: 'Continue to Customer Details',
    cancelButtonText: 'Cancel',
    showCloseButton: false,  // Explicitly hide close button
    allowOutsideClick: false,  // Prevent closing by clicking outside
    allowEscapeKey: false,    // Prevent closing with ESC key
    backdrop: 'static'        // Prevent closing when clicking backdrop
  }).then((result) => {
    if (result.isConfirmed) {
      // Show customer details form
      Swal.fire({
        title: 'Customer Details',
        html: `
          <form id="customer-details-form" class="customer-details-form">
            <div class="form-group">
              <label for="customer-name">Full Name</label>
              <input type="text" id="customer-name" name="name" required 
                     placeholder="John Doe" minlength="2" maxlength="50">
            </div>
            <div class="form-group">
              <label for="customer-email">Email Address</label>
              <input type="email" id="customer-email" name="email" required
                     placeholder="john@example.com">
            </div>
            <div class="form-group">
              <label for="customer-phone">Phone Number</label>
              <input type="tel" id="customer-phone" name="phone" required
                     placeholder="+91 98765 43210" pattern="[0-9+\-\s]+">
            </div>
          </form>
        `,
        customClass: {
          popup: 'customer-details-modal',
          title: 'customer-details-title',
          confirmButton: 'customer-details-confirm',
          cancelButton: 'customer-details-cancel',
          closeButton: 'swal2-close-hide'  // Hide close button
        },
        showCloseButton: false,  // Explicitly hide close button
        allowOutsideClick: false,  // Prevent closing by clicking outside
        allowEscapeKey: false,    // Prevent closing with ESC key
        backdrop: 'static',       // Prevent closing when clicking backdrop
        showCancelButton: true,
        confirmButtonText: 'Submit Trip',
        cancelButtonText: 'Cancel',
        preConfirm: async () => {
          const form = Swal.getPopup().querySelector('#customer-details-form');
          const submitBtn = Swal.getConfirmButton();
          
          // Show loading state
          submitBtn.disabled = true;
          submitBtn.innerHTML = `Submitting <span class="loading-spinner"></span>`;
          
          try {
            const customerData = {
              name: form.name.value,
              email: form.email.value,
              phone: form.phone.value
            };

            await saveTripToSheety(tripData, customerData);
            const recentTrips = await getTripsFromSheety({
              'customer-email': customerData.email,
              '_sort': 'timestamp',
              '_order': 'desc',
              '_limit': 3
            });
            
            return {
              customer: customerData,
              recentTrips: recentTrips
            };
          } catch (error) {
            Swal.showValidationMessage(`Save failed: ${error.message}`);
            return false;
          } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Trip';
          }
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const tripCount = result.value.recentTrips?.length || 1;
          
          Swal.fire({
            title: 'Success!',
            html: `
              <div class="booking-success">
                <p>Your trip has been sent to travel desk successfully.</p>
              </div>
            `,
            icon: 'success',
            customClass: {
              popup: 'success-modal',
              title: 'success-title',
              confirmButton: 'success-confirm',
              icon: 'success-icon',
              closeButton: 'swal2-close-hide'
            },
            confirmButtonText: 'Great!',
            buttonsStyling: false,
            showConfirmButton: true,
            showCloseButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            backdrop: 'static',
            willClose: () => {
              document.dispatchEvent(new CustomEvent('bookingComplete', {
                detail: result.value
              }));
              window.top.location.href = 'https://bonhomieeodyssey.zohocreatorportal.in/#Page:Custom_Packages';
            }
          });
        }
      });
    }
  });
};


// Final options (to be called after add-ons submission)
export const renderFinalOptions = () => {
  return `
    <div class="final-options">
      <h2>Your Itinerary is Ready!</h2>
      <div class="option-buttons">
        <button id="send-to-desk" class="btn-secondary">
          <i class="fas fa-envelope"></i> Send to Travel Desk
        </button>
        <button id="view-itinerary" class="btn-primary">
          <i class="fas fa-file-alt"></i> View Full Itinerary
        </button>
      </div>
    </div>
  `;
};

// Final options setup
export const setupFinalOptions = () => {
  document.getElementById('send-to-desk')?.addEventListener('click', () => {
    console.log('Sending to travel desk:', {
      ...getItinerary(),
      ...getFlightPreferences(),
      ...getAddOns()
    });
  });

  document.getElementById('view-itinerary')?.addEventListener('click', () => {
    // Implement itinerary viewer
  });
};