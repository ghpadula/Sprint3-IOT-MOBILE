import Ionicons from '@expo/vector-icons/Ionicons';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from '@/components/ui';
import { colors } from '@/constants/theme';
import { onNotificationTap } from '@/services/notifications';
import { AppProvider } from '@/store/AppContext';
import { AuthProvider } from '@/store/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Ionicons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  useEffect(() => onNotificationTap((route) => router.push(route as never)), []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" options={{ animation: 'fade' }} />
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
              <Stack.Screen name="login" options={{ animation: 'fade' }} />
              <Stack.Screen name="(cliente)" options={{ animation: 'fade' }} />
              <Stack.Screen name="(cockpit)" options={{ animation: 'fade' }} />
            </Stack>
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
