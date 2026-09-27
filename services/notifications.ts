import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL = 'fordconecta-default';
const supported = Platform.OS !== 'web';

if (supported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: 'Ford Conecta',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#2D7FF9',
        vibrationPattern: [0, 200, 120, 200],
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  } catch {
    return false;
  }
}

export async function notifyNow(title: string, body: string, route?: string) {
  if (!supported) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: route ? { route } : {} },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
    });
  } catch {
  }
}

export async function scheduleReminder(title: string, body: string, date: Date, route?: string): Promise<string | undefined> {
  if (!supported || date.getTime() <= Date.now()) return undefined;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, data: route ? { route } : {} },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL },
    });
  } catch {
    return undefined;
  }
}

export async function cancelReminder(id?: string) {
  if (!supported || !id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
  }
}

export function onNotificationTap(handler: (route: string) => void) {
  if (!supported) return () => {};
  const sub = Notifications.addNotificationResponseReceivedListener((resp) => {
    const route = resp.notification.request.content.data?.route;
    if (typeof route === 'string') handler(route);
  });
  return () => sub.remove();
}
