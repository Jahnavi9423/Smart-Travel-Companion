import { Destination } from '@/types/trip';

export const popularDestinations: Destination[] = [
  {
    id: '1',
    name: 'Goa',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    description: 'Sun-kissed beaches, vibrant nightlife, and Portuguese heritage charm.',
    rating: 4.7,
    category: 'Beach',
  },
  {
    id: '2',
    name: 'Jaipur',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
    description: 'The Pink City with magnificent forts, palaces, and rich Rajasthani culture.',
    rating: 4.8,
    category: 'Culture',
  },
  {
    id: '3',
    name: 'Manali',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1626621338956-076aaa14aab7?w=800&q=80',
    description: 'Snow-capped Himalayas, river rafting, and thrilling mountain adventures.',
    rating: 4.7,
    category: 'Adventure',
  },
  {
    id: '4',
    name: 'Varanasi',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80',
    description: 'Sacred ghats, ancient temples, and mesmerizing Ganga Aarti ceremonies.',
    rating: 4.9,
    category: 'Culture',
  },
  {
    id: '5',
    name: 'Andaman Islands',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
    description: 'Pristine turquoise waters, coral reefs, and untouched tropical beaches.',
    rating: 4.8,
    category: 'Beach',
  },
  {
    id: '6',
    name: 'Leh Ladakh',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1626015365107-aa04a5ae7bfd?w=800&q=80',
    description: 'Breathtaking passes, monasteries, and the ultimate road trip destination.',
    rating: 4.9,
    category: 'Adventure',
  },
  {
    id: '7',
    name: 'Mumbai',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800&q=80',
    description: 'The city of dreams with iconic landmarks, street food, and Bollywood vibes.',
    rating: 4.6,
    category: 'City',
  },
  {
    id: '8',
    name: 'Kerala',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    description: 'Serene backwaters, lush tea plantations, and Ayurvedic wellness retreats.',
    rating: 4.8,
    category: 'Nature',
  },
  {
    id: '9',
    name: 'Rishikesh',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1600108515428-1b170e372aaa?w=800&q=80',
    description: 'Yoga capital of the world with rafting, bungee jumping, and spiritual vibes.',
    rating: 4.7,
    category: 'Adventure',
  },
  {
    id: '10',
    name: 'Udaipur',
    country: 'India',
    imageUrl: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800&q=80',
    description: 'The City of Lakes with romantic palaces, boat rides, and Rajput grandeur.',
    rating: 4.8,
    category: 'Culture',
  },
];

export const travelCategories = [
  { id: 'all', label: 'All', icon: 'Globe' },
  { id: 'Beach', label: 'Beach', icon: 'Waves' },
  { id: 'Culture', label: 'Culture', icon: 'Landmark' },
  { id: 'Adventure', label: 'Adventure', icon: 'Mountain' },
  { id: 'City', label: 'City', icon: 'Building2' },
  { id: 'Nature', label: 'Nature', icon: 'TreePine' },
];

export const expenseCategoryLabels: Record<string, string> = {
  transport: 'Transport',
  accommodation: 'Lodging',
  food: 'Food & Drink',
  sightseeing: 'Sightseeing',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
};

export const expenseCategoryIcons: Record<string, string> = {
  transport: 'Car',
  accommodation: 'Bed',
  food: 'UtensilsCrossed',
  sightseeing: 'Camera',
  shopping: 'ShoppingBag',
  health: 'Heart',
  other: 'MoreHorizontal',
};

export const defaultTripImages = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
];
