import Ionicons from '@expo/vector-icons/Ionicons';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../lib/theme';

const ACCEPT = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
];

export function FilePicker({
  files,
  onChange,
  hint = 'PDF, DOCX, TXT hoặc ảnh chụp (JPG/PNG)',
}: {
  files: DocumentPicker.DocumentPickerAsset[];
  onChange: (files: DocumentPicker.DocumentPickerAsset[]) => void;
  hint?: string;
}) {
  async function pick() {
    const res = await DocumentPicker.getDocumentAsync({ type: ACCEPT, multiple: true, copyToCacheDirectory: true });
    if (!res.canceled) onChange([...files, ...res.assets]);
  }

  return (
    <View>
      <Pressable onPress={pick} style={({ pressed }) => [styles.drop, pressed && { borderColor: colors.primary }]}>
        <Ionicons name="cloud-upload-outline" size={26} color={colors.primary} />
        <Text style={[font.h3, { marginTop: spacing(1.5) }]}>Chọn tệp</Text>
        <Text style={font.small}>{hint}</Text>
      </Pressable>
      {files.map((f, i) => (
        <View key={`${f.uri}-${i}`} style={styles.file}>
          <Ionicons name={f.mimeType?.startsWith('image/') ? 'image-outline' : 'document-text-outline'} size={18} color={colors.primary} />
          <Text style={[font.body, { flex: 1 }]} numberOfLines={1}>
            {f.name}
          </Text>
          {f.size ? <Text style={font.small}>{(f.size / 1024 / 1024).toFixed(1)} MB</Text> : null}
          <Pressable hitSlop={10} onPress={() => onChange(files.filter((_, j) => j !== i))}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  drop: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    padding: spacing(5),
    backgroundColor: colors.surfaceAlt,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
    padding: spacing(3),
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
