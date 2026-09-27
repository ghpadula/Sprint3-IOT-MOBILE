import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { discountLabel } from '@/components/OfferCard';
import { Badge, Button, Card, Chip, ErrorState, Icon, IconButton, IconName, Input, KeyValue, LoadingList, ProgressBar, Skeleton, Text } from '@/components/ui';
import { colors, layout, radius, spacing } from '@/constants/theme';
import { services } from '@/data/mockData';
import { api } from '@/services/api';
import { POINTS_PER_APPOINTMENT, useApp } from '@/store/AppContext';
import { useAsync, useClientOffers } from '@/store/hooks';
import { useTelemetry } from '@/store/TelemetryContext';
import { Appointment } from '@/types';
import { formatCurrency, formatDateTime, formatDayShort } from '@/utils/format';
import { haptic } from '@/utils/haptics';

const STEPS = ['Serviço', 'Concessionária', 'Data e horário', 'Confirmação'];

function nextDays(n: number) {
  const days: Date[] = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) days.push(new Date(d));
  }
  return days;
}

function Radio({ on }: { on: boolean }) {
  return <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>;
}

export default function ScheduleWizard() {
  const params = useLocalSearchParams<{ serviceId?: string; offerId?: string }>();
  const { addAppointment } = useApp();
  const { alerts } = useTelemetry();
  const offers = useClientOffers();

  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(params.serviceId && services.some((s) => s.id === params.serviceId) ? params.serviceId : null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const days = useMemo(() => nextDays(12), []);
  const [day, setDay] = useState<Date>(days[0]);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const dealersQ = useAsync(() => api.getDealers(), []);
  const slotsQ = useAsync(() => (dealerId ? api.getSlots(dealerId, day) : Promise.resolve([])), [dealerId, day.getTime()]);
  useEffect(() => setTime(null), [dealerId, day]);

  const service = services.find((s) => s.id === serviceId);
  const dealer = dealersQ.data?.find((d) => d.id === dealerId);
  const flagged = new Set(alerts.map((a) => a.serviceId));

  const offer = useMemo(() => {
    const usable = offers.filter((o) => o.serviceId === serviceId && o.status !== 'aceita' && o.status !== 'recusada');
    const byParam = usable.find((o) => o.id === params.offerId);
    return byParam ?? usable.sort((a, b) => b.discountPct - a.discountPct)[0] ?? null;
  }, [offers, serviceId, params.offerId]);

  const price = service ? Math.round(service.basePrice * (1 - Math.min(100, offer?.discountPct ?? 0) / 100)) : 0;

  const canNext = [!!serviceId, !!dealerId, !!time, true][step];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/inicio'));

  const submit = async () => {
    if (!serviceId || !dealerId || !time) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const [h, m] = time.split(':').map(Number);
      const when = new Date(day);
      when.setHours(h, m, 0, 0);
      const slots = await api.getSlots(dealerId, day);
      if (!slots.find((s) => s.time === time)?.available) throw new Error('Esse horário acabou de ser ocupado. Escolha outro.');
      const apt = await addAppointment({ serviceId, dealerId, date: when.toISOString(), notes: notes.trim(), offer });
      haptic('success');
      setDone(apt);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Não foi possível agendar.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={[styles.safe, styles.successWrap]} edges={['top', 'bottom']} testID="schedule-success">
        <View style={styles.successIcon}>
          <Icon name="checkmark" size={56} color="textOnBrand" />
        </View>
        <Text variant="display" align="center">
          Agendamento confirmado!
        </Text>
        <Text variant="body" color="textMuted" align="center">
          {service?.title} na {dealer?.name}
          {'\n'}
          {formatDateTime(done.date)}
        </Text>
        <Badge label={`+${POINTS_PER_APPOINTMENT} pontos Ford`} tone="success" icon="ribbon" />
        <Text variant="caption" color="textMuted" align="center">
          Vamos te lembrar um dia antes. Você também pode acompanhar pela Agenda.
        </Text>
        <View style={styles.successActions}>
          <Button label="Ver na agenda" icon="calendar-outline" onPress={() => router.replace(`/agendamento/${done.id}`)} />
          <Button label="Voltar ao início" variant="ghost" onPress={() => router.replace('/inicio')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="close" label="Fechar" onPress={close} />
        <View style={{ flex: 1 }}>
          <Text variant="caption" color="textMuted">
            Passo {step + 1} de {STEPS.length}
          </Text>
          <Text variant="heading">{STEPS[step]}</Text>
        </View>
      </View>
      <View style={styles.progress}>
        <ProgressBar value={(step + 1) / STEPS.length} height={4} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {step === 0 &&
          services.map((s) => {
            const on = s.id === serviceId;
            return (
              <Pressable
                key={s.id}
                testID={`svc-${s.id}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => {
                  haptic('selection');
                  setServiceId(s.id);
                }}
                style={[styles.option, on && styles.optionOn]}
              >
                <View style={styles.optIcon}>
                  <Icon name={s.icon as IconName} size={20} color="brand" />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodyStrong">{s.title}</Text>
                  <Text variant="caption" color="textMuted">
                    {s.priceRange} · ~{s.durationMin} min
                  </Text>
                  {flagged.has(s.id) && <Badge label="Recomendado pelo seu veículo" tone="warning" icon="pulse" />}
                </View>
                <Radio on={on} />
              </Pressable>
            );
          })}

        {step === 1 &&
          (dealersQ.loading ? (
            <LoadingList count={3} />
          ) : dealersQ.error ? (
            <ErrorState message={dealersQ.error} onRetry={dealersQ.reload} />
          ) : (
            dealersQ.data?.map((d, i) => {
              const on = d.id === dealerId;
              return (
                <Pressable
                  key={d.id}
                  testID={`dealer-${d.id}`}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => {
                    haptic('selection');
                    setDealerId(d.id);
                  }}
                  style={[styles.option, on && styles.optionOn]}
                >
                  <View style={styles.optIcon}>
                    <Icon name="storefront" size={20} color="brand" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="bodyStrong">{d.name}</Text>
                    <Text variant="caption" color="textMuted">
                      {d.address} · {d.city}
                    </Text>
                    <View style={styles.inline}>
                      <Icon name="navigate" size={12} color="textMuted" />
                      <Text variant="caption" color="textMuted">
                        {d.distanceKm.toFixed(1)} km
                      </Text>
                      <Icon name="star" size={12} color="warning" />
                      <Text variant="caption" color="textMuted">
                        {d.rating}
                      </Text>
                      {i === 0 && <Badge label="Mais próxima" tone="primary" />}
                    </View>
                  </View>
                  <Radio on={on} />
                </Pressable>
              );
            })
          ))}

        {step === 2 && (
          <>
            <Text variant="label" color="textSecondary">
              Dia
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {days.map((d) => {
                const on = d.getTime() === day.getTime();
                const [wd, rest] = formatDayShort(d).split(', ');
                return (
                  <Pressable
                    key={d.toISOString()}
                    onPress={() => {
                      haptic('selection');
                      setDay(d);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.day, on && styles.dayOn]}
                  >
                    <Text variant="caption" color={on ? 'textOnBrandMuted' : 'textMuted'} style={{ textTransform: 'uppercase' }}>
                      {wd}
                    </Text>
                    <Text variant="title" color={on ? 'textOnBrand' : 'text'}>
                      {rest.split(' ')[0]}
                    </Text>
                    <Text variant="caption" color={on ? 'textOnBrandMuted' : 'textMuted'}>
                      {rest.split(' ')[1]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text variant="label" color="textSecondary" style={{ marginTop: spacing.md }}>
              Horários disponíveis · {dealer?.name}
            </Text>
            {slotsQ.loading ? (
              <View style={styles.slots}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} height={38} width={84} style={{ borderRadius: radius.pill }} />
                ))}
              </View>
            ) : slotsQ.error ? (
              <ErrorState message={slotsQ.error} onRetry={slotsQ.reload} />
            ) : (
              <View style={styles.slots}>
                {slotsQ.data?.map((s) => (
                  <Chip key={s.time} testID={`slot-${s.time}`} label={s.time} selected={time === s.time} disabled={!s.available} onPress={() => setTime(s.time)} />
                ))}
              </View>
            )}
          </>
        )}

        {step === 3 && service && dealer && time && (
          <>
            <Card style={{ gap: spacing.xs }}>
              <KeyValue icon="construct-outline" label="Serviço" value={service.title} />
              <KeyValue icon="storefront-outline" label="Local" value={dealer.name} />
              <KeyValue icon="calendar-outline" label="Quando" value={`${formatDayShort(day)} · ${time}`} />
              <KeyValue icon="time-outline" label="Duração" value={`~${service.durationMin} min`} />
            </Card>
            {offer ? (
              <Card tone="primary" style={styles.offerBox}>
                <Icon name="pricetag" size={20} color="primary" />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">Oferta aplicada: {discountLabel(offer)}</Text>
                  <Text variant="caption" color="textSecondary">
                    {offer.title}
                  </Text>
                </View>
              </Card>
            ) : null}
            <Card style={{ gap: spacing.xs }}>
              <KeyValue label="Preço de tabela" value={formatCurrency(service.basePrice)} />
              {offer && offer.discountPct > 0 && <KeyValue label="Desconto" value={`- ${formatCurrency(service.basePrice - price)}`} />}
              <KeyValue label="Total estimado" value={formatCurrency(price)} />
              <KeyValue label="Pontos Ford" value={`+${POINTS_PER_APPOINTMENT}`} />
            </Card>
            <Input label="Observações (opcional)" placeholder="Ex.: barulho ao frear" multiline value={notes} onChangeText={setNotes} maxLength={200} style={{ minHeight: 80, textAlignVertical: 'top' }} />
            {submitError && (
              <View style={styles.errorBox} testID="schedule-error">
                <Icon name="alert-circle" size={18} color="danger" />
                <Text variant="label" color="danger" style={{ flex: 1 }}>
                  {submitError}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 0 && <Button label="Voltar" variant="secondary" fullWidth={false} onPress={() => setStep(step - 1)} style={{ flex: 1 }} />}
        {step < STEPS.length - 1 ? (
          <Button label="Continuar" iconRight="arrow-forward" disabled={!canNext} onPress={() => setStep(step + 1)} style={{ flex: 2 }} fullWidth={false} testID="wizard-next" />
        ) : (
          <Button label="Confirmar" icon="checkmark-circle" loading={saving} onPress={submit} style={{ flex: 2 }} fullWidth={false} testID="wizard-confirm" />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: layout.screenPadding, paddingTop: spacing.md, paddingBottom: spacing.md },
  progress: { paddingHorizontal: layout.screenPadding },
  content: { padding: layout.screenPadding, gap: spacing.md, paddingBottom: spacing.huge },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  optIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  inline: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  day: { width: 64, paddingVertical: spacing.md, borderRadius: radius.lg, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dayOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  offerBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, padding: spacing.md, borderRadius: radius.md },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  successWrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxxl, gap: spacing.lg },
  successIcon: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  successActions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.lg },
});
