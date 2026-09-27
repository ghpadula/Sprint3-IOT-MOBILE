import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppointmentCard } from '@/components/AppointmentCard';
import { Button, Card, EmptyState, Screen, Segmented, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useApp } from '@/store/AppContext';

type Tab = 'proximos' | 'historico';

export default function AgendaScreen() {
  const { appointments } = useApp();
  const [tab, setTab] = useState<Tab>('proximos');
  const now = Date.now();

  const upcoming = appointments
    .filter((a) => a.status === 'confirmado' && new Date(a.date).getTime() >= now)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const past = appointments
    .filter((a) => !(a.status === 'confirmado' && new Date(a.date).getTime() >= now))
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const list = tab === 'proximos' ? upcoming : past;

  return (
    <Screen
      footer={<Button label="Novo agendamento" icon="add" onPress={() => router.push('/agendar')} testID="agenda-new" />}
    >
      <View>
        <Text variant="title">Agenda</Text>
        <Text variant="caption" color="textMuted">
          Seus serviços na rede oficial Ford
        </Text>
      </View>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'proximos', label: `Próximos (${upcoming.length})` },
          { value: 'historico', label: 'Histórico' },
        ]}
      />
      {list.length ? (
        <View style={{ gap: spacing.md }} testID="agenda-list">
          {list.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState
            icon={tab === 'proximos' ? 'calendar-outline' : 'time-outline'}
            title={tab === 'proximos' ? 'Nenhum serviço agendado' : 'Sem histórico ainda'}
            description={
              tab === 'proximos'
                ? 'Agende sua revisão em menos de um minuto e ganhe pontos Ford.'
                : 'Os serviços concluídos e cancelados aparecem aqui.'
            }
          />
        </Card>
      )}
    </Screen>
  );
}
