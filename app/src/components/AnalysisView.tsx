import { useState } from 'react';
import { Text, View } from 'react-native';
import { CATEGORY_LABEL, SEVERITY_LABEL } from '../lib/format';
import { colors, font, spacing } from '../lib/theme';
import type { Analysis, Severity } from '../lib/types';
import { Badge, Bullets, Card, Chip, InfoRow, SectionTitle } from './ui';

export const SEVERITY_COLOR: Record<Severity, string> = {
  critical: colors.danger,
  warning: colors.warning,
  info: colors.info,
};

const KEY_INFO_LABEL: Record<keyof Analysis['keyInfo'], string> = {
  bidName: 'Tên gói thầu',
  notifyNo: 'Số TBMT',
  investor: 'Chủ đầu tư',
  procuringEntity: 'Bên mời thầu',
  bidForm: 'Hình thức LCNT',
  bidMethod: 'Phương thức',
  closingTime: 'Đóng thầu',
  bidValidity: 'Hiệu lực HSDT',
  bidSecurity: 'Bảo đảm dự thầu',
  budget: 'Giá gói thầu',
  contractType: 'Loại hợp đồng',
  deliveryTime: 'Tiến độ cung cấp',
  deliveryLocation: 'Địa điểm',
  warranty: 'Bảo hành',
  evaluationMethod: 'Phương pháp đánh giá',
};

export function AnalysisView({ analysis }: { analysis: Analysis }) {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const counts = { critical: 0, warning: 0, info: 0 };
  for (const h of analysis.highlights) counts[h.severity]++;
  const highlights = analysis.highlights.filter((h) => filter === 'all' || h.severity === filter);

  return (
    <View>
      <Card accent={colors.primary}>
        <Text style={font.body}>{analysis.summary}</Text>
        <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(3), flexWrap: 'wrap' }}>
          <Badge label={`${counts.critical} nghiêm trọng`} color={colors.danger} />
          <Badge label={`${counts.warning} cần lưu ý`} color={colors.warning} />
          <Badge label={`${counts.info} thông tin`} color={colors.info} />
        </View>
      </Card>

      <SectionTitle>Điểm cần lưu ý</SectionTitle>
      <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(3) }}>
        <Chip label="Tất cả" active={filter === 'all'} onPress={() => setFilter('all')} count={analysis.highlights.length} />
        {(['critical', 'warning', 'info'] as const).map((s) => (
          <Chip key={s} label={SEVERITY_LABEL[s]} active={filter === s} onPress={() => setFilter(s)} count={counts[s]} />
        ))}
      </View>
      {highlights.map((h, i) => (
        <Card key={i} accent={SEVERITY_COLOR[h.severity]}>
          <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', marginBottom: spacing(2) }}>
            <Badge label={SEVERITY_LABEL[h.severity]} color={SEVERITY_COLOR[h.severity]} filled={h.severity === 'critical'} />
            <Badge label={CATEGORY_LABEL[h.category] ?? h.category} color={colors.textMuted} />
            {h.reference ? <Text style={font.small}>{h.reference}</Text> : null}
          </View>
          <Text style={font.h3}>{h.title}</Text>
          <Text style={[font.body, { marginTop: spacing(1.5) }]}>{h.detail}</Text>
          {h.quote ? (
            <View style={{ borderLeftWidth: 2, borderLeftColor: colors.border, paddingLeft: spacing(3), marginTop: spacing(2) }}>
              <Text style={[font.small, { fontStyle: 'italic' }]}>“{h.quote}”</Text>
            </View>
          ) : null}
          <Text style={[font.body, { marginTop: spacing(2), color: colors.primary }]}>→ {h.recommendation}</Text>
        </Card>
      ))}

      <SectionTitle>Thông tin chính</SectionTitle>
      <Card>
        {(Object.keys(KEY_INFO_LABEL) as (keyof Analysis['keyInfo'])[]).map((k) => (
          <InfoRow key={k} label={KEY_INFO_LABEL[k]} value={analysis.keyInfo[k]} />
        ))}
      </Card>

      {analysis.technicalSpecs.length ? (
        <>
          <SectionTitle>Yêu cầu kỹ thuật</SectionTitle>
          <Card>
            {analysis.technicalSpecs.map((s, i) => (
              <View key={i} style={{ paddingVertical: spacing(2), borderBottomWidth: i < analysis.technicalSpecs.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                <Text style={[font.h3, { color: colors.primary }]}>{s.item}</Text>
                <Text style={font.body}>{s.requirement}</Text>
                {s.reference ? <Text style={font.small}>{s.reference}</Text> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {analysis.qualificationRequirements.length ? (
        <>
          <SectionTitle>Năng lực - kinh nghiệm</SectionTitle>
          <Card>
            <Bullets items={analysis.qualificationRequirements.map((q) => (q.reference ? `${q.requirement} (${q.reference})` : q.requirement))} />
          </Card>
        </>
      ) : null}

      {analysis.requiredDocuments.length ? (
        <>
          <SectionTitle>Hồ sơ phải nộp</SectionTitle>
          <Card>
            <Bullets items={analysis.requiredDocuments} />
          </Card>
        </>
      ) : null}

      {analysis.restrictiveClauses.length ? (
        <>
          <SectionTitle>Điều khoản có dấu hiệu hạn chế</SectionTitle>
          <Card accent={colors.warning}>
            <Bullets items={analysis.restrictiveClauses} />
          </Card>
        </>
      ) : null}

      {analysis.questionsForClarification.length ? (
        <>
          <SectionTitle>Câu hỏi nên gửi làm rõ</SectionTitle>
          <Card>
            <Bullets items={analysis.questionsForClarification} />
          </Card>
        </>
      ) : null}
    </View>
  );
}
