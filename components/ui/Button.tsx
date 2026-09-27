import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fonts, layout, radius, spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'onBrand';
type Size = 'md' | 'sm';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const variantStyles: Record<Variant, { bg: string; fg: keyof typeof colors; border?: string; pressed: string }> = {
  primary: { bg: colors.primary, fg: 'textOnBrand', pressed: '#1F6AE0' },
  secondary: { bg: colors.surface, fg: 'brand', border: colors.borderStrong, pressed: colors.surfaceMuted },
  ghost: { bg: 'transparent', fg: 'primary', pressed: colors.primaryTint },
  danger: { bg: colors.dangerSoft, fg: 'danger', pressed: '#F9D5D5' },
  onBrand: { bg: 'rgba(255,255,255,0.14)', fg: 'textOnBrand', border: 'rgba(255,255,255,0.28)', pressed: 'rgba(255,255,255,0.24)' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  disabled,
  fullWidth = true,
  style,
  testID,
}: Props) {
  const v = variantStyles[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={() => {
        haptic('light');
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.sm,
        fullWidth && styles.full,
        { backgroundColor: pressed ? v.pressed : v.bg },
        v.border ? { borderWidth: 1, borderColor: v.border } : null,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} color={v.fg} />}
          <Text variant="label" color={v.fg} style={styles.label}>
            {label}
          </Text>
          {iconRight && <Icon name={iconRight} size={size === 'sm' ? 16 : 18} color={v.fg} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchMin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontFamily: fonts.semibold },
  disabled: { opacity: 0.45 },
});
