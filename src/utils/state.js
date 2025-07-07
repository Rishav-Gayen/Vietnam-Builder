let savedItinerary = [];
let flightPreferences = {
  departureCity: '',
  departureDate: '',
  departureTime: '', // 'morning', 'afternoon', etc.
  travelClass: '', // 'economy', 'business', etc.
  dietaryPreferences: [] // array of strings
};

// Existing destination functions remain the same
export const addToItinerary = (item) => {
  savedItinerary.push(item);
  return [...savedItinerary];
};

export const removeFromItinerary = (index) => {
  savedItinerary.splice(index, 1);
  return [...savedItinerary];
};

export const getItinerary = () => Array.isArray(savedItinerary) ? [...savedItinerary] : [];;

// New flight preference functions
export const saveFlightPreferences = (prefs) => {
  flightPreferences = {
    departureCity: prefs.departureCity,
    departureDate: prefs.departureDate,
    departureTime: prefs.departureTime,
    travelClass: prefs.travelClass,
    dietaryPreferences: prefs.dietaryPreferences || []
  };
  return {...flightPreferences};
};

export const getFlightPreferences = () => ({...flightPreferences});

// Debug
export const _state = {
  get rawData() { return savedItinerary; },
  get flightData() { return {...flightPreferences}; }
};


export const getBuilderPhase = () => {
  const hasFlights = !!getFlightPreferences().departureCity;
  return hasFlights ? 'addons' : 'destinations'; 
}

let addOns = {};

export const setAddOns = (options) => {
  addOns = {...options};
  return {...addOns};
};

export const getAddOns = () => ({...addOns});