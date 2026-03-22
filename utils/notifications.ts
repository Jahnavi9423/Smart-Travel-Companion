import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '@/types/trip';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return true;
}

async function areNotificationsEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem('user_notifications_enabled');
    return enabled === null || enabled === 'true'; // Default to true
}

export async function cancelTripNotifications(tripId: string) {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
        if (notification.identifier.startsWith(`trip-${tripId}`)) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
    }
}

export async function scheduleTripNotifications(trip: Trip) {
    // Always cancel existing ones first to avoid duplicates
    await cancelTripNotifications(trip.id);

    if (!(await areNotificationsEnabled())) {
        return;
    }

    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    const now = new Date();

    // 1. Trip Starting Soon (1 day before)
    const tomorrowStart = new Date(startDate);
    tomorrowStart.setDate(tomorrowStart.getDate() - 1);
    tomorrowStart.setHours(9, 0, 0, 0); // 9:00 AM the day before

    if (tomorrowStart > now) {
        const seconds = Math.floor((tomorrowStart.getTime() - now.getTime()) / 1000);
        if (seconds > 0) {
            await Notifications.scheduleNotificationAsync({
                identifier: `trip-${trip.id}-start-soon`,
                content: {
                    title: 'Trip Starting Soon!',
                    body: `Your trip to ${trip.destination} starts tomorrow!`,
                    data: { tripId: trip.id },
                    channelId: 'default',
                } as any,
                trigger: { type: 'timeInterval', seconds, repeats: false } as any,
            });
        }
    }

    // 2. Trip Starting Today
    const todayStart = new Date(startDate);
    todayStart.setHours(8, 0, 0, 0); // 8:00 AM on start day

    if (todayStart > now) {
        const seconds = Math.floor((todayStart.getTime() - now.getTime()) / 1000);
        if (seconds > 0) {
            await Notifications.scheduleNotificationAsync({
                identifier: `trip-${trip.id}-start-today`,
                content: {
                    title: 'Trip Starting Today!',
                    body: `Your trip to ${trip.destination} starts today. Have a great journey!`,
                    data: { tripId: trip.id },
                    channelId: 'default',
                } as any,
                trigger: { type: 'timeInterval', seconds, repeats: false } as any,
            });
        }
    }

    // 3. Trip Completed
    const tripEnd = new Date(endDate);
    tripEnd.setHours(20, 0, 0, 0); // 8:00 PM on end day

    if (tripEnd > now) {
        const seconds = Math.floor((tripEnd.getTime() - now.getTime()) / 1000);
        if (seconds > 0) {
            await Notifications.scheduleNotificationAsync({
                identifier: `trip-${trip.id}-completed`,
                content: {
                    title: 'Trip Completed',
                    body: `Your trip to ${trip.destination} has ended. Hope you had a great time!`,
                    data: { tripId: trip.id },
                    channelId: 'default',
                } as any,
                trigger: { type: 'timeInterval', seconds, repeats: false } as any,
            });
        }
    }

    // 4. Itinerary Reminders
    if (trip.itinerary && trip.itinerary.length > 0) {
        for (const day of trip.itinerary) {
            if (!day.items) continue;

            const dayDate = new Date(day.date);

            for (const item of day.items) {
                const itemTime = parseTime(item.time, dayDate);
                if (!itemTime) continue;

                const triggerTime = new Date(itemTime.getTime() - 10 * 60 * 1000); // 10 mins before

                if (triggerTime > now) {
                    const seconds = Math.floor((triggerTime.getTime() - now.getTime()) / 1000);
                    if (seconds > 0) {
                        await Notifications.scheduleNotificationAsync({
                            identifier: `trip-${trip.id}-itinerary-${item.id}`,
                            content: {
                                title: 'Upcoming Activity',
                                body: `${item.time} – ${item.title}`,
                                data: { tripId: trip.id, itemId: item.id },
                                channelId: 'default',
                            } as any,
                            trigger: { type: 'timeInterval', seconds, repeats: false } as any,
                        });
                    }
                }
            }
        }
    }
}

function parseTime(timeStr: string, baseDate: Date): Date | null {
    try {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return null;

        let [_, hours, minutes, ampm] = match;
        let h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);

        if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;

        const date = new Date(baseDate);
        date.setHours(h, m, 0, 0);
        return date;
    } catch (e) {
        return null;
    }
}

export async function refreshAllNotifications(trips: Trip[]) {
    const enabled = await areNotificationsEnabled();

    if (!enabled) {
        await Notifications.cancelAllScheduledNotificationsAsync();
        return;
    }

    // Reschedule for all trips
    for (const trip of trips) {
        await scheduleTripNotifications(trip);
    }
}
