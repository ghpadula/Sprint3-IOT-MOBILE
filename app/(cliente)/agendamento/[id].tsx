import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { statusMeta } from '@/components/AppointmentCard';
import { Badge, Button, Card, Dialog, EmptyState, KeyValue, Screen, ScreenHeader, Text, useToast } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { dealers, services } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import { formatCurrency, formatDateTime } from '@/utils/format';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, cancelAppointment } = useApp();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const apt = appointments.find((a) => a.id === id);

  if (!apt) {
    return (
      <Screen>
        <ScreenHeader title="Agendamento" />
        <EmptyState icon="calendar-clear-outline" title="Agendamento não encontrado" description="Ele pode ter sido removido deste aparelho." actionLabel="Ir para a agenda" onAction={() => router.replace('/agenda')} />
      </Screen>
    );
  }

  const service = services.find((s) => s.id === apt.serviceId);
  const dealer = dealers.find((d) => d.id === apt.dealerId);
  const meta = statusMeta[apt.status];
  const isFuture = new Date(apt.date).getTime() > Date.now();
  const canCancel = apt.status === 'confirmado' && isFuture;

  return (
    <Screen
      footer={
        canCancel ? (
          <Button label="Cancelar agendamento" icon="close-circle-outline" variant="danger" onPress={() => setConfirm(true)} testID="apt-cancel" />
        ) : (
          <Button label="Agendar novamente" icon="refresh" onPress={() => router.push({ pathname: '/agendar', params: { serviceId: apt.serviceId } })} />
        )
      }
    >
      <ScreenHeader title="Agendamento" subtitle={`Protocolo ${apt.id.slice(-8).toUpperCase()}`} />

      <Card style={{ gap: spacing.md }}>
        <Badge label={meta.label} tone={meta.tone} icon={meta.icon} testID="apt-status" />
        <Text variant="title">{service?.title}</Text>
        <Text variant="body" color="textMuted">
          {service?.description}
        </Text>
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <KeyValue icon="calendar-outline" label="Data" value={formatDateTime(apt.date)} />
        <KeyValue icon="storefront-outline" label="Local" value={dealer?.name ?? '—'} />
        <KeyValue icon="map-outline" label="Endereço" value={dealer ? `${dealer.address}, ${dealer.city}` : '—'} />
        <KeyValue icon="cash-outline" label="Valor" value={`${formatCurrency(apt.price)}${apt.discountPct ? ` (${apt.discountPct}% off)` : ''}`} />
        <KeyValue icon="ribbon-outline" label="Pontos" value={apt.status === 'cancelado' ? 'estornados' : `+${apt.pointsEarned}`} />
        {!!apt.notes && <KeyValue icon="chatbox-outline" label="Observações" value={apt.notes} />}
      </Card>

      {dealer && (
        <View style={styles.row}>
          <Button label="Ligar" icon="call-outline" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${dealer.phone.replace(/\D/g, '')}`)} />
          <Button
            label="Como chegar"
            icon="navigate-outline"
            variant="secondary"
            fullWidth={false}
            style={{ flex: 1 }}
            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dealer.address}, ${dealer.city}`)}`)}
          />
        </View>
      )}

      {service && (
        <Card tone="primary">
          <Text variant="caption" color="textSecondary">
            {service.officialNetworkBenefit}
          </Text>
        </Card>
      )}

      <Dialog
        visible={confirm}
        tone="danger"
        icon="close-circle-outline"
        title="Cancelar agendamento?"
        message={`Os ${apt.pointsEarned} pontos ganhos serão estornados e o lembrete será removido.`}
        confirmLabel="Sim, cancelar"
        cancelLabel="Manter"
        loading={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          setBusy(true);
          await cancelAppointment(apt.id);
          setBusy(false);
          setConfirm(false);
          toast('Agendamento cancelado', 'info');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
});
