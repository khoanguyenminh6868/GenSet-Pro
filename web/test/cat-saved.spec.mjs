// Danh mục dựng ở luồng nền (web/catalog-worker.js) và giữ trên máy (IndexedDB "genbid-catalog", catStore của
// index.html; Khoa 26/11/2026): F5 ở màn Thông số cấu hình đọc bản lưu; hồ sơ nhà cung cấp đổi phiên bản thì dựng lại.
import { test, expect } from "./fixtures.mjs";

// Đếm số lần dựng: worker = số worker danh mục được tạo; page = số lần trang tự dựng trên luồng của nó (không được có).
const countBuilds = (page) => page.addInitScript(() => {
  const n = (window.__builds = { worker: 0, page: 0 });
  const W = window.Worker;
  window.Worker = class extends W { constructor(url, o) { super(url, o); if (String(url).includes("catalog-worker")) n.worker++; } };
  let api;
  Object.defineProperty(window, "GenbidCatalog", { configurable: true, get: () => api, set: (v) => { api = { ...v, build: (s) => { n.page++; return v.build(s); } }; } });
});
const builds = (page) => page.evaluate(() => window.__builds);
const ready = (page) => expect(page.locator("#catBody [data-catitem]").first()).toBeVisible({ timeout: 60000 });
const savedKey = (page) => page.evaluate(() => new Promise((res) => {
  const o = indexedDB.open("genbid-catalog");
  o.onupgradeneeded = () => o.result.createObjectStore("built"); // như catStore: mở trước worker cũng không làm hỏng
  o.onsuccess = () => { const g = o.result.transaction("built").objectStore("built").get("key"); g.onsuccess = () => { o.result.close(); res(g.result || null); }; };
}));
const rows = (page) => page.locator("#catBody [data-catitem]").evaluateAll((r) => r.map((x) => x.textContent));
// Các lựa chọn của mọi ô lọc (hãng, nước thương hiệu, nơi sản xuất, thông số) kèm số model.
const options = (page) => page.locator("#catBody select").evaluateAll((s) => s.map((x) => [...x.options].map((o) => o.textContent)));

test("dựng ở luồng nền; F5 ở màn Động cơ đọc bản đã lưu, không dựng lại", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.goto("/#dong-co");
  await ready(page);
  expect(await builds(page)).toEqual({ worker: 1, page: 0 });
  const first = await rows(page), filters = await options(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  await page.reload();
  await ready(page);
  expect(await builds(page), "lần mở sau không dựng").toEqual({ worker: 0, page: 0 });
  expect(await rows(page)).toEqual(first);
  expect(await options(page)).toEqual(filters);
});

test("hồ sơ nhà cung cấp đổi phiên bản: dựng lại và lưu bản mới", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  const old = await savedKey(page);
  await page.evaluate(async () => {
    const db = await window.claude.use("db"), id = Object.keys(window.__gb.colls.supplier)[0];
    await db.doc("supplier/" + id).update({ testMark: 1 });
  });
  await expect.poll(() => builds(page)).toEqual({ worker: 2, page: 0 });
  await expect.poll(() => savedKey(page)).not.toBe(old);
});

test("không tải được worker: trang tự dựng, danh mục và bộ lọc y như dựng ở luồng nền", async ({ page, context, errors }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.goto("/#dong-co");
  await ready(page);
  const first = await rows(page), filters = await options(page);
  await context.route("**/catalog-worker.js", (r) => r.fulfill({ status: 404, body: "" }));
  await page.evaluate(() => new Promise((res) => { const d = indexedDB.deleteDatabase("genbid-catalog"); d.onsuccess = d.onerror = d.onblocked = res; }));
  await page.reload();
  await ready(page);
  expect((await builds(page)).page).toBe(1);
  expect(await rows(page)).toEqual(first);
  expect(await options(page)).toEqual(filters);
  errors.length = 0; // lỗi tải worker là cố ý
});
