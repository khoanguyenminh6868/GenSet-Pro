import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import multer from 'multer';
import { analyzeTender, ClaudeRefusalError, compareSubmission, translate, type Direction, type OutputLanguage } from './claude.js';
import { fileToBlocks, textToBlock, UnsupportedFileError, type UploadedFile } from './documents.js';
import { fetchOpenGeneratorTenders, type TenderSearchResult } from './muasamcong.js';
import { sampleTenders } from './sampleTenders.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Claude accepts requests up to 32 MB; base64 adds about a third, so cap raw uploads lower.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024, files: 10 } });

const asyncRoute =
  (fn: (req: Request, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

const language = (v: unknown): OutputLanguage => (v === 'en' ? 'en' : 'vi');

let cache: { at: number; result: TenderSearchResult } | undefined;
const CACHE_MS = 10 * 60 * 1000;

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, claudeConfigured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) });
});

app.get(
  '/api/tenders',
  asyncRoute(async (req, res) => {
    if (req.query.sample === '1') {
      res.json({ tenders: sampleTenders(), fetchedAt: new Date().toISOString(), source: 'sample' } satisfies TenderSearchResult);
      return;
    }
    if (req.query.refresh !== '1' && cache && Date.now() - cache.at < CACHE_MS) {
      res.json(cache.result);
      return;
    }
    const keywords = typeof req.query.q === 'string' && req.query.q.trim() ? [req.query.q.trim()] : undefined;
    try {
      const tenders = await fetchOpenGeneratorTenders({ keywords });
      const result: TenderSearchResult = { tenders, fetchedAt: new Date().toISOString(), source: 'muasamcong' };
      if (!keywords) cache = { at: Date.now(), result };
      res.json(result);
    } catch (err) {
      res.status(502).json({
        error: `Không lấy được dữ liệu từ muasamcong.mof.gov.vn: ${(err as Error).message}`,
        code: 'PORTAL_UNAVAILABLE',
      });
    }
  }),
);

async function collectBlocks(files: UploadedFile[] | undefined, text: unknown, label: string) {
  const blocks = [];
  for (const f of files ?? []) {
    // multer decodes multipart filenames as latin1; Vietnamese names need utf8.
    const originalname = Buffer.from(f.originalname, 'latin1').toString('utf8');
    blocks.push(...(await fileToBlocks({ ...f, originalname }, label)));
  }
  if (typeof text === 'string' && text.trim()) blocks.push(textToBlock(text, label));
  return blocks;
}

app.post(
  '/api/analyze',
  upload.array('files'),
  asyncRoute(async (req, res) => {
    const blocks = await collectBlocks(req.files as UploadedFile[], req.body.text, 'Hồ sơ mời thầu');
    if (!blocks.length) {
      res.status(400).json({ error: 'Hãy tải lên ít nhất một tệp hồ sơ mời thầu hoặc dán nội dung.' });
      return;
    }
    res.json(await analyzeTender(blocks, { language: language(req.body.language), context: req.body.context }));
  }),
);

app.post(
  '/api/translate',
  asyncRoute(async (req, res) => {
    const { text, direction } = req.body as { text?: string; direction?: Direction };
    if (!text?.trim()) {
      res.status(400).json({ error: 'Chưa có nội dung cần dịch.' });
      return;
    }
    const dir: Direction = direction === 'vi-en' || direction === 'en-vi' ? direction : 'auto';
    res.json({ translation: await translate(text, dir) });
  }),
);

app.post(
  '/api/compare',
  upload.fields([
    { name: 'requirements', maxCount: 5 },
    { name: 'submission', maxCount: 5 },
  ]),
  asyncRoute(async (req, res) => {
    const files = (req.files ?? {}) as Record<string, UploadedFile[]>;
    const requirements = await collectBlocks(files.requirements, req.body.requirementsText, 'Hồ sơ mời thầu');
    const submission = await collectBlocks(files.submission, req.body.submissionText, 'Hồ sơ dự thầu');
    if (!requirements.length || !submission.length) {
      res.status(400).json({ error: 'Cần cả hồ sơ mời thầu (yêu cầu) và hồ sơ dự thầu để đối chiếu.' });
      return;
    }
    res.json(await compareSubmission(requirements, submission, { language: language(req.body.language) }));
  }),
);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof UnsupportedFileError || err instanceof ClaudeRefusalError) {
    res.status(422).json({ error: err.message });
  } else if (err instanceof multer.MulterError) {
    res.status(413).json({ error: `Tệp tải lên không hợp lệ: ${err.message}` });
  } else if (err instanceof Anthropic.AuthenticationError) {
    res.status(500).json({ error: 'Máy chủ chưa cấu hình ANTHROPIC_API_KEY hợp lệ.' });
  } else if (err instanceof Anthropic.RateLimitError) {
    res.status(429).json({ error: 'Hệ thống AI đang quá tải, hãy thử lại sau ít phút.' });
  } else if (err instanceof Anthropic.BadRequestError) {
    res.status(400).json({ error: `Yêu cầu không hợp lệ: ${err.message}` });
  } else if (err instanceof Anthropic.APIError) {
    res.status(502).json({ error: `Lỗi dịch vụ AI: ${err.message}` });
  } else if (err instanceof Error && /authentication method/i.test(err.message)) {
    res.status(500).json({ error: 'Máy chủ chưa cấu hình ANTHROPIC_API_KEY.' });
  } else {
    console.error(err);
    res.status(500).json({ error: (err as Error)?.message ?? 'Lỗi không xác định' });
  }
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => console.log(`GenBid Pro API listening on http://localhost:${port}`));
