import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';

type Name = ComponentProps<typeof Ionicons>['name'];

export function tabIcon(name: string) {
  return function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return <Ionicons name={(focused ? name : `${name}-outline`) as Name} size={24} color={color} />;
  };
}
