import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, MapPin, Users, IndianRupee, ChevronRight, Train, Bed, UtensilsCrossed, Camera, Bus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { TravelerType, GeneratedPlan, PlanItem, ItineraryDay, ItineraryItem } from '@/types/trip';
import { generateId, formatCurrency } from '@/utils/helpers';
import { getPlaces } from '@/utils/geoapify';
import { getRealDistance } from '@/utils/distance';

import { transportFareByMode, localTravelByMode } from '@/utils/pricing';
import { LOCAL_TRAVEL_DB } from "@/utils/localData";
import { ROUTE_DB, RouteOption } from "@/utils/routeData";
import { useTrips } from '@/contexts/TripContext';
import { useRouter } from "expo-router";
import { CONFIG } from '@/constants/config';
import { getDestinationImage } from '@/utils/imageFetcher';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FALLBACK_ATTRACTIONS = [
  { name: "City Center", description: "Popular city area", price: 100, category: "sightseeing" },
  { name: "Local Market", description: "Local cultural market", price: 50, category: "sightseeing" },
  { name: "Scenic Viewpoint", description: "Famous viewpoint", price: 80, category: "sightseeing" }
];


function normalizeCity(input: string) {
  const val = input.toLowerCase().trim();
  if (val.includes("vizag") || val.includes("visakh")) return "visakhapatnam";
  if (val.includes("vzm") || val.includes("vizian")) return "vizianagaram";
  if (val.includes("araku")) return "araku";
  return val;
}

const travelerOptions: { value: TravelerType; label: string; icon: string }[] = [
  { value: 'solo', label: 'Solo', icon: '🧳' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'group', label: 'Group', icon: '👥' },
];

export default function PlannerScreen() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');

  const [travelerType, setTravelerType] = useState<TravelerType>('solo');
  const [travelerCount, setTravelerCount] = useState('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [transportMode, setTransportMode] = useState<'train' | 'bus' | 'flight' | 'car'>('train');
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [routes, setRoutes] = useState([]);
  const [distance, setDistance] = useState(0);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(0);
  const [selectedSightIndex, setSelectedSightIndex] = useState(0);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);

  const safeRouteIndex = selectedRouteIndex ?? 0;
  const safeHotelIndex = selectedHotelIndex ?? 0;
  const safeFoodIndex = selectedFoodIndex ?? 0;
  const safeSightIndex = selectedSightIndex ?? 0;

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (source.length > 2 && destination.length > 2) {
        try {
          const d = await getRealDistance(source, destination);
          setDistance(d);
        } catch (e) {
          setDistance(0);
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [source, destination]);

  useEffect(() => {
    const s = normalizeCity(source);
    const d = normalizeCity(destination);
    const dbEntry = ROUTE_DB[s]?.[d];

    if (dbEntry) {
      const currentArr = dbEntry[transportMode as keyof typeof dbEntry];
      if (!currentArr || !Array.isArray(currentArr) || currentArr.length === 0) {
        const validMode = ['train', 'bus', 'flight', 'car'].find(m => {
          const arr = dbEntry[m as keyof typeof dbEntry];
          return Array.isArray(arr) && arr.length > 0;
        });
        if (validMode) setTransportMode(validMode as any);
      }
    } else {
      if (distance <= 300 && transportMode === 'flight') {
        setTransportMode('train');
      }
    }
  }, [distance, source, destination, transportMode]);

  const liveTotal =
    (generatedPlan?.transport?.[safeRouteIndex]?.estimatedCost || 0) +
    (generatedPlan?.accommodation?.[safeHotelIndex]?.estimatedCost || 0) +
    (generatedPlan?.food?.[safeFoodIndex]?.estimatedCost || 0) +
    (generatedPlan?.sightseeing?.[safeSightIndex]?.estimatedCost || 0) +
    (generatedPlan?.localTravel?.[0]?.estimatedCost || 0);

  useEffect(() => {
    if (!generatedPlan) return;

    const budgetValue = Number(budget);

    if (liveTotal > budgetValue) {
      // cheapest transport
      const cheapestRoute = (generatedPlan.transport as any[]).length > 0
        ? (generatedPlan.transport as any[])
          .map((r: any, i: number) => ({ price: r.estimatedCost, index: i }))
          .sort((a, b) => a.price - b.price)[0]?.index ?? 0
        : 0;

      // cheapest hotel
      const cheapestHotel = (generatedPlan.accommodation as any[]).length > 0
        ? (generatedPlan.accommodation as any[])
          .map((r: any, i: number) => ({ price: r.estimatedCost, index: i }))
          .sort((a, b) => a.price - b.price)[0]?.index ?? 0
        : 0;

      // cheapest food
      const cheapestFood = (generatedPlan.food as any[]).length > 0
        ? (generatedPlan.food as any[])
          .map((r: any, i: number) => ({ price: r.estimatedCost, index: i }))
          .sort((a, b) => a.price - b.price)[0]?.index ?? 0
        : 0;

      // cheapest sightseeing
      const cheapestSight = (generatedPlan.sightseeing as any[]).length > 0
        ? (generatedPlan.sightseeing as any[])
          .map((r: any, i: number) => ({ price: r.estimatedCost, index: i }))
          .sort((a, b) => a.price - b.price)[0]?.index ?? 0
        : 0;

      setSelectedRouteIndex(cheapestRoute);
      setSelectedHotelIndex(cheapestHotel);
      setSelectedFoodIndex(cheapestFood);
      setSelectedSightIndex(cheapestSight);
    }

  }, [liveTotal]);

  const selectedTransportCost = useMemo(() => {
    if (!generatedPlan) return 0;
    return generatedPlan.transport?.[selectedRouteIndex]?.estimatedCost || 0;
  }, [generatedPlan, selectedRouteIndex]);


  const loadRoutes = (mode: string) => {
    setTransportMode(mode as any);

    const sourceKey = normalizeCity(source);
    const destinationKey = normalizeCity(destination);

    const routeData = (ROUTE_DB as any)[sourceKey]?.[destinationKey];
    if (!routeData) return;

    let routeOptions: any[] = [];

    if (mode === "train") {
      routeOptions = [{
        name: "Train Route",
        estimatedCost: routeData.train
      }];
    } else {
      routeOptions = routeData.routes.map((r: any, i: number) => ({
        name: r.name,
        estimatedCost: mode === "car" ? r.car : r.bus
      }));
    }

    setRoutes(routeOptions as any);
    setSelectedRouteIndex(0);
  };





  useEffect(() => {
    if (!source || !destination || !budget || !days) {
      setGeneratedPlan(null); // ← replace with YOUR state name
    }
  }, [source, destination, budget, days]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const planFadeAnim = useRef(new Animated.Value(0)).current;

  const parsedBudget = parseFloat(budget);
  const parsedDays = parseInt(days, 10);

  const canGenerate =
    destination.trim().length > 0 &&
    Number.isFinite(parsedBudget) &&
    parsedBudget > 0 &&
    Number.isFinite(parsedDays) &&
    parsedDays > 0;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCityTier = (city: string) => {
    const c = city.toLowerCase();
    const t1 = ["delhi", "mumbai", "bangalore", "hyderabad", "chennai"];
    const t2 = ["visakhapatnam", "pune", "jaipur", "kochi"];
    if (t1.some(ct => c.includes(ct))) return 1;
    if (t2.some(ct => c.includes(ct))) return 2;
    return 3;
  };

  const generateItinerary = (
    daysCount: number,
    attractions: any[],
    startDate: Date
  ): ItineraryDay[] => {
    const result: ItineraryDay[] = [];
    const safeAttractions = (attractions && attractions.length >= 3)
      ? attractions
      : [...(attractions || []), ...FALLBACK_ATTRACTIONS].slice(0, Math.max(3, attractions?.length || 0));

    let attractionIndex = 0;

    for (let i = 0; i < daysCount; i++) {
      const dayItems: ItineraryItem[] = [];
      const places = [
        safeAttractions[attractionIndex % safeAttractions.length],
        safeAttractions[(attractionIndex + 1) % safeAttractions.length],
        safeAttractions[(attractionIndex + 2) % safeAttractions.length]
      ];
      attractionIndex += 3;

      dayItems.push({
        id: generateId(),
        time: "08:00 AM",
        title: "Breakfast",
        description: "Start your day with a local breakfast"
      });

      dayItems.push({
        id: generateId(),
        time: "10:00 AM",
        title: places[0]?.name || "Local Attraction",
        description: `Explore the beautiful ${places[0]?.name || "Local Attraction"}`
      });

      dayItems.push({
        id: generateId(),
        time: "01:30 PM",
        title: "Lunch",
        description: "Taste local delicacies at a nearby eatery"
      });

      dayItems.push({
        id: generateId(),
        time: "03:00 PM",
        title: places[1]?.name || "Cultural Site",
        description: `Visit ${places[1]?.name || "Cultural Site"}`
      });

      dayItems.push({
        id: generateId(),
        time: "05:30 PM",
        title: places[2]?.name || "Scenic Spot",
        description: `Relax at ${places[2]?.name || "Scenic Spot"}`
      });

      result.push({
        date: new Date(startDate.getTime() + i * 86400000).toISOString(),
        items: dayItems
      });
    }

    return result;
  };

  const { addTrip, setItinerary } = useTrips();
  const router = useRouter();

  // Optimized helper to get coordinates for source and destination once
  const getGeocodedCoords = async (placeName: string) => {
    try {
      const API_KEY = CONFIG.GEOAPIFY_API_KEY;
      const res = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(placeName)}&apiKey=${API_KEY}`);
      const data = await res.json();
      if (!data?.features?.[0]) return null;
      return {
        lat: data.features[0].properties.lat,
        lon: data.features[0].properties.lon,
        place_id: data.features[0].properties.place_id
      };
    } catch (e) {
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!destination || !budget || !days || !source) return;

    const parsedBudget = parseFloat(budget);
    const parsedDays = parseInt(days, 10);
    const count = parseInt(travelerCount, 10) || 1;

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) return;
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) return;

    const cacheKey = `planner_cache_${source.toLowerCase().trim()}_${destination.toLowerCase().trim()}_${parsedDays}_${count}`;

    setIsGenerating(true);
    setGeneratedPlan(null);
    planFadeAnim.setValue(0);

    try {
      const normalizedDestKey = normalizeCity(destination);
      const isFixedDest = ['vizianagaram', 'visakhapatnam', 'araku'].includes(normalizedDestKey);

      // 1. Distance calculation (non-fatal)
      let tripDistance = 100;
      try {
        const d = await getRealDistance(source, destination);
        if (d && d > 0) tripDistance = d;
      } catch (_) { }

      let cityData: any = null;

      // 2. Load Local DB first — ALWAYS skip cache for these (they are fast + must be exact)
      if (isFixedDest) {
        const rawData = (LOCAL_TRAVEL_DB as any)[normalizedDestKey];
        if (rawData) {
          const parsePrice = (p: any) => {
            const n = parseFloat(p);
            return isNaN(n) ? 0 : n;
          };
          cityData = {
            hotels: rawData.hotels.map((h: any) => ({ ...h, price: parsePrice(h.price) })),
            food: rawData.food.map((f: any) => ({ ...f, price: parsePrice(f.price) })),
            attractions: rawData.attractions.map((a: any) => ({ ...a, price: parsePrice(a.price) }))
          };
        }
        // Delete any stale cached plan for local cities
        await AsyncStorage.removeItem(cacheKey).catch(() => { });
      }

      // 3. Try Cache for API destinations only
      if (!cityData) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const parsedPlan = JSON.parse(cached);
          setGeneratedPlan(parsedPlan);
          setSelectedRouteIndex(0);
          setSelectedHotelIndex(0);
          setSelectedFoodIndex(0);
          setSelectedSightIndex(0);
          Animated.timing(planFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
          setIsGenerating(false);
          return;
        }
      }

      // 4. Fetch from Geoapify for non-local cities
      if (!cityData) {
        try {
          const API_KEY = CONFIG.GEOAPIFY_API_KEY;

          // Geocode the destination fresh here
          const destCoords = await getGeocodedCoords(destination);
          let lat: number | null = destCoords?.lat ?? null;
          let lon: number | null = destCoords?.lon ?? null;

          if (lat == null || lon == null) {
            throw new Error("Could not resolve destination coordinates");
          }

          const [sightsRes, hotelsRes, foodRes] = await Promise.all([
            fetch(`https://api.geoapify.com/v2/places?categories=tourism.sights,tourism.attraction,entertainment&filter=circle:${lon},${lat},10000&limit=25&apiKey=${API_KEY}`),
            fetch(`https://api.geoapify.com/v2/places?categories=accommodation.hotel,accommodation.guest_house,accommodation.hostel&filter=circle:${lon},${lat},10000&limit=20&apiKey=${API_KEY}`),
            fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant,catering.cafe,catering.fast_food&filter=circle:${lon},${lat},10000&limit=20&apiKey=${API_KEY}`)
          ]);

          const [sightsData, hotelsData, foodData] = await Promise.all([
            sightsRes.json(), hotelsRes.json(), foodRes.json()
          ]);

          const seenNames = new Set();
          const filterFn = (f: any) => {
            if (!f?.properties?.name) return false;
            if (!f?.geometry?.coordinates) return false;
            if (seenNames.has(f.properties.name)) return false;
            seenNames.add(f.properties.name);
            return true;
          };

          const sortFn = (a: any, b: any) => {
            const rankA = a.properties?.rank?.confidence || 0;
            const rankB = b.properties?.rank?.confidence || 0;
            if (rankA !== rankB) return rankB - rankA;
            return (a.properties?.name || "").localeCompare(b.properties?.name || "");
          };

          const tier = getCityTier(destination);
          const hotelBase = tier === 1 ? 2500 : tier === 2 ? 1800 : 1200;

          const fetchedAttractions = (sightsData?.features || [])
            .filter(filterFn)
            .sort(sortFn)
            .slice(0, 8)
            .map((f: any) => ({
              name: f.properties.name,
              price: 150, // Entry Variation handled in display normally, but here we set a base
              category: "sightseeing"
            }));

          const fetchedHotels = (hotelsData?.features || [])
            .filter(filterFn)
            .sort(sortFn)
            .slice(0, 5)
            .map((f: any, idx: number) => ({
              name: f.properties.name,
              price: hotelBase + (idx * 400),
              description: f.properties.address_line2 || "Comfortable Stay"
            }));

          const fetchedFood = (foodData?.features || [])
            .filter(filterFn)
            .sort(sortFn)
            .slice(0, 5)
            .map((f: any, idx: number) => {
              const cats = f.properties.categories || [];
              let base = 300;
              if (cats.includes('catering.cafe')) base = 200;
              else if (cats.includes('catering.fast_food')) base = 150;

              return {
                name: f.properties.name,
                price: base + (idx * 20),
                description: f.properties.categories?.slice(0, 2).join(", ") || "Dining"
              };
            });

          cityData = {
            hotels: fetchedHotels.length > 0 ? fetchedHotels : [{ name: "Budget Stay Hotel", price: hotelBase }],
            food: fetchedFood.length > 0 ? fetchedFood : [{ name: "Popular Local Restaurant", price: 300 }],
            attractions: fetchedAttractions
          };
        } catch (apiErr) {
          console.log("Geoapify Error", apiErr);
        }
      }

      // Final safety fallback — always ensure hotels, food, attractions exist
      if (!cityData) {
        cityData = { hotels: [], food: [], attractions: [] };
      }
      if (!cityData.hotels || cityData.hotels.length === 0) {
        cityData.hotels = [
          { name: "Budget Stay Hotel", price: 1200 },
          { name: "City Guest House", price: 1600 }
        ];
      }
      if (!cityData.food || cityData.food.length === 0) {
        cityData.food = [
          { name: "Popular Local Restaurant", price: 300 },
          { name: "City Cafe", price: 200 }
        ];
      }
      if (!cityData.attractions || cityData.attractions.length < 3) {
        cityData.attractions = [
          ...(cityData.attractions || []),
          { name: "City Center Park", price: 0, category: "sightseeing" },
          { name: "Local Museum", price: 50, category: "sightseeing" },
          { name: "Main City Landmark", price: 100, category: "sightseeing" }
        ].slice(0, 8);
      }

      const startDate = new Date();
      const itineraryData = generateItinerary(parsedDays, cityData.attractions, startDate);

      /* ---------- Transport Calculations (selected mode only) ---------- */
      const dist = Math.round(tripDistance);
      const sourceKey = normalizeCity(source);
      const destinationKey = normalizeCity(destination);

      // Fetch routes from DB for selected mode
      const routeDbEntry = ROUTE_DB[sourceKey]?.[destinationKey];
      const modeRoutes: RouteOption[] =
        (routeDbEntry?.[transportMode as keyof typeof ROUTE_DB[string][string]] as RouteOption[] | undefined) ?? [];

      // Build transport options: each item = one route with full cost breakdown
      const transportOptions: any[] = modeRoutes.map((r: RouteOption) => {
        const oneWay = r.costPerPerson;
        const roundTripPerPerson = oneWay * 2;
        const roundTripTotal = roundTripPerPerson * count;
        return {
          name: r.name,
          departure: r.departure,
          arrival: r.arrival,
          duration: r.duration,
          oneWayCost: oneWay,
          roundTripPerPerson,
          roundTripTotal,
          description: `${r.departure} → ${r.arrival} | ${r.duration}`,
          // estimatedCost = full round-trip for all travelers (included in budget)
          estimatedCost: roundTripTotal,
          category: "transport"
        };
      });

      // If no DB routes found, fall back to distance-based estimate for selected mode
      // ONLY if the route is entirely unknown in the database
      if (transportOptions.length === 0 && !routeDbEntry) {
        const oneWay = transportFareByMode(dist, transportMode);
        const roundTripPerPerson = oneWay * 2;
        const roundTripTotal = roundTripPerPerson * count;
        transportOptions.push({
          name: `${transportMode.charAt(0).toUpperCase() + transportMode.slice(1)} Travel`,
          departure: source,
          arrival: destination,
          duration: "Duration not available",
          oneWayCost: oneWay,
          roundTripPerPerson,
          roundTripTotal,
          description: `${source} → ${destination} | ~${dist} km`,
          estimatedCost: roundTripTotal,
          category: "transport"
        });
      }

      // Total Cost for Budget Check
      const minHotelCost = Math.min(...cityData.hotels.map((h: any) => h.price)) * parsedDays;
      const minFoodCost = Math.min(...cityData.food.map((f: any) => f.price)) * 3 * parsedDays * count;
      const minTransCost = transportOptions.length > 0 ? Math.min(...transportOptions.map((t: any) => t.estimatedCost)) : 0;
      const minSightCost = Math.min(...cityData.attractions.map((a: any) => a.price || 0)) * count;
      const minLocalCost = 150 * count * parsedDays;
      const minTotalCost = minHotelCost + minFoodCost + minTransCost + minSightCost + minLocalCost;

      if (parsedBudget < minTotalCost) {
        Alert.alert("Budget is Low", `This trip requires at least approx ₹${minTotalCost}. Your entered budget might be insufficient.`);
      }

      const realPlan: GeneratedPlan = {
        transport: transportOptions,
        accommodation: cityData.hotels.map((h: any) => ({
          name: h.name,
          description: "Verified Accommodation",
          estimatedCost: h.price * parsedDays,
          category: "accommodation"
        })),
        food: cityData.food.map((f: any) => ({
          name: f.name,
          description: `Meals (₹${f.price} base/meal)`,
          estimatedCost: f.price * 3 * parsedDays * count,
          category: "food"
        })),
        sightseeing: cityData.attractions.map((p: any) => {
          const isFree = p.price === 0;
          return {
            name: p.name,
            // Show "Free Entry" for attractions with no ticket price (price=0)
            description: isFree ? "Free Entry" : `Entry fee: ₹${p.price} per person`,
            // Free attractions cost 0; paid ones cost price × travelers
            estimatedCost: isFree ? 0 : p.price * count,
            category: "sightseeing"
          };
        }),
        localTravel: (() => {
          const budgetPerPersonPerDay = parsedBudget / (parsedDays * count);

          let dailyCost = 200; // Budget-friendly default
          if (budgetPerPersonPerDay < 1500) {
            dailyCost = 150; // simple budget travel
          } else if (budgetPerPersonPerDay > 2500) {
            dailyCost = 300; // comfortable travel
          }

          // Validation: never exceed ₹300 per person per day
          if (dailyCost > 300) {
            dailyCost = 300;
          } else if (dailyCost < 150) {
            dailyCost = 150;
          }

          return [{
            name: "Local Conveyance",
            description: "Local bus, Shared auto, Metro (if available)",
            estimatedCost: dailyCost * count * parsedDays,
            category: "transport"
          }];
        })(),
        destinationOverview: `${destination} trip for ${parsedDays} days. Source: ${source}. Distance: ${dist} km. Full dynamic itinerary generated.`,
        totalEstimated: totalEstimatedCost,
        itinerary: itineraryData
      };

      setGeneratedPlan(realPlan);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(realPlan));

      setSelectedRouteIndex(0);
      setSelectedHotelIndex(0);
      setSelectedFoodIndex(0);
      setSelectedSightIndex(0);

      Animated.timing(planFadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    } catch (err: any) {
      console.log("Planner Error:", err);
      Alert.alert("Error", "Could not generate a dynamic plan. Please try again.");
    }

    setIsGenerating(false);
  };

  const PlanSection = ({
    title,
    items,
    icon,
    sectionKey,
    selectedTransportCost
  }: {
    title: string;
    items: PlanItem[];
    icon: React.ReactNode;
    sectionKey: string;
    selectedTransportCost?: number;
  }) => {
    const isExpanded = expandedSection === sectionKey;

    let total = 0;

    if (sectionKey === "transport")
      total = items[safeRouteIndex]?.estimatedCost || 0;
    else if (sectionKey === "accommodation")
      total = items[safeHotelIndex]?.estimatedCost || 0;
    else if (sectionKey === "food")
      total = items[safeFoodIndex]?.estimatedCost || 0;
    else if (sectionKey === "sightseeing")
      total = items[safeSightIndex]?.estimatedCost || 0;
    else
      total = items.reduce((s, i) => s + (i?.estimatedCost || 0), 0);

    return (
      <View style={styles.planSection}>
        <TouchableOpacity
          style={styles.planSectionHeader}
          onPress={() => setExpandedSection(isExpanded ? null : sectionKey)}
          activeOpacity={0.7}
        >
          <View style={styles.planSectionLeft}>
            {icon}
            <Text style={styles.planSectionTitle}>{title}</Text>
          </View>
          <View style={styles.planSectionRight}>
            <Text style={styles.planSectionCost}>{formatCurrency(total)}</Text>
            <ChevronRight
              size={16}
              color={Colors.textSecondary}
              style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>
        {isExpanded && items.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.planItem,
              ((sectionKey === "transport" && i === selectedRouteIndex) ||
                (sectionKey === "accommodation" && i === selectedHotelIndex) ||
                (sectionKey === "food" && i === selectedFoodIndex) ||
                (sectionKey === "sightseeing" && i === selectedSightIndex))
                ? { backgroundColor: "#d0f0d0" }
                : null
            ]}
            onPress={() => {
              if (sectionKey === "transport") setSelectedRouteIndex(i);
              if (sectionKey === "accommodation") setSelectedHotelIndex(i);
              if (sectionKey === "food") setSelectedFoodIndex(i);
              if (sectionKey === "sightseeing") setSelectedSightIndex(i);
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.planItemName}>{item.name}</Text>
              <Text style={styles.planItemDesc}>{item.description}</Text>
            </View>
            <Text style={styles.planItemCost}>
              {formatCurrency(item.estimatedCost)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Sparkles size={24} color={Colors.accent} />
            </View>
            <Text style={styles.title}>Trip Planner</Text>
            <Text style={styles.subtitle}>Generate a smart plan based on your budget</Text>
          </View>



          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin size={18} color={Colors.primary} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="From where?"
                placeholderTextColor={Colors.textLight}
                value={source}
                onChangeText={setSource}
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin size={18} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Where to?"
                placeholderTextColor={Colors.textLight}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <View style={styles.inputIcon}>
                  <IndianRupee size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Budget (INR)"
                  placeholderTextColor={Colors.textLight}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <TextInput
                  style={[styles.input, { paddingLeft: 14 }]}
                  placeholder="Days"
                  placeholderTextColor={Colors.textLight}
                  value={days}
                  onChangeText={setDays}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Travelers</Text>
            <View style={styles.travelerGrid}>
              {travelerOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.travelerOption, travelerType === opt.value && styles.travelerOptionActive]}
                  onPress={() => {
                    setTravelerType(opt.value);
                    if (opt.value === 'solo') setTravelerCount('1');
                    else if (opt.value === 'couple') setTravelerCount('2');
                    else if (opt.value === 'family') setTravelerCount('4');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.travelerEmoji}>{opt.icon}</Text>
                  <Text style={[styles.travelerLabel, travelerType === opt.value && styles.travelerLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {travelerType === 'group' && (
              <View style={[styles.inputGroup, { marginBottom: 18 }]}>
                <View style={styles.inputIcon}>
                  <Users size={18} color={Colors.primary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="How many members in the group?"
                  placeholderTextColor={Colors.textLight}
                  value={travelerCount}
                  onChangeText={setTravelerCount}
                  keyboardType="numeric"
                />
              </View>
            )}

            <Text style={styles.fieldLabel}>Transport Mode</Text>
            <View style={styles.optionRow}>
              {['train', 'bus', 'flight', 'car']
                .filter(mode => {
                  const s = normalizeCity(source);
                  const d = normalizeCity(destination);
                  const dbEntry = ROUTE_DB[s]?.[d];
                  if (dbEntry) {
                    const arr = dbEntry[mode as keyof typeof dbEntry];
                    return Array.isArray(arr) && arr.length > 0;
                  }
                  return mode !== 'flight' || distance > 300;
                })
                .map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.optionBtn,
                      transportMode === mode && styles.optionBtnActive
                    ]}
                    onPress={() => setTransportMode(mode as any)}
                  >
                    <Text style={styles.optionText}>{mode}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
              style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={!canGenerate || isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Sparkles size={18} color={Colors.white} />
                  <Text style={styles.generateBtnText}>Generate Plan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {generatedPlan && (
            <Animated.View style={[styles.planContainer, { opacity: planFadeAnim }]}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Your Trip Plan ({travelerCount} {parseInt(travelerCount) === 1 ? 'Person' : 'People'})</Text>

                <View style={styles.planBudgetRow}>
                  <Text style={styles.planEstimate}>Group Total</Text>

                  <Text style={styles.planTotal}>
                    {formatCurrency(
                      liveTotal
                    )}
                  </Text>
                </View>

                <View style={[styles.planBudgetRow, { marginTop: -5, marginBottom: 12 }]}>
                  <Text style={[styles.planEstimate, { fontSize: 13 }]}>Per Person</Text>
                  <Text style={[styles.planTotal, { fontSize: 16, color: Colors.textSecondary }]}>
                    {formatCurrency(liveTotal / (parseInt(travelerCount) || 1))}
                  </Text>
                </View>


                {generatedPlan.destinationOverview && (
                  <View style={styles.overviewContainer}>
                    <Text style={styles.overviewText}>{generatedPlan.destinationOverview}</Text>
                  </View>
                )}
              </View>
              <View style={{ marginTop: 18 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                  {transportMode.charAt(0).toUpperCase() + transportMode.slice(1)} Routes
                </Text>
                <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 12 }}>
                  Showing only {transportMode} options · Tap a route to select
                </Text>

                {generatedPlan.transport.length === 0 ? (
                  <View style={styles.noRouteCard}>
                    <Text style={styles.noRouteText}>
                      No {transportMode} routes found for this journey.
                      Try a different transport mode.
                    </Text>
                  </View>
                ) : (
                  generatedPlan.transport.map((route: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedRouteIndex(index)}
                      style={[
                        styles.routeCard,
                        selectedRouteIndex === index && styles.routeCardActive
                      ]}
                    >
                      {/* Route header */}
                      <View style={styles.routeCardHeader}>
                        <Text style={styles.routeCardName}>{route.name}</Text>
                        {selectedRouteIndex === index && (
                          <View style={styles.routeSelectedBadge}>
                            <Text style={styles.routeSelectedBadgeText}>Selected</Text>
                          </View>
                        )}
                      </View>

                      {/* Departure → Arrival */}
                      <Text style={styles.routeJourney}>
                        📍 {route.departure} → {route.arrival}
                      </Text>

                      {/* Duration */}
                      <Text style={styles.routeDuration}>🕐 {route.duration}</Text>

                      {/* Cost Breakdown */}
                      <View style={styles.routeCostBreakdown}>
                        <View style={styles.routeCostRow}>
                          <Text style={styles.routeCostLabel}>One-way per person</Text>
                          <Text style={styles.routeCostValue}>₹{route.oneWayCost}</Text>
                        </View>
                        <View style={styles.routeCostRow}>
                          <Text style={styles.routeCostLabel}>Round-trip per person</Text>
                          <Text style={styles.routeCostValue}>₹{route.roundTripPerPerson}</Text>
                        </View>
                        <View style={[styles.routeCostRow, styles.routeCostTotalRow]}>
                          <Text style={styles.routeCostTotalLabel}>
                            Total for {travelerCount} traveler{parseInt(travelerCount) !== 1 ? 's' : ''}
                          </Text>
                          <Text style={styles.routeCostTotalValue}>₹{route.roundTripTotal}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
              <PlanSection title="Transportation" items={generatedPlan.transport} icon={<Train size={18} color={Colors.categories.transport} />} sectionKey="transport" selectedTransportCost={selectedTransportCost} />
              <PlanSection title="Accommodation" items={generatedPlan.accommodation} icon={<Bed size={18} color={Colors.categories.accommodation} />} sectionKey="accommodation" />
              <PlanSection title="Food & Dining" items={generatedPlan.food} icon={<UtensilsCrossed size={18} color={Colors.categories.food} />} sectionKey="food" />
              <PlanSection title="Sightseeing" items={generatedPlan.sightseeing} icon={<Camera size={18} color={Colors.categories.sightseeing} />} sectionKey="sightseeing" />
              <PlanSection title="Local Travel" items={generatedPlan.localTravel} icon={<Bus size={18} color={Colors.categories.transport} />} sectionKey="local" />

              <View style={styles.itinerarySection}>
                <Text style={styles.itinerarySectionTitle}>Day-by-Day Itinerary</Text>
                {generatedPlan.itinerary.map((day: any, index: number) => (
                  <View key={day.date} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <View style={styles.dayBadge}>
                        <Text style={styles.dayBadgeText}>Day {index + 1}</Text>
                      </View>
                    </View>
                    {day.items.map((item: any) => (
                      <View key={item.id} style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                          <Text style={styles.timelineTime}>{item.time}</Text>
                          <Text style={styles.timelineTitle}>{item.title}</Text>
                          <Text style={styles.timelineDesc}>{item.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#4CAF50",
                  padding: 16,
                  borderRadius: 12,
                  marginTop: 20,
                  alignItems: "center"
                }}
                onPress={async () => {
                  if (!generatedPlan) return;
                  const parsedBudget = parseFloat(budget);
                  const parsedDays = parseInt(days, 10);
                  const startDate = new Date();

                  const imageUrl = await getDestinationImage(destination);

                  addTrip({
                    title: destination,
                    destination: destination,
                    country: 'India',
                    imageUrl: imageUrl,
                    startDate: startDate.toISOString(),
                    endDate: new Date(startDate.getTime() + parsedDays * 86400000).toISOString(),
                    budget: parsedBudget,
                    currency: 'INR',
                    travelerType: travelerType,
                    travelerCount: parseInt(travelerCount, 10) || 1,
                    status: 'planning',
                    itinerary: generatedPlan.itinerary,
                  });

                  // Navigate to Trips Tab
                  router.push("/trips");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Add To My Trips
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 14,

    paddingLeft: 5,
    paddingRight: 10,
    fontSize: 15,
    color: Colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
    marginTop: 4,
  },
  travelerGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  travelerOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  travelerOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  travelerEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  travelerLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  travelerLabelActive: {
    color: Colors.primary,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  planContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  planHeader: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  planBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planEstimate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planTotal: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  budgetCompare: {
    gap: 6,
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  budgetLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  planSection: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 8,
    overflow: 'hidden',
  },
  planSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  planSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planSectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  planSectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planSectionCost: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  planItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    paddingLeft: 2,
    flexShrink: 1,
  },
  planItemCost: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  itinerarySection: {
    marginTop: 16,
  },
  itinerarySectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  dayCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  dayHeader: {
    marginBottom: 10,
  },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dayBadgeText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  timelineDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },

  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  optionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },

  optionBtnActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },

  optionText: {
    color: '#333',
    fontWeight: '600',
  },

  // ── Route Card Styles ──────────────────────────────────────────────────
  routeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  routeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#eaf4ff',
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  routeCardName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
    flex: 1,
  },
  routeSelectedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  routeSelectedBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  routeJourney: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  routeDuration: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  routeCostBreakdown: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  routeCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeCostLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  routeCostValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  routeCostTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 6,
    marginTop: 4,
  },
  routeCostTotalLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  routeCostTotalValue: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.primary,
  },
  noRouteCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  noRouteText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center' as const,
  },



  overviewContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});




