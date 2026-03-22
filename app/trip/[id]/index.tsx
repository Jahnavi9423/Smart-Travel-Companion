import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MapPin, Calendar, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import WeatherCard from '@/components/WeatherCard';
import ImageGallery from '@/components/ImageGallery';
import { useTrips } from '@/contexts/TripContext';
import { formatDate, getDaysBetween, formatCurrency } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { isGenericImage, getDestinationImage } from '@/utils/imageFetcher';

export default function TripOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTripById, updateTrip } = useTrips();
  const trip = getTripById(id ?? '');
  const [heroImage, setHeroImage] = useState(trip?.imageUrl || '');

  const days = useMemo(() => trip ? getDaysBetween(trip.startDate, trip.endDate) : 0, [trip]);

  useEffect(() => {
    if (trip) {
      setHeroImage(trip.imageUrl);
      
      // Auto-fix if the trip is currently using a generic placeholder
      if (isGenericImage(trip.imageUrl)) {
        const fixImage = async () => {
          const newImg = await getDestinationImage(trip.destination);
          if (newImg && newImg !== trip.imageUrl) {
            setHeroImage(newImg);
            updateTrip(trip.id, { imageUrl: newImg });
          }
        };
        fixImage();
      }
    }
  }, [trip?.id, trip?.imageUrl]);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Trip Not Found', headerTintColor: Colors.text }} />
        <View style={styles.notFound}><Text style={{ color: Colors.textSecondary }}>Trip not found</Text></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTintColor: Colors.text,
          headerStyle: { backgroundColor: Colors.white },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.heroContainer}>
        <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent} pointerEvents="box-none">
          <View style={styles.weatherTop}>
            <WeatherCard
              city={`${trip.destination}, ${trip.country}`}
              startDate={trip.startDate}
              endDate={trip.endDate}
            />
          </View>
          <Text style={styles.heroTitle}>{trip.title}</Text>
          <View style={styles.heroMeta}>
            <MapPin size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroMetaText}>{trip.destination}, {trip.country}</Text>
          </View>
          <View style={styles.heroMeta}>
            <Calendar size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroMetaText}>{formatDate(trip.startDate)} — {formatDate(trip.endDate)} • {days} days</Text>
          </View>
        </View>
      </View>

      <ImageGallery city={`${trip.destination}, ${trip.country}`} />


      <View style={styles.budgetCard}>
        <View style={styles.budgetHeader}>
          <Text style={styles.budgetTitle}>Budget</Text>
          <TouchableOpacity onPress={() => router.push(`/trip/${trip.id}/details`)} style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>Details</Text>
            <ChevronDown size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.budgetNumbers}>
          <View>
            <Text style={styles.budgetSpent}>{formatCurrency(trip.expenses.reduce((s: any, e: any) => s + e.amount, 0))}</Text>
            <Text style={styles.budgetLabel}>spent</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View>
            <Text style={styles.budgetTotal}>{formatCurrency(trip.budget)}</Text>
            <Text style={styles.budgetLabel}>budget</Text>
          </View>
          <View style={styles.budgetDivider} />
          <View>
            <Text style={[styles.budgetRemaining, { color: trip.budget - trip.expenses.reduce((s: any, e: any) => s + e.amount, 0) >= 0 ? Colors.success : Colors.danger }]}>
              {formatCurrency(Math.abs(trip.budget - trip.expenses.reduce((s: any, e: any) => s + e.amount, 0)))}
            </Text>
            <Text style={styles.budgetLabel}>{trip.budget - trip.expenses.reduce((s: any, e: any) => s + e.amount, 0) >= 0 ? 'remaining' : 'over'}</Text>
          </View>
        </View>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  heroContainer: { height: 260, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  weatherTop: { marginBottom: 10 },
  heroTitle: { fontSize: 26, fontWeight: '800' as const, color: Colors.white, marginBottom: 6 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  heroMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  budgetCard: { backgroundColor: Colors.white, marginHorizontal: 20, marginTop: 18, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  budgetTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text },
  detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailsBtnText: { color: Colors.textSecondary, fontWeight: '600' as const },
  budgetNumbers: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  budgetSpent: { fontSize: 20, fontWeight: '800' as const, color: Colors.text },
  budgetTotal: { fontSize: 20, fontWeight: '800' as const, color: Colors.textSecondary },
  budgetRemaining: { fontSize: 20, fontWeight: '800' as const },
  budgetLabel: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 2 },
  budgetDivider: { width: 1, height: 30, backgroundColor: Colors.borderLight },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 9999,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
