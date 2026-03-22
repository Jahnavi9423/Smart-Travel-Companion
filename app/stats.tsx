import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTrips } from "@/contexts/TripContext";
import { useTheme } from "@/contexts/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { useRouter } from "expo-router";
import { useMemo } from "react";

export default function Stats() {
  const { trips } = useTrips();
  const { colors } = useTheme();
  const router = useRouter();
  const now = new Date();

  const travelStats = useMemo(() => {
    const sorted = [...trips].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    const upcoming = sorted.filter(t => new Date(t.startDate) > now);
    const ongoing = sorted.filter(t => {
      const start = new Date(t.startDate);
      const end = new Date(t.endDate);
      return start <= now && now <= end;
    });
    const completed = sorted.filter(t => new Date(t.endDate) < now);

    return {
      total: trips.length,
      allNames: trips.map(t => t.title),
      upcoming,
      ongoing,
      completed,
    };
  }, [trips]);

  const StatSection = ({ title, icon, count, tripsList, color }: { title: string, icon: any, count: number, tripsList: any[], color: string }) => (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.sectionCount, { color: color }]}>{count} {count === 1 ? 'Trip' : 'Trips'}</Text>
        </View>
      </View>

      {tripsList.length > 0 ? (
        <View style={styles.tripList}>
          {tripsList.map((t, i) => (
            <View key={t.id || i} style={styles.tripItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.tripName, { color: colors.textSecondary }]}>{t.title || t}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: colors.textLight }]}>No trips in this category</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Travel Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <StatSection
          title="Total Trips"
          icon={<MapPin size={20} color={colors.primary} />}
          count={travelStats.total}
          tripsList={travelStats.allNames}
          color={colors.primary}
        />

        <StatSection
          title="Upcoming Trips"
          icon={<Calendar size={20} color={colors.accent} />}
          count={travelStats.upcoming.length}
          tripsList={travelStats.upcoming}
          color={colors.accent}
        />

        <StatSection
          title="Ongoing Trips"
          icon={<Clock size={20} color="#3B82F6" />}
          count={travelStats.ongoing.length}
          tripsList={travelStats.ongoing}
          color="#3B82F6"
        />

        <StatSection
          title="Completed Trips"
          icon={<CheckCircle size={20} color={colors.success} />}
          count={travelStats.completed.length}
          tripsList={travelStats.completed}
          color={colors.success}
        />
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
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  tripList: {
    marginTop: 8,
    paddingLeft: 4,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tripName: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  }
});
