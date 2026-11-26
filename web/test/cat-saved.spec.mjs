// Danh mục đã dựng được giữ trên máy (IndexedDB "genbid-catalog", catStore của index.html, Khoa 26/11/2026): F5 ở màn
// Thông số cấu hình đọc bản lưu thay vì dựng lại; hồ sơ nhà cung cấp đổi phiên bản thì dựng lại.
import { test, expect } from "./fixtures.mjs";

// Đếm số lần trang dựng danh mục: build() và result() của builder() (builder() không step() chỉ nạp nơi sản xuất).
const countBuilds = (page) => page.addInitScript(() => {
  window.__builds = 0;
  let api;
  Object.defineProperty(window, "GenbidCatalog", {
    configurable: true,
    get: () => api,
    set: (v) => {
      api = { ...v, build: (s) => { window.__builds++; return v.build(s); }, builder: (s) => { const b = v.builder(s); let done = false; return { ...b, result: () => { const r = b.result(); if (r && !done) { done = true; window.__builds++; } return r; } }; } };
    },
  });
});
const ready = (page) => expect(page.locator("#catBody [data-catitem]").first()).toBeVisible({ timeout: 60000 });
const savedKey = (page) => page.evaluate(() => new Promise((res) => {
  const o = indexedDB.open("genbid-catalog");
  o.onsuccess = () => { try { const g = o.result.transaction("built").objectStore("built").get("key"); g.onsuccess = () => { o.result.close(); res(g.result || null); }; } catch { o.result.close(); res(null); } };
}));
const rows = (page) => page.locator("#catBody [data-catitem]").evaluateAll((r) => r.map((x) => x.textContent));

test("F5 ở màn Động cơ: đọc bản đã lưu, không dựng lại", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.goto("/#dong-co");
  await ready(page);
  const first = await rows(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  await page.reload();
  await ready(page);
  expect(await page.evaluate(() => window.__builds), "lần mở sau không dựng").toBe(0);
  expect(await rows(page)).toEqual(first);
});

test("hồ sơ nhà cung cấp đổi phiên bản: dựng lại và lưu bản mới", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  const old = await savedKey(page), n = await page.evaluate(() => window.__builds);
  await page.evaluate(async () => {
    const db = await window.claude.use("db"), id = Object.keys(window.__gb.colls.supplier)[0];
    await db.doc("supplier/" + id).update({ testMark: 1 });
  });
  await expect.poll(() => page.evaluate(() => window.__builds)).toBeGreaterThan(n);
  await expect.poll(() => savedKey(page)).not.toBe(old);
});
