import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Droplets, Wind, Thermometer } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Constants from 'expo-constants';

interface WeatherCardProps {
  city: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  owmApiKey?: string; // optional OpenWeatherMap API key
}

function getWeatherIconFromCode(code: number, size = 24) {
  if (code === 0) return <Sun size={size} color="#F59E0B" />;
  if (code === 1 || code === 2) return <Cloud size={size} color="#F59E0B" />;
  if (code === 3) return <Cloud size={size} color="#9CA3AF" />;
  if (code === 45 || code === 48) return <Cloud size={size} color="#6B7280" />;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={size} color="#3B82F6" />;
  if (code >= 71 && code <= 77) return <CloudSnow size={size} color="#60A5FA" />;
  if (code >= 95) return <CloudLightning size={size} color="#A78BFA" />;
  return <Cloud size={size} color="#9CA3AF" />;
}

function mapOwmIdToOmCode(id: number) {
  // Map OpenWeatherMap weather id ranges to approximate Open-Meteo codes
  if (id === 800) return 0; // clear
  if (id === 801 || id === 802) return 2; // partly cloudy
  if (id === 803 || id === 804) return 3; // overcast
  if (id >= 200 && id < 300) return 95; // thunderstorm
  if (id >= 300 && id < 600) return 51; // drizzle / rain
  if (id >= 600 && id < 700) return 71; // snow
  if (id >= 700 && id < 800) return 45; // fog/mist
  return 3;
}

export default function WeatherCard({ city, startDate, endDate, owmApiKey }: WeatherCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState<any | null>(null);
  const [forecast, setForecast] = useState<Array<any>>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    async function fetchWeather() {
      // Prefer OpenWeatherMap if API key available, otherwise fallback to Open-Meteo
      const expoExtra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra || {};
      const envKey = expoExtra?.EXPO_PUBLIC_OWM_KEY;
      const apiKey = owmApiKey ?? envKey;
      try {
        if (apiKey) {
          // OpenWeatherMap: geocode then fetch current weather only
          const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`);
          if (!geoRes.ok) throw new Error('OWM geocode failed');
          const geo = await geoRes.json();
          const place = geo && geo[0];
          if (!place) throw new Error('Location not found');
          const { lat: latitude, lon: longitude } = place as any;

          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
          // Masked logging for debug
          try {
            console.log('WeatherCard: using OWM key ending', String(apiKey).slice(-4));
            console.log('WeatherCard: fetching url=', url.replace(/appid=[^&]+/, 'appid=****'));
          } catch (e) { }

          const res = await fetch(url);
          if (!res.ok) throw new Error('OWM current weather failed');
          const data = await res.json();
          if (cancelled) return;

          if (data) {
            const id = data.weather?.[0]?.id ?? 800;
            setCurrent({ temp: Math.round(data.main?.temp ?? data.temp ?? 0), code: mapOwmIdToOmCode(id), rawId: id });
          }
          return;
        }

        // Fallback: Open-Meteo (existing behavior)
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        if (!geoRes.ok) throw new Error('Geocode failed');
        const geo = await geoRes.json();
        const place = geo.results && geo.results[0];
        if (!place) throw new Error('Location not found');
        const { latitude, longitude } = place;

        const today = new Date();
        const toISO = (d: Date) => d.toISOString().slice(0, 10);
        const s = startDate ? startDate.slice(0, 10) : toISO(today);
        const e = endDate ? endDate.slice(0, 10) : toISO(new Date(today.getTime() + 2 * 86400000));

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&start_date=${s}&end_date=${e}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Forecast fetch failed');
        const data = await res.json();
        if (cancelled) return;

        if (data.current_weather) {
          setCurrent({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
        }

        const daily = data.daily || {};
        const days: any[] = [];
        if (daily.time && Array.isArray(daily.time)) {
          for (let i = 0; i < daily.time.length; i++) {
            days.push({
              date: daily.time[i],
              max: daily.temperature_2m_max?.[i],
              min: daily.temperature_2m_min?.[i],
              code: daily.weathercode?.[i],
            });
          }
        }
        setForecast(days);
      } catch (e) {
        console.log('Weather fetch error:', e);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, [city, startDate, endDate, owmApiKey]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
      </View>
    );
  }

  if (error || !current) {
    return null;
  }

  let emoji = "❄";
  if (current.temp >= 30) emoji = "🔥";
  else if (current.temp >= 20) emoji = "🌤";
  else if (current.temp >= 10) emoji = "🌥";

  let conditionStr = 'Clear Sky';
  if (current.code === 1 || current.code === 2) conditionStr = 'Partly Cloudy';
  else if (current.code === 3) conditionStr = 'Overcast';
  else if (current.code >= 51 && current.code <= 67) conditionStr = 'Rain';
  else if (current.code >= 71 && current.code <= 77) conditionStr = 'Snow';
  else if (current.code >= 95) conditionStr = 'Storm';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.emojiText}>{emoji}</Text>
        <Text style={styles.text}>{current.temp}°C | {conditionStr}</Text>
      </View>
      <View style={styles.row}>
        <MapPin size={14} color="rgba(255,255,255,0.9)" />
        <Text style={styles.text}>Weather in {city.split(',')[0]}</Text>
      </View>
    </View>
  );
}

import { MapPin } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    gap: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  emojiText: {
    fontSize: 14,
  },
});
