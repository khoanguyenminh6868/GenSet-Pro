import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CATEGORY_LABEL, STATUS_LABEL } from '../lib/format';
import { colors, font, spacing } from '../lib/theme';
import type { ComplianceStatus, Comparison } from '../lib/types';
import { Badge, Bullets, Card, Chip, SectionTitle } from './ui';

const STATUS_COLOR: Record<ComplianceStatus, string> = {
  met: colors.success,
  partial: colors.warning,
  not_met: colors.danger,
  missing: colors.danger,
  unclear: colors.info,
};

const VERDICT = {
  pass: { label: 'Đáp ứng', color: colors.success },
  at_risk: { label: 'Có rủi ro', color: colors.warning },
  fail: { label: 'Không đáp ứng', color: colors.danger },
};

export function ComparisonView({ comparison }: { comparison: Comparison }) {
  const [onlyGaps, setOnlyGaps] = useState(true);
  const verdict = VERDICT[comparison.verdict];
  const gaps = comparison.items.filter((i) => i.status !== 'met');
  const items = (onlyGaps ? gaps : comparison.items)
    .slice()
    .sort((a, b) => Number(b.critical) - Number(a.critical));

  return (
    <View>
      <Card accent={verdict.color}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(4) }}>
          <View style={[styles.score, { borderColor: verdict.color }]}>
            <Text style={[styles.scoreText, { color: verdict.color }]}>{Math.round(comparison.overallScore)}</Text>
            <Text style={font.small}>/100</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Badge label={verdict.label} color={verdict.color} filled />
            <Text style={[font.body, { marginTop: spacing(2) }]}>{comparison.summary}</Text>
          </View>
        </View>
        <Text style={[font.small, { marginTop: spacing(3) }]}>
          {comparison.items.length} yêu cầu · {comparison.items.length - gaps.length} đạt · {gaps.length} cần xử lý
        </Text>
      </Card>

      {comparison.recommendations.length ? (
        <>
          <SectionTitle>Việc cần làm trước khi nộp</SectionTitle>
          <Card accent={colors.primary}>
            <Bullets items={comparison.recommendations} />
          </Card>
        </>
      ) : null}

      {comparison.missingDocuments.length ? (
        <>
          <SectionTitle>Tài liệu còn thiếu</SectionTitle>
          <Card accent={colors.danger}>
            <Bullets items={comparison.missingDocuments} />
          </Card>
        </>
      ) : null}

      <SectionTitle>Bảng đối chiếu</SectionTitle>
      <View style={{ flexDirection: 'row', gap: spacing(2), marginBottom: spacing(3) }}>
        <Chip label="Chưa đạt" active={onlyGaps} onPress={() => setOnlyGaps(true)} count={gaps.length} />
        <Chip label="Tất cả" active={!onlyGaps} onPress={() => setOnlyGaps(false)} count={comparison.items.length} />
      </View>
      {items.map((it, i) => (
        <Card key={i} accent={STATUS_COLOR[it.status]}>
          <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(2) }}>
            <Badge label={STATUS_LABEL[it.status]} color={STATUS_COLOR[it.status]} filled />
            <Badge label={CATEGORY_LABEL[it.category] ?? it.category} color={colors.textMuted} />
            {it.critical ? <Badge label="Có thể bị loại" color={colors.danger} /> : null}
          </View>
          <Text style={font.small}>YÊU CẦU{it.requirementRef ? ` · ${it.requirementRef}` : ''}</Text>
          <Text style={[font.body, { marginBottom: spacing(2) }]}>{it.requirement}</Text>
          <Text style={font.small}>HỒ SƠ DỰ THẦU{it.offeredRef ? ` · ${it.offeredRef}` : ''}</Text>
          <Text style={[font.body, { marginBottom: spacing(2), color: it.offered ? colors.text : colors.textFaint }]}>
            {it.offered ?? 'Không tìm thấy trong hồ sơ dự thầu'}
          </Text>
          <Text style={[font.body, { color: colors.primary }]}>→ {it.note}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  score: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 28, fontWeight: '900' },
});
