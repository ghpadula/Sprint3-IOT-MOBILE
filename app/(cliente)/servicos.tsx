import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, ErrorState, Icon, IconName, LoadingList, Screen, ScreenHeader, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { api } from '@/services/api';
import { useApp } from '@/store/AppContext';
import { useAsync } from '@/store/hooks';
import { useTelemetry } from '@/store/TelemetryContext';
import { formatKm } from '@/utils/format';
import { sortServicesByNeed } from '@/utils/maintenance';

export default function ServicesScreen() {
  const { vehicle, appointments } = useApp();
  const { alerts } = useTelemetry();
  const { data, loading, error, reload, refresh, refreshing } = useAsync(() => api.getServices(), []);
  const flagged = new Set(alerts.map((a) => a.serviceId));

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <ScreenHeader title="Revisões e serviços" subtitle="Priorizados pela quilometragem e pelos alertas do veículo" />
      {loading ? (
        <LoadingList count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        sortServicesByNeed(vehicle, data ?? [], alerts).map((s) => {
          const scheduled = appointments.some((a) => a.serviceId === s.id && a.status === 'confirmado');
          return (
            <Card key={s.id} style={{ gap: spacing.md }}>
              <View style={styles.top}>
                <View style={styles.icon}>
                  <Icon name={s.icon as IconName} size={22} color="brand" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{s.title}</Text>
                  <Text variant="caption" color="textMuted">
                    {s.recommendedKm ? `recomendado em ${formatKm(s.recommendedKm)}` : 'quando houver alerta no painel'}
                  </Text>
                </View>
                {scheduled ? <Badge label="Agendado" tone="success" icon="checkmark" /> : flagged.has(s.id) ? <Badge label="Alerta" tone="warning" icon="pulse" /> : null}
              </View>
              <Text variant="body" color="textMuted">
                {s.description}
              </Text>
              <View style={styles.price}>
                <Text variant="caption" color="textMuted">
                  Faixa estimada
                </Text>
                <Text variant="bodyStrong">{s.priceRange}</Text>
              </View>
              <View style={styles.benefit}>
                <Icon name="shield-checkmark-outline" size={16} color="primary" />
                <Text variant="caption" color="brand" style={{ flex: 1 }}>
                  {s.officialNetworkBenefit}
                </Text>
              </View>
              <Button
                label={scheduled ? 'Agendar outro horário' : 'Agendar na rede Ford'}
                icon="calendar-outline"
                variant={scheduled ? 'secondary' : 'primary'}
                onPress={() => router.push({ pathname: '/agendar', params: { serviceId: s.id } })}
              />
            </Card>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  price: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md, gap: 2 },
  benefit: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
});
