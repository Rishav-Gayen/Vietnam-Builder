export const destinations = [
  {
    id: 'phnom_penh',
    name: 'Phnom Penh',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1697730269491-7a3425f2163c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    shortDesc: 'Explore Khmer Heritage in the riverside capital',
    activities: [
      {
        id: 'site_seeing_tour',
        name: 'Phnom Penh sightseeing tour',
        imageUrl: "https://media.tacdn.com/media/attractions-splice-spp-674x446/07/81/80/c4.jpg",
        selected: false
      },
      {
        id: 'siem_reap',
        name: 'Siem Reap Tour',
        imageUrl: 'https://i.natgeofe.com/n/fdbadebb-1db9-41a9-9ac6-e7ee41f199aa/ta-prohm-siem-reap-cambodia_3x2.jpg',
        selected: false
      },
      {
        id: 'angkor_wat',
        name: 'Angkor Wat Tour',
        imageUrl: 'https://powertraveller.com/wp-content/uploads/2024/10/2-day-angkor-wat-tour.jpg',
        selected: false
      },
      {
        id: 'small_temple_circuit_tour',
        name: 'Small temple circuit tour',
        imageUrl: 'https://www.templeseeker.com/wp-content/uploads/2020/02/tommanon-temple.jpg',
        selected: false
      },
    ],
    accommodationOptions: [
      'Accomodation (3 Star)',
      'Accomodation (4 Star)',
      'Accomodation (5 Star)',
      'Airbnb'
    ],
    metadata: {
      region: 'South Central Cambodia',
      popular: true,
      idealFor: ['history', 'culture']
    }
  },
  {
    id: 'ho_chi_minh',
    name: 'Ho Chi Minh',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1690960644830-487c569ca6fa?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    shortDesc:"Metropolis with pulsing energy, street food and modern charm",
    activities: [
      {
        id: 'mekong_delta',
        name: 'Mekong Delta Trip',
        imageUrl: 'https://media.tacdn.com/media/attractions-content--1x-1/12/2b/59/61.jpg',
        selected: false
      },
      {
        id: 'city_tour',
        name: 'City tour with cultural experience',
        imageUrl: 'https://vmtravel.com.vn/wp-content/uploads/2022/10/The_Old_Central_Post_Office.jpg',
        selected: false
      },
    ],
    accommodationOptions: [
      'Accomodation (3 Star)',
      'Accomodation (4 Star)',
      'Accomodation (5 Star)',
      'Airbnb'
    ],
    metadata: {
      region: 'southern vietnam',
      popular: true,
      idealFor: ['romance', 'photography']
    }
  },

  {
    id: 'Hanoi',
    name: 'Hanoi',
    imageUrl: 'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    shortDesc: 'Capital where ancient temples meet French colonial grace',
    activities: [
      {
        id: 'old_quarters',
        name: 'Old Quarters',
        imageUrl: 'https://vietdantravel.com/wp-content/uploads/2023/05/Hanoi-Old-Quarter-Vietnam-DMC.jpg',
        selected: false
      },
      {
        id: 'ninh_binh_province',
        name: 'Ninh Binh Province',
        imageUrl: 'https://vietnam.travel/sites/default/files/inline-images/shutterstock_138213581.jpg',
        selected: false
      },
      {
        id: 'mua_cave',
        name: 'Mua Cave Tour',
        imageUrl: 'https://localvietnam.com/wp-content/uploads/2019/08/mua-cave-dragon.jpg',
        selected: false
      },
      {
        id: 'tamcoc',
        name: 'Tamcoc',
        imageUrl: 'https://nomadisbeautiful.com/wp-content/uploads/2017/03/TamCoc-1.jpg',
        selected: false
      }
    ],
    accommodationOptions: [
      'Accomodation (3 Star)',
      'Accomodation (4 Star)',
      'Accomodation (5 Star)',
      'Airbnb'
    ],
    metadata: {
      region: 'Hanoi',
      popular: false,
      idealFor: ['history', 'heritage']
    }
  },

  {
    id: 'ha_long_bay',
    name: 'Ha Long Bay',
    imageUrl: 'https://geologyscience.com/wp-content/uploads/2023/06/Ha-Long-Bay-Vietnam-3-scaled.webp',
    shortDesc: "Surreal seascape of emerald waters and limestone islands",
    activities: [
      {
        id: 'three_day_cruise_sightseeing_Halong_Bay',
        name: 'Halong Bay Sightseeing cruise',
        imageUrl: 'https://www.halonghub.com/wp-content/uploads/2022/06/HalongHub-HeroHome.jpg',
        selected: false
      },
    ],
    accommodationOptions: [
      '3 Star Cruise',
      '4 Star Cruise',
      '5 Star Cruise'
    ],
    metadata: {
      region: 'halong_bay',
      popular: false,
      idealFor: ['cruise', 'chilling']
    }
  },
];

// Optional: Helper functions for data access
export const getDestinationById = (id) => 
  destinations.find(dest => dest.id === id);

export const getPopularDestinations = () => 
  destinations.filter(dest => dest.metadata.popular);

export const getDestinationsByRegion = (region) => 
  destinations.filter(dest => dest.metadata.region === region);