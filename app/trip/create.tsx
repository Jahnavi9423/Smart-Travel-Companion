import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { MapPin, Calendar as CalendarIcon, IndianRupee, Users, Check } from 'lucide-react-native';
import { Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Colors from '@/constants/colors';
import { useTrips } from '@/contexts/TripContext';
import { TravelerType, TripStatus } from '@/types/trip';
import { defaultTripImages } from '@/mocks/destinations';
import { PLACES } from "../data/places";
import { getDestinationImage } from '@/utils/imageFetcher';
const travelerOptions: { value: TravelerType; label: string; emoji: string }[] = [
  { value: 'solo', label: 'Solo', emoji: '🧳' },
  { value: 'couple', label: 'Couple', emoji: '💑' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'group', label: 'Group', emoji: '👥' },
];

const statusOptions: { value: TripStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export default function CreateTripScreen() {
  const router = useRouter();
  const { addTrip } = useTrips();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');
  const [budget, setBudget] = useState('');
  const [travelerType, setTravelerType] = useState<TravelerType>('solo');
  const [travelerCount, setTravelerCount] = useState('1');
  const [status, setStatus] = useState<TripStatus>('planning');

  const handleCreate = async () => {
    if (!title || !destination || !country || !startDate || !endDate || !budget) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    const startParsed = new Date(startDate);
    const endParsed = new Date(endDate);
    if (isNaN(startParsed.getTime()) || isNaN(endParsed.getTime())) {
      Alert.alert('Invalid Date', 'Please use format YYYY-MM-DD for dates.');
      return;
    }
    if (endParsed < startParsed) {
      Alert.alert('Invalid Date Range', 'End date must be on or after start date.');
      return;
    }

    const parsedBudget = parseFloat(budget);
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid budget greater than 0.');
      return;
    }

    const parsedTravelerCount = parseInt(travelerCount, 10);
    if (!Number.isFinite(parsedTravelerCount) || parsedTravelerCount <= 0) {
      Alert.alert('Invalid Travelers', 'Number of travelers must be at least 1.');
      return;
    }

    const normalizeCity = (city: string): string => {
      const lowerCity = city.toLowerCase().trim();
      if (lowerCity === 'vizag' || lowerCity === 'visakh') return 'visakhapatnam';
      if (lowerCity === 'vzm') return 'vizianagaram';
      if (lowerCity === 'araku') return 'araku valley';
      return lowerCity;
    };

    const normalizedDest = normalizeCity(destination);

    const predefinedDestinations: Record<string, { image: string, places: string[] }> = {
      'vizianagaram': {
        image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80',
        places: ['Ramanarayanam', 'Vizianagaram Fort', 'Thatipudi Reservoir', 'Kumili', 'Bobbili Fort']
      },
      'visakhapatnam': {
        image: 'https://images.unsplash.com/photo-1622308644420-a7ec3625f3c1?w=800&q=80',
        places: ['RK Beach', 'Kailasagiri', 'Submarine Museum', 'Rushikonda Beach', 'Dolphin\'s Nose']
      },
      'araku valley': {
        image: 'https://images.unsplash.com/photo-1598974646549-14a0f4435ac5?w=800&q=80',
        places: ['Borra Caves', 'Araku Tribal Museum', 'Coffee Museum', 'Padmapuram Gardens', 'Katiki Waterfalls']
      }
    };

    let imageUrl = await getDestinationImage(destination);
    let places = ["Explore Local Area", "Visit Popular Spots", "Try Local Food"];

    if (predefinedDestinations[normalizedDest]) {
      places = predefinedDestinations[normalizedDest].places;
    }


    const times = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"];
    const defaultItinerary = [{
      date: startParsed.toISOString(),
      items: places.map((place, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        time: times[index] || "10:00 AM",
        title: place,
        description: "Must visit place in " + (normalizedDest || destination),
      }))
    }];

    addTrip({
      title,
      destination,
      country,
      imageUrl,
      startDate: startParsed.toISOString(),
      endDate: endParsed.toISOString(),
      budget: parsedBudget,
      currency: 'INR',
      travelerType,
      travelerCount: parsedTravelerCount,
      status,
      itinerary: defaultItinerary,
    });

    router.back();
  };



  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Trip',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Trip Name *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Goa Beach Trip"
                placeholderTextColor={Colors.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.label}>Destination *</Text>
            <View style={styles.inputContainer}>
              <MapPin size={16} color={Colors.primary} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="e.g. Goa"
                placeholderTextColor={Colors.textLight}
                value={destination}
                onChangeText={setDestination}
              />
            </View>

            <Text style={styles.label}>Country *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. India"
                placeholderTextColor={Colors.textLight}
                value={country}
                onChangeText={setCountry}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Start Date *</Text>
                <TouchableOpacity onPress={() => { setCalendarTarget('start'); setShowCalendar(true); }} activeOpacity={0.8}>
                  <View style={styles.inputContainer}>
                    <CalendarIcon size={16} color={Colors.primary} />
                    <Text style={[styles.inputWithIcon, { paddingVertical: 13 }]}>{startDate || 'YYYY-MM-DD'}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>End Date *</Text>
                <TouchableOpacity onPress={() => { setCalendarTarget('end'); setShowCalendar(true); }} activeOpacity={0.8}>
                  <View style={styles.inputContainer}>
                    <CalendarIcon size={16} color={Colors.primary} />
                    <Text style={[styles.inputWithIcon, { paddingVertical: 13 }]}>{endDate || 'YYYY-MM-DD'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <Modal visible={showCalendar} transparent animationType="slide">
              <View style={styles.modalBackdrop}>
                <View style={styles.modalCard}>
                  <Calendar
                    onDayPress={(day) => {
                      const date = day.dateString;
                      if (calendarTarget === 'start') {
                        setStartDate(date);
                        if (endDate && new Date(date) > new Date(endDate)) {
                          setEndDate(date);
                        }
                      } else {
                        if (startDate && new Date(date) < new Date(startDate)) {
                          Alert.alert('Invalid Date', 'End date cannot be before start date.');
                          setEndDate(startDate);
                        } else {
                          setEndDate(date);
                        }
                      }
                      setShowCalendar(false);
                    }}
                    markedDates={{
                      ...(startDate ? { [startDate]: { selected: true, selectedColor: Colors.primary } } : {}),
                      ...(endDate ? { [endDate]: { selected: true, selectedColor: Colors.primary } } : {}),
                    }}
                  />
                  <TouchableOpacity style={styles.modalClose} onPress={() => setShowCalendar(false)}>
                    <Text style={{ color: Colors.primary, fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>Budget (INR) *</Text>
            <View style={styles.inputContainer}>
              <IndianRupee size={16} color={Colors.primary} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="e.g. 25000"
                placeholderTextColor={Colors.textLight}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>Travelers</Text>
            <View style={styles.travelerGrid}>
              {travelerOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.travelerOption, travelerType === opt.value && styles.travelerActive]}
                  onPress={() => setTravelerType(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.travelerEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.travelerLabel, travelerType === opt.value && styles.travelerLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Number of Travelers</Text>
            <View style={styles.inputContainer}>
              <Users size={16} color={Colors.primary} />
              <TextInput
                style={styles.inputWithIcon}
                placeholder="1"
                placeholderTextColor={Colors.textLight}
                value={travelerCount}
                onChangeText={setTravelerCount}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusRow}>
              {statusOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.statusOption, status === opt.value && styles.statusActive]}
                  onPress={() => setStatus(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statusLabel, status === opt.value && styles.statusLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
            <Check size={20} color={Colors.white} />
            <Text style={styles.createBtnText}>Create Trip</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  travelerGrid: {
    flexDirection: 'row',
    gap: 8,
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
  travelerActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  travelerEmoji: {
    fontSize: 18,
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
  statusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  statusLabelActive: {
    color: Colors.primary,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '92%',
    borderRadius: 12,
    backgroundColor: Colors.white,
    padding: 12,
  },
  modalClose: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

