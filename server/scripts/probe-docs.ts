// Temporary probe: loads a public tender detail page and the public E-HSMT viewer in a
// browser and records which API calls they make, to build the document reader.
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright-core';

const detailUrl = process.argv[2];
const out = 'probe-out';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ locale: 'vi-VN' });
const log: string[] = [];
let n = 0;
ctx.on('request', (r) => {
  if (['xhr', 'fetch', 'document'].includes(r.resourceType()))
    log.push(`REQ ${r.method()} ${r.url()}${r.postData() ? ' BODY ' + r.postData()!.slice(0, 1500) : ''}`);
});
ctx.on('response', async (r) => {
  if (!['xhr', 'fetch'].includes(r.request().resourceType())) return;
  try {
    const body = await r.text();
    const f = `${out}/resp-${String(++n).padStart(3, '0')}.txt`;
    writeFileSync(f, `${r.status()} ${r.url()}\n\n${body}`);
    log.push(`RES ${r.status()} ${r.url()} -> ${f} (${body.length} bytes)`);
  } catch {}
});

const page = await ctx.newPage();
await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => log.push('GOTO ERR ' + e));
await page.waitForTimeout(5000);
writeFileSync(`${out}/detail.txt`, await page.innerText('body').catch(() => ''));

// The "Xem toàn bộ" button stores the E-HSMT id in localStorage and opens the viewer.
const hsmtId = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('*')).find((e: any) => e.__vue__?.dtlTdNs) as any;
  return el?.__vue__?.dtlTdNs?.bidoNotifyContractorM?.id ?? null;
});
log.push('HSMT id ' + hsmtId);
if (hsmtId) {
  await page.evaluate((id) => localStorage.setItem('param_hsmt', JSON.stringify({ formCode: 'ALL', id, fileName: 'Hồ sơ mời thầu' })), hsmtId);
  const v = await ctx.newPage();
  await v.goto('https://muasamcong.mof.gov.vn/egp/contractorfe/viewer', { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => log.push('VIEWER ERR ' + e));
  await v.waitForTimeout(8000);
  const txt = await v.innerText('body').catch(() => '');
  writeFileSync(`${out}/viewer.txt`, txt);
  log.push(`VIEWER ${v.url()} text ${txt.length} chars`);
}

writeFileSync(`${out}/log.txt`, log.join('\n'));
await browser.close();
console.log(log.join('\n'));
