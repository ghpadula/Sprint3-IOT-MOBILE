import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Session } from '@/types';

const KEY = 'fordconecta.session';

export async function saveSession(session: Session) {
  const value = JSON.stringify(session);
  if (Platform.OS === 'web') return AsyncStorage.setItem(KEY, value);
  await SecureStore.setItemAsync(KEY, value);
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = Platform.OS === 'web' ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (session.expiresAt < Date.now()) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  if (Platform.OS === 'web') return AsyncStorage.removeItem(KEY);
  await SecureStore.deleteItemAsync(KEY);
}
