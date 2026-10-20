import type { ComplianceStatus, Severity, Stage } from './types';

export const STAGES: { key: Stage; label: string; hint: string }[] = [
  { key: 'new', label: 'Mới', hint: 'Vừa lấy từ muasamcong' },
  { key: 'reviewing', label: 'Đang đánh giá', hint: 'Đọc HSMT, quyết định có dự thầu' },
  { key: 'preparing', label: 'Chuẩn bị HSDT', hint: 'Lập hồ sơ, báo giá, bảo lãnh' },
  { key: 'submitted', label: 'Đã nộp', hint: 'Chờ mở thầu và kết quả' },
  { key: 'won', label: 'Trúng thầu', hint: 'Ký và thực hiện hợp đồng' },
  { key: 'lost', label: 'Không trúng', hint: 'Lưu bài học' },
  { key: 'dropped', label: 'Bỏ qua', hint: 'Không tham dự' },
];

export const stageLabel = (s: Stage) => STAGES.find((x) => x.key === s)?.label ?? s;

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Nghiêm trọng',
  warning: 'Cần lưu ý',
  info: 'Thông tin',
};

export const CATEGORY_LABEL: Record<string, string> = {
  deadline: 'Thời hạn',
  eligibility: 'Tư cách hợp lệ',
  technical: 'Kỹ thuật',
  financial: 'Tài chính',
  documents: 'Hồ sơ',
  contract: 'Hợp đồng',
  risk: 'Rủi ro',
  qualification: 'Năng lực - kinh nghiệm',
  commercial: 'Thương mại',
  other: 'Khác',
};

export const STATUS_LABEL: Record<ComplianceStatus, string> = {
  met: 'Đạt',
  partial: 'Đạt một phần',
  not_met: 'Không đạt',
  missing: 'Thiếu',
  unclear: 'Chưa rõ',
};

export function formatVnd(n?: number): string | undefined {
  if (n === undefined) return undefined;
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ đ`;
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu đ`;
  return `${n.toLocaleString('vi-VN')} đ`;
}

export function formatDateTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "còn 3 ngày 4 giờ" style countdown, or null when the time has passed. */
export function timeLeft(iso?: string, now = Date.now()): { text: string; urgent: boolean } | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return null;
  const h = Math.floor(ms / 3.6e6);
  const d = Math.floor(h / 24);
  const text = d >= 1 ? `còn ${d} ngày ${h % 24} giờ` : `còn ${h} giờ ${Math.floor((ms % 3.6e6) / 6e4)} phút`;
  return { text, urgent: d < 3 };
}
