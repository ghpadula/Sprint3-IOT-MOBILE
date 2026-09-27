import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Badge, BadgeTone, Card, Icon, IconName, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { dealers, services } from '@/data/mockData';
import { Appointment, AppointmentStatus } from '@/types';
import { formatCurrency, formatDayShort, formatTime } from '@/utils/format';

export const statusMeta: Record<AppointmentStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  confirmado: { label: 'Confirmado', tone: 'primary', icon: 'checkmark-circle' },
  concluido: { label: 'Concluído', tone: 'success', icon: 'checkmark-done' },
  cancelado: { label: 'Cancelado', tone: 'neutral', icon: 'close-circle' },
};

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const service = services.find((s) => s.id === appointment.serviceId);
  const dealer = dealers.find((d) => d.id === appointment.dealerId);
  const date = new Date(appointment.date);
  const meta = statusMeta[appointment.status];
  return (
    <Card testID={`apt-${appointment.id}`} onPress={() => router.push(`/agendamento/${appointment.id}`)} accessibilityLabel={`Agendamento ${service?.title}`}>
      <View style={styles.row}>
        <View style={[styles.dateBox, appointment.status === 'cancelado' && styles.dateBoxOff]}>
          <Text variant="caption" color={appointment.status === 'cancelado' ? 'textMuted' : 'primary'} style={styles.month}>
            {formatDayShort(date).split(', ')[1].split(' ')[1]}
          </Text>
          <Text variant="title" color={appointment.status === 'cancelado' ? 'textMuted' : 'brand'}>
            {date.getDate().toString().padStart(2, '0')}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {service?.title ?? 'Serviço'}
          </Text>
          <View style={styles.meta}>
            <Icon name="time-outline" size={14} color="textMuted" />
            <Text variant="caption" color="textMuted">
              {formatDayShort(date)} · {formatTime(date)}
            </Text>
          </View>
          <View style={styles.meta}>
            <Icon name="location-outline" size={14} color="textMuted" />
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {dealer?.name}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing.sm }}>
          <Badge label={meta.label} tone={meta.tone} />
          <Text variant="label" color="textSecondary">
            {formatCurrency(appointment.price)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateBox: { width: 56, height: 60, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  dateBoxOff: { backgroundColor: colors.surfaceMuted },
  month: { textTransform: 'uppercase', fontFamily: 'Inter_600SemiBold' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
