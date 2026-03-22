import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Moon, ChevronLeft } from 'lucide-react-native';
import { useRouter } from "expo-router";
import { useTrips } from "@/contexts/TripContext";
import { refreshAllNotifications } from "@/utils/notifications";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function Preferences() {
  const { theme, colors, toggleTheme, isDarkMode } = useTheme();
  const { trips } = useTrips();
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadPreferences = async () => {
      const savedNotifs = await AsyncStorage.getItem('user_notifications_enabled');
      if (savedNotifs !== null) {
        setNotifications(savedNotifs === 'true');
      }
    };
    loadPreferences();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    setNotifications(value);
    await AsyncStorage.setItem('user_notifications_enabled', value ? 'true' : 'false');
    refreshAllNotifications(trips);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Travel Preferences</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Receive trip alerts and updates</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={notifications ? colors.white : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.row}>
            <View style={styles.labelRow}>
              <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                <Moon size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Switch to a darker theme</Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={isDarkMode ? colors.white : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backBtn: {
    marginRight: 15,
  },
  title: { fontSize: 22, fontWeight: "bold" },
  content: { padding: 20 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  subLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  }
});
