import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { useAuth } from '@/store/AuthContext';

export default function Index() {
  const { user, isRestoring, hasSeenOnboarding } = useAuth();
  const { isReady } = useApp();

  if (isRestoring || !isReady) {
    return (
      <View style={styles.center} testID="boot">
        <ActivityIndicator color={colors.textOnBrand} size="large" />
      </View>
    );
  }
  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;
  if (!user) return <Redirect href="/login" />;
  return <Redirect href={user.role === 'cliente' ? '/inicio' : '/painel'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brand },
});
