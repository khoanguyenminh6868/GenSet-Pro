import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDateTime, formatVnd, stageLabel, timeLeft } from '../lib/format';
import { colors, font, radius, spacing } from '../lib/theme';
import type { Stage, Tender } from '../lib/types';
import { Badge } from './ui';

export function TenderCard({ tender, stage }: { tender: Tender; stage?: Stage }) {
  const left = timeLeft(tender.bidCloseDate);
  const price = formatVnd(tender.estimatedPrice);
  return (
    <Pressable
      onPress={() => router.push(`/tender/${encodeURIComponent(tender.id)}`)}
      style={({ pressed }) => [styles.card, pressed && { borderColor: colors.primary }]}
    >
      <View style={styles.top}>
        <Text style={styles.notify}>{tender.notifyNo}</Text>
        {tender.isSample ? <Badge label="Dữ liệu mẫu" color={colors.info} /> : null}
        {stage ? <Badge label={stageLabel(stage)} filled /> : null}
        <View style={{ flex: 1 }} />
        {left ? (
          <View style={[styles.countdown, left.urgent && { backgroundColor: colors.danger }]}>
            <Ionicons name="time-outline" size={12} color={colors.onPrimary} />
            <Text style={styles.countdownText}>{left.text}</Text>
          </View>
        ) : (
          <Badge label="Đã đóng thầu" color={colors.textFaint} />
        )}
      </View>
      <Text style={[font.h3, { marginTop: spacing(2) }]} numberOfLines={3}>
        {tender.bidName}
      </Text>
      {tender.investorName ? (
        <Text style={[font.small, { marginTop: spacing(1.5) }]} numberOfLines={1}>
          {tender.investorName}
        </Text>
      ) : null}
      <View style={styles.meta}>
        {tender.location ? <Meta icon="location-outline" text={tender.location} /> : null}
        {price ? <Meta icon="cash-outline" text={price} /> : null}
        {tender.bidCloseDate ? <Meta icon="calendar-outline" text={`Đóng ${formatDateTime(tender.bidCloseDate)}`} /> : null}
      </View>
    </Pressable>
  );
}

function Meta({ icon, text }: { icon: 'location-outline' | 'cash-outline' | 'calendar-outline'; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={13} color={colors.primary} />
      <Text style={font.small}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing(4),
    marginBottom: spacing(3),
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flexWrap: 'wrap' },
  notify: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing(2),
    paddingVertical: 2,
  },
  countdownText: { color: colors.onPrimary, fontSize: 11, fontWeight: '800' },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginTop: spacing(3) },
});
