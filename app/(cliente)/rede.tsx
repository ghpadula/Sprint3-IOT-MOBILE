import { router } from 'expo-router';
import { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Badge, Button, Card, ErrorState, Icon, Input, LoadingList, Screen, ScreenHeader, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { api } from '@/services/api';
import { fetchAddressByCep, maskCep } from '@/services/cep';
import { useAsync } from '@/store/hooks';
import { CepAddress } from '@/types';

export default function DealersScreen() {
  const dealersQ = useAsync(() => api.getDealers(), []);
  const [cep, setCep] = useState('01310-100');
  const [address, setAddress] = useState<CepAddress | null>(null);
  const [cepError, setCepError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    setSearching(true);
    setCepError(null);
    try {
      setAddress(await fetchAddressByCep(cep));
    } catch (e) {
      setAddress(null);
      setCepError(e instanceof Error ? e.message : 'Erro inesperado ao buscar CEP.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <Screen refreshing={dealersQ.refreshing} onRefresh={dealersQ.refresh}>
      <ScreenHeader title="Rede oficial" subtitle="Encontre a concessionária Ford mais conveniente" />

      <Card style={{ gap: spacing.md }}>
        <Text variant="heading">Buscar por CEP</Text>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <Input
              testID="cep-input"
              icon="location-outline"
              keyboardType="numeric"
              placeholder="00000-000"
              value={cep}
              onChangeText={(v) => setCep(maskCep(v))}
              onSubmitEditing={search}
              error={cepError}
            />
          </View>
          <Button label="Buscar" icon="search" fullWidth={false} loading={searching} onPress={search} style={{ height: 52 }} testID="cep-search" />
        </View>
        {address && (
          <View style={styles.address} testID="cep-result">
            <Icon name="map" size={18} color="primary" />
            <Text variant="caption" color="text" style={{ flex: 1 }}>
              {address.logradouro || 'Endereço sem logradouro'}, {address.bairro} — {address.localidade}/{address.uf}
            </Text>
          </View>
        )}
        <Text variant="caption" color="textMuted">
          Consulta em tempo real na API pública ViaCEP.
        </Text>
      </Card>

      {dealersQ.loading ? (
        <LoadingList count={3} />
      ) : dealersQ.error ? (
        <ErrorState message={dealersQ.error} onRetry={dealersQ.reload} />
      ) : (
        dealersQ.data?.map((d, i) => (
          <Card key={d.id} style={{ gap: spacing.md }}>
            <View style={styles.top}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="heading">{d.name}</Text>
                <Text variant="caption" color="textMuted">
                  {d.address} · {d.city}/{d.state}
                </Text>
              </View>
              <View style={styles.rating}>
                <Icon name="star" size={14} color="warning" />
                <Text variant="label" color="warning">
                  {d.rating}
                </Text>
              </View>
            </View>
            <View style={styles.meta}>
              <Badge label={`${d.distanceKm.toFixed(1)} km`} icon="navigate" tone={i === 0 ? 'primary' : 'neutral'} />
              <Badge label={d.phone} icon="call" />
              <Badge label={`CEP ${d.cep}`} />
            </View>
            <View style={styles.actions}>
              <Button label="Ligar" icon="call-outline" size="sm" variant="secondary" fullWidth={false} style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${d.phone.replace(/\D/g, '')}`)} />
              <Button label="Agendar aqui" icon="calendar-outline" size="sm" fullWidth={false} style={{ flex: 1 }} onPress={() => router.push('/agendar')} />
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  address: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primaryTint, borderRadius: radius.md, padding: spacing.md, alignItems: 'flex-start' },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.warningSoft, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
