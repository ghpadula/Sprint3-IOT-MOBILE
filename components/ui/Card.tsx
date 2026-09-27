import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  tone?: 'default' | 'brand' | 'muted' | 'primary';
  testID?: string;
  accessibilityLabel?: string;
};

const tones = {
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  brand: { backgroundColor: colors.brand, borderColor: colors.brand },
  muted: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
  primary: { backgroundColor: colors.primaryTint, borderColor: colors.primarySoft },
};

export function Card({ children, onPress, style, padded = true, tone = 'default', testID, accessibilityLabel }: Props) {
  const content = [styles.card, tones[tone], padded && styles.padded, tone === 'default' && shadow.card, style];
  if (!onPress) {
    return (
      <View style={content} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        haptic('selection');
        onPress();
      }}
      style={({ pressed }) => [content, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1 },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
