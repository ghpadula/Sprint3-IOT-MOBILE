import { createContext, ReactNode, useCallback, useContext, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type ToastKind = 'success' | 'error' | 'info';
type ToastState = { message: string; kind: ToastKind } | null;

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(() => {});

const kindMap: Record<ToastKind, { icon: IconName; bg: string }> = {
  success: { icon: 'checkmark-circle', bg: colors.success },
  error: { icon: 'alert-circle', bg: colors.danger },
  info: { icon: 'information-circle', bg: colors.brand },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      if (timer.current) clearTimeout(timer.current);
      setToast({ message, kind });
      haptic(kind === 'error' ? 'error' : 'success');
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 8 }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setToast(null));
      }, 2600);
    },
    [anim],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <View pointerEvents="none" style={[styles.host, { top: insets.top + spacing.sm }]}>
          <Animated.View
            testID="toast"
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              { backgroundColor: kindMap[toast.kind].bg },
              { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] },
            ]}
          >
            <Icon name={kindMap[toast.kind].icon} size={20} color="textOnBrand" />
            <Text variant="label" color="textOnBrand" style={{ flex: 1 }}>
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  host: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 999 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadow.raised,
  },
});
