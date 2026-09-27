import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ReactNode, useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, layout, radius, spacing } from '@/constants/theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

export function LightStatusBar() {
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );
  return focused ? <StatusBar style="light" /> : null;
}

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: ReactNode;
  background?: 'default' | 'surface';
  testID?: string;
};

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  refreshing,
  onRefresh,
  contentStyle,
  footer,
  background = 'default',
  testID,
}: ScreenProps) {
  const bg = background === 'surface' ? colors.surface : colors.background;
  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: bg }]} testID={testID}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

type HeaderProps = {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  onBack?: () => void;
};

export function ScreenHeader({ title, subtitle, back = true, right, onBack }: HeaderProps) {
  return (
    <View style={styles.header}>
      {back && (
        <IconButton
          icon="chevron-back"
          label="Voltar"
          onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        />
      )}
      <View style={styles.flex}>
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Text variant="heading">{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="button">
          <Text variant="label" color="primary">
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'default',
  badge,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  tone?: 'default' | 'onBrand';
  badge?: number;
}) {
  const onBrand = tone === 'onBrand';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconBtn,
        onBrand ? styles.iconBtnBrand : styles.iconBtnDefault,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Icon name={icon} size={22} color={onBrand ? 'textOnBrand' : 'text'} />
      {!!badge && badge > 0 && (
        <View style={styles.badge}>
          <Text variant="caption" color="textOnBrand" style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function Divider({ spaced }: { spaced?: boolean }) {
  return <View style={[styles.divider, spaced && { marginVertical: spacing.md }]} />;
}

export function KeyValue({ label, value, icon }: { label: string; value: string; icon?: IconName }) {
  return (
    <View style={styles.kv}>
      <View style={styles.kvLeft}>
        {icon && <Icon name={icon} size={16} color="textMuted" />}
        <Text variant="body" color="textMuted">
          {label}
        </Text>
      </View>
      <Text variant="bodyStrong" style={styles.kvValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function ListRow({
  icon,
  iconTone = 'primary',
  title,
  subtitle,
  right,
  onPress,
  testID,
}: {
  icon?: IconName;
  iconTone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  testID?: string;
}) {
  const tones = {
    primary: { bg: colors.primarySoft, fg: 'primary' },
    success: { bg: colors.successSoft, fg: 'success' },
    warning: { bg: colors.warningSoft, fg: 'warning' },
    danger: { bg: colors.dangerSoft, fg: 'danger' },
    neutral: { bg: colors.surfaceMuted, fg: 'textSecondary' },
  } as const;
  const t = tones[iconTone];
  const body = (
    <>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={20} color={t.fg} />
        </View>
      )}
      <View style={styles.flex}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="textMuted" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (onPress ? <Icon name="chevron-forward" size={18} color="textDisabled" /> : null)}
    </>
  );
  if (!onPress)
    return (
      <View style={styles.row} testID={testID}>
        {body}
      </View>
    );
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      testID={testID}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceMuted }]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: layout.screenPadding, gap: spacing.lg, paddingBottom: spacing.huge },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  iconBtn: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconBtnDefault: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  iconBtnBrand: { backgroundColor: 'rgba(255,255,255,0.12)' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, backgroundColor: colors.border },
  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.xs + 2 },
  kvLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  kvValue: { flexShrink: 1, textAlign: 'right' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.xs, borderRadius: radius.md },
  rowIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
