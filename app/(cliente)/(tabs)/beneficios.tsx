import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OfferCard } from '@/components/OfferCard';
import { Badge, Button, Card, Dialog, EmptyState, Icon, IconName, ProgressBar, Screen, Segmented, SectionHeader, Text, useToast } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { POINTS_PER_APPOINTMENT, useApp } from '@/store/AppContext';
import { useClientOffers } from '@/store/hooks';
import { formatDate } from '@/utils/format';

const rewards: { title: string; points: number; icon: IconName }[] = [
  { title: 'Diagnóstico gratuito', points: 500, icon: 'pulse' },
  { title: '10% em acessórios', points: 900, icon: 'pricetag' },
  { title: 'Lavagem cortesia', points: 1200, icon: 'sparkles' },
  { title: 'Revisão com 30% off', points: 2000, icon: 'construct' },
];

const LEVELS = [
  { name: 'Blue', min: 0 },
  { name: 'Blue Pro', min: 1500 },
  { name: 'Blue Elite', min: 3000 },
];

type Tab = 'ofertas' | 'pontos';

export default function BenefitsScreen() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'pontos' ? 'pontos' : 'ofertas');
  const { vehicle, appointments, consent, setConsent, redeemReward, redemptions } = useApp();
  const offers = useClientOffers();
  const toast = useToast();
  const [confirm, setConfirm] = useState<(typeof rewards)[number] | null>(null);

  const active = offers.filter((o) => o.status === 'nova' || o.status === 'vista');
  const history = offers.filter((o) => o.status === 'aceita' || o.status === 'recusada');

  const pts = vehicle.loyaltyPoints;
  const level = [...LEVELS].reverse().find((l) => pts >= l.min)!;
  const nextLevel = LEVELS.find((l) => l.min > pts);

  return (
    <Screen>
      <Text variant="title">Ofertas e benefícios</Text>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'ofertas', label: `Ofertas${active.length ? ` (${active.length})` : ''}` },
          { value: 'pontos', label: 'Pontos Ford' },
        ]}
      />

      {tab === 'ofertas' ? (
        <>
          {!consent.personalizedOffers && (
            <Card tone="primary" style={{ gap: spacing.sm }}>
              <Text variant="bodyStrong">Ofertas personalizadas desativadas</Text>
              <Text variant="caption" color="textSecondary">
                Você só verá ofertas enviadas pela concessionária. Ative para receber sugestões baseadas no uso do seu veículo.
              </Text>
              <Button label="Ativar ofertas personalizadas" size="sm" variant="secondary" onPress={() => setConsent({ personalizedOffers: true })} />
            </Card>
          )}
          {active.length ? (
            <View style={{ gap: spacing.md }} testID="offers-list">
              {active.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </View>
          ) : (
            <Card>
              <EmptyState icon="pricetags-outline" title="Sem ofertas no momento" description="Assim que o seu veículo precisar de algo, você recebe uma oferta aqui e uma notificação." />
            </Card>
          )}
          {history.length > 0 && (
            <>
              <SectionHeader title="Histórico" />
              {history.map((o) => (
                <Card key={o.id} style={styles.histRow}>
                  <Icon name={o.status === 'aceita' ? 'checkmark-circle' : 'close-circle'} size={20} color={o.status === 'aceita' ? 'success' : 'textDisabled'} />
                  <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>
                    {o.title}
                  </Text>
                  <Badge label={o.status === 'aceita' ? 'Aproveitada' : 'Recusada'} tone={o.status === 'aceita' ? 'success' : 'neutral'} />
                </Card>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          <Card tone="brand" style={{ gap: spacing.md }}>
            <View style={styles.loyaltyTop}>
              <View>
                <Badge label={level.name} tone="brand" icon="ribbon" />
                <Text variant="metric" color="textOnBrand" style={{ marginTop: spacing.sm }} testID="points">
                  {pts.toLocaleString('pt-BR')}
                </Text>
                <Text variant="caption" color="textOnBrandMuted">
                  pontos Ford
                </Text>
              </View>
              <Icon name="ribbon" size={48} color="textOnBrand" />
            </View>
            {nextLevel && (
              <>
                <ProgressBar value={(pts - level.min) / (nextLevel.min - level.min)} height={8} />
                <Text variant="caption" color="textOnBrandMuted">
                  Faltam {(nextLevel.min - pts).toLocaleString('pt-BR')} pontos para o nível {nextLevel.name}
                </Text>
              </>
            )}
          </Card>

          <View style={styles.stats}>
            <Card style={styles.stat}>
              <Text variant="title" color="brand">
                {appointments.filter((a) => a.status !== 'cancelado').length}
              </Text>
              <Text variant="caption" color="textMuted">
                serviços na rede
              </Text>
            </Card>
            <Card style={styles.stat}>
              <Text variant="title" color="brand">
                +{POINTS_PER_APPOINTMENT}
              </Text>
              <Text variant="caption" color="textMuted">
                pontos por agendamento
              </Text>
            </Card>
          </View>

          <SectionHeader title="Resgatar" />
          {rewards.map((r) => {
            const available = pts >= r.points;
            return (
              <Card key={r.title} style={styles.reward}>
                <View style={styles.rewardIcon}>
                  <Icon name={r.icon} size={22} color="brand" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{r.title}</Text>
                  <Text variant="caption" color="textMuted">
                    {r.points.toLocaleString('pt-BR')} pontos
                  </Text>
                </View>
                <Button label={available ? 'Resgatar' : 'Bloqueado'} size="sm" fullWidth={false} disabled={!available} variant={available ? 'primary' : 'secondary'} onPress={() => setConfirm(r)} />
              </Card>
            );
          })}

          {redemptions.length > 0 && (
            <>
              <SectionHeader title="Seus resgates" />
              {redemptions.map((r) => (
                <Card key={r.id} style={styles.reward}>
                  <Icon name="ticket-outline" size={22} color="success" />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{r.title}</Text>
                    <Text variant="caption" color="textMuted">
                      Código {r.code} · {formatDate(r.at)}
                    </Text>
                  </View>
                </Card>
              ))}
            </>
          )}
        </>
      )}

      <Dialog
        visible={!!confirm}
        icon="gift"
        title={`Resgatar ${confirm?.title}?`}
        message={`Serão usados ${confirm?.points.toLocaleString('pt-BR')} pontos. Você receberá um código para apresentar na concessionária.`}
        confirmLabel="Resgatar"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          const r = redeemReward(confirm.title, confirm.points);
          setConfirm(null);
          if (r) toast(`Resgatado! Código ${r.code}`);
          else toast('Pontos insuficientes', 'error');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  histRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  loyaltyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, gap: 2 },
  reward: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rewardIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
});
