import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Card, EmptyState, Icon, IconName, Screen, ScreenHeader, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useApp } from '@/store/AppContext';
import { NotificationType } from '@/types';
import { timeAgo } from '@/utils/format';

const typeMeta: Record<NotificationType, { icon: IconName; bg: string; fg: 'primary' | 'success' | 'warning' | 'brand' }> = {
  agendamento: { icon: 'calendar', bg: colors.successSoft, fg: 'success' },
  oferta: { icon: 'pricetag', bg: colors.primarySoft, fg: 'primary' },
  alerta: { icon: 'warning', bg: colors.warningSoft, fg: 'warning' },
  sistema: { icon: 'information-circle', bg: colors.surfaceMuted, fg: 'brand' },
};

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();

  return (
    <Screen>
      <ScreenHeader
        title="Notificações"
        subtitle={unreadCount ? `${unreadCount} não lida(s)` : 'Tudo lido'}
        right={unreadCount ? <Button label="Ler todas" size="sm" variant="ghost" fullWidth={false} onPress={markAllNotificationsRead} /> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState icon="notifications-off-outline" title="Nenhuma notificação" description="Avisos de agendamento, ofertas e alertas do veículo aparecem aqui." />
      ) : (
        <Card padded={false} style={{ overflow: 'hidden' }}>
          {notifications.map((n, i) => {
            const m = typeMeta[n.type];
            return (
              <Pressable
                key={n.id}
                testID={`notif-${i}`}
                accessibilityRole="button"
                onPress={() => {
                  markNotificationRead(n.id);
                  if (n.route) router.push(n.route as never);
                }}
                style={({ pressed }) => [styles.item, !n.read && styles.unread, i > 0 && styles.sep, pressed && { opacity: 0.7 }]}
              >
                <View style={[styles.icon, { backgroundColor: m.bg }]}>
                  <Icon name={m.icon} size={18} color={m.fg} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.titleRow}>
                    <Text variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
                      {n.title}
                    </Text>
                    <Text variant="caption" color="textMuted">
                      {timeAgo(n.createdAt)}
                    </Text>
                  </View>
                  <Text variant="caption" color="textSecondary">
                    {n.body}
                  </Text>
                </View>
                {!n.read && <View style={styles.dot} />}
              </Pressable>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'flex-start' },
  unread: { backgroundColor: colors.primaryTint },
  sep: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
});
