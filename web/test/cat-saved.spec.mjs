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

// Giữ lại tin gửi cho worker (window.__held) để ca kiểm chen việc vào giữa một lần dựng, rồi thả bằng release().
const holdWorker = (page) => page.addInitScript(() => {
  const post = Worker.prototype.postMessage, stop = Worker.prototype.terminate;
  window.__held = [];
  window.__stopped = 0;
  Worker.prototype.terminate = function () { window.__stopped++; stop.call(this); };
  Worker.prototype.postMessage = function (...a) { if (window.__hold) window.__held.push(() => post.apply(this, a)); else post.apply(this, a); };
});
const release = (page) => page.evaluate(() => { window.__hold = false; window.__held.splice(0).forEach((f) => f()); });
const held = (page) => expect.poll(() => page.evaluate(() => window.__held.length)).toBe(1);
const databases = (page) => page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name));
const touchSupplier = (page) => page.evaluate(async () => {
  const db = await window.claude.use("db"), id = Object.keys(window.__gb.colls.supplier)[0];
  await db.doc("supplier/" + id).update({ testMark: 1 });
});

test("bản lưu bị xoá giữa lúc dựng (đăng nhập hỏng): worker không tạo lại", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await holdWorker(page);
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  await page.evaluate(() => { window.__hold = true; });
  await touchSupplier(page);
  await held(page);
  await page.evaluate(() => new Promise((res) => { const d = indexedDB.deleteDatabase("genbid-catalog"); d.onsuccess = d.onerror = res; }));
  await release(page);
  await ready(page);
  await page.waitForTimeout(2000); // worker lưu sau khi đã trả danh mục
  expect(await databases(page)).not.toContain("genbid-catalog");
});

test("hồ sơ đổi rồi trở lại giữa lúc dựng: bản dựng dở bị dừng, không đè bản đã lưu", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await holdWorker(page);
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  const old = await savedKey(page);
  await page.evaluate(() => { window.__hold = true; });
  await page.evaluate(async () => (await window.claude.use("db")).doc("supplier/zz-test").set({ id: "zz-test", name: "ZZ test" }));
  await held(page);
  await page.evaluate(async () => (await window.claude.use("db")).doc("supplier/zz-test").delete());
  await expect.poll(() => page.evaluate(() => window.__stopped)).toBe(1);
  await release(page);
  expect(await savedKey(page)).toBe(old);
});

test("bản lưu bị xoá rồi trang khác tạo lại giữa lúc dựng: worker cũ không ghi vào bản mới", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await holdWorker(page);
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  await page.evaluate(() => { window.__hold = true; });
  await touchSupplier(page);
  await held(page);
  await page.evaluate(() => new Promise((res) => { const d = indexedDB.deleteDatabase("genbid-catalog"); d.onsuccess = d.onerror = res; }));
  expect(await savedKey(page)).toBeNull(); // savedKey tạo lại database, như một trang khác
  await release(page);
  await ready(page);
  await page.waitForTimeout(3000); // worker lưu sau khi trang nhận danh mục
  expect(await savedKey(page)).toBeNull();
});

test("hồ sơ trở lại ngay trước khi worker trả lời: bản trang bỏ không được lưu", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  // Trước khi giao câu trả lời của worker cho trang: chạy window.__beforeReply (đổi hồ sơ), rồi giao ngay.
  await page.addInitScript(() => {
    const W = window.Worker;
    window.Worker = class extends W {
      set onmessage(fn) {
        this.addEventListener("message", async (e) => {
          const first = window.__beforeReply;
          window.__beforeReply = null;
          if (first) await first();
          fn(e);
          if (first) window.__replied = true;
        });
      }
    };
  });
  await page.goto("/#dong-co");
  await ready(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  const old = await savedKey(page);
  await page.evaluate(async () => {
    const db = await window.claude.use("db");
    // Chờ 1 s (worker nào tự lưu thì đã lưu xong), rồi đổi hồ sơ về cũ và chờ trang nhận bản đó.
    window.__beforeReply = async () => {
      await new Promise((r) => setTimeout(r, 1000));
      await db.doc("supplier/zz-test").delete();
      while (state.supplier["zz-test"]) await new Promise((r) => setTimeout(r, 20));
    };
    await db.doc("supplier/zz-test").set({ id: "zz-test", name: "ZZ test" });
  });
  await expect.poll(() => page.evaluate(() => window.__replied), { timeout: 60000 }).toBe(true);
  await page.waitForTimeout(3000);
  expect(await savedKey(page)).toBe(old);
});

test("worker hỏng rồi hồ sơ đổi ngay: hẹn giờ cũ bị huỷ, trang không tự dựng", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.addInitScript(() => {
    const W = window.Worker;
    let first = true;
    // Worker đầu tiên báo lỗi và đổi hồ sơ ngay trong 50 ms chờ của đường dự phòng; các worker sau chạy thật.
    window.Worker = class extends W {
      constructor(url, o) { super(url, o); this.broken = first; first = false; }
      postMessage(m) {
        if (!this.broken) return super.postMessage(m);
        this.onerror({ preventDefault() {} });
        window.claude.use("db").then((db) => db.doc("supplier/" + Object.keys(window.__gb.colls.supplier)[0]).update({ testMark: 1 }));
      }
    };
  });
  await page.goto("/#dong-co");
  await ready(page);
  await page.waitForTimeout(500);
  expect(await builds(page)).toEqual({ worker: 2, page: 0 });
});

test("worker không tạo được: bản trang tự dựng được lưu, F5 đọc lại", async ({ page }) => {
  test.setTimeout(120000);
  await countBuilds(page);
  await page.addInitScript(() => { window.Worker = class { constructor() { throw new Error("no worker"); } }; });
  await page.goto("/#dong-co");
  await ready(page);
  expect((await builds(page)).page).toBe(1);
  const first = await rows(page);
  await expect.poll(() => savedKey(page)).not.toBeNull();
  expect(await page.evaluate(() => new Promise((res) => {
    const o = indexedDB.open("genbid-catalog");
    o.onsuccess = () => { const g = o.result.transaction("built").objectStore("built").get("cat"); g.onsuccess = () => { o.result.close(); res(g.result.engines.every((e) => e.origin)); }; };
  })), "lưu kèm nước thương hiệu và nơi sản xuất").toBe(true);
  await page.reload();
  await ready(page);
  expect((await builds(page)).page, "lần mở sau không dựng").toBe(0);
  expect(await rows(page)).toEqual(first);
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
