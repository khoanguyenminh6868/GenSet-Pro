import type { DocumentPickerAsset } from 'expo-document-picker';
import { Platform } from 'react-native';
import type { Analysis, Comparison, TenderSearchResult } from './types';

// Android emulators reach the host machine at 10.0.2.2, not localhost.
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8787' : 'http://localhost:8787';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(`Không kết nối được máy chủ GenBid (${API_URL}). Kiểm tra máy chủ đã chạy và EXPO_PUBLIC_API_URL.`, 0);
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body.error ?? `Lỗi máy chủ (HTTP ${res.status})`, res.status, body.code);
  return body as T;
}

async function appendFile(form: FormData, field: string, asset: DocumentPickerAsset) {
  if (Platform.OS === 'web') {
    const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
    form.append(field, blob, asset.name);
  } else {
    // React Native's FormData accepts a { uri, name, type } descriptor for files.
    form.append(field, { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' } as unknown as Blob);
  }
}

export const api = {
  tenders(opts: { refresh?: boolean; sample?: boolean; q?: string } = {}) {
    const p = new URLSearchParams();
    if (opts.refresh) p.set('refresh', '1');
    if (opts.sample) p.set('sample', '1');
    if (opts.q) p.set('q', opts.q);
    return request<TenderSearchResult>(`/api/tenders?${p.toString()}`);
  },

  async analyze(files: DocumentPickerAsset[], opts: { text?: string; context?: string; language?: 'vi' | 'en' }) {
    const form = new FormData();
    for (const f of files) await appendFile(form, 'files', f);
    if (opts.text) form.append('text', opts.text);
    if (opts.context) form.append('context', opts.context);
    form.append('language', opts.language ?? 'vi');
    return request<Analysis>('/api/analyze', { method: 'POST', body: form });
  },

  translate(text: string, direction: 'vi-en' | 'en-vi' | 'auto') {
    return request<{ translation: string }>('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, direction }),
    });
  },

  async compare(
    req: { files: DocumentPickerAsset[]; text?: string },
    sub: { files: DocumentPickerAsset[]; text?: string },
    language: 'vi' | 'en' = 'vi',
  ) {
    const form = new FormData();
    for (const f of req.files) await appendFile(form, 'requirements', f);
    for (const f of sub.files) await appendFile(form, 'submission', f);
    if (req.text) form.append('requirementsText', req.text);
    if (sub.text) form.append('submissionText', sub.text);
    form.append('language', language);
    return request<Comparison>('/api/compare', { method: 'POST', body: form });
  },
};
