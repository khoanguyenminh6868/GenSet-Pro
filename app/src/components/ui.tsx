import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../lib/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.screenContent} keyboardShouldPersistTaps="handled">
          <View style={styles.maxWidth}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.screenContent, styles.maxWidth, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Card({ children, style, accent }: { children: ReactNode; style?: ViewStyle; accent?: string }) {
  return <View style={[styles.card, accent ? { borderLeftWidth: 3, borderLeftColor: accent } : null, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionBar} />
      <Text style={[font.h2, { flex: 1 }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Button({
  title,
  onPress,
  icon,
  variant = 'primary',
  loading,
  disabled,
  compact,
}: {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  const fg = variant === 'primary' ? colors.onPrimary : variant === 'danger' ? colors.danger : colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        variant === 'primary' && { backgroundColor: pressed ? colors.primaryDark : colors.primary },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.primary, backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
        variant === 'danger' && { borderWidth: 1, borderColor: colors.danger },
        variant === 'ghost' && { backgroundColor: pressed ? colors.surfaceAlt : 'transparent' },
        (disabled || loading) && { opacity: 0.5 },
      ]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={fg} /> : null}
      <Text style={[styles.buttonText, { color: fg }, compact && { fontSize: 13 }]}>{title}</Text>
    </Pressable>
  );
}

export function Badge({ label, color = colors.primary, filled }: { label: string; color?: string; filled?: boolean }) {
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: filled ? color : 'transparent' }]}>
      <Text style={[styles.badgeText, { color: filled ? colors.onPrimary : color }]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, count }: { label: string; active: boolean; onPress: () => void; count?: number }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: colors.onPrimary }]}>
        {label}
        {count !== undefined ? ` · ${count}` : ''}
      </Text>
    </Pressable>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: spacing(3) }}>
      <Text style={[font.small, { marginBottom: spacing(1.5), textTransform: 'uppercase', letterSpacing: 0.6 }]}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.textFaint} {...props} style={[styles.input, props.multiline && styles.inputMulti, props.style]} />;
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={[font.small, { width: 128 }]}>{label}</Text>
      <Text style={[font.body, { flex: 1 }]}>{value}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={colors.primary} />
      <Text style={[font.h3, { marginTop: spacing(3), textAlign: 'center' }]}>{title}</Text>
      {text ? <Text style={[font.small, { textAlign: 'center', marginTop: spacing(1.5) }]}>{text}</Text> : null}
      {action ? <View style={{ marginTop: spacing(4) }}>{action}</View> : null}
    </View>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.error}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={[font.body, { flex: 1, color: colors.danger }]}>{message}</Text>
    </View>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: spacing(2) }}>
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: spacing(2) }}>
          <Text style={{ color: colors.primary, fontWeight: '800' }}>▸</Text>
          <Text style={[font.body, { flex: 1 }]}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: spacing(4), paddingBottom: spacing(10) },
  maxWidth: { width: '100%', maxWidth: 860, alignSelf: 'center' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(4),
    marginBottom: spacing(3),
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(4), marginBottom: spacing(3) },
  sectionBar: { width: 4, height: 18, backgroundColor: colors.primary, borderRadius: 2 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    borderRadius: radius.sm,
  },
  buttonCompact: { paddingVertical: spacing(2), paddingHorizontal: spacing(3) },
  buttonText: { fontSize: 15, fontWeight: '700' },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: spacing(2), paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    color: colors.text,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    fontSize: 15,
  },
  inputMulti: { minHeight: 140, textAlignVertical: 'top' },
  infoRow: { flexDirection: 'row', paddingVertical: spacing(1.5), gap: spacing(2) },
  empty: { alignItems: 'center', padding: spacing(8) },
  error: {
    flexDirection: 'row',
    gap: spacing(2),
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    padding: spacing(3),
    marginBottom: spacing(3),
    backgroundColor: 'rgba(255,90,79,0.08)',
  },
});
