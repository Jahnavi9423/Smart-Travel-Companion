export interface NearbyPlace {
  id: string;
  name: string;
  category: 'tourist' | 'hotel' | 'restaurant' | 'hospital';
  latitude: number;
  longitude: number;
  rating: number;
  description: string;
}

export interface CityData {
  name: string;
  latitude: number;
  longitude: number;
  places: NearbyPlace[];
}

export const cityNearbyPlaces: CityData[] = [
  {
    name: 'Goa',
    latitude: 15.4909,
    longitude: 73.8278,
    places: [
      { id: 'goa1', name: 'Basilica of Bom Jesus', category: 'tourist', latitude: 15.5009, longitude: 73.9116, rating: 4.7, description: 'UNESCO World Heritage Site, 16th century church' },
      { id: 'goa2', name: 'Fort Aguada', category: 'tourist', latitude: 15.4925, longitude: 73.7735, rating: 4.5, description: 'Portuguese-era fort with lighthouse & sea views' },
      { id: 'goa3', name: 'Calangute Beach', category: 'tourist', latitude: 15.5437, longitude: 73.7554, rating: 4.4, description: 'Queen of Beaches - popular tourist beach' },
      { id: 'goa4', name: 'Dudhsagar Falls', category: 'tourist', latitude: 15.3144, longitude: 74.3143, rating: 4.8, description: 'Stunning four-tiered waterfall on Mandovi river' },
      { id: 'goa5', name: 'Taj Exotica Resort', category: 'hotel', latitude: 15.2993, longitude: 73.9243, rating: 4.8, description: 'Luxury 5-star resort with private beach' },
      { id: 'goa6', name: 'Novotel Goa Dona Sylvia', category: 'hotel', latitude: 15.2750, longitude: 73.9350, rating: 4.4, description: 'Premium beachside resort in South Goa' },
      { id: 'goa7', name: 'Hotel Fidalgo', category: 'hotel', latitude: 15.4966, longitude: 73.8271, rating: 4.3, description: 'Well-known hotel in Panjim city centre' },
      { id: 'goa8', name: "Martin's Corner", category: 'restaurant', latitude: 15.2879, longitude: 73.9542, rating: 4.6, description: 'Famous Goan & seafood restaurant' },
      { id: 'goa9', name: "Britto's", category: 'restaurant', latitude: 15.5143, longitude: 73.7654, rating: 4.3, description: 'Iconic beachside shack in Baga' },
      { id: 'goa10', name: 'Goa Medical College', category: 'hospital', latitude: 15.3963, longitude: 73.8714, rating: 4.0, description: 'Largest government hospital in Goa' },
      { id: 'goa11', name: 'Manipal Hospital Goa', category: 'hospital', latitude: 15.3890, longitude: 73.8670, rating: 4.2, description: 'Multi-specialty private hospital' },
    ],
  },
  {
    name: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    places: [
      { id: 'jai1', name: 'Hawa Mahal', category: 'tourist', latitude: 26.9239, longitude: 75.8267, rating: 4.6, description: 'Palace of Winds - iconic pink sandstone landmark' },
      { id: 'jai2', name: 'Amber Fort', category: 'tourist', latitude: 26.9855, longitude: 75.8513, rating: 4.8, description: 'Majestic hilltop fort with stunning architecture' },
      { id: 'jai3', name: 'City Palace', category: 'tourist', latitude: 26.9258, longitude: 75.8236, rating: 4.7, description: 'Royal residence with museums & courtyards' },
      { id: 'jai4', name: 'Nahargarh Fort', category: 'tourist', latitude: 26.9387, longitude: 75.8154, rating: 4.5, description: 'Hilltop fort with panoramic city views' },
      { id: 'jai5', name: 'Rambagh Palace Hotel', category: 'hotel', latitude: 26.8936, longitude: 75.8049, rating: 4.9, description: 'Luxury heritage palace hotel by Taj' },
      { id: 'jai6', name: 'Hotel Clarks Amer', category: 'hotel', latitude: 26.8890, longitude: 75.7920, rating: 4.2, description: 'Popular 5-star hotel with gardens' },
      { id: 'jai7', name: 'LMB (Laxmi Mishthan Bhandar)', category: 'restaurant', latitude: 26.9191, longitude: 75.8224, rating: 4.5, description: 'Legendary Rajasthani vegetarian restaurant since 1727' },
      { id: 'jai8', name: 'Chokhi Dhani', category: 'restaurant', latitude: 26.7825, longitude: 75.8070, rating: 4.4, description: 'Rajasthani village-themed resort & restaurant' },
      { id: 'jai9', name: 'SMS Hospital', category: 'hospital', latitude: 26.8988, longitude: 75.7958, rating: 4.0, description: 'Major government hospital & medical college' },
      { id: 'jai10', name: 'Fortis Escorts Hospital', category: 'hospital', latitude: 26.8560, longitude: 75.7930, rating: 4.3, description: 'Multi-specialty private hospital' },
    ],
  },
  {
    name: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
    places: [
      { id: 'mum1', name: 'Gateway of India', category: 'tourist', latitude: 18.9220, longitude: 72.8347, rating: 4.6, description: 'Iconic arch monument overlooking Arabian Sea' },
      { id: 'mum2', name: 'Marine Drive', category: 'tourist', latitude: 18.9440, longitude: 72.8238, rating: 4.7, description: "Queen's Necklace - famous seafront promenade" },
      { id: 'mum3', name: 'Elephanta Caves', category: 'tourist', latitude: 18.9633, longitude: 72.9315, rating: 4.5, description: 'UNESCO site with ancient rock-cut temples' },
      { id: 'mum4', name: 'Chhatrapati Shivaji Terminus', category: 'tourist', latitude: 18.9398, longitude: 72.8355, rating: 4.6, description: 'UNESCO Heritage Victorian Gothic railway station' },
      { id: 'mum5', name: 'Taj Mahal Palace', category: 'hotel', latitude: 18.9217, longitude: 72.8332, rating: 4.9, description: 'Legendary luxury hotel facing Gateway of India' },
      { id: 'mum6', name: 'The Oberoi Mumbai', category: 'hotel', latitude: 18.9260, longitude: 72.8200, rating: 4.7, description: 'Premium luxury hotel at Nariman Point' },
      { id: 'mum7', name: 'Leopold Cafe', category: 'restaurant', latitude: 18.9272, longitude: 72.8319, rating: 4.3, description: 'Historic cafe in Colaba since 1871' },
      { id: 'mum8', name: 'Britannia & Co.', category: 'restaurant', latitude: 18.9340, longitude: 72.8360, rating: 4.5, description: 'Iconic Parsi restaurant since 1923' },
      { id: 'mum9', name: 'Lilavati Hospital', category: 'hospital', latitude: 19.0509, longitude: 72.8284, rating: 4.4, description: 'Premier multi-specialty hospital in Bandra' },
      { id: 'mum10', name: 'Hinduja Hospital', category: 'hospital', latitude: 19.0300, longitude: 72.8380, rating: 4.3, description: 'Leading private hospital in Mahim' },
    ],
  },
  {
    name: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    places: [
      { id: 'del1', name: 'Red Fort', category: 'tourist', latitude: 28.6562, longitude: 77.2410, rating: 4.5, description: 'UNESCO Heritage - Mughal-era red sandstone fort' },
      { id: 'del2', name: 'India Gate', category: 'tourist', latitude: 28.6129, longitude: 77.2295, rating: 4.7, description: 'War memorial & iconic landmark of Delhi' },
      { id: 'del3', name: 'Qutub Minar', category: 'tourist', latitude: 28.5245, longitude: 77.1855, rating: 4.6, description: 'UNESCO site - tallest brick minaret in the world' },
      { id: 'del4', name: 'Lotus Temple', category: 'tourist', latitude: 28.5535, longitude: 77.2588, rating: 4.5, description: "Bahai House of Worship shaped like a lotus flower" },
      { id: 'del5', name: 'ITC Maurya', category: 'hotel', latitude: 28.5975, longitude: 77.1727, rating: 4.8, description: 'Luxury 5-star hotel in Diplomatic Enclave' },
      { id: 'del6', name: 'The Leela Palace', category: 'hotel', latitude: 28.5960, longitude: 77.1710, rating: 4.9, description: 'Ultra-luxury palace hotel in New Delhi' },
      { id: 'del7', name: "Karim's", category: 'restaurant', latitude: 28.6537, longitude: 77.2340, rating: 4.5, description: 'Legendary Mughlai restaurant since 1913' },
      { id: 'del8', name: 'Bukhara - ITC Maurya', category: 'restaurant', latitude: 28.5980, longitude: 77.1730, rating: 4.7, description: 'World-famous North Indian restaurant' },
      { id: 'del9', name: 'AIIMS', category: 'hospital', latitude: 28.5672, longitude: 77.2100, rating: 4.5, description: "India's premier medical institute & hospital" },
      { id: 'del10', name: 'Max Super Speciality Hospital', category: 'hospital', latitude: 28.5690, longitude: 77.2080, rating: 4.3, description: 'Leading private healthcare chain' },
    ],
  },
  {
    name: 'Varanasi',
    latitude: 25.3176,
    longitude: 83.0065,
    places: [
      { id: 'var1', name: 'Kashi Vishwanath Temple', category: 'tourist', latitude: 25.3109, longitude: 83.0107, rating: 4.8, description: 'One of the most famous Hindu temples dedicated to Lord Shiva' },
      { id: 'var2', name: 'Dashashwamedh Ghat', category: 'tourist', latitude: 25.3048, longitude: 83.0107, rating: 4.7, description: 'Main ghat famous for evening Ganga Aarti ceremony' },
      { id: 'var3', name: 'Sarnath', category: 'tourist', latitude: 25.3813, longitude: 83.0229, rating: 4.6, description: "Buddhist pilgrimage site where Buddha gave first sermon" },
      { id: 'var4', name: 'Taj Ganges Hotel', category: 'hotel', latitude: 25.3280, longitude: 82.9870, rating: 4.5, description: 'Premium hotel with traditional Varanasi hospitality' },
      { id: 'var5', name: 'Baati Chokha', category: 'restaurant', latitude: 25.3200, longitude: 82.9900, rating: 4.4, description: 'Traditional UP cuisine in rustic village setting' },
      { id: 'var6', name: 'BHU Hospital', category: 'hospital', latitude: 25.2677, longitude: 82.9913, rating: 4.1, description: 'Major teaching hospital at Banaras Hindu University' },
    ],
  },
  {
    name: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    places: [
      { id: 'ker1', name: 'Alleppey Backwaters', category: 'tourist', latitude: 9.4981, longitude: 76.3388, rating: 4.8, description: 'Famous houseboat cruise through serene backwaters' },
      { id: 'ker2', name: 'Munnar Tea Gardens', category: 'tourist', latitude: 10.0889, longitude: 77.0595, rating: 4.7, description: 'Lush green tea plantations in Western Ghats' },
      { id: 'ker3', name: 'Fort Kochi', category: 'tourist', latitude: 9.9658, longitude: 76.2421, rating: 4.5, description: 'Historic area with Chinese fishing nets & colonial architecture' },
      { id: 'ker4', name: 'Taj Malabar Resort', category: 'hotel', latitude: 9.9680, longitude: 76.2400, rating: 4.6, description: 'Luxury heritage resort in Cochin' },
      { id: 'ker5', name: 'Kayees Rahmathulla Hotel', category: 'restaurant', latitude: 9.9710, longitude: 76.2890, rating: 4.5, description: 'Famous for authentic Kerala biryani since 1948' },
      { id: 'ker6', name: 'Amrita Institute of Medical Sciences', category: 'hospital', latitude: 10.0380, longitude: 76.2890, rating: 4.4, description: 'Leading super-speciality hospital in Kochi' },
    ],
  },
];

export const nearbyCategories = [
  { id: 'all', label: 'All Places', color: '#0F7B6C' },
  { id: 'tourist', label: 'Tourist Spots', color: '#10B981' },
  { id: 'hotel', label: 'Hotels', color: '#8B5CF6' },
  { id: 'restaurant', label: 'Restaurants', color: '#F59E0B' },
  { id: 'hospital', label: 'Hospitals', color: '#EF4444' },
];

export const categoryMarkerColors: Record<string, string> = {
  tourist: '#10B981',
  hotel: '#8B5CF6',
  restaurant: '#F59E0B',
  hospital: '#EF4444',
};
