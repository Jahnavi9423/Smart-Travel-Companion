import React, { useState, useRef, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { Plus, MapPin, Calendar, DollarSign, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTrips } from '@/contexts/TripContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDate, formatCurrency, getDaysBetween, getStatusColor, getBudgetPercentage, getTripStatus } from '@/utils/helpers';

export default function TripsScreen() {
  const router = useRouter();
  const { trips, deleteTrip } = useTrips();
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Trip', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTrip(id) },
    ]);
  };

  const activeTrips = trips.filter((t: any) => {
    const status = getTripStatus(t.startDate, t.endDate);
    return status === 'active' || status === 'planning';
  });
  const completedTrips = trips.filter((t: any) => {
    const status = getTripStatus(t.startDate, t.endDate);
    return status === 'completed';
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{trips.length} trip{trips.length !== 1 ? 's' : ''} total</Text>
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/trip/create' as never)}
              activeOpacity={0.8}
            >
              <Plus size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {trips.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={48} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>No trips yet</Text>
                <Text style={styles.emptySubtitle}>Start planning your next adventure!</Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/trip/create' as never)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyButtonText}>Create Trip</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {activeTrips.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Upcoming & Active</Text>
                    {activeTrips.map((trip: any) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        colors={colors}
                        onPress={() => router.push(`/trip/${trip.id}` as never)}
                        onDelete={() => handleDelete(trip.id, trip.title)}
                      />
                    ))}
                  </>
                )}
                {completedTrips.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Completed</Text>
                    {completedTrips.map((trip: any) => (
                      <TripCard
                        key={trip.id}
                        trip={trip}
                        colors={colors}
                        onPress={() => router.push(`/trip/${trip.id}` as never)}
                        onDelete={() => handleDelete(trip.id, trip.title)}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

interface TripCardProps {
  trip: any;
  colors: any;
  onPress: () => void;
  onDelete: () => void;
}

function TripCard({ trip, colors, onPress, onDelete }: TripCardProps) {
  const totalSpent = trip.expenses.reduce((s: number, e: any) => s + e.amount, 0);
  const budgetPct = getBudgetPercentage(totalSpent, trip.budget);
  const currentStatus = getTripStatus(trip.startDate, trip.endDate);
  const days = getDaysBetween(trip.startDate, trip.endDate);

  return (
    <TouchableOpacity style={[styles.tripCard, { backgroundColor: colors.card }]} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: trip.imageUrl }} style={styles.tripImage} contentFit="cover" />
      <View style={styles.tripOverlay}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
          <Text style={styles.statusText}>{currentStatus}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Trash2 size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.tripInfo}>
        <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <MapPin size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{trip.destination}, {trip.country}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{days} day{days !== 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.budgetRow}>
          <View style={styles.budgetInfo}>
            <DollarSign size={13} color={colors.primary} />
            <Text style={[styles.budgetText, { color: colors.text }]}>{formatCurrency(totalSpent)} / {formatCurrency(trip.budget)}</Text>
          </View>
          <View style={[styles.budgetBarBg, { backgroundColor: colors.borderLight }]}>
            <View
              style={[
                styles.budgetBarFill,
                {
                  width: `${Math.min(budgetPct, 100)}%` as const,
                  backgroundColor: budgetPct > 90 ? colors.danger : budgetPct > 70 ? colors.warning : colors.primary,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    marginTop: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  emptyButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  tripCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tripImage: {
    width: '100%',
    height: 150,
  },
  tripOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: Colors.white,
    textTransform: 'capitalize' as const,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripInfo: {
    padding: 14,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  budgetRow: {
    marginTop: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  budgetBarBg: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
