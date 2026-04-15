import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Trip, Expense, TripNote, ItineraryDay } from '@/types/trip';
import { generateId } from '@/utils/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/supabase';
import { scheduleTripNotifications, cancelTripNotifications, refreshAllNotifications } from '@/utils/notifications';

async function loadTrips(userId: string): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error loading trips from Supabase:', error);
    return [];
  }
  return data as Trip[];
}

export const [TripProvider, useTrips] = createContextHook(() => {
  const { user } = useAuth();
  const userId = user?.id;
  const [trips, setTrips] = useState<Trip[]>([]);
  const queryClient = useQueryClient();

  const tripsQuery = useQuery({
    queryKey: ['trips', userId],
    queryFn: () => loadTrips(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (tripsQuery.data) {
      setTrips(tripsQuery.data);
      refreshAllNotifications(tripsQuery.data);
    }
  }, [tripsQuery.data]);

  useEffect(() => {
    if (!userId) {
      setTrips([]);
    }
  }, [userId]);

  const addTripMutation = useMutation({
    mutationFn: async (newTrip: Trip) => {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          ...newTrip,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', userId] });
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Trip> }) => {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', userId] });
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', userId] });
    },
  });

  const addTrip = useCallback(async (trip: Omit<Trip, 'id' | 'expenses' | 'itinerary' | 'notes' | 'createdAt'> & { itinerary?: ItineraryDay[] }) => {
    const newTrip: Trip = {
      ...trip,
      id: generateId(),
      expenses: [],
      itinerary: trip.itinerary || [],
      notes: [],
      createdAt: new Date().toISOString(),
    };
    
    await addTripMutation.mutateAsync(newTrip);
    scheduleTripNotifications(newTrip);
    return newTrip;
  }, [userId, addTripMutation]);

  const updateTrip = useCallback(async (id: string, updates: Partial<Trip>) => {
    await updateTripMutation.mutateAsync({ id, updates });
    const updatedTrip = trips.find(t => t.id === id);
    if (updatedTrip) scheduleTripNotifications({ ...updatedTrip, ...updates });
  }, [trips, updateTripMutation]);

  const deleteTrip = useCallback(async (id: string) => {
    await deleteTripMutation.mutateAsync(id);
    cancelTripNotifications(id);
  }, [deleteTripMutation]);

  const addExpense = useCallback(async (tripId: string, expense: Omit<Expense, 'id' | 'tripId'>) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newExpense: Expense = { ...expense, id: generateId(), tripId };
    const updatedExpenses = [...trip.expenses, newExpense];
    
    await updateTripMutation.mutateAsync({ id: tripId, updates: { expenses: updatedExpenses } });
  }, [trips, updateTripMutation]);

  const deleteExpense = useCallback(async (tripId: string, expenseId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedExpenses = trip.expenses.filter((e: any) => e.id !== expenseId);
    await updateTripMutation.mutateAsync({ id: tripId, updates: { expenses: updatedExpenses } });
  }, [trips, updateTripMutation]);

  const addNote = useCallback(async (tripId: string, content: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const newNote: TripNote = {
      id: generateId(),
      tripId,
      content,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...trip.notes, newNote];
    
    await updateTripMutation.mutateAsync({ id: tripId, updates: { notes: updatedNotes } });
  }, [trips, updateTripMutation]);

  const deleteNote = useCallback(async (tripId: string, noteId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;

    const updatedNotes = trip.notes.filter((n: any) => n.id !== noteId);
    await updateTripMutation.mutateAsync({ id: tripId, updates: { notes: updatedNotes } });
  }, [trips, updateTripMutation]);

  const setItinerary = useCallback(async (tripId: string, itinerary: ItineraryDay[]) => {
    await updateTripMutation.mutateAsync({ id: tripId, updates: { itinerary } });
    const updatedTrip = trips.find(t => t.id === tripId);
    if (updatedTrip) scheduleTripNotifications({ ...updatedTrip, itinerary });
  }, [trips, updateTripMutation]);

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

