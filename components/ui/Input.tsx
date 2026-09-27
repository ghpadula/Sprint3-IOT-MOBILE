import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { Icon, IconName } from './Icon';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string;
  icon?: IconName;
  secureToggle?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, icon, secureToggle, secureTextEntry, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;
  return (
    <View style={styles.wrap}>
      {label && (
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      )}
      <View style={[styles.field, { borderColor }, focused && styles.focused]}>
        {icon && <Icon name={icon} size={18} color={error ? 'danger' : focused ? 'primary' : 'textMuted'} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, style]}
          accessibilityLabel={label}
          {...rest}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color="textMuted" />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.msg}>
          <Icon name="alert-circle" size={14} color="danger" />
          <Text variant="caption" color="danger">
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs + 2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  focused: { backgroundColor: colors.primaryTint },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.text,
    paddingVertical: spacing.md,
    outlineStyle: 'none',
  } as object,
  msg: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
