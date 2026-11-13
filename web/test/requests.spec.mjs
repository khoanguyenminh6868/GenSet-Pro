// Gửi yêu cầu cho bot Windows (việc H2, 13/11/2026): mỗi nút ghi đúng collection và đúng trường qua genbidApi("/api/webreq")
// (giả, fake-shim.js), rồi cho chính yêu cầu đó đi qua handler thật web/api/webreq.js (fixtures/real-api.mjs) để kiểm trường
// bot thật sự nhận. Trạng thái "đang chờ" và "máy bot tắt" (nhịp tim botstatus/current.lastPollAt quá 3 phút).
import { test, expect, SEED, RICH, openApp, openTab, reqsOf } from "./fixtures.mjs";
import { throughWebreq } from "./fixtures/real-api.mjs";
import { NOW } from "./fixtures/fake-data.mjs";

const NEW2 = "IB2699000102";
const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k);
const MIN = 60e3, ago = (ms) => new Date(Date.parse(NOW) - ms).toISOString();
// Tệp HSMT đã có (tên, cỡ bịa): Phân tích, Gợi ý cấu hình... cần gói có tệp.
const HSMT = { [RICH]: { files: [{ name: "E-HSMT (BỊA).pdf", size: 120000 }], updatedAt: "2026-11-02T00:00:00.000Z" } };
// Bot đang chạy mà không cần giờ giả: nhịp tim ở tương lai thì "now − lastPollAt < 3 phút" luôn đúng. (Đồng hồ giả của
// Playwright làm lệch mốc 3 giây của "Đã gửi yêu cầu phân tích", nên chỉ các ca nhịp tim mới cài giờ.)
const online = { current: { lastPollAt: "2099-01-01T00:00:00.000Z" } };

// Một yêu cầu duy nhất của collection, và bản bot nhận sau webreq.js thật.
async function oneReq(page, coll) {
  await expect.poll(async () => (await reqsOf(page, coll)).length, { message: coll }).toBe(1);
  const [body] = await reqsOf(page, coll);
  expect(body.items).toHaveLength(1);
  const real = await throughWebreq(body);
  expect(real.status, real.error).toBe(200);
  return { item: body.items[0], saved: real.saved[0].data };
}

test.describe("gói có tệp HSMT, bot đang chạy", () => {
  test.use({ patch: { colls: { hsmt: HSMT, botstatus: online } } });

  test("Phân tích lại → analysisreq/<TBMT>; tab chuyển sang đang chờ bot, không cảnh báo máy tắt", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "analysis");
    await page.locator('#dbody [data-act="reanalyze"]').click();
    const { item, saved } = await oneReq(page, "analysisreq");
    expect(item).toEqual({ key: RICH, notifyNo: RICH, bidName: tender(RICH).bidName });
    expect(saved).toMatchObject({ notifyNo: RICH, bidName: tender(RICH).bidName, from: "web" });
    expect(Date.parse(saved.requestedAt)).toBeGreaterThan(0);
    await expect(page.locator("#dbody")).toContainText("Đã gửi yêu cầu phân tích");
    // Sau 3 giây: "Đang chờ Agent phân tích..." kèm thời gian chờ.
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent phân tích", { timeout: 8000 });
    await expect(page.locator("#dbody [data-since]")).toHaveText("(vừa gửi)");
    await expect(page.locator("#dbody [data-botwarn]")).toBeHidden();
  });

  test("Gợi ý cấu hình: chọn xuất xứ G7 + yêu cầu khác → configreq có origin, extra", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    await page.locator('#dbody input[name="cfgOrigin"][value="g7"]').check();
    await page.locator("#cfgExtra").fill("động cơ hãng G7, đầu phát Stamford");
    await page.locator("#cfgRun").click();
    const { item, saved } = await oneReq(page, "configreq");
    expect(item).toMatchObject({ key: RICH, origin: "g7", extra: "động cơ hãng G7, đầu phát Stamford" });
    expect(saved).toMatchObject({ notifyNo: RICH, origin: "g7", extra: "động cơ hãng G7, đầu phát Stamford" });
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent đọc HSMT và chọn cấu hình");
    await expect(page.locator("#cfgRun")).toBeDisabled();
    await expect(page.locator('#dbody input[name="cfgOrigin"][value="g7"]')).toBeDisabled();
  });

  test("Tìm (cả gói) → findreq không có target; xuất xứ mặc định Tất cả", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    await page.locator("#cfgFind").click();
    const { item, saved } = await oneReq(page, "findreq");
    expect(item).toMatchObject({ key: RICH, origin: "all", extra: "" });
    expect(item.target).toBeUndefined();
    expect(saved.origin).toBe("all");
    expect(saved.target).toBeUndefined();
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent tìm nhà cung cấp trên internet");
  });

  test("Gợi ý giá → bidpricereq có basis: công suất, giá gói, chủ đầu tư", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "price");
    await page.locator("#bpRun").click();
    const { item, saved } = await oneReq(page, "bidpricereq");
    const t = tender(RICH);
    expect(item.basis).toMatchObject({ kva: 160, price: t.estimatedPrice, bidForm: t.bidForm, investorName: t.investorName });
    expect(saved.basis).toMatchObject({ kva: 160, price: t.estimatedPrice, bidForm: t.bidForm, investorName: t.investorName });
    await expect(page.locator("#dbody")).toContainText("Đang chờ Agent so cấu hình gói này");
    await expect(page.locator("#bpRun")).toBeDisabled();
  });

  // LỖI (H2): index.html bidBasis gửi location, field, bidCloseDate "cho dự báo số nhà thầu của bot" và
  // suppliers/bidprice-bot.mjs đọc b.location / b.field / b.bidCloseDate cho nbForecast, nhưng api/webreq.js bidBasis chỉ
  // giữ kva, price, capText, bidForm, investorName → yêu cầu Gợi ý giá từ web mất tỉnh, lĩnh vực, ngày đóng thầu.
  test.fixme("Gợi ý giá: location, field, bidCloseDate đi qua webreq.js tới bot", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "price");
    await page.locator("#bpRun").click();
    const { item, saved } = await oneReq(page, "bidpricereq");
    const t = tender(RICH);
    expect(item.basis).toMatchObject({ location: t.location, field: t.field, bidCloseDate: t.bidCloseDate });
    expect(saved.basis).toMatchObject({ location: t.location, field: t.field, bidCloseDate: t.bidCloseDate });
  });
});

test.describe("Tìm nhà cung cấp cho một cấu hình chưa có NCC", () => {
  // Cấu hình #2 của dữ liệu mẫu bỏ danh sách NCC → hiện nút Tìm nhà cung cấp cho riêng nó.
  const cm = structuredClone(SEED.colls.configmatch[RICH]);
  cm.result.configs[1].suppliers = [];
  test.use({ patch: { colls: { hsmt: HSMT, botstatus: online, configmatch: { [RICH]: cm } } } });

  test("findreq có target: hạng, động cơ / đầu phát / bộ điều khiển (model, hãng) của cấu hình", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    const btn = page.locator(`#dbody [data-cfgfind="${RICH}"]`);
    await expect(btn).toHaveCount(1);
    await expect(btn).toHaveAttribute("data-rank", "2");
    await page.locator("#dbody details").evaluateAll((ds) => ds.forEach((d) => (d.open = true)));
    await btn.click();
    const { item, saved } = await oneReq(page, "findreq");
    const c = cm.result.configs[1], part = (p) => (p?.model ? { model: p.model, ...(p.make ? { make: p.make } : {}) } : undefined);
    const want = JSON.parse(JSON.stringify({ rank: 2, engine: part(c.engine), alternator: part(c.alternator), controller: part(c.controller), genset: part(c.genset) }));
    expect(item.target).toMatchObject(want);
    expect(saved.target).toMatchObject(want);
    await expect(page.locator("#dbody")).toContainText("cho cấu hình #2");
  });
});

test.describe("gói chưa có tệp", () => {
  test.use({ patch: { colls: { botstatus: online } } });

  test("Lấy lại tệp → hsmtreq có link muasamcong (giữ qua webreq.js); Phân tích ngay khi chưa có tệp thì không gửi", async ({ page }) => {
    await openApp(page, "#goi/" + NEW2);
    await openTab(page, "analysis");
    await page.locator('#dbody [data-act="reanalyze"]').click();
    await expect(page.locator("#toast, .toast").first()).toContainText("chưa có tệp hồ sơ");
    expect(await reqsOf(page, "analysisreq")).toEqual([]);

    await openTab(page, "info");
    await page.locator("#hfFetch").click();
    const { item, saved } = await oneReq(page, "hsmtreq");
    expect(item).toMatchObject({ key: NEW2, notifyNo: NEW2, bidName: tender(NEW2).bidName });
    expect(item.sourceUrl).toMatch(/^https:\/\/muasamcong\.mof\.gov\.vn\//);
    expect(item.sourceUrl).toContain(NEW2);
    expect(saved.sourceUrl).toBe(item.sourceUrl);
    await expect(page.locator("#dbody")).toContainText("Đang tải hồ sơ từ muasamcong bằng Agent");
  });
});

test.describe("máy bot tắt / chưa kết nối", () => {
  test.beforeEach(async ({ page }) => { await page.clock.install({ time: new Date(NOW) }); });
  const pending = { [RICH]: { notifyNo: RICH, requestedAt: ago(5 * MIN), by: "test@example.invalid", from: "web" } };
  for (const [name, bot, warn] of [
    ["nhịp tim 2 phút 30 giây trước: bot đang chạy, không cảnh báo", { current: { lastPollAt: ago(150e3) } }, null],
    ["nhịp tim 3 phút 30 giây trước: máy bot tắt, nêu lần cuối kết nối", { current: { lastPollAt: ago(210e3) } }, "Agent chưa nhận yêu cầu (lần cuối kết nối lúc"],
    ["chưa từng có nhịp tim: bot chưa kết nối", null, "Agent chưa kết nối. Yêu cầu sẽ được xử lý khi Agent bật lại."],
  ]) {
    test.describe(name, () => {
      test.use({ patch: { colls: { hsmt: HSMT, bidpricereq: pending, ...(bot ? { botstatus: bot } : {}) } } });
      test(`yêu cầu Gợi ý giá đang chờ 5 phút — ${name}`, async ({ page }) => {
        await openApp(page, "#goi/" + RICH);
        await openTab(page, "price");
        await expect(page.locator("#dbody")).toContainText("Đang chờ Agent so cấu hình gói này");
        await expect(page.locator("#dbody [data-since]")).toHaveText("(đã chờ 5 phút)");
        await expect(page.locator("#bpRun")).toBeDisabled();
        const w = page.locator("#dbody [data-botwarn]");
        if (warn) { await expect(w).toBeVisible(); await expect(w).toContainText(warn); }
        else await expect(w).toBeHidden();
      });
    });
  }
});
