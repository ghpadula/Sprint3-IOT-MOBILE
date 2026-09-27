import { Redirect, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { TelemetryProvider } from '@/store/TelemetryContext';

export default function ClienteLayout() {
  const { user, isRestoring } = useAuth();
  if (isRestoring) return null;
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'cliente') return <Redirect href="/painel" />;

  return (
    <TelemetryProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="agendar" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </TelemetryProvider>
  );
}
