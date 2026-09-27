import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, ColorToken, typography, TypographyVariant } from '@/constants/theme';

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: 'left' | 'center' | 'right';
};

export function Text({ variant = 'body', color = 'text', align, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: colors[color] }, align && { textAlign: align }, styles.base, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { includeFontPadding: false },
});
