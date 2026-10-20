import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';
import { AnalysisView } from '../../components/AnalysisView';
import { Badge, Button, Card, EmptyState, Field, InfoRow, Input, Screen, SectionTitle } from '../../components/ui';
import { formatDateTime, formatVnd, STAGES, timeLeft } from '../../lib/format';
import { useStore } from '../../lib/store';
import { colors, font, radius, spacing } from '../../lib/theme';

export default function TenderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { findTender, tracked, track, untrack, setStage, setNotes } = useStore();
  const tender = findTender(id);
  const entry = tracked[id];

  if (!tender) {
    return (
      <Screen>
        <EmptyState icon="help-circle-outline" title="Không tìm thấy gói thầu" text="Gói thầu có thể đã đóng và không còn trong danh sách." />
      </Screen>
    );
  }

  const left = timeLeft(tender.bidCloseDate);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', gap: spacing(2), flexWrap: 'wrap', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontWeight: '800' }}>{tender.notifyNo}</Text>
        {tender.isSample ? <Badge label="Dữ liệu mẫu" color={colors.info} /> : null}
        {left ? <Badge label={left.text} color={left.urgent ? colors.danger : colors.primary} filled /> : <Badge label="Đã đóng thầu" color={colors.textFaint} />}
      </View>
      <Text style={[font.h1, { marginTop: spacing(2) }]}>{tender.bidName}</Text>

      <Card style={{ marginTop: spacing(4) }}>
        <InfoRow label="Chủ đầu tư" value={tender.investorName} />
        <InfoRow label="Bên mời thầu" value={tender.procuringEntityName} />
        <InfoRow label="Địa điểm" value={tender.location} />
        <InfoRow label="Lĩnh vực" value={tender.field} />
        <InfoRow label="Hình thức" value={tender.bidForm} />
        <InfoRow label="Giá gói thầu" value={formatVnd(tender.estimatedPrice)} />
        <InfoRow label="Bảo đảm dự thầu" value={formatVnd(tender.bidSecurity)} />
        <InfoRow label="Ngày đăng" value={formatDateTime(tender.publicDate)} />
        <InfoRow label="Đóng thầu" value={formatDateTime(tender.bidCloseDate)} />
        <InfoRow label="Mở thầu" value={formatDateTime(tender.bidOpenDate)} />
        <InfoRow label="Số KHLCNT" value={tender.planNo} />
        <InfoRow label="Đấu thầu qua mạng" value={tender.isInternet === undefined ? undefined : tender.isInternet ? 'Có' : 'Không'} />
        <View style={{ marginTop: spacing(3) }}>
          <Button title="Mở trên muasamcong" icon="open-outline" variant="outline" compact onPress={() => Linking.openURL(tender.sourceUrl)} />
        </View>
      </Card>

      <SectionTitle>Vòng đời</SectionTitle>
      {entry ? (
        <>
          <View style={{ gap: spacing(2) }}>
            {STAGES.map((s, i) => {
              const active = entry.stage === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setStage(id, s.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing(3),
                    padding: spacing(3),
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? 'rgba(255,194,14,0.12)' : colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? colors.primary : colors.surfaceAlt,
                    }}
                  >
                    <Text style={{ color: active ? colors.onPrimary : colors.textMuted, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[font.h3, active && { color: colors.primary }]}>{s.label}</Text>
                    <Text style={font.small}>{s.hint}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <View style={{ marginTop: spacing(4) }}>
            <Field label="Ghi chú nội bộ">
              <Input multiline value={entry.notes} onChangeText={(t) => setNotes(id, t)} placeholder="Báo giá hãng, đối thủ, người phụ trách..." />
            </Field>
            <Button title="Bỏ theo dõi" variant="danger" compact icon="trash-outline" onPress={() => untrack(id)} />
          </View>
        </>
      ) : (
        <Card>
          <Text style={[font.body, { marginBottom: spacing(3) }]}>Đưa gói thầu vào quy trình để theo dõi từ đánh giá, chuẩn bị HSDT đến kết quả.</Text>
          <Button title="Theo dõi gói thầu" icon="bookmark" onPress={() => track(tender)} />
        </Card>
      )}

      <SectionTitle>Công cụ AI</SectionTitle>
      <View style={{ gap: spacing(2) }}>
        <Button
          title="Phân tích hồ sơ mời thầu"
          icon="sparkles"
          onPress={() => router.push({ pathname: '/analyze', params: { tenderId: id } })}
        />
        <Button
          title="Đối chiếu hồ sơ dự thầu"
          icon="git-compare-outline"
          variant="outline"
          onPress={() => router.push({ pathname: '/compare', params: { tenderId: id } })}
        />
      </View>
      <Text style={[font.small, { marginTop: spacing(2) }]}>Tải E-HSMT từ trang muasamcong (nút “Mở trên muasamcong”) rồi đưa vào công cụ phân tích.</Text>

      {entry?.analysis ? (
        <>
          <SectionTitle>Kết quả phân tích ({formatDateTime(entry.analyzedAt)})</SectionTitle>
          <AnalysisView analysis={entry.analysis} />
        </>
      ) : null}
    </Screen>
  );
}
