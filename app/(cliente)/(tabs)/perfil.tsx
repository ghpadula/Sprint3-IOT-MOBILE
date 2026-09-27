import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, Divider, ListRow, Screen, SectionHeader, SwitchRow, Text, useToast } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { MODEL } from '@/ml/churnModel';
import { ensureNotificationPermission } from '@/services/notifications';
import { useApp } from '@/store/AppContext';
import { useAuth } from '@/store/AuthContext';
import { formatKm, initials } from '@/utils/format';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { vehicle, consent, setConsent, demo, setDemo, resetDemoData, appointments, notifications } = useApp();
  const toast = useToast();
  const [dialog, setDialog] = useState<null | 'logout' | 'reset' | 'export'>(null);

  const doLogout = async () => {
    setDialog(null);
    await logout();
    router.replace('/login');
  };

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.avatar}>
          <Text variant="title" color="textOnBrand">
            {initials(user?.name ?? '')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="title">{user?.name}</Text>
          <Text variant="caption" color="textMuted">
            {user?.email}
          </Text>
        </View>
      </View>

      <Card>
        <ListRow icon="car-sport" title={`${vehicle.model} ${vehicle.version}`} subtitle={`${vehicle.plate} · ${formatKm(vehicle.mileage)}`} onPress={() => router.push('/veiculo')} />
        <Divider />
        <ListRow icon="notifications" title="Notificações" subtitle={`${notifications.filter((n) => !n.read).length} não lida(s)`} onPress={() => router.push('/notificacoes')} />
        <Divider />
        <ListRow icon="construct" title="Revisões e serviços" subtitle="Plano de manutenção do seu Ford" onPress={() => router.push('/servicos')} />
        <Divider />
        <ListRow icon="location" title="Rede oficial" subtitle="Concessionárias e busca por CEP" onPress={() => router.push('/rede')} />
      </Card>

      <SectionHeader title="Privacidade (LGPD)" />
      <Card>
        <SwitchRow
          icon="pulse"
          title="Telemetria do veículo"
          description="Leitura de óleo, bateria, pneus e falhas para alertas preventivos."
          value={consent.telemetry}
          onChange={(v) => setConsent({ telemetry: v })}
          testID="consent-telemetry"
        />
        <Divider />
        <SwitchRow
          icon="sparkles"
          title="Ofertas personalizadas"
          description="Usamos uso do veículo e histórico de serviços para sugerir ofertas."
          value={consent.personalizedOffers}
          onChange={(v) => setConsent({ personalizedOffers: v })}
          testID="consent-offers"
        />
        <Divider />
        <SwitchRow
          icon="notifications"
          title="Notificações push"
          description="Lembretes de revisão, confirmações e alertas do veículo."
          value={consent.pushNotifications}
          onChange={async (v) => {
            if (v) {
              const ok = await ensureNotificationPermission();
              if (!ok) toast('Permissão negada no sistema. Os avisos continuam na central do app.', 'info');
            }
            setConsent({ pushNotifications: v });
          }}
        />
      </Card>
      <Card tone="muted" style={{ gap: spacing.sm }}>
        <ListRow icon="download-outline" iconTone="neutral" title="Ver meus dados" subtitle="Direito de acesso (art. 18, LGPD)" onPress={() => setDialog('export')} />
        <ListRow icon="trash-outline" iconTone="danger" title="Apagar dados deste aparelho" subtitle="Remove histórico, agendamentos e preferências locais" onPress={() => setDialog('reset')} />
      </Card>

      <SectionHeader title="Modo demonstração" />
      <Card>
        <SwitchRow
          icon="cloud-offline-outline"
          title="Simular falha de rede"
          description="Força erro nas chamadas da API para demonstrar os estados de erro."
          value={demo.simulateNetworkError}
          onChange={(v) => setDemo({ simulateNetworkError: v })}
          testID="demo-network"
        />
      </Card>

      <Button label="Sair da conta" icon="log-out-outline" variant="secondary" onPress={() => setDialog('logout')} testID="logout" />
      <Text variant="caption" color="textMuted" align="center">
        Ford Conecta v{Constants.expoConfig?.version ?? '1.0.0'} · modelo de risco v{MODEL.version}
      </Text>

      <Dialog visible={dialog === 'logout'} icon="log-out-outline" title="Sair da conta?" message="Seus dados continuam salvos neste aparelho." confirmLabel="Sair" onConfirm={doLogout} onCancel={() => setDialog(null)} />
      <Dialog
        visible={dialog === 'reset'}
        tone="danger"
        icon="trash-outline"
        title="Apagar dados locais?"
        message="Agendamentos, notificações, pontos e preferências voltam ao estado inicial. Esta ação não pode ser desfeita."
        confirmLabel="Apagar tudo"
        onConfirm={async () => {
          setDialog(null);
          await resetDemoData();
          toast('Dados apagados');
        }}
        onCancel={() => setDialog(null)}
      />
      <Dialog visible={dialog === 'export'} icon="document-text-outline" title="Seus dados" confirmLabel="Fechar" cancelLabel={null} onConfirm={() => setDialog(null)} onCancel={() => setDialog(null)}>
        <View style={styles.dataBox}>
          <Text variant="caption" color="textSecondary">
            Nome: {user?.name}
            {'\n'}E-mail: {user?.email}
            {'\n'}Veículo: {vehicle.model} {vehicle.year} · VIN {vehicle.vin}
            {'\n'}Agendamentos: {appointments.length}
            {'\n'}Pontos: {vehicle.loyaltyPoints}
            {'\n'}Telemetria: {consent.telemetry ? 'autorizada' : 'negada'}
            {'\n'}Ofertas personalizadas: {consent.personalizedOffers ? 'autorizadas' : 'negadas'}
            {'\n\n'}Os dados ficam armazenados localmente; a sessão é guardada no armazenamento criptografado do sistema.
          </Text>
        </View>
      </Dialog>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  dataBox: { alignSelf: 'stretch', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md },
});
