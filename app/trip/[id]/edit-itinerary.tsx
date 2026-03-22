import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useTrips } from '@/contexts/TripContext';
import { Calendar } from 'react-native-calendars';
import { useSnackbar } from '@/components/Snackbar';

export default function EditItineraryScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { id, itemId, date } = params as { id?: string; itemId?: string; date?: string };
  const { getTripById, setItinerary } = useTrips();
  const trip = getTripById(id ?? '');

  const [selDate, setSelDate] = useState<string>(date ?? '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('08:00');
  const snackbar = useSnackbar();

  useEffect(() => {
    if (!trip || !itemId) return;
    const day = trip.itinerary.find(d => d.date && d.date.startsWith(selDate));
    const item = day?.items?.find(i => i.id === itemId);
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      setTime(item.time || '08:00');
    }
  }, [trip, itemId, selDate]);

  if (!trip) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Edit Itinerary' }} />
        <Text>Trip not found</Text>
      </View>
    );
  }

  const onSave = () => {
    if (!trip || !itemId) return;
    if (!selDate) {
      Alert.alert('Select Date', 'Please select a date within the trip range.');
      return;
    }
    if (!title) {
      Alert.alert('Missing Title', 'Please add a title for the itinerary item.');
      return;
    }

    const updated = trip.itinerary.map(d => ({ ...d, items: [...(d.items||[])] }));
    // find day containing item
    let found = false;
    for (let di = 0; di < updated.length; di++) {
      const day = updated[di];
      const idx = day.items.findIndex(i => i.id === itemId);
      if (idx >= 0) {
        // if date changed and differs from current day.date, remove and add to target
        const targetDateKey = selDate;
        const currentDayDate = day.date ? day.date.split('T')[0] : undefined;
        const item = { ...day.items[idx], time, title, description };
        if (currentDayDate === targetDateKey) {
          updated[di].items[idx] = item;
        } else {
          // remove
          updated[di].items.splice(idx, 1);
          // add to target day (or new day)
          const tIdx = updated.findIndex(dd => dd.date && dd.date.startsWith(targetDateKey));
          if (tIdx >= 0) {
            updated[tIdx].items.push(item);
            updated[tIdx].items.sort((a,b) => a.time.localeCompare(b.time));
          } else {
            const dayNumber = Math.round((new Date(targetDateKey).getTime() - new Date(trip.startDate).setHours(0,0,0,0)) / 86400000) + 1;
            updated.push({ day: dayNumber, date: new Date(targetDateKey).toISOString(), items: [item] });
            updated.sort((a,b)=>a.day-b.day);
          }
        }
        found = true;
        break;
      }
    }

    // clean empty days
    const cleaned = updated.filter(d => d.items && d.items.length > 0);
    setItinerary(trip.id, cleaned);
    snackbar.show({ message: 'Itinerary updated' });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Itinerary' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Date</Text>
        <Calendar
          minDate={trip.startDate.split('T')[0]}
          maxDate={trip.endDate.split('T')[0]}
          onDayPress={(d) => setSelDate(d.dateString)}
          markedDates={{ ...(selDate ? { [selDate]: { selected: true, selectedColor: Colors.primary } } : {}) }}
        />

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 100 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />

        <Text style={styles.label}>Time (HH:MM)</Text>
        <TextInput style={styles.input} placeholder="08:00" value={time} onChangeText={setTime} />

        <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
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
