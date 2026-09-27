import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabIcon } from '@/components/TabBarIcon';
import { tabScreenOptions } from '@/constants/navigation';
import { useClientOffers } from '@/store/hooks';

export default function ClienteTabs() {
  const insets = useSafeAreaInsets();
  const newOffers = useClientOffers().filter((o) => o.status === 'nova').length;
  return (
    <Tabs
      screenOptions={{
        ...tabScreenOptions,
        tabBarStyle: { ...tabScreenOptions.tabBarStyle, height: 68 + insets.bottom, paddingBottom: 10 + insets.bottom },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Início', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="veiculo" options={{ title: 'Veículo', tabBarIcon: tabIcon('car-sport') }} />
      <Tabs.Screen
        name="beneficios"
        options={{ title: 'Ofertas', tabBarIcon: tabIcon('pricetags'), tabBarBadge: newOffers || undefined }}
      />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: tabIcon('calendar') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: tabIcon('person-circle') }} />
    </Tabs>
  );
}
