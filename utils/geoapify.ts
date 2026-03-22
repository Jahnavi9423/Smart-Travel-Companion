import { CONFIG } from '@/constants/config';

export const getPlaces = async (city: string) => {
  const API_KEY = CONFIG.GEOAPIFY_API_KEY;

  try {
    // STEP 1 — get coordinates of city
    const geoRes = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) return [];

    const { lat, lon } = geoData.features[0].properties;

    // STEP 2 — search places near city
    const placesRes = await fetch(
      `https://api.geoapify.com/v2/places?categories=accommodation.hotel,catering.restaurant&filter=circle:${lon},${lat},5000&limit=20&apiKey=${API_KEY}`
    );

    const placesData = await placesRes.json();

    return placesData.features || [];
  } catch (err) {
    console.log("Geoapify error:", err);
    return [];
  }
};