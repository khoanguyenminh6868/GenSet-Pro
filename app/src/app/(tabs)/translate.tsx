import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, ErrorBox, Input, Screen } from '../../components/ui';
import { api, ApiError } from '../../lib/api';
import { colors, font, spacing } from '../../lib/theme';

type Dir = 'vi-en' | 'en-vi';
const NAME = { vi: 'Tiếng Việt', en: 'English' };

export default function TranslateScreen() {
  const [dir, setDir] = useState<Dir>('vi-en');
  const [text, setText] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [from, to] = dir.split('-') as ['vi' | 'en', 'vi' | 'en'];

  async function run() {
    setLoading(true);
    setError(undefined);
    try {
      setOutput((await api.translate(text, dir)).translation);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function swap() {
    setDir(dir === 'vi-en' ? 'en-vi' : 'vi-en');
    if (output) {
      setText(output);
      setOutput('');
    }
  }

  async function copy() {
    await Clipboard.setStringAsync(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Screen>
      <Text style={font.h1}>Dịch Việt ⇄ Anh</Text>
      <Text style={[font.small, { marginTop: spacing(1), marginBottom: spacing(4) }]}>
        Dùng thuật ngữ đấu thầu và kỹ thuật máy phát điện chuẩn (HSMT, bảo lãnh dự thầu, PRP/ESP...).
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginBottom: spacing(3) }}>
        <Text style={[font.h3, { flex: 1, textAlign: 'center' }]}>{NAME[from]}</Text>
        <Pressable onPress={swap} style={{ backgroundColor: colors.primary, borderRadius: 999, padding: spacing(2) }} accessibilityLabel="Đổi chiều dịch">
          <Ionicons name="swap-horizontal" size={20} color={colors.onPrimary} />
        </Pressable>
        <Text style={[font.h3, { flex: 1, textAlign: 'center' }]}>{NAME[to]}</Text>
      </View>

      <Input multiline value={text} onChangeText={setText} placeholder={from === 'vi' ? 'Nhập hoặc dán văn bản tiếng Việt...' : 'Paste English text...'} />
      <View style={{ height: spacing(3) }} />
      {error ? <ErrorBox message={error} /> : null}
      <Button title={loading ? 'Đang dịch...' : 'Dịch'} icon="language" loading={loading} disabled={!text.trim()} onPress={run} />

      {output ? (
        <Card style={{ marginTop: spacing(4) }} accent={colors.primary}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing(2) }}>
            <Text style={[font.small, { flex: 1 }]}>{NAME[to]}</Text>
            <Button title={copied ? 'Đã sao chép' : 'Sao chép'} icon={copied ? 'checkmark' : 'copy-outline'} variant="ghost" compact onPress={copy} />
          </View>
          <Text selectable style={font.body}>
            {output}
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
