export const palette = {
  navy900: '#061A3A',
  navy800: '#0B2F6B',
  navy700: '#123F8A',
  blue500: '#2D7FF9',
  blue100: '#E7F0FF',
  blue50: '#F2F7FF',
  gray900: '#0E1726',
  gray700: '#344256',
  gray500: '#5B6B82',
  gray400: '#8A97AB',
  gray300: '#C5CEDB',
  gray200: '#E3E8F0',
  gray100: '#EEF1F6',
  gray50: '#F5F7FB',
  white: '#FFFFFF',
  green600: '#138A55',
  green100: '#E3F6EC',
  amber600: '#B7780A',
  amber100: '#FFF3DB',
  red600: '#C93636',
  red100: '#FDE8E8',
} as const;

export const colors = {
  brand: palette.navy800,
  brandStrong: palette.navy900,
  brandSoft: palette.navy700,
  primary: palette.blue500,
  primarySoft: palette.blue100,
  primaryTint: palette.blue50,

  background: palette.gray50,
  surface: palette.white,
  surfaceMuted: palette.gray100,
  border: palette.gray200,
  borderStrong: palette.gray300,

  text: palette.gray900,
  textSecondary: palette.gray700,
  textMuted: palette.gray500,
  textDisabled: palette.gray400,
  textOnBrand: palette.white,
  textOnBrandMuted: 'rgba(255,255,255,0.72)',

  success: palette.green600,
  successSoft: palette.green100,
  warning: palette.amber600,
  warningSoft: palette.amber100,
  danger: palette.red600,
  dangerSoft: palette.red100,
  info: palette.blue500,
  infoSoft: palette.blue100,

  overlay: 'rgba(6,26,58,0.55)',

  onBrandSuccess: '#5BE49B',
  onBrandWarning: '#FFC857',
  onBrandDanger: '#FF7A7A',
  onBrandSurface: 'rgba(255,255,255,0.08)',
  onBrandBorder: 'rgba(255,255,255,0.12)',
} as const;

export type ColorToken = keyof typeof colors;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1, textTransform: 'uppercase' as const },
  metric: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
} as const;

export type TypographyVariant = keyof typeof typography;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: palette.navy900,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: palette.navy900,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;

export const layout = {
  screenPadding: spacing.xl,
  touchMin: 48,
  tabBarHeight: 64,
} as const;

export const riskColors = {
  baixo: { fg: colors.success, bg: colors.successSoft },
  medio: { fg: colors.warning, bg: colors.warningSoft },
  alto: { fg: colors.danger, bg: colors.dangerSoft },
} as const;

export const theme = { colors, typography, spacing, radius, shadow, layout, fonts, riskColors };
export type Theme = typeof theme;
