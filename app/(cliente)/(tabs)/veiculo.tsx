import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AlertItem } from '@/components/AlertItem';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Icon,
  IconName,
  Input,
  KeyValue,
  ProgressBar,
  Screen,
  Segmented,
  SectionHeader,
  Skeleton,
  Text,
  TrendLine,
  useToast,
} from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { telemetryTopic } from '@/services/telemetry';
import { useApp } from '@/store/AppContext';
import { useTelemetry } from '@/store/TelemetryContext';
import { TelemetrySourceKind } from '@/types';
import { formatKm } from '@/utils/format';
import { TIRE_POSITIONS, TIRE_TARGET_PSI } from '@/utils/maintenance';

function Metric({ icon, label, value, unit, tone = 'primary', progress }: { icon: IconName; label: string; value: string; unit?: string; tone?: 'primary' | 'success' | 'warning' | 'danger'; progress?: number }) {
  return (
    <Card style={styles.metric}>
      <View style={styles.metricHead}>
        <Icon name={icon} size={16} color={tone === 'primary' ? 'textMuted' : tone} />
        <Text variant="caption" color="textMuted">
          {label}
        </Text>
      </View>
      <Text variant="title">
        {value}
        {unit && (
          <Text variant="label" color="textMuted">
            {' '}
            {unit}
          </Text>
        )}
      </Text>
      {progress !== undefined && <ProgressBar value={progress} tone={tone} height={6} />}
    </Card>
  );
}

function useSecondsAgo(ts?: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return ts ? Math.max(0, Math.round((now - ts) / 1000)) : null;
}

export default function VehicleScreen() {
  const { vehicle, demo, setDemo, consent, setConsent, updateMileage } = useApp();
  const { telemetry: t, status, statusDetail, alerts, history, injectFault, clearFaults, reconnect } = useTelemetry();
  const toast = useToast();
  const [mqttUrl, setMqttUrl] = useState(demo.mqttUrl);
  const [kmText, setKmText] = useState(String(vehicle.mileage));
  const [kmError, setKmError] = useState<string | null>(null);
  const ago = useSecondsAgo(t?.timestamp);

  useEffect(() => setKmText(String(vehicle.mileage)), [vehicle.mileage]);

  if (!consent.telemetry) {
    return (
      <Screen>
        <Text variant="title">Meu veículo</Text>
        <Card>
          <EmptyState
            icon="eye-off-outline"
            title="Telemetria desativada"
            description="Você desativou a coleta de dados do veículo. Sem ela não conseguimos avisar sobre óleo, bateria e pneus."
            actionLabel="Ativar telemetria"
            onAction={() => setConsent({ telemetry: true })}
          />
        </Card>
      </Screen>
    );
  }

  const statusTone = status === 'online' ? 'success' : status === 'conectando' ? 'warning' : 'danger';
  const statusLabel = { online: 'Online', conectando: 'Conectando', offline: 'Offline', erro: 'Erro' }[status];

  const saveKm = () => {
    const km = Number(kmText.replace(/\D/g, ''));
    if (!km || km < vehicle.lastServiceKm) {
      setKmError(`Informe um valor acima de ${formatKm(vehicle.lastServiceKm)} (última revisão).`);
      return;
    }
    if (km > vehicle.mileage + 50000) {
      setKmError('Valor muito acima do atual. Confira a quilometragem.');
      return;
    }
    setKmError(null);
    updateMileage(km);
    toast('Quilometragem atualizada');
  };

  const changeSource = (s: TelemetrySourceKind) => setDemo({ telemetrySource: s });

  return (
    <Screen>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="title">Meu veículo</Text>
          <Text variant="caption" color="textMuted">
            {vehicle.model} {vehicle.version} · VIN {vehicle.vin.slice(-6)}
          </Text>
        </View>
        <Badge label={statusLabel} tone={statusTone} icon="radio" testID="telemetry-status" />
      </View>

      <Card style={{ gap: spacing.md }}>
        <View style={styles.rowBetween}>
          <Text variant="heading">Fonte dos dados</Text>
          <Text variant="caption" color="textMuted">
            {ago !== null ? `atualizado há ${ago}s` : ''}
          </Text>
        </View>
        <Segmented<TelemetrySourceKind>
          value={demo.telemetrySource}
          onChange={changeSource}
          options={[
            { value: 'simulador', label: 'Simulador' },
            { value: 'mqtt', label: 'MQTT (IoT)' },
          ]}
        />
        {demo.telemetrySource === 'mqtt' && (
          <View style={{ gap: spacing.md }}>
            <Input label="Broker (WebSocket)" icon="server-outline" autoCapitalize="none" value={mqttUrl} onChangeText={setMqttUrl} hint={`Tópico: ${telemetryTopic(vehicle.vin)}`} />
            <Button
              label="Conectar"
              icon="link-outline"
              variant="secondary"
              onPress={() => {
                if (!/^wss?:\/\//.test(mqttUrl)) return toast('A URL deve começar com ws:// ou wss://', 'error');
                if (mqttUrl === demo.mqttUrl) reconnect();
                else setDemo({ mqttUrl });
              }}
            />
          </View>
        )}
        {(status === 'erro' || status === 'offline') && statusDetail && (
          <View style={styles.errorBox}>
            <Icon name="cloud-offline-outline" size={18} color="danger" />
            <Text variant="caption" color="danger" style={{ flex: 1 }}>
              {statusDetail}
            </Text>
            <Button label="Tentar de novo" size="sm" variant="ghost" fullWidth={false} onPress={reconnect} />
          </View>
        )}
      </Card>

      {!t ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} style={styles.metric}>
              <Skeleton height={12} width="50%" />
              <Skeleton height={26} width="70%" />
            </Card>
          ))}
          {status === 'online' && (
            <Text variant="caption" color="textMuted">
              Conectado ao broker. Aguardando a primeira leitura do veículo…
            </Text>
          )}
        </View>
      ) : (
        <>
          <View style={styles.grid} testID="telemetry-grid">
            <Metric icon="speedometer-outline" label="Hodômetro" value={Math.floor(t.odometerKm).toLocaleString('pt-BR')} unit="km" />
            <Metric
              icon="water-outline"
              label="Vida útil do óleo"
              value={`${Math.round(t.oilLifePct)}`}
              unit="%"
              tone={t.oilLifePct <= 10 ? 'danger' : t.oilLifePct <= 20 ? 'warning' : 'success'}
              progress={t.oilLifePct / 100}
            />
            <Metric
              icon="battery-half-outline"
              label={t.ignitionOn ? 'Bateria (carregando)' : 'Bateria'}
              value={t.batteryV.toFixed(1)}
              unit="V"
              tone={t.batteryV < 12.0 ? 'danger' : t.batteryV < 12.3 ? 'warning' : 'success'}
            />
            <Metric icon="flame-outline" label="Combustível" value={`${Math.round(t.fuelPct)}`} unit="%" tone={t.fuelPct < 15 ? 'warning' : 'primary'} progress={t.fuelPct / 100} />
            <Metric icon="thermometer-outline" label="Temp. do motor" value={`${Math.round(t.engineTempC)}`} unit="°C" tone={t.engineTempC > 105 ? 'danger' : 'primary'} />
            <Metric icon="key-outline" label="Ignição" value={t.ignitionOn ? 'Ligada' : 'Desligada'} />
          </View>

          <Card>
            <View style={styles.rowBetween}>
              <Text variant="heading">Pressão dos pneus</Text>
              <Text variant="caption" color="textMuted">
                ideal {TIRE_TARGET_PSI} PSI
              </Text>
            </View>
            <View style={styles.tires}>
              <View style={styles.tireCol}>
                {[0, 2].map((i) => (
                  <Tire key={i} psi={t.tirePsi[i]} label={TIRE_POSITIONS[i]} />
                ))}
              </View>
              <View style={styles.carBody}>
                <Icon name="car-sport" size={40} color="textDisabled" />
              </View>
              <View style={styles.tireCol}>
                {[1, 3].map((i) => (
                  <Tire key={i} psi={t.tirePsi[i]} label={TIRE_POSITIONS[i]} />
                ))}
              </View>
            </View>
          </Card>

          {history.batteryV.length > 3 && (
            <Card>
              <Text variant="heading">Tensão da bateria</Text>
              <Text variant="caption" color="textMuted" style={{ marginBottom: spacing.md }}>
                Últimas {history.batteryV.length} leituras
              </Text>
              <TrendLine values={history.batteryV} height={90} />
            </Card>
          )}
        </>
      )}

      <SectionHeader title="Alertas" />
      {alerts.length ? (
        <View style={{ gap: spacing.sm }}>
          {alerts.map((a) => (
            <AlertItem key={a.id} alert={a} />
          ))}
        </View>
      ) : (
        <Card>
          <View style={styles.okRow}>
            <Icon name="checkmark-circle" size={24} color="success" />
            <Text variant="body" color="textSecondary" style={{ flex: 1 }}>
              Tudo certo com o seu veículo. Nenhum alerta no momento.
            </Text>
          </View>
        </Card>
      )}

      {demo.telemetrySource === 'simulador' && t && (
        <Card tone="muted" style={{ gap: spacing.sm }}>
          <Text variant="label" color="textSecondary">
            Modo demonstração do simulador
          </Text>
          <View style={styles.demoRow}>
            <Button label="Simular falha" icon="flash-outline" size="sm" variant="secondary" fullWidth={false} onPress={injectFault} testID="inject-fault" />
            <Button label="Limpar falhas" icon="refresh" size="sm" variant="ghost" fullWidth={false} onPress={clearFaults} />
          </View>
        </Card>
      )}

      <Card style={{ gap: spacing.md }}>
        <Text variant="heading">Atualizar quilometragem</Text>
        <Text variant="caption" color="textMuted">
          Use se o veículo estiver sem conexão. A recomendação de revisão é recalculada na hora.
        </Text>
        <View style={styles.kmRow}>
          <View style={{ flex: 1 }}>
            <Input keyboardType="numeric" value={kmText} onChangeText={(v) => setKmText(v.replace(/\D/g, ''))} error={kmError} icon="speedometer-outline" testID="km-input" />
          </View>
          <Button label="Salvar" fullWidth={false} onPress={saveKm} style={{ height: 52 }} />
        </View>
      </Card>

      <Card>
        <Text variant="heading" style={{ marginBottom: spacing.sm }}>
          Dados do veículo
        </Text>
        <KeyValue label="Modelo" value={`${vehicle.model} ${vehicle.version}`} />
        <KeyValue label="Ano" value={String(vehicle.year)} />
        <KeyValue label="Placa" value={vehicle.plate} />
        <KeyValue label="VIN" value={vehicle.vin} />
        <KeyValue label="Última revisão" value={formatKm(vehicle.lastServiceKm)} />
      </Card>
    </Screen>
  );
}

function Tire({ psi, label }: { psi: number; label: string }) {
  const low = psi < TIRE_TARGET_PSI - 5;
  return (
    <View style={[styles.tire, low && styles.tireLow]} accessibilityLabel={`${label}: ${psi.toFixed(0)} PSI`}>
      <Text variant="title" color={low ? 'danger' : 'text'}>
        {psi.toFixed(0)}
      </Text>
      <Text variant="caption" color={low ? 'danger' : 'textMuted'} style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metric: { flexBasis: '47%', flexGrow: 1, gap: spacing.sm },
  metricHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.dangerSoft, borderRadius: radius.md, paddingLeft: spacing.md },
  tires: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  tireCol: { gap: spacing.xxl },
  carBody: { width: 90, height: 150, borderRadius: 40, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  tire: { width: 100, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center' },
  tireLow: { backgroundColor: colors.dangerSoft },
  okRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  demoRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  kmRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
});
