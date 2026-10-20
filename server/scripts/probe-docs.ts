// Temporary probe: calls the public endpoints the tender detail page uses for the
// E-HSMT (lcnt_tbmt_hsmt) and general notice info (lcnt_tbmt_ttc_ldt), and prints
// their structure so the document reader can be built.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const ORIGIN = 'https://muasamcong.mof.gov.vn';
const BASE = `${ORIGIN}/o/egp-portal-contractor-selection-v2/services`;
const SITE_KEY = '6Lc0INgpAAAAAIvd8dqVm7lCEQoR2Tmd2k2Bl18t';
const ids = process.argv.slice(2); // notifyId values
mkdirSync('probe-out', { recursive: true });

async function direct(path: string, body: unknown) {
  const r = await fetch(`${BASE}/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', origin: ORIGIN, referer: `${ORIGIN}/web/guest/contractor-selection` },
    body: JSON.stringify(body),
  });
  return { status: r.status, text: await r.text() };
}

function describe(v: unknown, depth = 0): string {
  if (depth > 3) return '…';
  if (Array.isArray(v)) return `[${v.length}] ${v.length ? describe(v[0], depth + 1) : ''}`;
  if (v && typeof v === 'object')
    return '{' + Object.entries(v as Record<string, unknown>).map(([k, x]) => `${k}: ${typeof x === 'string' ? `str(${x.length})` : describe(x, depth + 1)}`).join(', ') + '}';
  return typeof v;
}

let browserFetch: ((path: string, body: unknown) => Promise<{ status: number; text: string }>) | null = null;
async function viaBrowser(path: string, body: unknown) {
  if (!browserFetch) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${ORIGIN}/web/guest/contractor-selection?render=index`, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForFunction(() => (window as any).grecaptcha?.execute, null, { timeout: 30000 });
    browserFetch = (p, b) =>
      page.evaluate(async ({ url, b, key }) => {
        const g = (window as any).grecaptcha;
        const token = await new Promise<string>((res) => g.ready(() => g.execute(key, { action: 'submit' }).then(res)));
        const r = await fetch(`${url}?token=${token}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
        return { status: r.status, text: await r.text() };
      }, { url: `${BASE}/${p}`, b, key: SITE_KEY });
  }
  return browserFetch(path, body);
}

for (const id of ids) {
  for (const path of ['lcnt_tbmt_ttc_ldt', 'lcnt_tbmt_hsmt']) {
    const body = path === 'lcnt_tbmt_hsmt' ? { id, processApply: 'LDT' } : { id };
    let res = await direct(path, body);
    let via = 'direct';
    if (res.status !== 200 || /^\s*-?\d+\s*$/.test(res.text)) {
      console.log(`${path} direct -> ${res.status} ${res.text.slice(0, 200)}; retrying in browser`);
      res = await viaBrowser(path, body);
      via = 'browser';
    }
    writeFileSync(`probe-out/${path}-${id}.json`, res.text);
    console.log(`\n===== ${path} ${id} via ${via}: ${res.status}, ${res.text.length} bytes`);
    try {
      const j = JSON.parse(res.text);
      console.log(describe(j));
      if (path === 'lcnt_tbmt_hsmt') {
        const forms = (j.bidoInvBiddingDTO ?? []) as Record<string, unknown>[];
        for (const f of forms.slice(0, 60))
          console.log(`  form ${f.chapterCode} ${f.formCode} value ${String(f.formValue ?? '').length} chars: ${String(f.formValue ?? '').slice(0, 300).replace(/\s+/g, ' ')}`);
        console.log('  chapters:', JSON.stringify(j.bidaInvChapterConfList)?.slice(0, 3000));
        console.log('  files:', JSON.stringify(j.bidoInvFileDTO)?.slice(0, 3000));
      } else console.log(res.text.slice(0, 4000));
    } catch {
      console.log(res.text.slice(0, 1000));
    }
  }
}
process.exit(0);
