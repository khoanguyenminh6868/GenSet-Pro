import type { DocumentPickerAsset } from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { AnalysisView } from '../../components/AnalysisView';
import { FilePicker } from '../../components/FilePicker';
import { Button, Card, Chip, ErrorBox, Field, Input, Screen } from '../../components/ui';
import { api, ApiError } from '../../lib/api';
import { useStore } from '../../lib/store';
import { colors, font, spacing } from '../../lib/theme';
import type { Analysis } from '../../lib/types';

export default function AnalyzeScreen() {
  const { tenderId } = useLocalSearchParams<{ tenderId?: string }>();
  const { findTender, tracked, track, saveAnalysis } = useStore();
  const tender = tenderId ? findTender(tenderId) : undefined;

  const [files, setFiles] = useState<DocumentPickerAsset[]>([]);
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Analysis>();
  const shown = result ?? (tender ? tracked[tender.id]?.analysis : undefined);

  async function run() {
    setLoading(true);
    setError(undefined);
    try {
      const context = tender
        ? `${tender.notifyNo} – ${tender.bidName}; chủ đầu tư: ${tender.investorName ?? 'n/a'}; đóng thầu: ${tender.bidCloseDate ?? 'n/a'}`
        : undefined;
      const analysis = await api.analyze(files, { text: text.trim() || undefined, context, language });
      setResult(analysis);
      if (tender) {
        track(tender);
        saveAnalysis(tender.id, analysis);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={font.h1}>Phân tích hồ sơ mời thầu</Text>
      <Text style={[font.small, { marginTop: spacing(1), marginBottom: spacing(4) }]}>
        Tải E-HSMT/HSYC (tải từ muasamcong). AI đọc toàn bộ và đánh dấu các điểm có thể khiến hồ sơ bị loại.
      </Text>
      {tender ? (
        <Card accent={colors.primary}>
          <Text style={font.small}>Gói thầu</Text>
          <Text style={font.h3}>
            {tender.notifyNo} · {tender.bidName}
          </Text>
        </Card>
      ) : null}

      <Field label="Hồ sơ mời thầu">
        <FilePicker files={files} onChange={setFiles} />
      </Field>
      <Field label="Hoặc dán nội dung">
        <Input multiline value={text} onChangeText={setText} placeholder="Dán chương Yêu cầu kỹ thuật, Bảng dữ liệu đấu thầu..." />
      </Field>
      <Field label="Ngôn ngữ kết quả">
        <View style={{ flexDirection: 'row', gap: spacing(2) }}>
          <Chip label="Tiếng Việt" active={language === 'vi'} onPress={() => setLanguage('vi')} />
          <Chip label="English" active={language === 'en'} onPress={() => setLanguage('en')} />
        </View>
      </Field>
      {error ? <ErrorBox message={error} /> : null}
      <Button
        title={loading ? 'Đang phân tích...' : 'Phân tích'}
        icon="sparkles"
        loading={loading}
        disabled={!files.length && !text.trim()}
        onPress={run}
      />
      {loading ? (
        <Text style={[font.small, { textAlign: 'center', marginTop: spacing(2) }]}>Hồ sơ dài có thể mất vài phút.</Text>
      ) : null}

      {shown ? (
        <View style={{ marginTop: spacing(4) }}>
          <AnalysisView analysis={shown} />
        </View>
      ) : null}
    </Screen>
  );
}
