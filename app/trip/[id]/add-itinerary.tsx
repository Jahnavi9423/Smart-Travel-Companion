import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTrips } from '@/contexts/TripContext';
import { generateId } from '@/utils/helpers';
import { Calendar } from 'react-native-calendars';
import { useSnackbar } from '@/components/Snackbar';

export default function AddItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getTripById, setItinerary } = useTrips();
  const trip = getTripById(id ?? '');
  const snackbar = useSnackbar();

  const [date, setDate] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');

  const minDate = trip ? trip.startDate.split('T')[0] : undefined;
  const maxDate = trip ? trip.endDate.split('T')[0] : undefined;

  const onSave = (stayOpen = false) => {
    if (!trip) return;
    if (!date) {
      Alert.alert('Select Date', 'Please select a date within the trip range.');
      return;
    }
    if (!title) {
      Alert.alert('Missing Title', 'Please add a title for the itinerary item.');
      return;
    }

    // validate date within range
    const d = new Date(date);
    const s = new Date(trip.startDate);
    const e = new Date(trip.endDate);
    if (d < s || d > e) {
      Alert.alert('Invalid Date', 'Selected date is outside the trip range.');
      return;
    }

    const item = {
      id: generateId(),
      time: time || '08:00',
      title,
      description,
    };

    // build new itinerary grouped by date -> day number relative to trip start
    const existing = trip.itinerary || [];
    const dateKey = date; // YYYY-MM-DD

    const updated = [...existing];
    const foundIdx = updated.findIndex(dy => dy.date && dy.date.startsWith(dateKey));
    if (foundIdx >= 0) {
      updated[foundIdx] = { ...updated[foundIdx], items: [...(updated[foundIdx].items || []), item].sort((a, b) => a.time.localeCompare(b.time)) };
    } else {
      const dayNumber = Math.round((new Date(date).getTime() - new Date(trip.startDate).setHours(0,0,0,0)) / 86400000) + 1;
      updated.push({ day: dayNumber, date: new Date(date).toISOString(), items: [item] });
      // sort by day
      updated.sort((a, b) => a.day - b.day);
    }

    setItinerary(trip.id, updated);
    snackbar.show({ message: 'Itinerary saved' });
    if (stayOpen) {
      // clear inputs to allow adding another
      setDate('');
      setTitle('');
      setDescription('');
      setTime('08:00');
      return;
    }
    router.back();
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Add Itinerary' }} />
        <Text>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Add Itinerary' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Select Date</Text>
        <Calendar
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={(d) => setDate(d.dateString)}
          markedDates={{ ...(date ? { [date]: { selected: true, selectedColor: Colors.primary } } : {}) }}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Time (HH:MM)</Text>
        <TextInput style={styles.input} placeholder="08:00" value={time} onChangeText={setTime} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(false)} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.success }]} onPress={() => onSave(true)} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save & Add Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600' as const, color: Colors.text, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderRadius: 10, padding: 12, color: Colors.text },
  saveBtn: { marginTop: 16, backgroundColor: Colors.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: Colors.white, fontWeight: '700' as const },
});
