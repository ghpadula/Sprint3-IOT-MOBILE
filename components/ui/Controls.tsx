import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { haptic } from '@/utils/haptics';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type ChipProps = { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; disabled?: boolean; testID?: string };

export function Chip({ label, selected, onPress, icon, disabled, testID }: ChipProps) {
  return (
    <Pressable
      testID={testID}
      disabled={disabled}
      onPress={() => {
        haptic('selection');
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      style={[styles.chip, selected && styles.chipOn, disabled && styles.chipDisabled]}
    >
      {icon && <Icon name={icon} size={14} color={selected ? 'textOnBrand' : 'textSecondary'} />}
      <Text variant="label" color={selected ? 'textOnBrand' : disabled ? 'textDisabled' : 'textSecondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  scroll = true,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
  scroll?: boolean;
}) {
  const chips = options.map((o) => (
    <Chip key={o.value} label={o.label} icon={o.icon} selected={o.value === value} onPress={() => onChange(o.value)} />
  ));
  if (!scroll) return <View style={styles.wrap}>{chips}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hscroll}>
      {chips}
    </ScrollView>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.seg} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              haptic('selection');
              onChange(o.value);
            }}
            style={[styles.segItem, on && styles.segOn]}
          >
            <Text variant="label" color={on ? 'brand' : 'textMuted'}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SwitchRow({
  title,
  description,
  value,
  onChange,
  icon,
  testID,
}: {
  title: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: IconName;
  testID?: string;
}) {
  return (
    <View style={styles.switchRow}>
      {icon && (
        <View style={styles.switchIcon}>
          <Icon name={icon} size={18} color="primary" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{title}</Text>
        {description && (
          <Text variant="caption" color="textMuted">
            {description}
          </Text>
        )}
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={(v) => {
          haptic('selection');
          onChange(v);
        }}
        trackColor={{ true: colors.primary, false: colors.borderStrong }}
        thumbColor={colors.surface}
        {...({ activeThumbColor: colors.surface } as object)}
        accessibilityLabel={title}
      />
    </View>
  );
}

export function ProgressBar({ value, tone = 'primary', height = 8 }: { value: number; tone?: 'primary' | 'success' | 'warning' | 'danger'; height?: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const fg = { primary: colors.primary, success: colors.success, warning: colors.warning, danger: colors.danger }[tone];
  return (
    <View
      style={[styles.track, { height, borderRadius: height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
    >
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: fg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md + 2,
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipDisabled: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hscroll: { gap: spacing.sm, paddingRight: spacing.lg },
  seg: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segOn: { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  switchIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  track: { backgroundColor: colors.surfaceMuted, overflow: 'hidden', width: '100%' },
});
