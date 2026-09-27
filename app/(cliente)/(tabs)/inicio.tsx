import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertItem } from '@/components/AlertItem';
import { AppointmentCard } from '@/components/AppointmentCard';
import { OfferCard } from '@/components/OfferCard';
import { Badge, Button, Card, EmptyState, Icon, IconButton, IconName, LightStatusBar, ProgressBar, ScoreRing, SectionHeader, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { useAuth } from '@/store/AuthContext';
import { useClientOffers } from '@/store/hooks';
import { useTelemetry } from '@/store/TelemetryContext';
import { daysUntil, firstName, formatDate, formatKm, greeting } from '@/utils/format';
import { getKmToNextService, getServiceProgress, getServiceUrgency, healthScore } from '@/utils/maintenance';

const quickActions: { icon: IconName; label: string; href: string }[] = [
  { icon: 'calendar', label: 'Agendar', href: '/agendar' },
  { icon: 'construct', label: 'Revisões', href: '/servicos' },
  { icon: 'location', label: 'Rede Ford', href: '/rede' },
  { icon: 'ribbon', label: 'Pontos', href: '/beneficios' },
];

export default function Home() {
  const { user } = useAuth();
  const { vehicle, appointments, unreadCount } = useApp();
  const { telemetry, status, alerts } = useTelemetry();
  const offers = useClientOffers().filter((o) => o.status !== 'aceita' && o.status !== 'recusada');

  const progress = getServiceProgress(vehicle);
  const kmLeft = getKmToNextService(vehicle);
  const urgency = getServiceUrgency(vehicle);
  const score = healthScore(vehicle, telemetry);
  const scoreColor = score >= 80 ? colors.onBrandSuccess : score >= 60 ? colors.onBrandWarning : colors.onBrandDanger;
  const upcoming = appointments
    .filter((a) => a.status === 'confirmado' && new Date(a.date).getTime() > Date.now())
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
  const warrantyDays = daysUntil(vehicle.warrantyEnd);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: spacing.huge }} showsVerticalScrollIndicator={false}>
      <LightStatusBar />
      <SafeAreaView edges={['top']} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="textOnBrandMuted">
              {greeting()},
            </Text>
            <Text variant="title" color="textOnBrand" testID="home-greeting">
              {firstName(user?.name ?? vehicle.ownerName)}
            </Text>
          </View>
          <IconButton icon="notifications-outline" label="Notificações" tone="onBrand" badge={unreadCount} onPress={() => router.push('/notificacoes')} />
        </View>

        <Pressable onPress={() => router.push('/veiculo')} accessibilityRole="button" style={styles.vehicle} testID="home-vehicle">
          <View style={{ flex: 1, gap: spacing.xs }}>
            <View style={styles.connRow}>
              <View style={[styles.connDot, { backgroundColor: status === 'online' ? colors.onBrandSuccess : status === 'conectando' ? colors.onBrandWarning : colors.onBrandDanger }]} />
              <Text variant="caption" color="textOnBrandMuted">
                {status === 'online' ? 'Veículo conectado' : status === 'conectando' ? 'Conectando…' : 'Sem conexão com o veículo'}
              </Text>
            </View>
            <Text variant="display" color="textOnBrand">
              {vehicle.model}
            </Text>
            <Text variant="caption" color="textOnBrandMuted">
              {vehicle.version} · {vehicle.year}
            </Text>
            <View style={styles.plateRow}>
              <View style={styles.plate}>
                <Text variant="caption" color="brand" style={styles.plateText}>
                  {vehicle.plate}
                </Text>
              </View>
              <Text variant="label" color="textOnBrand">
                {formatKm(vehicle.mileage)}
              </Text>
            </View>
          </View>
          <ScoreRing value={score} size={96} stroke={9} color={scoreColor} track="rgba(255,255,255,0.15)" caption="saúde" onBrand />
        </Pressable>
      </SafeAreaView>

      <View style={styles.body}>
        {alerts.length > 0 && (
          <View style={{ gap: spacing.sm }}>
            {alerts.slice(0, 2).map((a) => (
              <AlertItem key={a.id} alert={a} />
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {quickActions.map((a) => (
            <Pressable
              key={a.label}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              onPress={() => router.push(a.href as never)}
              style={({ pressed }) => [styles.action, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.actionIcon}>
                <Icon name={a.icon} size={22} color="brand" />
              </View>
              <Text variant="caption" color="textSecondary" style={{ fontFamily: 'Inter_500Medium' }}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Card>
          <View style={styles.rowBetween}>
            <Text variant="heading">Próxima revisão</Text>
            <Badge label={urgency.label} tone={urgency.tone} />
          </View>
          <View style={{ marginVertical: spacing.md }}>
            <ProgressBar value={progress / 100} tone={urgency.tone === 'success' ? 'primary' : urgency.tone} height={10} />
          </View>
          <Text variant="body" color="textMuted">
            {kmLeft > 0 ? (
              <>
                Faltam <Text variant="bodyStrong">{formatKm(kmLeft)}</Text> para a revisão de {formatKm(vehicle.nextServiceKm)}.
              </>
            ) : (
              'A revisão programada está vencida. Agende para manter a garantia.'
            )}
          </Text>
          <Button
            label="Agendar revisão"
            icon="calendar-outline"
            style={{ marginTop: spacing.lg }}
            onPress={() => router.push({ pathname: '/agendar', params: { serviceId: 'revisao' } })}
            testID="home-schedule"
          />
        </Card>

        {upcoming && (
          <>
            <SectionHeader title="Seu próximo serviço" action="Ver agenda" onAction={() => router.push('/agenda')} />
            <AppointmentCard appointment={upcoming} />
          </>
        )}

        <SectionHeader title="Ofertas para você" action="Ver todas" onAction={() => router.push('/beneficios')} />
        {offers.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offers} style={styles.offersScroll}>
            {offers.slice(0, 4).map((o) => (
              <OfferCard key={o.id} offer={o} compact />
            ))}
          </ScrollView>
        ) : (
          <Card>
            <EmptyState icon="pricetags-outline" title="Nenhuma oferta agora" description="Quando surgir algo útil para o seu veículo, avisamos por aqui." />
          </Card>
        )}

        <Card tone="primary">
          <View style={styles.warranty}>
            <View style={styles.warrantyIcon}>
              <Icon name="shield-checkmark" size={24} color="primary" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{warrantyDays > 0 ? `Garantia até ${formatDate(vehicle.warrantyEnd)}` : 'Garantia de fábrica encerrada'}</Text>
              <Text variant="caption" color="textSecondary">
                {warrantyDays > 0
                  ? `Faltam ${warrantyDays} dias. Revisões na rede oficial mantêm a cobertura e o histórico do VIN.`
                  : 'Continue na rede oficial para manter o histórico e o valor de revenda.'}
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.xl,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.onBrandSurface,
    borderWidth: 1,
    borderColor: colors.onBrandBorder,
  },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  plate: { backgroundColor: colors.surface, borderRadius: 4, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  plateText: { fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  body: { padding: spacing.xl, gap: spacing.lg },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { alignItems: 'center', gap: spacing.xs + 2, flex: 1 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  offersScroll: { marginHorizontal: -spacing.xl },
  offers: { gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs },
  warranty: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  warrantyIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
