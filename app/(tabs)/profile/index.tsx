import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, MapPin, Calendar, DollarSign, FileText, TrendingUp, Settings, ChevronRight, LogOut, Shield, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTrips } from '@/contexts/TripContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatCurrency, getTripStatus } from '@/utils/helpers';
import { useRouter, useNavigation } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { trips } = useTrips();
  const { user, setUser } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const totalExpenses = trips.reduce((sum: number, t: any) => sum + t.expenses.reduce((s: number, e: any) => s + e.amount, 0), 0);
    const totalNotes = trips.reduce((sum: number, t: any) => sum + t.notes.length, 0);
    const completedTrips = trips.filter((t: any) => getTripStatus(t.startDate, t.endDate) === 'completed').length;
    const countries = new Set(trips.map((t: any) => t.country)).size;
    return { totalTrips, totalExpenses, totalNotes, completedTrips, countries };
  }, [trips]);

  async function handleLogout() {
    try {
      // clear stored session ONLY, do not clear registered users
      await AsyncStorage.removeItem('userSession');

      // reset auth state
      setUser?.(null);

      // reset navigation
      navigation.reset({
        index: 0,
        routes: [{ name: "login" as never }]
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? 'T';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.ScrollView style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'Traveler'}</Text>
            <View style={styles.emailRow}>
              <Mail size={13} color={colors.textSecondary} />
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email ?? ''}</Text>
            </View>
            <View style={[styles.privacyBadge, { backgroundColor: colors.primaryLight }]}>
              <Shield size={12} color={colors.primary} />
              <Text style={[styles.privacyText, { color: colors.primary }]}>Your data is private & secure</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[
              { label: 'Trips', value: stats.totalTrips.toString(), icon: <MapPin size={18} color={colors.primary} />, bg: colors.primaryLight },
              { label: 'Countries', value: stats.countries.toString(), icon: <TrendingUp size={18} color={colors.accent} />, bg: colors.accentLight },
              { label: 'Completed', value: stats.completedTrips.toString(), icon: <Calendar size={18} color={colors.success} />, bg: '#ECFDF5' },
              { label: 'Spent', value: formatCurrency(stats.totalExpenses), icon: <DollarSign size={18} color={colors.warning} />, bg: '#FEF3C7' },
            ].map((stat, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                {stat.icon}
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {trips.length === 0 ? (
              <View style={[styles.emptyActivity, { backgroundColor: colors.card }]}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No trips yet. Start exploring!</Text>
              </View>
            ) : (
              trips.slice(0, 5).map((trip: any) => (
                <View key={trip.id} style={styles.activityItem}>
                  <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
                  <View style={styles.activityContent}>
                    <Text style={[styles.activityTitle, { color: colors.text }]}>{trip.title}</Text>
                    <Text style={[styles.activityMeta, { color: colors.textSecondary }]}>{trip.destination}, {trip.country} • {getTripStatus(trip.startDate, trip.endDate)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>

            {[
              { label: 'Travel Preferences', route: "/preferences", icon: <Settings size={18} color={colors.textSecondary} /> },
              { label: 'Export Trip Data', route: "/export", icon: <FileText size={18} color={colors.textSecondary} /> },
              { label: 'Travel Statistics', route: "/stats", icon: <TrendingUp size={18} color={colors.textSecondary} /> },
            ].map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.actionItem, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
                onPress={() => router.push(action.route as any)}
              >
                {action.icon}
                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                <ChevronRight size={16} color={colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#2D1515' : '#FEF2F2', borderColor: isDarkMode ? '#5B2121' : '#FECACA' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
              testID="logout-btn"
            >
              <LogOut size={18} color={colors.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            <Text style={[styles.versionText, { color: colors.textLight }]}>Travel Companion v1.0</Text>
          </View>
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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  emptyActivity: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  activityMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize' as const,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.danger,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 16,
  },
});
