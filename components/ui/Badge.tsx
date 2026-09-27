import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'brand';

const toneMap = {
  neutral: { bg: colors.surfaceMuted, fg: 'textSecondary' },
  primary: { bg: colors.primarySoft, fg: 'primary' },
  success: { bg: colors.successSoft, fg: 'success' },
  warning: { bg: colors.warningSoft, fg: 'warning' },
  danger: { bg: colors.dangerSoft, fg: 'danger' },
  brand: { bg: 'rgba(255,255,255,0.16)', fg: 'textOnBrand' },
} as const;

type Props = { label: string; tone?: BadgeTone; icon?: IconName; testID?: string };

export function Badge({ label, tone = 'neutral', icon, testID }: Props) {
  const t = toneMap[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]} testID={testID}>
      {icon && <Icon name={icon} size={12} color={t.fg} />}
      <Text variant="caption" color={t.fg} style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  text: { fontSize: 12, lineHeight: 16, fontFamily: 'Inter_600SemiBold' },
});
