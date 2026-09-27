import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@fordconecta/v1/';

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  async set<T>(key: string, value: T) {
    try {
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
    }
  },
  async clearAll() {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(PREFIX));
    await AsyncStorage.multiRemove(keys);
  },
};
