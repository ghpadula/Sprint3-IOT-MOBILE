import { router } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState icon="compass-outline" title="Página não encontrada" description="O link que você abriu não existe mais." actionLabel="Ir para o início" onAction={() => router.replace('/')} />
    </Screen>
  );
}
