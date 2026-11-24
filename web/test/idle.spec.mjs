// idle() của index.html (dựng danh mục lúc trang rảnh, #1107 / web-idle-2, 24/11/2026): sau cú nhấp chuột thật, trang không vẽ khung hình thì Chromium
// KHÔNG cấp thời gian rảnh, mọi requestIdleCallback chờ tới hết hạn (1000, 50, 50, 50 ms, timeRemaining() = 0). idle() xin thêm
// một khung hình rỗng mỗi lần gọi nên callback chạy trong thời gian rảnh thật. Ca này đếm callback của requestIdleCallback khi
// dựng danh mục; KHÔNG chờ bằng waitForFunction mặc định (polling "raf" trong trang): nó tự tạo khung hình và che mất hiện tượng.
import { test, expect, RICH, openApp } from "./fixtures.mjs";

test("dựng danh mục lúc rảnh: callback chạy trong thời gian rảnh thật, không chờ hết hạn", async ({ page }) => {
  await page.addInitScript(() => {
    const R = (window.__ric = { calls: 0, fired: 0, timeouts: 0, first: 0, last: 0, waits: [] });
    const orig = window.requestIdleCallback.bind(window);
    window.requestIdleCallback = (fn, o) => {
      const t0 = performance.now();
      if (!R.first) R.first = t0;
      R.calls++;
      return orig((d) => { R.fired++; R.last = performance.now(); R.waits.push(Math.round(R.last - t0)); if (d.didTimeout) R.timeouts++; fn(d); }, o);
    };
  });
  await openApp(page, "#goi/" + RICH);
  // Mở tab cấu hình bằng cú nhấp chuột THẬT (page.click → sự kiện chuột của trình duyệt, như người dùng): sau cú nhấp thật Chromium
  // không cấp thời gian rảnh cho trang không vẽ gì (đo 24/11/2026: 7/8 lần bị; .click() tổng hợp trong trang 0/9). catWarm() chạy.
  await page.click('#dtabs [data-dt="config"]');
  // Chờ yên (polling bằng timer của Node, không bằng rAF của trang) tới khi hết callback đang chờ.
  await expect.poll(() => page.evaluate(() => { const r = window.__ric; return r.calls > 0 && r.calls === r.fired && performance.now() - r.last > 1000; }),
    { timeout: 20000, intervals: [250] }).toBe(true);
  const r = await page.evaluate(() => window.__ric);
  expect(r.calls, "catalog build asks for idle time").toBeGreaterThan(1);
  expect(r.timeouts, `callbacks that ran only on timeout, waits ${r.waits}`).toBe(0);
  expect(r.last - r.first, "toàn bộ việc rảnh xong dưới 600 ms").toBeLessThan(600);
});
