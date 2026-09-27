import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { colors, ColorToken } from '@/constants/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = { name: IconName; size?: number; color?: ColorToken; rawColor?: string };

export function Icon({ name, size = 20, color = 'text', rawColor }: Props) {
  return <Ionicons name={name} size={size} color={rawColor ?? colors[color]} />;
}
