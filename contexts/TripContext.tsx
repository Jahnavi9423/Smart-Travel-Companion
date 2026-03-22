import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Trip, Expense, TripNote, ItineraryDay } from '@/types/trip';
import { generateId } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { scheduleTripNotifications, cancelTripNotifications, refreshAllNotifications } from '@/utils/notifications';

function getTripsKey(userId: string): string {
  return `travel_trips_${userId}`;
}

async function loadTrips(userId: string): Promise<Trip[]> {
  try {
    const stored = await AsyncStorage.getItem(getTripsKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.log('Error loading trips:', e);
    return [];
  }
}

async function saveTrips(userId: string, trips: Trip[]): Promise<Trip[]> {
  await AsyncStorage.setItem(getTripsKey(userId), JSON.stringify(trips));
  return trips;
}

export const [TripProvider, useTrips] = createContextHook(() => {
  const { user } = useAuth();
  const userId = user?.id ?? '__guest__';
  const [trips, setTrips] = useState<Trip[]>([]);

  const tripsQuery = useQuery({
    queryKey: ['trips', userId],
    queryFn: () => loadTrips(userId),
    enabled: !!user,
  });

  useEffect(() => {
    if (tripsQuery.data) {
      setTrips(tripsQuery.data);
      // Initial notification sync
      refreshAllNotifications(tripsQuery.data);
    }
  }, [tripsQuery.data]);

  useEffect(() => {
    if (!user) {
      setTrips([]);
    }
  }, [user]);

  const syncMutation = useMutation({
    mutationFn: (updated: Trip[]) => saveTrips(userId, updated),
  });

  const persist = useCallback((updated: Trip[]) => {
    setTrips(updated);
    syncMutation.mutate(updated);
  }, [syncMutation, userId]);

  const addTrip = useCallback((trip: Omit<Trip, 'id' | 'expenses' | 'itinerary' | 'notes' | 'createdAt'> & { itinerary?: ItineraryDay[] }) => {
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      expenses: [],
      itinerary: trip.itinerary || [],
      notes: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newTrip, ...trips];
    persist(updated);
    scheduleTripNotifications(newTrip);
    return newTrip;
  }, [trips, persist]);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    const updated = trips.map(t => t.id === id ? { ...t, ...updates } : t);
    persist(updated);
    const updatedTrip = updated.find(t => t.id === id);
    if (updatedTrip) scheduleTripNotifications(updatedTrip);
  }, [trips, persist]);

  const deleteTrip = useCallback((id: string) => {
    const updated = trips.filter(t => t.id !== id);
    persist(updated);
    cancelTripNotifications(id);
  }, [trips, persist]);

  const addExpense = useCallback((tripId: string, expense: Omit<Expense, 'id' | 'tripId'>) => {
    const newExpense: Expense = { ...expense, id: generateId(), tripId };
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, expenses: [...t.expenses, newExpense] } : t
    );
    persist(updated);
  }, [trips, persist]);

  const deleteExpense = useCallback((tripId: string, expenseId: string) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, expenses: t.expenses.filter((e: any) => e.id !== expenseId) } : t
    );
    persist(updated);
  }, [trips, persist]);

  const addNote = useCallback((tripId: string, content: string) => {
    const newNote: TripNote = {
      id: generateId(),
      tripId,
      content,
      createdAt: new Date().toISOString(),
    };
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, notes: [...t.notes, newNote] } : t
    );
    persist(updated);
  }, [trips, persist]);

  const deleteNote = useCallback((tripId: string, noteId: string) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, notes: t.notes.filter((n: any) => n.id !== noteId) } : t
    );
    persist(updated);
  }, [trips, persist]);

  const setItinerary = useCallback((tripId: string, itinerary: ItineraryDay[]) => {
    const updated = trips.map(t =>
      t.id === tripId ? { ...t, itinerary } : t
    );
    persist(updated);
    const updatedTrip = updated.find(t => t.id === tripId);
    if (updatedTrip) scheduleTripNotifications(updatedTrip);
  }, [trips, persist]);

  const getTripById = useCallback((id: string): Trip | undefined => {
    return trips.find(t => t.id === id);
  }, [trips]);

  return {
    trips,
    isLoading: tripsQuery.isLoading,
    addTrip,
    updateTrip,
    deleteTrip,
    addExpense,
    deleteExpense,
    addNote,
    deleteNote,
    setItinerary,
    getTripById,
  };
});
