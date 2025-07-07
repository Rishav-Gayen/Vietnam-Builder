// src/app.js
import { initializeDestinations } from './modules/builder/destinations.js';
import { updateItinerarySummary } from './modules/builder/summary.js';
import { showDestinationAdded } from './ui/feedback.js';

// Initialize the app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  // 1. Set up destination cards
  initializeDestinations();

  // 2. Handle saved destinations
  document.addEventListener('destinationSaved', (e) => {
    const tripData = e.detail;
    
    // Update itinerary summary
    updateItinerarySummary();
    
    // Show success UI
    showDestinationAdded(tripData);
  });

  // 3. Initialize empty state
  updateItinerarySummary();
});

// Export for potential testing
export const app = {
  init: () => document.dispatchEvent(new Event('DOMContentLoaded'))
};