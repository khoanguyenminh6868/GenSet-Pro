// Adapter for the public search API behind https://muasamcong.mof.gov.vn
// (Hệ thống mạng đấu thầu quốc gia). The portal's contractor-selection page
// calls this JSON endpoint from the browser; we call it server-side to avoid
// CORS on the web build and to keep one place to fix if the portal changes.

export const PORTAL_ORIGIN = process.env.MUASAMCONG_ORIGIN ?? 'https://muasamcong.mof.gov.vn';
const SEARCH_PATH = '/o/egp-portal-contractor-selection-v2/services/smart/search';

/** Search phrases for generator tenders. Results are merged and de-duplicated. */
export const GENERATOR_KEYWORDS = [
  'máy phát điện',
  'tổ máy phát điện',
  'máy phát điện dự phòng',
  'genset',
];

/** A bid name must contain one of these (lower-cased, accent-insensitive) to be kept. */
const RELEVANCE_TERMS = ['may phat', 'phat dien', 'genset', 'generator', 'to may phat'];

export interface Tender {
  id: string;
  notifyNo: string;
  notifyVersion?: string;
  planNo?: string;
  bidName: string;
  investorName?: string;
  procuringEntityName?: string;
  location?: string;
  field?: string;
  bidForm?: string;
  bidMode?: string;
  processApply?: string;
  isInternet?: boolean;
  publicDate?: string;
  bidCloseDate?: string;
  bidOpenDate?: string;
  estimatedPrice?: number;
  bidSecurity?: number;
  status: 'open' | 'closed';
  sourceUrl: string;
  isSample?: boolean;
}

export interface TenderSearchResult {
  tenders: Tender[];
  fetchedAt: string;
  source: 'muasamcong' | 'sample';
  warning?: string;
}

type Raw = Record<string, unknown>;

function pick(raw: Raw, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = raw[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function asString(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) return v.filter(Boolean).join(' ').trim() || undefined;
  return String(v).trim() || undefined;
}

function asNumber(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

function asIsoDate(v: unknown): string | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'number') return new Date(v).toISOString();
  const s = String(v);
  // The portal returns "2026-10-25T09:00:00" (local, +07:00) or epoch millis as a string.
  if (/^\d{12,}$/.test(s)) return new Date(Number(s)).toISOString();
  const hasZone = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
  const d = new Date(hasZone ? s : `${s}+07:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function isGeneratorTender(bidName: string): boolean {
  const n = stripAccents(bidName);
  return RELEVANCE_TERMS.some((t) => n.includes(t));
}

export function buildDetailUrl(t: Pick<Tender, 'id' | 'notifyNo' | 'planNo' | 'processApply' | 'bidMode' | 'isInternet'>): string {
  const p = 'egpportalcontractorselectionv2_WAR_egpportalcontractorselectionv2';
  const params = new URLSearchParams({
    p_p_id: p,
    p_p_lifecycle: '0',
    p_p_state: 'normal',
    p_p_mode: 'view',
    [`_${p}_render`]: 'detail-v2',
    type: 'es-notify-contractor',
    stepCode: 'notify-contractor-step-1-tbmt',
    id: t.id,
    notifyId: t.id,
    inputResultId: 'undefined',
    bidOpenId: 'undefined',
    techReqId: 'undefined',
    bidPreNotifyResultId: 'undefined',
    bidPreOpenId: 'undefined',
    processApply: t.processApply ?? 'undefined',
    bidMode: t.bidMode ?? 'undefined',
    notifyNo: t.notifyNo,
    planNo: t.planNo ?? 'undefined',
    pno: 'undefined',
    step: 'tbmt',
    isInternet: t.isInternet === undefined ? 'undefined' : t.isInternet ? '1' : '0',
    caseKHKQ: 'undefined',
  });
  return `${PORTAL_ORIGIN}/web/guest/contractor-selection?${params.toString()}`;
}

export function normalizeTender(raw: Raw, now = new Date()): Tender | null {
  const id = asString(pick(raw, 'id', 'notifyId'));
  const notifyNo = asString(pick(raw, 'notifyNo', 'notifyNoStand'));
  const bidName = asString(pick(raw, 'bidName', 'packageName', 'name'));
  if (!id || !notifyNo || !bidName) return null;

  const locations = raw.locations;
  const location = Array.isArray(locations)
    ? locations
        .map((l) => (l && typeof l === 'object' ? asString((l as Raw).provName ?? (l as Raw).districtName) : asString(l)))
        .filter(Boolean)
        .join(', ') || undefined
    : asString(pick(raw, 'location', 'provName'));

  const isInternetRaw = pick(raw, 'isInternet');
  const bidCloseDate = asIsoDate(pick(raw, 'bidCloseDate', 'closeDate', 'bidCloseTime'));
  const tender: Omit<Tender, 'sourceUrl'> = {
    id,
    notifyNo,
    notifyVersion: asString(pick(raw, 'notifyVersion')),
    planNo: asString(pick(raw, 'planNo')),
    bidName,
    investorName: asString(pick(raw, 'investorName', 'investor')),
    procuringEntityName: asString(pick(raw, 'procuringEntityName', 'procuringEntity')),
    location,
    field: asString(pick(raw, 'investField', 'field', 'bidField')),
    bidForm: asString(pick(raw, 'bidForm')),
    bidMode: asString(pick(raw, 'bidMode')),
    processApply: asString(pick(raw, 'processApply')),
    isInternet: isInternetRaw === undefined ? undefined : String(isInternetRaw) === '1' || isInternetRaw === true,
    publicDate: asIsoDate(pick(raw, 'publicDate', 'createdDate')),
    bidCloseDate,
    bidOpenDate: asIsoDate(pick(raw, 'bidOpenDate')),
    estimatedPrice: asNumber(pick(raw, 'bidPrice', 'estimatePrice', 'pkgPrice')),
    bidSecurity: asNumber(pick(raw, 'guaranteeValue', 'bidGuarantee')),
    status: bidCloseDate && new Date(bidCloseDate) > now ? 'open' : 'closed',
  };
  return { ...tender, sourceUrl: buildDetailUrl(tender) };
}

function searchBody(keyWord: string, pageNumber: number, pageSize: number) {
  return [
    {
      pageSize,
      pageNumber,
      query: [
        {
          index: 'es-contractor-selection',
          keyWord,
          matchType: 'all-1',
          matchFields: ['notifyNo', 'bidName'],
          filters: [
            { fieldName: 'type', searchType: 'in', fieldValues: ['es-notify-contractor'] },
            { fieldName: 'caseKHKQ', searchType: 'not_in', fieldValues: ['1'] },
          ],
        },
      ],
    },
  ];
}

function extractContent(json: unknown): Raw[] {
  if (!json || typeof json !== 'object') return [];
  const j = json as Raw;
  const page = (j.page ?? (Array.isArray(j) ? (j[0] as Raw)?.page : undefined)) as Raw | undefined;
  const content = page?.content ?? j.content ?? j.data;
  return Array.isArray(content) ? (content as Raw[]) : [];
}

async function searchKeyword(keyWord: string, pageSize: number, signal: AbortSignal): Promise<Raw[]> {
  const res = await fetch(`${PORTAL_ORIGIN}${SEARCH_PATH}?token=`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Origin: PORTAL_ORIGIN,
      Referer: `${PORTAL_ORIGIN}/web/guest/contractor-selection?render=index`,
      'User-Agent': 'Mozilla/5.0 (GenBid Pro)',
    },
    body: JSON.stringify(searchBody(keyWord, 0, pageSize)),
    signal,
  });
  if (!res.ok) throw new Error(`muasamcong trả về HTTP ${res.status} cho từ khoá "${keyWord}"`);
  return extractContent(await res.json());
}

/**
 * Fetch open generator tenders. Only tenders whose bid-closing time is still in
 * the future are returned, newest publication first.
 */
export async function fetchOpenGeneratorTenders(opts: { keywords?: string[]; pageSize?: number } = {}): Promise<Tender[]> {
  const keywords = opts.keywords?.length ? opts.keywords : GENERATOR_KEYWORDS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const settled = await Promise.allSettled(keywords.map((k) => searchKeyword(k, opts.pageSize ?? 50, controller.signal)));
    const failures = settled.filter((s): s is PromiseRejectedResult => s.status === 'rejected');
    if (failures.length === settled.length) {
      throw new Error(String(failures[0]?.reason?.message ?? failures[0]?.reason ?? 'Không kết nối được muasamcong'));
    }
    const now = new Date();
    const byNotify = new Map<string, Tender>();
    for (const s of settled) {
      if (s.status !== 'fulfilled') continue;
      for (const raw of s.value) {
        const t = normalizeTender(raw, now);
        if (!t || t.status !== 'open' || !isGeneratorTender(t.bidName)) continue;
        const prev = byNotify.get(t.notifyNo);
        // Keep the latest notice version when the same notice is returned more than once.
        if (!prev || (t.notifyVersion ?? '') > (prev.notifyVersion ?? '')) byNotify.set(t.notifyNo, t);
      }
    }
    return [...byNotify.values()].sort((a, b) => (b.publicDate ?? '').localeCompare(a.publicDate ?? ''));
  } finally {
    clearTimeout(timer);
  }
}
