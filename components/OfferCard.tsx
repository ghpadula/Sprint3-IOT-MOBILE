import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, Icon, IconName, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { services } from '@/data/mockData';
import { Offer } from '@/types';
import { daysUntil, formatCurrency } from '@/utils/format';
import { offerTagMeta } from '@/utils/offers';

export function discountLabel(o: Offer) {
  if (o.discountPct >= 100) return 'Grátis';
  if (o.discountPct > 0) return `${o.discountPct}% OFF`;
  return 'Cortesia';
}

export function OfferCard({ offer, compact }: { offer: Offer; compact?: boolean }) {
  const meta = offerTagMeta[offer.tag];
  const service = services.find((s) => s.id === offer.serviceId);
  const finalPrice = service ? Math.round(service.basePrice * (1 - Math.min(100, offer.discountPct) / 100)) : 0;
  const days = daysUntil(offer.validUntil);
  return (
    <Card
      testID={`offer-${offer.id}`}
      onPress={() => router.push(`/oferta/${offer.id}`)}
      accessibilityLabel={`Oferta: ${offer.title}`}
      style={[compact && styles.compact, offer.status === 'aceita' && styles.accepted]}
    >
      <View style={styles.top}>
        <Badge label={meta.label} tone={meta.tone} icon={meta.icon as IconName} />
        {offer.status === 'nova' && <View style={styles.newDot} accessibilityLabel="Nova" />}
        {offer.status === 'aceita' && <Badge label="Agendada" tone="success" icon="checkmark" />}
      </View>
      <Text variant="bodyStrong" numberOfLines={2} style={{ marginTop: spacing.sm }}>
        {offer.title}
      </Text>
      {!compact && (
        <Text variant="caption" color="textMuted" numberOfLines={2} style={{ marginTop: spacing.xs }}>
          {offer.reason}
        </Text>
      )}
      <View style={styles.bottom}>
        <View style={styles.discount}>
          <Text variant="label" color="primary" style={styles.discountText}>
            {discountLabel(offer)}
          </Text>
        </View>
        {service && service.basePrice > 0 && offer.discountPct > 0 && offer.discountPct < 100 && (
          <Text variant="caption" color="textMuted">
            por {formatCurrency(finalPrice)}
          </Text>
        )}
        <View style={{ flex: 1 }} />
        <Icon name="time-outline" size={14} color="textMuted" />
        <Text variant="caption" color="textMuted">
          {days <= 1 ? 'hoje' : `${days}d`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  compact: { width: 260 },
  accepted: { opacity: 0.75 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  newDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs + 2, marginTop: spacing.md },
  discount: { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  discountText: { fontFamily: 'Inter_700Bold' },
});
