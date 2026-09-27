import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

type Kind = 'light' | 'medium' | 'success' | 'warning' | 'error' | 'selection';

export function haptic(kind: Kind = 'light') {
  if (Platform.OS === 'web') return;
  try {
    switch (kind) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'selection':
        Haptics.selectionAsync();
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
  }
}
