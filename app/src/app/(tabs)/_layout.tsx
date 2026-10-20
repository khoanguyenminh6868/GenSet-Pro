import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/tabs';
import { Text, View } from 'react-native';
import type { IconName } from '../../components/ui';
import { colors } from '../../lib/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Gói thầu', icon: 'flash' },
  { name: 'pipeline', title: 'Theo dõi', icon: 'git-network-outline' },
  { name: 'analyze', title: 'Phân tích', icon: 'document-text-outline' },
  { name: 'compare', title: 'Đối chiếu', icon: 'git-compare-outline' },
  { name: 'translate', title: 'Dịch', icon: 'language-outline' },
];

function Brand() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ backgroundColor: colors.primary, borderRadius: 6, padding: 4 }}>
        <Ionicons name="flash" size={16} color={colors.onPrimary} />
      </View>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 }}>
        GenBid <Text style={{ color: colors.primary }}>Pro</Text>
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg, borderBottomColor: colors.border, borderBottomWidth: 1 },
        headerTitle: () => <Brand />,
        headerTitleAlign: 'left',
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} color={color as string} size={size} /> }}
        />
      ))}
    </Tabs>
  );
}
