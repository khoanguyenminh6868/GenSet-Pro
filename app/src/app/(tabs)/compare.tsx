import type { DocumentPickerAsset } from 'expo-document-picker';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { ComparisonView } from '../../components/ComparisonView';
import { FilePicker } from '../../components/FilePicker';
import { Button, Card, ErrorBox, Field, Input, Screen, SectionTitle } from '../../components/ui';
import { api, ApiError } from '../../lib/api';
import { useStore } from '../../lib/store';
import { colors, font, spacing } from '../../lib/theme';
import type { Comparison } from '../../lib/types';

export default function CompareScreen() {
  const { tenderId } = useLocalSearchParams<{ tenderId?: string }>();
  const { findTender, tracked, track, saveComparison } = useStore();
  const tender = tenderId ? findTender(tenderId) : undefined;

  const [reqFiles, setReqFiles] = useState<DocumentPickerAsset[]>([]);
  const [reqText, setReqText] = useState('');
  const [subFiles, setSubFiles] = useState<DocumentPickerAsset[]>([]);
  const [subText, setSubText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<Comparison>();
  const shown = result ?? (tender ? tracked[tender.id]?.comparison : undefined);

  const ready = (reqFiles.length || reqText.trim()) && (subFiles.length || subText.trim());

  async function run() {
    setLoading(true);
    setError(undefined);
    try {
      const comparison = await api.compare(
        { files: reqFiles, text: reqText.trim() || undefined },
        { files: subFiles, text: subText.trim() || undefined },
      );
      setResult(comparison);
      if (tender) {
        track(tender);
        saveComparison(tender.id, comparison);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={font.h1}>Đối chiếu hồ sơ dự thầu</Text>
      <Text style={[font.small, { marginTop: spacing(1), marginBottom: spacing(2) }]}>
        So từng yêu cầu của HSMT với hồ sơ dự thầu của bạn, như tổ chuyên gia sẽ chấm.
      </Text>
      {tender ? (
        <Card accent={colors.primary}>
          <Text style={font.small}>Gói thầu</Text>
          <Text style={font.h3}>
            {tender.notifyNo} · {tender.bidName}
          </Text>
        </Card>
      ) : null}

      <SectionTitle>1. Yêu cầu ban đầu (HSMT)</SectionTitle>
      <Field label="Tệp hồ sơ mời thầu">
        <FilePicker files={reqFiles} onChange={setReqFiles} />
      </Field>
      <Field label="Hoặc dán yêu cầu">
        <Input multiline value={reqText} onChangeText={setReqText} placeholder="Ví dụ: Công suất liên tục ≥ 500kVA, động cơ xuất xứ G7..." />
      </Field>

      <SectionTitle>2. Hồ sơ dự thầu</SectionTitle>
      <Field label="Tệp hồ sơ dự thầu">
        <FilePicker files={subFiles} onChange={setSubFiles} hint="Đề xuất kỹ thuật, catalogue, bảng tuân thủ, BCTC..." />
      </Field>
      <Field label="Hoặc dán nội dung">
        <Input multiline value={subText} onChangeText={setSubText} placeholder="Thông số máy chào thầu..." />
      </Field>

      {error ? <ErrorBox message={error} /> : null}
      <Button title={loading ? 'Đang đối chiếu...' : 'Đối chiếu'} icon="git-compare" loading={loading} disabled={!ready} onPress={run} />

      {shown ? (
        <View style={{ marginTop: spacing(4) }}>
          <ComparisonView comparison={shown} />
        </View>
      ) : null}
    </Screen>
  );
}
