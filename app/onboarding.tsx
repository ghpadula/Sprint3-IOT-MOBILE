import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wordmark } from '@/components/Brand';
import { Button, Icon, IconName, LightStatusBar, Text } from '@/components/ui';
import { colors, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';

const slides: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'pulse',
    title: 'Seu Ford conectado a você',
    text: 'Acompanhe óleo, bateria, pneus e alertas do veículo em tempo real, direto pela telemetria IoT.',
  },
  {
    icon: 'sparkles',
    title: 'Ofertas feitas para o seu momento',
    text: 'Nossa inteligência entende o momento do seu carro e sugere o serviço certo, com desconto, na hora certa.',
  },
  {
    icon: 'calendar',
    title: 'Agende em segundos na rede oficial',
    text: 'Escolha serviço, concessionária e horário. Receba lembretes e acumule pontos a cada visita.',
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuth();

  const finish = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const next = () => {
    if (index === slides.length - 1) return finish();
    listRef.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LightStatusBar />
      <View style={styles.top}>
        <Wordmark compact />
        <Pressable onPress={finish} hitSlop={12} accessibilityRole="button" testID="onboarding-skip">
          <Text variant="label" color="textOnBrandMuted">
            Pular
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.title}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.halo}>
              <View style={styles.iconWrap}>
                <Icon name={item.icon} size={56} color="textOnBrand" />
              </View>
            </View>
            <Text variant="display" color="textOnBrand" align="center">
              {item.title}
            </Text>
            <Text variant="body" color="textOnBrandMuted" align="center" style={styles.text}>
              {item.text}
            </Text>
          </View>
        )}
      />

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotOn]} />
          ))}
        </View>
        <Button
          testID="onboarding-next"
          label={index === slides.length - 1 ? 'Começar' : 'Próximo'}
          iconRight="arrow-forward"
          onPress={next}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.brand },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl, gap: spacing.lg },
  halo: { width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl },
  iconWrap: { width: 128, height: 128, borderRadius: 64, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  text: { maxWidth: 340 },
  bottom: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.xl },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotOn: { width: 24, backgroundColor: colors.textOnBrand },
});
