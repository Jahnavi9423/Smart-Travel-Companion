import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  "All",
  "Beaches",
  "Mountains",
  "Cities",
  "Pilgrimage",
];

const destinations = [
  {
    id: "1",
    name: "Maldives",
    category: "Beaches",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  },
  {
    id: "2",
    name: "Manali",
    category: "Mountains",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  },
  {
    id: "3",
    name: "Tokyo",
    category: "Cities",
    image:
      "https://images.unsplash.com/photo-1549693578-d683be217e58",
  },
  {
    id: "4",
    name: "Varanasi",
    category: "Pilgrimage",
    image:
      "https://images.unsplash.com/photo-1561361058-c24cecae35ca",
  },
];

export default function ExploreScreen() {
  const [selected, setSelected] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = destinations.filter(d => {
    const matchCat =
      selected === "All" || d.category === selected;

    const matchSearch = d.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCat && matchSearch;
  });

  const openMaps = async (place: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const { user } = useAuth();
  const [weather, setWeather] = useState<{ temp: number; condition: string; city: string; emoji: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 1500, useNativeDriver: true }), // pause
      ])
    ).start();

    (async () => {
      let city = "London";
      let lat = 51.5074;
      let lon = -0.1278;

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;

          const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          if (geocode?.[0]?.city) {
            city = geocode[0].city;
          } else if (geocode?.[0]?.region) {
            city = geocode[0].region;
          }
        }
      } catch (err) {
        console.warn("Location error:", err);
      }

      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        if (data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode;
          let emoji = "❄";
          if (temp >= 30) emoji = "🔥";
          else if (temp >= 20) emoji = "🌤";
          else if (temp >= 10) emoji = "🌥";

          let conditionStr = "Clear";
          if ([1, 2, 3].includes(code)) conditionStr = "Cloudy";
          else if ([45, 48].includes(code)) conditionStr = "Fog";
          else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) conditionStr = "Rainy";
          else if ([71, 73, 75, 85, 86].includes(code)) conditionStr = "Snow";
          else if ([95, 96, 99].includes(code)) conditionStr = "Storm";

          setWeather({ temp, condition: conditionStr, city, emoji });
        }
      } catch (error) {
        console.warn("Weather API error:", error);
      } finally {
        setLoadingWeather(false);
      }
    })();
  }, [fadeAnim, waveAnim]);

  const waveStyle = {
    transform: [
      {
        rotate: waveAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ["-15deg", "0deg", "15deg"],
        })
      }
    ]
  };

  const hour = new Date().getHours();
  let greetingStr = "Good Morning ☀";
  let gradientColors = ["#87CEEB", "#E0F6FF"];
  let isDark = false;

  if (hour >= 5 && hour < 12) {
    greetingStr = "Good Morning ☀";
    gradientColors = ["#87CEEB", "#E0F6FF"]; // Light blue
  } else if (hour >= 12 && hour < 17) {
    greetingStr = "Good Afternoon 🌤";
    gradientColors = ["#FFDAB9", "#FFE4B5"]; // Peach
  } else if (hour >= 17 && hour < 21) {
    greetingStr = "Good Evening 🌇";
    gradientColors = ["#9370DB", "#FFB6C1"]; // Purple / pink
    isDark = true;
  } else {
    greetingStr = "Good Night 🌙";
    gradientColors = ["#0B1021", "#1B2A47"]; // Night
    isDark = true;
  }

  const textColor = isDark ? "#FFFFFF" : "#1A1A1A";
  const chipBg = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)";
  const chipTextCol = isDark ? "#FFFFFF" : "#333333";

  return (
    <LinearGradient colors={gradientColors} style={styles.bg}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* GREETING SECTION */}
        <View style={styles.header}>
          <View style={styles.greetingRow}>
            <Text style={[styles.nameText, { color: textColor }]}>Hi {user?.name || "Traveler"}</Text>
            <Animated.Text style={[styles.waveText, waveStyle]}>👋</Animated.Text>
          </View>
          <Text style={[styles.greetingText, { color: textColor }]}>{greetingStr}</Text>
        </View>

        {/* WEATHER SECTION */}
        {!loadingWeather && weather && (
          <View style={[styles.weatherCard, isDark && styles.weatherCardDark]}>
            <Text style={[styles.weatherTitle, isDark && styles.weatherTitleDark]}>Weather in {weather.city} 📍</Text>
            <View style={styles.weatherInfo}>
              <Text style={[styles.weatherTemp, isDark && styles.weatherTempDark]}>{weather.temp}°C {weather.emoji}</Text>
              <Text style={[styles.weatherCond, isDark && styles.weatherCondDark]}>{weather.condition}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.title, { color: textColor }]}>Explore</Text>

        {/* SEARCH */}
        <TextInput
          placeholder="Search any place..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => openMaps(search)}
        />

        {/* CATEGORIES */}
        <View style={styles.row}>

          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelected(item)}
                style={[
                  styles.chip,
                  { backgroundColor: chipBg },
                  selected === item && styles.activeChip,
                ]}
              >
                <Text style={[styles.chipText, { color: selected === item ? "white" : chipTextCol }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, isDark && styles.cardDark]}
              onPress={() => openMaps(item.name)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    flex: 1,
    padding: 16,
    paddingTop: 30, // For the notch
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 12,
  },

  search: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 12,
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    marginBottom: 14,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  activeChip: {
    backgroundColor: "#1DBF73",
  },

  chipText: { fontWeight: "600" },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    marginBottom: 16,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 170,
  },

  cardTitle: {
    padding: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  cardTitleDark: {
    color: "#FFF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardDark: {
    backgroundColor: "#1F2937",
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "600",
  },
  waveText: {
    fontSize: 22,
    marginLeft: 8,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 2,
  },
  weatherCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  weatherCardDark: {
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  weatherTitleDark: {
    color: "#DDD",
  },
  weatherInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weatherTemp: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111",
  },
  weatherTempDark: {
    color: "#FFF",
  },
  weatherCond: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  weatherCondDark: {
    color: "#CCC",
  },
});