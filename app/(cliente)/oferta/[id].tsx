import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { discountLabel } from '@/components/OfferCard';
import { Badge, Button, Card, Dialog, EmptyState, Icon, IconName, KeyValue, Screen, ScreenHeader, Text, useToast } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { services } from '@/data/mockData';
import { useApp } from '@/store/AppContext';
import { useClientOffers } from '@/store/hooks';
import { formatCurrency, formatDate } from '@/utils/format';
import { offerTagMeta } from '@/utils/offers';

export default function OfferDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const offers = useClientOffers();
  const { setOfferStatus } = useApp();
  const toast = useToast();
  const [decline, setDecline] = useState(false);
  const offer = offers.find((o) => o.id === id);

  useEffect(() => {
    if (offer && offer.status === 'nova') setOfferStatus(offer, 'vista');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer?.id]);

  if (!offer) {
    return (
      <Screen>
        <ScreenHeader title="Oferta" />
        <EmptyState icon="pricetag-outline" title="Oferta indisponível" description="Ela pode ter expirado ou já ter sido utilizada." actionLabel="Ver ofertas" onAction={() => router.replace('/beneficios')} />
      </Screen>
    );
  }

  const meta = offerTagMeta[offer.tag];
  const service = services.find((s) => s.id === offer.serviceId);
  const final = service ? Math.round(service.basePrice * (1 - Math.min(100, offer.discountPct) / 100)) : 0;
  const closed = offer.status === 'aceita' || offer.status === 'recusada';

  return (
    <Screen
      footer={
        closed ? (
          <Badge label={offer.status === 'aceita' ? 'Você já aproveitou esta oferta' : 'Oferta recusada'} tone={offer.status === 'aceita' ? 'success' : 'neutral'} />
        ) : (
          <View style={{ gap: spacing.xs }}>
            <Button label="Agendar com esta oferta" icon="calendar" onPress={() => router.push({ pathname: '/agendar', params: { serviceId: offer.serviceId, offerId: offer.id } })} testID="offer-accept" />
            <Button label="Não tenho interesse" variant="ghost" onPress={() => setDecline(true)} testID="offer-decline" />
          </View>
        )
      }
    >
      <ScreenHeader title="Oferta" />

      <Card tone="brand" style={{ gap: spacing.md }}>
        <Badge label={meta.label} tone="brand" icon={meta.icon as IconName} />
        <Text variant="title" color="textOnBrand">
          {offer.title}
        </Text>
        <View style={styles.bigRow}>
          <Text variant="metric" color="textOnBrand">
            {discountLabel(offer)}
          </Text>
          {service && service.basePrice > 0 && offer.discountPct > 0 && offer.discountPct < 100 && (
            <View>
              <Text variant="caption" color="textOnBrandMuted" style={styles.strike}>
                {formatCurrency(service.basePrice)}
              </Text>
              <Text variant="bodyStrong" color="textOnBrand">
                {formatCurrency(final)}
              </Text>
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.why}>
        <View style={styles.whyIcon}>
          <Icon name="bulb-outline" size={20} color="primary" />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label" color="textSecondary">
            Por que estou vendo isto?
          </Text>
          <Text variant="body">{offer.reason}</Text>
        </View>
      </Card>

      <Card style={{ gap: spacing.xs }}>
        <Text variant="body" color="textMuted" style={{ marginBottom: spacing.sm }}>
          {offer.description}
        </Text>
        <KeyValue icon="construct-outline" label="Serviço" value={service?.title ?? '—'} />
        <KeyValue icon="time-outline" label="Válida até" value={formatDate(offer.validUntil)} />
        <KeyValue icon="business-outline" label="Origem" value={offer.source === 'modelo' ? 'Ford Conecta (personalizada)' : 'Sua concessionária'} />
      </Card>

      <Text variant="caption" color="textMuted" align="center">
        Ofertas personalizadas usam dados de uso do veículo com o seu consentimento. Você pode desativar em Perfil › Privacidade.
      </Text>

      <Dialog
        visible={decline}
        icon="thumbs-down-outline"
        title="Dispensar oferta?"
        message="Vamos usar sua resposta para sugerir ofertas mais relevantes no futuro."
        confirmLabel="Dispensar"
        onCancel={() => setDecline(false)}
        onConfirm={() => {
          setOfferStatus(offer, 'recusada');
          setDecline(false);
          toast('Obrigado pelo retorno!', 'info');
          router.back();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bigRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  strike: { textDecorationLine: 'line-through' },
  why: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  whyIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
});
