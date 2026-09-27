import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '@/components/Brand';
import { Button, Card, Chip, Icon, Input, Text, useToast } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { demoUsers } from '@/data/mockData';
import { ensureNotificationPermission } from '@/services/notifications';
import { useAuth } from '@/store/AuthContext';
import { firstName } from '@/utils/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passRef = useRef<TextInput>(null);

  const fill = (role: 'cliente' | 'concessionaria') => {
    const u = demoUsers.find((d) => d.role === role)!;
    setEmail(u.email);
    setPassword(u.password);
    setErrors({});
    setApiError(null);
  };

  const submit = async () => {
    const e: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) e.email = 'Informe um e-mail válido.';
    if (password.length < 6) e.password = 'A senha deve ter pelo menos 6 caracteres.';
    setErrors(e);
    setApiError(null);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'cliente') ensureNotificationPermission();
      toast(`Bem-vindo(a), ${firstName(user.name)}!`);
      router.replace(user.role === 'cliente' ? '/inicio' : '/painel');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.hero}>
        <Wordmark />
        <View style={{ gap: spacing.xs }}>
          <Text variant="display" color="textOnBrand">
            Entre na sua conta
          </Text>
          <Text variant="body" color="textOnBrandMuted">
            Clientes Ford e consultores da rede oficial usam o mesmo app.
          </Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Input
            testID="login-email"
            label="E-mail"
            icon="mail-outline"
            placeholder="voce@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setErrors((p) => ({ ...p, email: undefined }));
            }}
            onSubmitEditing={() => passRef.current?.focus()}
            error={errors.email}
          />
          <Input
            ref={passRef}
            testID="login-password"
            label="Senha"
            icon="lock-closed-outline"
            placeholder="Sua senha"
            secureTextEntry
            secureToggle
            returnKeyType="go"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            onSubmitEditing={submit}
            error={errors.password}
          />

          {apiError && (
            <View style={styles.apiError} testID="login-error" accessibilityLiveRegion="polite">
              <Icon name="alert-circle" size={18} color="danger" />
              <Text variant="label" color="danger" style={styles.flex}>
                {apiError}
              </Text>
            </View>
          )}

          <Button testID="login-submit" label="Entrar" icon="log-in-outline" loading={loading} onPress={submit} />

          <Card tone="muted" style={{ gap: spacing.md }}>
            <View style={styles.demoHead}>
              <Icon name="flask-outline" size={16} color="textSecondary" />
              <Text variant="label" color="textSecondary">
                Acesso de demonstração (senha ford2026)
              </Text>
            </View>
            <View style={styles.chips}>
              <Chip testID="demo-cliente" icon="person-outline" label="Sou cliente" onPress={() => fill('cliente')} />
              <Chip testID="demo-concessionaria" icon="storefront-outline" label="Sou concessionária" onPress={() => fill('concessionaria')} />
            </View>
          </Card>

          <Text variant="caption" color="textMuted" align="center">
            Ao entrar você concorda com o tratamento dos seus dados conforme a LGPD. Você pode revisar
            as permissões a qualquer momento em Perfil › Privacidade.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  hero: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.lg,
    gap: spacing.xxl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  form: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.huge },
  apiError: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.dangerSoft },
  demoHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
