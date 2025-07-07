// sheety.js
export const SHEETY_CONFIG = {
  BASE_URL: 'https://api.sheety.co/1025af4ef5e3ffc4e8008b2e0fca9514/bonhomieeCustomTravelData/sheet1',
  API_KEY: 'YOUR_API_KEY', // Leave empty if no authentication
  SHEET_NAME: 'sheet1' // Should match your sheet name in Sheety
};

/**
 * Saves trip data to Sheety (POST)
 * @param {object} tripData - Full trip data including destinations, flights, etc.
 * @param {object} customerData - Customer details from the form
 * @returns {Promise} Resolves with Sheety response
 */
export const saveTripToSheety = async (tripData, customerData) => {

  if (!customerData.name || !customerData.email || !customerData.phone) {
    throw new Error('All customer details are required');
  }

  // Validate email format
  if (!/^\S+@\S+\.\S+$/.test(customerData.email)) {
    throw new Error('Invalid email format');
  }

  // Validate phone format
  if (!/^[\d\s\+\-\(\)]{8,}$/.test(customerData.phone)) {
    throw new Error('Invalid phone number');
  }

  //country
  const country = "Vietnam"; 

   const now = new Date();
  const timestampData = {
    iso: now.toISOString(),
    date: now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    time: now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };

   // Extract ONLY SELECTED activities from all destinations
  const selectedActivities = tripData.destinations.flatMap(destination => {
    // Ensure we have activities and they're in the correct format
    if (!destination.tripDetails?.activities) return [];
    
    // Handle both array of strings and array of objects with 'selected' property
    return destination.tripDetails.activities
      .filter(activity => {
        if (typeof activity === 'string') return true; // assume all strings are selected
        return activity.selected !== false; // include if selected is not explicitly false
      })
      .map(activity => typeof activity === 'string' ? activity : activity.name);
  }).join(', ');


// Generate a unique request ID (timestamp + random string)
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const payload = {
    [SHEETY_CONFIG.SHEET_NAME]: {
      'requestid': requestId,
      'customername': customerData.name,
      'customeremail': customerData.email,
      'customerphone': customerData.phone,
      'departurecity': tripData.flights.departureCity,
      'departuredate': tripData.flights.departureDate,
      'departuretime': tripData.flights.departureTime,
      'travelclass': tripData.flights.travelClass,
      'dietarypreferences': tripData.flights.dietaryPreferences?.join(', ') || '',
      'country': country,
      'destinations': tripData.destinations.map(d => d.destination.name).join(', '),
      'activities': selectedActivities,
      'totaldays': tripData.summary.totalDays,
      'estimatedcost': tripData.summary.estimatedCost,
      'addons': Object.entries(tripData.addOns || {})
        .filter(([_, val]) => val)
        .map(([key]) => key)
        .join(', '),
       'timestamp': timestampData.iso,
      'date': timestampData.date,
      'time': timestampData.time,
  },
};

  const headers = {
    'Content-Type': 'application/json',
    ...(SHEETY_CONFIG.API_KEY && { 'Authorization': `Bearer ${SHEETY_CONFIG.API_KEY}` })
  };

  try {
    const response = await fetch(SHEETY_CONFIG.BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save trip data');
    }

    return await response.json();
  } catch (error) {
    console.error('Sheety POST Error:', error);
    throw error;
  }
};

/**
 * Retrieves trip data from Sheety (GET)
 * @param {object} filters - Optional filters for querying data
 * @returns {Promise} Resolves with array of trip records
 */
export const getTripsFromSheety = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add filters if provided
  Object.entries(filters).forEach(([key, value]) => {
    queryParams.append(key, value);
  });

  const url = `${SHEETY_CONFIG.BASE_URL}?${queryParams.toString()}`;
  const headers = {
    ...(SHEETY_CONFIG.API_KEY && { 'Authorization': `Bearer ${SHEETY_CONFIG.API_KEY}` })
  };

  try {
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[SHEETY_CONFIG.SHEET_NAME] || [];
  } catch (error) {
    console.error('Sheety GET Error:', error);
    throw error;
  }
};