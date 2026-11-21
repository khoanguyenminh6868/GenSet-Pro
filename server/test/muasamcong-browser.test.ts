// Nhánh trình duyệt của server/src/muasamcong.ts (searchViaBrowser, và đường "auto": gọi trực tiếp bị đòi reCAPTCHA → thử lại
// bằng Chromium không đầu). Các test khác (muasamcong*.test.ts) chỉ phủ nhánh `direct` với fetch giả.
// Không gọi cổng thật: MUASAMCONG_ORIGIN trỏ tới một máy chủ cổng GIẢ trên 127.0.0.1 (trang có `grecaptcha` giả với
// `siteKey: "…"` như trang muasamcong, và dịch vụ tìm kiếm chỉ trả kết quả khi có token, mỗi token dùng một lần). Trình duyệt là
// Chromium / Chrome / Edge có sẵn trên máy (CHROMIUM_PATH, hoặc dò các đường dẫn thường gặp); không có thì các ca cần trình
// duyệt được BỎ QUA (skip) và nói rõ lý do, không báo xanh giả.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, beforeEach, describe, test } from 'node:test';

function findBrowser(): string | undefined {
  const cands = [
    process.env.CHROMIUM_PATH,
    '/opt/pw-browsers/chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return cands.find((p) => p && fs.existsSync(p));
}
const BROWSER = findBrowser();
const SKIP = BROWSER ? false : 'không có Chromium / Chrome / Edge (đặt CHROMIUM_PATH)';

// ----- cổng giả -----
type Hit = { method: string; url: string; token: string | null; body?: any };
let hits: Hit[] = [];
let siteKeyInPage: string | null = 'SITEKEY-BIA';
let grecaptchaInPage = true;
let usedTokens = new Set<string>();
let searchMode: 'ok' | 'http500' | 'captcha' = 'ok';
let server: http.Server;
let origin = '';
const executeCalls: string[] = []; // mỗi lần trang gọi grecaptcha.execute (qua /__tok)

const page = () => `<!doctype html><html><head><meta charset="utf-8"><title>muasamcong giả</title></head><body>
${siteKeyInPage ? `<script>var cfg = { siteKey: "${siteKeyInPage}" };</script>` : ''}
${grecaptchaInPage ? `<script>
window.grecaptcha = {
  ready: function (f) { setTimeout(f, 0); },
  execute: function (key, opts) { return fetch('/__tok?key=' + encodeURIComponent(key) + '&action=' + encodeURIComponent(opts && opts.action)).then(function (r) { return r.text(); }); }
};
</script>` : ''}
</body></html>`;

const rec = (id: string, notifyNo: string, name: string) => ({
  id, notifyNo, notifyVersion: '00', bidName: name, publicDate: '2026-10-01T08:00:00', bidCloseDate: '2099-01-01T08:00:00',
});

before(async () => {
  server = http.createServer((req, res) => {
    const u = new URL(req.url ?? '/', 'http://x');
    if (u.pathname === '/__tok') {
      // grecaptcha.execute của trang giả: ghi lại site key + action, phát token mới (đếm chung mọi phiên trình duyệt của ca).
      executeCalls.push(`${u.searchParams.get('key')}|${u.searchParams.get('action')}`);
      res.end(`tok-${executeCalls.length}`);
      return;
    }
    if (u.pathname === '/favicon.ico') { res.statusCode = 404; res.end(); return; }
    if (req.method === 'GET') {
      hits.push({ method: 'GET', url: u.pathname + u.search, token: null });
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(page());
      return;
    }
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      const token = u.searchParams.get('token');
      const body = raw ? JSON.parse(raw) : undefined;
      hits.push({ method: req.method ?? '', url: u.pathname, token, body });
      res.setHeader('content-type', 'application/json');
      if (searchMode === 'http500') { res.statusCode = 500; res.end('{}'); return; }
      // Không token, token đã dùng, hoặc chế độ captcha → cổng trả một con số (như cổng thật khi reCAPTCHA hỏng).
      if (searchMode === 'captcha' || !token || usedTokens.has(token)) { res.end('401'); return; }
      usedTokens.add(token);
      const kw: string = body[0].query[0].keyWord;
      res.end(JSON.stringify({ page: { content: [rec('id-' + kw, 'IB-' + kw, 'Máy phát điện ' + kw)] } }));
    });
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  process.env.MUASAMCONG_ORIGIN = origin; // đọc một lần lúc nạp mô-đun: nạp SAU dòng này (mỗi tệp test là một tiến trình riêng)
  if (BROWSER) process.env.CHROMIUM_PATH = BROWSER;
});
after(() => server.close());
beforeEach(() => {
  hits = [];
  usedTokens = new Set();
  executeCalls.length = 0;
  siteKeyInPage = 'SITEKEY-BIA';
  grecaptchaInPage = true;
  searchMode = 'ok';
});

const lib = () => import('../src/muasamcong.js');
const searches = () => hits.filter((h) => h.method === 'POST');

describe('searchRaw trong trình duyệt', { skip: SKIP }, () => {
  test('mode "browser": không gọi trực tiếp; mỗi từ khoá một lượt tìm TRONG trang với token mới (không dùng lại), đúng site key và action', async () => {
    const { searchRaw } = await lib();
    const r = await searchRaw(['may phat', 'genset', 'x'], 25, 'browser');
    assert.equal(r.via, 'browser');
    assert.equal(r.pages.length, 3);
    assert.deepEqual(r.pages.map((p) => p[0].notifyNo), ['IB-may phat', 'IB-genset', 'IB-x']); // đúng thứ tự từ khoá
    assert.equal(hits.filter((h) => h.method === 'GET').length, 1); // tải trang một lần cho cả ba từ khoá
    assert.ok(hits.find((h) => h.method === 'GET')!.url.startsWith('/web/guest/contractor-selection?render=index'));
    const s = searches();
    assert.equal(s.length, 3); // không có lượt "không token" nào
    assert.deepEqual(s.map((h) => h.token), ['tok-1', 'tok-2', 'tok-3']);
    assert.ok(s.every((h) => h.url === '/o/egp-portal-contractor-selection-v2/services/smart/search'));
    assert.deepEqual(executeCalls, ['SITEKEY-BIA|submit', 'SITEKEY-BIA|submit', 'SITEKEY-BIA|submit']);
    assert.deepEqual(s.map((h) => h.body[0].query[0].keyWord), ['may phat', 'genset', 'x']);
    assert.equal(s[0].body[0].pageSize, 25);
  });

  test('truy vấn trong trang mang bộ lọc "còn mở" (bidCloseDate) theo openOnly, như nhánh trực tiếp', async () => {
    const { searchRaw } = await lib();
    await searchRaw(['a'], 10, 'browser', true);
    await searchRaw(['b'], 10, 'browser', false);
    const f = (i: number) => searches()[i].body[0].query[0].filters.map((x: any) => x.fieldName);
    assert.ok(f(0).includes('bidCloseDate'));
    assert.ok(!f(1).includes('bidCloseDate'));
  });

  test('mode "auto": gọi trực tiếp bị đòi reCAPTCHA (cổng trả 401) → thử lại bằng trình duyệt và có kết quả', async () => {
    const { searchRaw } = await lib();
    const r = await searchRaw(['may phat'], 10, 'auto');
    assert.equal(r.via, 'browser');
    assert.equal(r.pages[0][0].notifyNo, 'IB-may phat');
    const s = searches();
    assert.equal(s.length, 2);
    assert.equal(s[0].token, ''); // lượt đầu: trực tiếp, `?token=` rỗng
    assert.equal(s[1].token, 'tok-1'); // lượt hai: trong trang, có token
  });

  test('mode "direct": cổng đòi reCAPTCHA → ném CaptchaRequiredError, KHÔNG mở trình duyệt (không tải trang)', async () => {
    const { searchRaw, CaptchaRequiredError } = await lib();
    await assert.rejects(searchRaw(['x'], 10, 'direct'), (e: unknown) => e instanceof CaptchaRequiredError);
    assert.equal(hits.filter((h) => h.method === 'GET').length, 0);
  });

  test('mode "auto": lỗi HTTP 5xx ở lượt trực tiếp cũng thử lại bằng trình duyệt', async () => {
    const { searchRaw } = await lib();
    // 500 chỉ ở lượt không token: trang giả trả 500 cho mọi POST, nên dùng chế độ riêng — lượt trong trang cũng 500 → lỗi nêu HTTP 500.
    searchMode = 'http500';
    await assert.rejects(searchRaw(['x'], 10, 'auto'), /HTTP 500/);
    assert.equal(hits.filter((h) => h.method === 'GET').length, 1); // đã thử trình duyệt
    assert.equal(searches().length, 2); // một lượt trực tiếp + một lượt trong trang
  });

  test('trong trang cổng vẫn trả con số (token bị từ chối) → CaptchaRequiredError nêu mã', async () => {
    const { searchRaw, CaptchaRequiredError } = await lib();
    searchMode = 'captcha';
    await assert.rejects(searchRaw(['x'], 10, 'browser'), (e: unknown) => e instanceof CaptchaRequiredError && /401/.test((e as Error).message));
  });

  test('trang không có site key → lỗi nói rõ, không gửi lượt tìm nào', async () => {
    const { searchRaw } = await lib();
    siteKeyInPage = null;
    await assert.rejects(searchRaw(['x'], 10, 'browser'), /site key/);
    assert.equal(searches().length, 0);
  });

  test('fetchOpenGeneratorTenders chế độ browser: kết quả đi qua lọc gói máy phát / gói còn mở như nhánh trực tiếp', async () => {
    const { fetchOpenGeneratorTenders } = await lib();
    const out = await fetchOpenGeneratorTenders({ keywords: ['a', 'b'], mode: 'browser' });
    assert.deepEqual(out.map((t) => t.notifyNo).sort(), ['IB-a', 'IB-b']);
    assert.ok(out.every((t) => t.status === 'open' && t.sourceUrl.startsWith(origin)));
  });
});
