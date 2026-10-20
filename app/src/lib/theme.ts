export const colors = {
  bg: '#0B0B0D',
  surface: '#16161A',
  surfaceAlt: '#1F1F25',
  border: '#2C2C34',
  primary: '#FFC20E',
  primaryDark: '#D9A300',
  onPrimary: '#0B0B0D',
  text: '#F5F5F0',
  textMuted: '#A3A3A8',
  textFaint: '#6E6E76',
  danger: '#FF5A4F',
  warning: '#FFC20E',
  success: '#3DDC84',
  info: '#7AA7FF',
};

export const radius = { sm: 6, md: 10, lg: 16 };
export const spacing = (n: number) => n * 4;

export const font = {
  h1: { fontSize: 24, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 15, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 14, color: colors.text, lineHeight: 20 },
  small: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
};
