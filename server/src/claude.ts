import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const client = new Anthropic();
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5-5';
// Translation is short and well-specified, so a much cheaper model is enough.
const TRANSLATE_MODEL = process.env.ANTHROPIC_TRANSLATE_MODEL ?? 'claude-haiku-5-5';
// Server-side fallback: if the model declines a request, the API retries it on
// the model's default fallback inside the same call.
const FALLBACK = { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const };

type Blocks = Anthropic.Beta.BetaContentBlockParam[];
export type OutputLanguage = 'vi' | 'en';

const languageLine = (lang: OutputLanguage) =>
  lang === 'en' ? 'Write every field of your answer in English.' : 'Viết toàn bộ câu trả lời bằng tiếng Việt.';

const DOMAIN_CONTEXT = `You assist a Vietnamese company that bids on public tenders for electric generators (máy phát điện, tổ máy phát điện diesel/gas, ATS, tủ hòa đồng bộ, lắp đặt, bảo dưỡng) published on the national e-procurement system muasamcong.mof.gov.vn.
Tender documents (E-HSMT / HSMT / HSYC) follow Vietnam's Law on Bidding (Luật Đấu thầu 22/2023/QH15) and Decree 24/2024/NĐ-CP and its circulars. You know the usual chapters: Chỉ dẫn nhà thầu (CDNT), Bảng dữ liệu đấu thầu (BDL), Tiêu chuẩn đánh giá (năng lực-kinh nghiệm, kỹ thuật, tài chính), Yêu cầu kỹ thuật, Biểu mẫu, Điều kiện hợp đồng.
For generators, the technical points that most often disqualify a bid are: rated vs. standby power (kVA/kW, PRP/ESP/COP per ISO 8528), engine and alternator make/origin, voltage/frequency, fuel consumption, noise level (dB(A) @ 7m), enclosure, ATS rating, controller, emission standard, manufacture year/"mới 100%", CO/CQ, warranty period, delivery time, and installation scope.
Quote the document's own words when you cite a requirement, and say so when a figure is not stated rather than guessing.`;

async function parse<T extends z.ZodType>(schema: T, system: string, content: Blocks, effort: 'low' | 'medium' | 'high') {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    ...FALLBACK,
    output_config: { effort, format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: 'user', content }],
  });
  if (response.stop_reason === 'refusal') throw new ClaudeRefusalError();
  if (response.stop_reason === 'max_tokens') throw new Error('Kết quả quá dài, hãy chia nhỏ hồ sơ và thử lại.');
  if (!response.parsed_output) throw new Error('Không đọc được kết quả phân tích, hãy thử lại.');
  return response.parsed_output as z.infer<T>;
}

export class ClaudeRefusalError extends Error {
  constructor() {
    super('Yêu cầu này không được xử lý. Hãy kiểm tra lại nội dung tệp.');
  }
}

// ---------- Tender analysis ----------

export const AnalysisSchema = z.object({
  summary: z.string().describe('3-5 sentence overview of what is being procured and the main conditions.'),
  keyInfo: z.object({
    bidName: z.string().nullable(),
    notifyNo: z.string().nullable(),
    investor: z.string().nullable(),
    procuringEntity: z.string().nullable(),
    bidForm: z.string().nullable().describe('e.g. Đấu thầu rộng rãi, Chào hàng cạnh tranh'),
    bidMethod: z.string().nullable().describe('e.g. Một giai đoạn một túi hồ sơ'),
    closingTime: z.string().nullable(),
    bidValidity: z.string().nullable(),
    bidSecurity: z.string().nullable(),
    budget: z.string().nullable(),
    contractType: z.string().nullable(),
    deliveryTime: z.string().nullable(),
    deliveryLocation: z.string().nullable(),
    warranty: z.string().nullable(),
    evaluationMethod: z.string().nullable().describe('e.g. giá thấp nhất, giá đánh giá, đạt/không đạt'),
  }),
  technicalSpecs: z
    .array(
      z.object({
        item: z.string().describe('Equipment or parameter, e.g. "Công suất liên tục (PRP)"'),
        requirement: z.string(),
        reference: z.string().nullable().describe('Chapter/section/page where it appears'),
      }),
    )
    .describe('Every technical requirement for the generator set and related equipment.'),
  qualificationRequirements: z
    .array(z.object({ requirement: z.string(), reference: z.string().nullable() }))
    .describe('Contractor capability, experience, financial and similar-contract requirements.'),
  highlights: z
    .array(
      z.object({
        severity: z.enum(['critical', 'warning', 'info']).describe('critical = can disqualify the bid'),
        category: z.enum(['deadline', 'eligibility', 'technical', 'financial', 'documents', 'contract', 'risk', 'other']),
        title: z.string(),
        detail: z.string(),
        quote: z.string().nullable().describe('Exact words from the document'),
        reference: z.string().nullable(),
        recommendation: z.string(),
      }),
    )
    .describe('Points the bidder must pay attention to, most severe first.'),
  requiredDocuments: z.array(z.string()).describe('Documents the bid must include (CO/CQ, catalogues, bảo lãnh, BCTC...).'),
  restrictiveClauses: z
    .array(z.string())
    .describe('Clauses that look tailored to a brand or unusually restrictive, which the bidder may want to clarify.'),
  questionsForClarification: z.array(z.string()),
});
export type Analysis = z.infer<typeof AnalysisSchema>;

export async function analyzeTender(documents: Blocks, opts: { language: OutputLanguage; context?: string }) {
  const system = `${DOMAIN_CONTEXT}

Task: read the tender documents and produce a structured brief for the bid team. Flag anything that can cause rejection (missing documents, technical non-conformity, deadlines, bid security amount/validity, experience thresholds) as critical. ${languageLine(opts.language)}`;
  const content: Blocks = [
    ...documents,
    { type: 'text', text: `${opts.context ? `Thông tin gói thầu đã biết: ${opts.context}\n\n` : ''}Phân tích hồ sơ mời thầu trên.` },
  ];
  return parse(AnalysisSchema, system, content, 'high');
}

// ---------- Translation ----------

export type Direction = 'vi-en' | 'en-vi' | 'auto';

export async function translate(text: string, direction: Direction): Promise<string> {
  const target =
    direction === 'vi-en'
      ? 'Translate from Vietnamese into English.'
      : direction === 'en-vi'
        ? 'Dịch từ tiếng Anh sang tiếng Việt.'
        : 'Detect the language. If it is Vietnamese translate it into English, otherwise translate it into Vietnamese.';
  // Haiku has no server-side refusal fallback, so this uses the plain endpoint without FALLBACK.
  const response = await client.messages.create({
    model: TRANSLATE_MODEL,
    max_tokens: 16000,
    output_config: { effort: 'low' },
    system: `${DOMAIN_CONTEXT}

You are a professional translator for tender and technical documents. ${target}
Use the standard terminology of Vietnamese public procurement and the generator industry (e.g. HSMT = bidding documents, bảo lãnh dự thầu = bid security, công suất dự phòng = standby power, công suất liên tục = prime power). Keep numbers, units, model codes and formatting (lists, tables) unchanged. Output only the translation.`,
    messages: [{ role: 'user', content: text }],
  });
  if (response.stop_reason === 'refusal') throw new ClaudeRefusalError();
  return response.content
    .flatMap((b) => (b.type === 'text' ? [b.text] : []))
    .join('')
    .trim();
}

// ---------- Submission vs. requirements comparison ----------

export const ComparisonSchema = z.object({
  overallScore: z.number().describe('0-100: share of requirements fully met, weighting critical ones higher'),
  verdict: z.enum(['pass', 'at_risk', 'fail']).describe('pass = likely compliant, at_risk = fixable gaps, fail = disqualifying gaps'),
  summary: z.string(),
  items: z.array(
    z.object({
      category: z.enum(['technical', 'qualification', 'financial', 'documents', 'commercial', 'other']),
      requirement: z.string().describe('What the tender requires, quoted or closely paraphrased'),
      requirementRef: z.string().nullable(),
      offered: z.string().nullable().describe('What the submission offers for this requirement'),
      offeredRef: z.string().nullable(),
      status: z.enum(['met', 'partial', 'not_met', 'missing', 'unclear']),
      critical: z.boolean().describe('true if failing it would disqualify the bid'),
      note: z.string().describe('Why, with figures, and what to fix'),
    }),
  ),
  missingDocuments: z.array(z.string()),
  recommendations: z.array(z.string()).describe('Concrete fixes before submission, most important first'),
});
export type Comparison = z.infer<typeof ComparisonSchema>;

export async function compareSubmission(requirements: Blocks, submission: Blocks, opts: { language: OutputLanguage }) {
  const system = `${DOMAIN_CONTEXT}

Task: check a bid (hồ sơ dự thầu) against the tender's requirements (hồ sơ mời thầu) line by line, the way the evaluation panel (tổ chuyên gia) would. Go through every technical parameter, qualification criterion, financial condition and required document. Compare numbers precisely (e.g. offered 450kVA standby against required 500kVA prime is not_met). Use "missing" when the submission says nothing about a requirement and "unclear" when evidence is ambiguous. ${languageLine(opts.language)}`;
  const content: Blocks = [
    { type: 'text', text: '=== HỒ SƠ MỜI THẦU / YÊU CẦU (requirements) ===' },
    ...requirements,
    { type: 'text', text: '=== HỒ SƠ DỰ THẦU (submission) ===' },
    ...submission,
    { type: 'text', text: 'Đối chiếu hồ sơ dự thầu với yêu cầu của hồ sơ mời thầu.' },
  ];
  return parse(ComparisonSchema, system, content, 'high');
}
