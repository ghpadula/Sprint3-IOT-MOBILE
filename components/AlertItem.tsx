import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { TelemetryAlert } from '@/types';

const sev = {
  info: { bg: colors.infoSoft, fg: 'info', icon: 'information-circle' },
  atencao: { bg: colors.warningSoft, fg: 'warning', icon: 'warning' },
  critico: { bg: colors.dangerSoft, fg: 'danger', icon: 'alert-circle' },
} as const;

export function AlertItem({ alert }: { alert: TelemetryAlert }) {
  const s = sev[alert.severity];
  return (
    <Pressable
      testID={`alert-${alert.id}`}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}. ${alert.description}. Toque para agendar.`}
      onPress={() => router.push({ pathname: '/agendar', params: { serviceId: alert.serviceId } })}
      style={({ pressed }) => [styles.box, { backgroundColor: s.bg }, pressed && { opacity: 0.8 }]}
    >
      <Icon name={s.icon} size={22} color={s.fg} />
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" color={s.fg}>
          {alert.title}
        </Text>
        <Text variant="caption" color="textSecondary">
          {alert.description}
        </Text>
      </View>
      <View style={styles.cta}>
        <Text variant="caption" color={s.fg} style={{ fontFamily: 'Inter_600SemiBold' }}>
          Agendar
        </Text>
        <Icon name="chevron-forward" size={14} color={s.fg} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md + 2, borderRadius: radius.md },
  cta: { flexDirection: 'row', alignItems: 'center' },
});
