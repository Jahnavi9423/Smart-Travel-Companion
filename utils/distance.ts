import { CONFIG } from '@/constants/config';

export async function getCoordinates(place: string) {
  const API_KEY = CONFIG.GEOAPIFY_API_KEY;

  const res = await fetch(
    `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(place)}&apiKey=${API_KEY}`
  );

  const data = await res.json();

  if (!data.features.length) return null;

  const coords = data.features[0].geometry.coordinates;

  return {
    lon: coords[0],
    lat: coords[1],
  };
}


// Haversine Formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}


export async function getRealDistance(source: string, destination: string) {
  const src = await getCoordinates(source);
  const dest = await getCoordinates(destination);

  if (!src || !dest) return 0;

  return calculateDistance(src.lat, src.lon, dest.lat, dest.lon);
}