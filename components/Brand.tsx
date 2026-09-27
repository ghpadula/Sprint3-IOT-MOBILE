import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing } from '@/constants/theme';
import { Text } from './ui/Text';

export function LogoMark({ size = 40, onBrand = true }: { size?: number; onBrand?: boolean }) {
  const fg = onBrand ? colors.textOnBrand : colors.brand;
  const bg = onBrand ? 'rgba(255,255,255,0.12)' : colors.primarySoft;
  const s = size;
  const c = s / 2;
  const r = s * 0.3;
  const arc = (rad: number, a0: number, a1: number, cx = c) => {
    const p = (a: number) => `${cx + rad * Math.cos((a * Math.PI) / 180)} ${c + rad * Math.sin((a * Math.PI) / 180)}`;
    return `M ${p(a0)} A ${rad} ${rad} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
  };
  return (
    <View style={{ width: s, height: s, borderRadius: s * 0.28, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={s} height={s}>
        <Path d={arc(r, 45, 315)} stroke={fg} strokeWidth={s * 0.08} fill="none" strokeLinecap="butt" />
        <Circle cx={c + r * 0.45} cy={c} r={s * 0.05} fill={colors.primary} />
        <Path d={arc(r * 0.35, -40, 40, c + r * 0.45)} stroke={colors.primary} strokeWidth={s * 0.045} fill="none" />
      </Svg>
    </View>
  );
}

export function Wordmark({ onBrand = true, compact }: { onBrand?: boolean; compact?: boolean }) {
  return (
    <View style={styles.row}>
      <LogoMark size={compact ? 32 : 40} onBrand={onBrand} />
      <View>
        <Text variant={compact ? 'bodyStrong' : 'heading'} color={onBrand ? 'textOnBrand' : 'brand'}>
          Ford Conecta
        </Text>
        {!compact && (
          <Text variant="caption" color={onBrand ? 'textOnBrandMuted' : 'textMuted'}>
            Prever para reter
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
