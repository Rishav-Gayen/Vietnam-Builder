import { destinations } from '../../data/destination.js';
import { openDestinationModal } from './modal.js';

// DOM Targets (Single element selection)
const destinationsGrid = document.querySelector('.destinations-grid');


const createDestinationCard = (destination) => {
  const card = document.createElement('div');
  card.className = 'destination-card';
  card.dataset.id = destination.id;
  
  card.innerHTML = `
    <div class="card-image">
      <img src="${destination.imageUrl}" 
           alt="${destination.name}" 
           loading="lazy">
    </div>
    <div class="card-content">
      <h3>${destination.name}</h3>
      <p>${destination.shortDesc}</p>
    </div>
  `;
  
  return card;
};


const setupCardInteractions = (card, destination) => {
  card.addEventListener('click', () => {
    // Clear previous active state
    document.querySelectorAll('.destination-card').forEach(c => {
      c.classList.remove('active');
    });
    
    // Set new active state
    card.classList.add('active');
    
    // Open modal
    openDestinationModal(destination);
  });
  
  // Setup activity interactions
  setupActivityInteractions(card, destination);
};


const setupActivityInteractions = (card, destination) => {
  // TO DO: implement activity interactions
};


export const initializeDestinations = () => {
  // Clear grid (if needed for re-renders)
  destinationsGrid.innerHTML = '';
  
  // Create and append cards
  destinations.forEach(destination => {
    const card = createDestinationCard(destination);
    setupCardInteractions(card, destination);
    destinationsGrid.appendChild(card);
  });
};