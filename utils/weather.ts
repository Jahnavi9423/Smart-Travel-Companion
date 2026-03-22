export type ForecastDay = {
  date: string; // YYYY-MM-DD
  maxTemp: number;
  minTemp: number;
  weathercode: number;
};

export type WeatherRange = {
  current?: { temperature: number; weathercode: number };
  forecast: ForecastDay[];
};

async function geocode(place: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;
    return { latitude: result.latitude, longitude: result.longitude };
  } catch (e) {
    console.log('geocode error', e);
    return null;
  }
}

export async function getWeatherForRange(place: string, startDate?: string, endDate?: string): Promise<WeatherRange | null> {
  // place can be "City, Country"
  const geo = await geocode(place.split(',')[0]);
  if (!geo) return null;
  const lat = geo.latitude;
  const lon = geo.longitude;

  // default dates: today + 2 days
  const today = new Date();
  const s = startDate ? new Date(startDate) : today;
  const e = endDate ? new Date(endDate) : new Date(today.getTime() + 2 * 86400000);

  const start = s.toISOString().slice(0, 10);
  const end = e.toISOString().slice(0, 10);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&current_weather=true&timezone=auto&start_date=${start}&end_date=${end}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const current = data.current_weather ? { temperature: data.current_weather.temperature, weathercode: data.current_weather.weathercode } : undefined;

    const days: ForecastDay[] = [];
    const daily = data.daily || {};
    const dates: string[] = daily.time || [];
    const maxArr: number[] = daily.temperature_2m_max || [];
    const minArr: number[] = daily.temperature_2m_min || [];
    const codeArr: number[] = daily.weathercode || [];

    for (let i = 0; i < dates.length; i++) {
      days.push({ date: dates[i], maxTemp: Number(maxArr[i] ?? 0), minTemp: Number(minArr[i] ?? 0), weathercode: Number(codeArr[i] ?? 0) });
    }

    return { current, forecast: days };
  } catch (e) {
    console.log('weather service error', e);
    return null;
  }
}
