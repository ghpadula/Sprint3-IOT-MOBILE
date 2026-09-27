import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors, radius, spacing } from '@/constants/theme';
import { Text } from './Text';

export function ScoreRing({
  value,
  size = 96,
  stroke = 10,
  color = colors.primary,
  track = colors.surfaceMuted,
  label,
  caption,
  onBrand,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  label?: string;
  caption?: string;
  onBrand?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={`${caption ?? 'Score'} ${Math.round(value)} de 100`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant="title" color={onBrand ? 'textOnBrand' : 'text'} style={{ fontSize: size * 0.26, lineHeight: size * 0.3 }}>
          {label ?? Math.round(value)}
        </Text>
        {caption && (
          <Text variant="caption" color={onBrand ? 'textOnBrandMuted' : 'textMuted'} style={{ fontSize: 11 }}>
            {caption}
          </Text>
        )}
      </View>
    </View>
  );
}

export function RiskGauge({ value, color, size = 200 }: { value: number; color: string; size?: number }) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const pct = Math.max(0, Math.min(1, value));
  const arc = (p: number) => {
    const a = Math.PI * (1 - p);
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const start = arc(0);
  const end = arc(1);
  const cur = arc(pct);
  const h = size / 2 + stroke;
  return (
    <View style={{ width: size, height: h, alignItems: 'center' }}>
      <Svg width={size} height={h}>
        <Path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`} stroke={colors.surfaceMuted} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        {pct > 0.005 && (
          <Path d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${cur.x} ${cur.y}`} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.gaugeLabel]}>
        <Text variant="display" style={{ color }}>
          {Math.round(pct * 100)}%
        </Text>
        <Text variant="caption" color="textMuted">
          probabilidade de evasão
        </Text>
      </View>
    </View>
  );
}

export function BarChart({
  data,
  height = 140,
}: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={styles.bars} accessibilityLabel={data.map((d) => `${d.label}: ${d.value}`).join(', ')}>
      {data.map((d) => (
        <View key={d.label} style={styles.barCol}>
          <Text variant="label" color="textSecondary">
            {d.value}
          </Text>
          <View style={[styles.barTrack, { height }]}>
            <View style={[styles.bar, { height: Math.max(4, (d.value / max) * height), backgroundColor: d.color ?? colors.primary }]} />
          </View>
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function TrendLine({
  values,
  labels,
  width = 300,
  height = 120,
  color = colors.primary,
  target,
}: {
  values: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  target?: number;
}) {
  const pad = 8;
  const all = target !== undefined ? [...values, target] : values;
  const min = Math.min(...all) - 2;
  const max = Math.max(...all) + 2;
  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / (max - min)) * (height - pad * 2);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((g) => (
          <Line key={g} x1={0} x2={width} y1={height * g} y2={height * g} stroke={colors.border} strokeWidth={1} />
        ))}
        {target !== undefined && (
          <Line x1={0} x2={width} y1={y(target)} y2={y(target)} stroke={colors.success} strokeWidth={1.5} strokeDasharray="6 4" />
        )}
        <Polyline points={pts} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => (
          <Circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 3} fill={i === values.length - 1 ? color : colors.surface} stroke={color} strokeWidth={2} />
        ))}
      </Svg>
      {labels && (
        <View style={styles.trendLabels}>
          {labels.map((l) => (
            <Text key={l} variant="caption" color="textMuted" style={{ fontSize: 11 }}>
              {l}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export function ContributionBars({ items }: { items: { label: string; value: number; detail: string }[] }) {
  const max = Math.max(0.01, ...items.map((i) => Math.abs(i.value)));
  return (
    <View style={{ gap: spacing.md }}>
      {items.map((it) => {
        const pos = it.value >= 0;
        const w = (Math.abs(it.value) / max) * 100;
        return (
          <View key={it.label} style={{ gap: 4 }}>
            <View style={styles.contribHead}>
              <Text variant="label" style={{ flex: 1 }} numberOfLines={1}>
                {it.label}
              </Text>
              <Text variant="caption" color={pos ? 'danger' : 'success'} style={{ fontFamily: 'Inter_600SemiBold' }}>
                {pos ? '▲ aumenta' : '▼ reduz'}
              </Text>
            </View>
            <Svg width="100%" height={8}>
              <Rect x={0} y={0} width="100%" height={8} rx={4} fill={colors.surfaceMuted} />
              <Rect x={0} y={0} width={`${w}%`} height={8} rx={4} fill={pos ? colors.danger : colors.success} />
            </Svg>
            <Text variant="caption" color="textMuted">
              {it.detail}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  gaugeLabel: { alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  barCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barTrack: { width: '100%', justifyContent: 'flex-end', borderRadius: radius.sm, backgroundColor: colors.surfaceMuted, overflow: 'hidden' },
  bar: { width: '100%', borderRadius: radius.sm },
  trendLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  contribHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
