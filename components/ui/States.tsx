import { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { Button } from './Button';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type EmptyProps = {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function EmptyState({ icon, title, description, actionLabel, onAction, testID }: EmptyProps) {
  return (
    <View style={styles.center} testID={testID ?? 'empty-state'}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={28} color="primary" />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {description && (
        <Text variant="body" color="textMuted" align="center">
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: spacing.sm }} />
      )}
    </View>
  );
}

type ErrorProps = { message?: string; onRetry?: () => void };

export function ErrorState({ message = 'Não foi possível carregar os dados.', onRetry }: ErrorProps) {
  return (
    <View style={styles.center} testID="error-state">
      <View style={[styles.iconCircle, { backgroundColor: colors.dangerSoft }]}>
        <Icon name="cloud-offline-outline" size={28} color="danger" />
      </View>
      <Text variant="heading" align="center">
        Algo deu errado
      </Text>
      <Text variant="body" color="textMuted" align="center">
        {message}
      </Text>
      {onRetry && (
        <Button label="Tentar novamente" icon="refresh" variant="secondary" onPress={onRetry} fullWidth={false} />
      )}
    </View>
  );
}

export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.skeleton, { height, width, opacity }, style]} />;
}

export function LoadingList({ count = 3 }: { count?: number }) {
  return (
    <View style={{ gap: spacing.md }} testID="loading-state" accessibilityLabel="Carregando">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.skelCard}>
          <Skeleton height={14} width="40%" />
          <Skeleton height={18} width="85%" />
          <Skeleton height={12} width="60%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.huge, paddingHorizontal: spacing.xl },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  skeleton: { backgroundColor: colors.border, borderRadius: radius.sm },
  skelCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
