import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { TenderCard } from '../../components/TenderCard';
import { Chip, EmptyState, Screen } from '../../components/ui';
import { STAGES } from '../../lib/format';
import { useStore } from '../../lib/store';
import { colors, font, radius, spacing } from '../../lib/theme';
import type { Stage } from '../../lib/types';

export default function PipelineScreen() {
  const { tracked } = useStore();
  const [stage, setStage] = useState<Stage | 'all'>('all');
  const all = Object.values(tracked);
  const counts = useMemo(() => {
    const c = Object.fromEntries(STAGES.map((s) => [s.key, 0])) as Record<Stage, number>;
    for (const t of all) c[t.stage]++;
    return c;
  }, [all]);
  const list = all
    .filter((t) => stage === 'all' || t.stage === stage)
    .sort((a, b) => (a.tender.bidCloseDate ?? '9').localeCompare(b.tender.bidCloseDate ?? '9'));
  const active = counts.reviewing + counts.preparing + counts.submitted;
  const decided = counts.won + counts.lost;

  return (
    <Screen>
      <Text style={font.h1}>Vòng đời gói thầu</Text>
      <Text style={[font.small, { marginTop: spacing(1) }]}>Theo dõi từ lúc phát hiện đến khi có kết quả.</Text>

      <View style={{ flexDirection: 'row', gap: spacing(3), marginTop: spacing(4) }}>
        <Stat label="Đang theo dõi" value={all.length} />
        <Stat label="Đang xử lý" value={active} />
        <Stat label="Tỉ lệ trúng" value={decided ? `${Math.round((counts.won / decided) * 100)}%` : '–'} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: spacing(4) }} contentContainerStyle={{ gap: spacing(2) }}>
        <Chip label="Tất cả" active={stage === 'all'} onPress={() => setStage('all')} count={all.length} />
        {STAGES.map((s) => (
          <Chip key={s.key} label={s.label} active={stage === s.key} onPress={() => setStage(s.key)} count={counts[s.key]} />
        ))}
      </ScrollView>

      {list.length ? (
        list.map((t) => <TenderCard key={t.tender.id} tender={t.tender} stage={t.stage} />)
      ) : (
        <EmptyState
          icon="bookmark-outline"
          title="Chưa có gói thầu nào ở đây"
          text="Mở một gói thầu ở tab Gói thầu và bấm “Theo dõi” để đưa vào quy trình."
        />
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing(3) }}>
      <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '900' }}>{value}</Text>
      <Text style={font.small}>{label}</Text>
    </View>
  );
}
