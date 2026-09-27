import { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  icon?: IconName;
  tone?: 'primary' | 'danger' | 'success';
  confirmLabel?: string;
  cancelLabel?: string | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function Dialog({
  visible,
  title,
  message,
  icon = 'help-circle',
  tone = 'primary',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading,
  onConfirm,
  onCancel,
  children,
}: Props) {
  const toneMap = {
    primary: { bg: colors.primarySoft, fg: 'primary' },
    danger: { bg: colors.dangerSoft, fg: 'danger' },
    success: { bg: colors.successSoft, fg: 'success' },
  } as const;
  const t = toneMap[tone];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Fechar">
        <Pressable style={styles.card} onPress={() => {}} accessibilityViewIsModal testID="dialog">
          <View style={[styles.icon, { backgroundColor: t.bg }]}>
            <Icon name={icon} size={26} color={t.fg} />
          </View>
          <Text variant="heading" align="center">
            {title}
          </Text>
          {message && (
            <Text variant="body" color="textMuted" align="center">
              {message}
            </Text>
          )}
          {children}
          <View style={styles.actions}>
            <Button label={confirmLabel} variant={tone === 'danger' ? 'danger' : 'primary'} onPress={onConfirm} loading={loading} testID="dialog-confirm" />
            {cancelLabel && <Button label={cancelLabel} variant="ghost" onPress={onCancel} testID="dialog-cancel" />}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadow.raised,
  },
  icon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.xs, marginTop: spacing.sm },
});
