import { addToItinerary } from '../../utils/state.js'; // For state management
import { showDestinationAdded } from '../../ui/feedback.js'; // Assume we'll create this later

const validateDuration = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num >= 1 && num <= 14;
};

const validateActivities = (activities) => {
  return activities.length > 0;
};

const generateActivitiesHTML = (activities) => 
  `<div class="activities-grid">
    ${activities.map(activity => `
      <div class="activity-card" data-id="${activity.id}">
        <img src="${activity.imageUrl}" 
             alt="${activity.name}" 
             class="activity-image">
        <div class="activity-name">${activity.name}</div>
        <button class="select-btn" data-selected="${activity.selected ? 'true' : 'false'}">
          ${activity.selected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    `).join('')}
  </div>`;

const generateAccommodationHTML = (options) => 
  options.map(option => `
    <option value="${option.toLowerCase().replace(/\s+/g, '-')}">
      ${option}
    </option>
  `).join('');


const getModalConfig = (destination, activitiesHTML, accommodationHTML) => ({
  html: `
    <div class="modal">
      <div class="modal__header">
        <h3>${destination.name} - Local Experiences</h3>
      </div>
      
      <!-- Duration Section -->
      <div class="modal__section days">
        <h4>Duration (in days)</h4>
        <input type="number" id="duration" min="3" max="5" value="3" required>
      </div>
      
      <!-- Activities Section -->
      <div class="modal__section">
        <h4>Activities</h4>
        <div class="modal__checkbox-group">
          ${activitiesHTML}
        </div>
      </div>
      
      <!-- Accommodation Section -->
      <div class="modal__section">
        <h4>Accommodation</h4>
        <select id="accommodation">
          ${accommodationHTML}
        </select>
      </div>


      <div class="modal__actions">
        <button type="button" id="save-modal" class="modal__submit-btn">
          Add Destination
        </button>
      </div>
    </div>
  `,
  width: '1000px',
  showConfirmButton: false,
  showCloseButton: true,
  didOpen: (modalInstance) => {
    setupModalHandlers(modalInstance, destination);
  
    // Remove any anchor wrappers from activity images
    modalInstance.querySelectorAll('.activity-image').forEach(img => {
      const wrapper = img.closest('a[data-gallery="activities"]');
      if (wrapper) {
        wrapper.parentNode.insertBefore(img, wrapper);
        wrapper.remove();
      }
      // Add click handler for custom zoom
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        e.stopPropagation();
        showCustomZoom(img.src, img.alt);
      });
    });

    // Custom zoom overlay logic
    function showCustomZoom(src, alt) {
      // Remove any existing overlay
      document.querySelectorAll('.custom-zoom-overlay').forEach(el => el.remove());
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'custom-zoom-overlay';
      overlay.tabIndex = 0;
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.innerHTML = `
        <div class="custom-zoom-inner">
          <img src="${src}" alt="${alt || ''}" class="custom-zoom-img" />
          <button class="custom-zoom-close" aria-label="Close zoomed image">&times;</button>
        </div>
      `;
      document.body.appendChild(overlay);
      // Focus for accessibility
      overlay.focus();
      // Close on overlay or close button click
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.classList.contains('custom-zoom-close')) {
          overlay.remove();
        }
      });
      // Close on Escape key
      overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.remove();
      });
    }
  },
});


// Function to handle activity selection
const handleActivitySelection = (modalInstance, destination) => {
  const activityCards = modalInstance.querySelectorAll('.activity-card');

  activityCards.forEach(card => {
    const activityId = card.dataset.id;
    const activity = destination.activities.find(a => a.id === activityId);

    // Only handle selection on select button
    const selectBtn = card.querySelector('.select-btn');
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling to card or image
      activity.selected = !activity.selected;
      updateActivityUI(card, activity);
    });
  });
};

const updateActivityUI = (card, activity) => {
  // Update button
  const selectBtn = card.querySelector('.select-btn');
  selectBtn.dataset.selected = activity.selected;
  selectBtn.textContent = activity.selected ? '✓ Selected' : 'Select';
  
  // Apply selected class
  card.classList.toggle('selected', activity.selected);
};

const setupModalHandlers = (modalInstance, destination) => {
  // Handle activity selection
  handleActivitySelection(modalInstance, destination);

  // Save Handler
  modalInstance.querySelector('#save-modal')?.addEventListener('click', () => {
    const duration = modalInstance.querySelector('#duration').value;
    const activities = destination.activities
      .filter(activity => activity.selected)
      .map(activity => activity.name);
    const accommodation = modalInstance.querySelector('#accommodation').value;

    if (!validateDuration(duration)) {
      // Show error (would extract to feedback.js)
      return;
    }

    if (!validateActivities(activities)) {
      Swal.showValidationMessage('Select at least one activity');
      return;
    }

    // Build payload
    const tripData = {
      destination: {
        id: destination.id,
        name: destination.name
      },
      tripDetails: {
        duration: parseInt(duration),
        accommodation,
        activities
      }
    };

    // Update state
    addToItinerary(tripData);
    document.dispatchEvent(new CustomEvent('itineraryUpdated'));  // Add this line
    // Close modal
    Swal.close();
  });

  // Real-time Validation
  modalInstance.querySelector('#duration')?.addEventListener('input', (e) => {
    if (!validateDuration(e.target.value)) {
      e.target.classList.add('error');
    } else {
      e.target.classList.remove('error');
    }
  });
};


export const openDestinationModal = (destination) => {
  // Generate modal content
  const activitiesHTML = generateActivitiesHTML(destination.activities);
  const accommodationHTML = generateAccommodationHTML(destination.accommodationOptions);
  
  // Create modal
  const modalPromise = Swal.fire(getModalConfig(destination, activitiesHTML, accommodationHTML));
  
  // Handlers are now set up in the didOpen callback of the modal config.
  
  // Handle save result
  return modalPromise.then((result) => {
    if (result.isConfirmed) {
      // Show customer details form
      Swal.fire({
        title: 'Customer Details',
        html: `
          <form id="customer-details-form">
            <div class="form-group">
              <label for="customer-name">Name:</label>
              <input type="text" id="customer-name" name="name" required>
            </div>
            <div class="form-group">
              <label for="customer-email">Email:</label>
              <input type="email" id="customer-email" name="email" required>
            </div>
            <div class="form-group">
              <label for="customer-phone">Phone Number:</label>
              <input type="tel" id="customer-phone" name="phone" required>
            </div>
          </form>
        `,
        showCancelButton: true,
        confirmButtonText: 'Submit Trip',
        cancelButtonText: 'Cancel',
        customClass: {
          confirmButton: 'submit-btn',
          cancelButton: 'cancel-btn'
        },
        preConfirm: () => {
          const form = Swal.getPopup().querySelector('#customer-details-form');
          const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            trip: tripData
          };
          
          // Log all trip data including customer details
          console.log('Trip Summary:', {
            customer: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone
            },
            destination: tripData.destination.name,
            duration: tripData.tripDetails.duration,
            activities: tripData.tripDetails.activities
          });
          
          return formData;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          // Close modal
          Swal.close();
        }
      });
    }
  });
};
