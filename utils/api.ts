import { CONFIG } from '@/constants/config';

export async function getPlaces(city: string) {
  const res = await fetch(
    `https://api.geoapify.com/v2/places?categories=catering.hotel,catering.restaurant&filter=place:${city}&limit=20&apiKey=${CONFIG.GEOAPIFY_API_KEY}`
  );

  const data = await res.json();
  return data.features;
}