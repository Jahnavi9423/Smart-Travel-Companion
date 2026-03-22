import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useSegments, useRouter, Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TripProvider } from "@/contexts/TripContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SnackbarProvider } from '@/components/Snackbar';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import Colors from "@/constants/colors";





SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    registerForPushNotificationsAsync();
    if (isLoading) return;
    const inLogin = (segments as string[])[0] === 'login';
    if (!isAuthenticated && !inLogin) {
      router.replace('/login' as never);
    } else if (isAuthenticated && inLogin) {
      router.replace('/' as never);
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={loadStyles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="trip/create" options={{ title: "New Trip", presentation: "modal" }} />
      <Stack.Screen name="trip/[id]" options={{ title: "", headerTransparent: true, headerTintColor: Colors.white }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);


  return (



    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <TripProvider>
              <SnackbarProvider>

                <RootLayoutNav />
              </SnackbarProvider>
            </TripProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const loadStyles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
