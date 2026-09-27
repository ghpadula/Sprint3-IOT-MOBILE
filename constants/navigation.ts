import { colors, fonts } from './theme';

export const tabScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.brand,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 68,
    paddingTop: 8,
    paddingBottom: 10,
  },
  sceneStyle: { backgroundColor: colors.background },
} as const;
