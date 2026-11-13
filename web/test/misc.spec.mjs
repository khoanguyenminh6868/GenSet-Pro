// Các luồng khác (việc H2, 13/11/2026): bộ lọc cột và thứ tự tạm, xoá gói, tạo dự án, chi tiết Danh mục (động cơ → thông số,
// "N model gần giống"), giao diện sáng / tối, analysis rút gọn (_lite, như api/lite.js) + db.full của gói đang mở.
import { test, expect, SEED, RICH, openApp, openTab, writesOf, gridKeys, byPubDesc } from "./fixtures.mjs";
import { NOW } from "./fixtures/fake-data.mjs";
import { makeDb, installFetch, fresh, mkReq, call } from "../api/test/harness.mjs";
import "../catalog.js";

const CAT = globalThis.GenbidCatalog;
const INV = ["IB2500258586", "IB2500313344", "IB2600241796"], CLOSED = ["IB2699000105", "IB2200004914", "IB2300231276", ...INV];
const INVESTOR = SEED.colls.bidhist[INV[0]].investorName;
const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k) || SEED.colls.bidhist[k];

test.describe("bộ lọc cột và thứ tự: tạm thời", () => {
  test("lọc Chủ đầu tư (chọn) và Công suất (số), thứ tự theo tên; Xoá lọc; tải lại trang thì về mặc định", async ({ page }) => {
    await openApp(page);
    await page.locator('#stageTabs [data-stage="closed"]').click();
    await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(CLOSED));
    // Lọc Chủ đầu tư: chỉ 3 gói của chủ đầu tư đó; nút phễu sáng.
    await page.locator('#grid [data-fcol="offerer"]').click();
    await page.locator("#fpop #fval").selectOption(INVESTOR);
    await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(INV));
    await expect(page.locator('#grid [data-fcol="offerer"]')).toHaveClass(/\bon\b/);
    // Thứ tự theo tên gói (tăng dần) trong bộ lọc.
    await page.locator('#grid th [data-sort="name"]').click();
    const byName = INV.slice().sort((a, b) => tender(a).bidName.localeCompare(tender(b).bidName, "vi", { numeric: true }) || pubOrder(b, a));
    await expect.poll(() => gridKeys(page)).toEqual(byName);
    await expect(page.locator('#grid th[aria-sort="ascending"] [data-sort="name"]')).toHaveCount(1);
    // Xoá lọc: lại đủ gói (thứ tự theo tên vẫn giữ trong tab).
    await page.locator("#clearFilters").click();
    await expect.poll(async () => (await gridKeys(page)).length).toBe(CLOSED.length);
    // Lọc lại rồi tải lại trang: bộ lọc và thứ tự không được lưu.
    await page.locator('#grid [data-fcol="offerer"]').click();
    await page.locator("#fpop #fval").selectOption(INVESTOR);
    await expect.poll(async () => (await gridKeys(page)).length).toBe(INV.length);
    await page.reload();
    await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
    await page.locator('#stageTabs [data-stage="closed"]').click();
    await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(CLOSED));
    await expect(page.locator('#grid [data-fcol="offerer"]')).not.toHaveClass(/\bon\b/);
  });

  test("lọc số Công suất: >200 giữ gói 250 và 1000 kVA ở tab Mới; đổi tab: thứ tự về mặc định, bộ lọc cột vẫn giữ (khoá hành vi)", async ({ page }) => {
    await openApp(page);
    await page.locator('#stageTabs [data-stage="new"]').click();
    await page.locator('#grid [data-fcol="cap"]').click();
    await page.locator("#fpop #fval").fill(">200");
    // Tab Mới: RICH 160 kVA, IB2699000102 250 kVA, IB2699000107 1000 kVA (công suất trong tên gói).
    await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(["IB2699000102", "IB2699000107"]));
    await page.locator("#fpop #fok").click();
    await page.locator('#grid th [data-sort="cap"]').click();
    await expect.poll(() => gridKeys(page)).toEqual(["IB2699000102", "IB2699000107"]);
    // Khoá hành vi: đổi tab chỉ bỏ bộ lọc Trạng thái và thứ tự; bộ lọc Công suất vẫn áp ở tab Tất cả.
    await page.locator('#stageTabs [data-stage="all"]').click();
    const all = await gridKeys(page);
    expect(all).toEqual(byPubDesc(all));
    expect(all).toContain("IB2699000107");
    expect(all).not.toContain(RICH);
    await expect(page.locator('#grid [data-fcol="cap"]')).toHaveClass(/\bon\b/);
  });
});
const pubOrder = (a, b) => byPubDesc([a, b])[0] === a ? -1 : 1;

test("xoá gói ở tab Đã đóng: hỏi trước, ghi deleted/<TBMT> với updated_at mới, gói rời danh sách", async ({ page }) => {
  await openApp(page);
  await page.locator('#stageTabs [data-stage="closed"]').click();
  const k = "IB2200004914";
  await page.locator(`#grid .selbox[data-sel="${k}"]`).check();
  await expect(page.locator("#delSel")).toHaveText(/Xoá 1 gói/);
  await page.locator("#delSel").click();
  await expect(page.locator("#mdl")).toContainText(k);
  await page.locator("#delOk").click();
  await expect.poll(async () => (await writesOf(page, "deleted/" + k)).length).toBe(1);
  const [w] = await writesOf(page, "deleted/" + k);
  expect(w.data).toMatchObject({ notifyNo: k, bidName: tender(k).bidName });
  expect(w.updated_at > SEED.stamp).toBe(true);
  await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(CLOSED.filter((x) => x !== k)));
  await expect(page.locator('#stageTabs [data-stage="closed"]')).toContainText(String(CLOSED.length - 1));
  // Tab Mới không có ô chọn xoá.
  await page.locator('#stageTabs [data-stage="new"]').click();
  await expect(page.locator("#grid .selbox")).toHaveCount(0);
  await expect(page.locator("#bulkBar")).toBeHidden();
});

test.describe("tạo dự án", () => {
  test.beforeEach(async ({ page }) => { await page.clock.install({ time: new Date(NOW) }); });
  test("Tạo dự án: tên bắt buộc, ghi manual/DA-… với mã DA-<ngày>-01, mở dự án, hiện ở tab Dự án", async ({ page }) => {
    await openApp(page);
    await page.locator('#stageTabs [data-stage="project"]').click();
    await page.locator("#newProject").click();
    await expect(page.locator("#npOk")).toBeDisabled();
    await page.locator("#npName").fill("Dự án BỊA: nguồn dự phòng trạm bơm");
    await page.locator("#npInv").fill("Công ty BỊA");
    await page.locator("#npLoc").fill("Huế");
    await page.locator("#npOk").click();
    await expect.poll(async () => (await writesOf(page, "manual/")).length).toBe(1);
    const [w] = await writesOf(page, "manual/");
    expect(w.path).toMatch(/^manual\/DA-/);
    // Ngày theo giờ Việt Nam của NOW (13/11/2026 10:00), dự án đầu tiên trong ngày.
    expect(w.data).toMatchObject({ isProject: true, projectNo: "DA-2026-11-13-01", bidName: "Dự án BỊA: nguồn dự phòng trạm bơm", investorName: "Công ty BỊA", location: "Huế" });
    expect(w.updated_at > SEED.stamp).toBe(true);
    await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
    await expect(page.locator("#dtitle")).toHaveText("Dự án BỊA: nguồn dự phòng trạm bơm");
    await expect(page.locator("#dmeta")).toContainText("DA-2026-11-13-01");
    await page.locator("#dclose").click();
    await expect.poll(async () => (await gridKeys(page)).length).toBe(2);
    await expect(page.locator('#stageTabs [data-stage="project"]')).toContainText("2");
  });
});

test.describe("chi tiết Danh mục từ hàng trúng thầu", () => {
  // Gói lịch sử BỊA: nhà thầu trúng có hai dòng hàng ghi động cơ Perkins — một mã đủ đời (1106A-70TAG3, có trong danh mục
  // của 5 NCC mẫu) và một mã thiếu đời (1106A-70: nhiều model trong danh mục bắt đầu bằng mã này).
  const KEY = "IB2597000001";
  const goods = [{ name: "Máy phát điện dự phòng", desc: "Tổ máy phát điện 160 kVA, động cơ Perkins 1106A-70, đầu phát Stamford" },
    { name: "Tổ máy phát điện", desc: "động cơ Perkins 1106A-70TAG3" }];
  const doc = { notifyNo: KEY, bidName: "Mua sắm máy phát điện 160 kVA (gói BỊA)", investorName: "Chủ đầu tư BỊA", location: "Tỉnh BỊA", publicDate: "2025-03-01T02:00:00.000Z",
    bidCloseDate: "2025-03-10T03:00:00.000Z", estimatedPrice: 900000000, final: true,
    lots: [{ lotNo: "", price: 900000000, goods, bidders: [{ name: "Nhà thầu BỊA trúng", taxCode: "9990000001", bidPrice: 800000000, won: true, winPrice: 800000000 },
      { name: "Nhà thầu BỊA khác", taxCode: "9990000002", bidPrice: 850000000, won: false }] }] };
  test.use({ patch: { colls: { bidhist: { [KEY]: doc } } } });
  // Số mong đợi theo quy tắc của partFind (index.html): mã ≥ 5 ký tự trùng đúng một model → "Xem thông số"; nhiều model bắt
  // đầu bằng mã → "N model gần giống". Danh mục dựng bằng catalog.js (dùng chung web + bot) trên 5 NCC mẫu.
  const cat = CAT.build(Object.values(SEED.colls.supplier));
  const near = cat.engines.filter((e) => e.key.startsWith(CAT.keyOf("1106A-70")));
  const exact = cat.engines.find((e) => e.key === CAT.keyOf("1106A-70TAG3"));

  // Mở gói bằng bấm ở danh sách (tab Đã đóng), như người dùng: bước gói có trong lịch sử Back.
  async function openKey(page) {
    await openApp(page);
    await page.locator('#stageTabs [data-stage="closed"]').click();
    await page.locator(`#grid tr[data-key="${KEY}"] td.c-name`).click();
    await expect(page.locator("#dtitle")).toHaveText(doc.bidName);
  }
  const drawerOpen = async (page) => {
    await expect(page.locator("#ov")).toBeHidden();
    await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
    await expect(page.locator("#dtitle")).toHaveText(doc.bidName);
  };

  test("mã thiếu đời → 'N model gần giống' mở Danh mục lọc sẵn đúng các model đó; Back về gói", async ({ page }) => {
    expect(near.length).toBeGreaterThan(1);
    await openKey(page);
    const parts = page.locator("#dbody .wpart");
    await expect(parts).toHaveCount(2);
    await expect(parts.nth(0)).toHaveText(`${near.length} model gần giống`, { timeout: 20000 });
    await parts.nth(0).locator("a").click();
    await expect(page.locator("#catBody #catCount")).toHaveText(`${near.length} model`);
    await expect(page.locator("#catQ")).toHaveValue("1106A-70");
    expect((await page.locator("#catList tr[data-catitem]").evaluateAll((rs) => rs.map((r) => r.dataset.catitem))).sort()).toEqual(near.map((e) => e.key).sort());
    await page.goBack();
    await drawerOpen(page);
  });

  test("mã đủ → 'Xem thông số' mở chi tiết động cơ: loại, hãng, các nhóm thông số, bảng dòng nguồn của từng NCC; Back về gói", async ({ page }) => {
    expect(exact).toBeTruthy();
    await openKey(page);
    const link = page.locator("#dbody .wpart").nth(1);
    await expect(link).toHaveText("Xem thông số", { timeout: 20000 });
    await link.locator("a").click();
    const det = page.locator("#catBody");
    await expect(det.locator("h3.hlname")).toHaveText(exact.model);
    await expect(det).toContainText(`${exact.suppliers.length} nhà cung cấp · ${exact.uses.length} dòng bảng`);
    await expect(det.locator("dl.kv").first()).toContainText("Động cơ");
    for (const g of exact.specs) await expect(det).toContainText(g.vi);
    await expect(det.locator("details.supspec")).toHaveCount(exact.suppliers.length);
    expect(new URL(page.url()).hash).toBe("#dong-co");
    await page.goBack();
    await drawerOpen(page);
  });

  // Gói mở thẳng bằng link (#goi/<TBMT>, vd. link gửi qua Zalo) rồi bấm "N model gần giống" → Back về gói, Back nữa về
  // danh sách (lỗi H2: navTap() lần chạm đầu chỉ đẩy bước "trang chủ", gói mở từ link không thành bước; sửa ở W2).
  // Các link thẳng khác: back-link.spec.mjs.
  test("gói mở thẳng bằng link #goi/<TBMT> → Danh mục → Back về lại gói → Back về danh sách", async ({ page }) => {
    await openApp(page, "#goi/" + KEY);
    await expect(page.locator("#dbody .wpart").nth(0)).toHaveText(`${near.length} model gần giống`, { timeout: 20000 });
    await page.locator("#dbody .wpart").nth(0).locator("a").click();
    await expect(page.locator("#catBody #catCount")).toBeVisible();
    await page.goBack();
    await drawerOpen(page);
    await page.goBack();
    await expect(page.locator("#drawer")).not.toHaveClass(/\bopen\b/);
    expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/);
  });
});

test.describe("giao diện sáng / tối", () => {
  for (const colorScheme of ["light", "dark"]) {
    test.describe(colorScheme, () => {
      test.use({ colorScheme });
      // Khoá hành vi: trang luôn dùng giao diện tối (đầu index.html đặt data-theme="dark"), máy để chế độ sáng cũng vậy.
      test(`máy để chế độ ${colorScheme}: trang dùng giao diện tối, chữ sáng trên nền tối`, async ({ page }) => {
        await openApp(page);
        const t = await page.evaluate(() => ({ theme: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, fg: getComputedStyle(document.body).color, scheme: getComputedStyle(document.documentElement).colorScheme }));
        expect(t.theme).toBe("dark");
        expect(t.bg).toBe("rgb(11, 16, 32)"); // --bg tối
        expect(t.fg).toBe("rgb(230, 234, 245)"); // --fg tối
        expect(t.scheme).toBe("dark");
      });
    });
  }
});

test.describe("analysis rút gọn (_lite) + db.full", () => {
  // Bản rút gọn dựng bằng handler THẬT web/api/lite.js trên analysis mẫu (Supabase giả của test API).
  let lite;
  test.beforeAll(async () => {
    const db = makeDb(), undo = installFetch(db);
    try {
      db.put("analysis", RICH, SEED.colls.analysis[RICH]);
      const r = await call(await fresh("lite.js"), mkReq({ method: "GET", query: { coll: "analysis", ids: RICH }, bearer: "member-token" }));
      expect(r.statusCode).toBe(200);
      lite = r.jsonBody[0].data;
    } finally { undo(); }
  });
  // Hai ca dưới tự mở trang (cần bản rút gọn dựng ở beforeAll, sau lúc fixture patch được đọc).

  test("danh sách dùng bản rút gọn; mở gói thì đọc bản đầy đủ đúng gói đó (db.full) và tab Phân tích hiện đủ thông số", async ({ browser }) => {
    expect(lite._lite).toBe(true);
    const full = SEED.colls.analysis[RICH].result.technicalSpecs.length;
    expect(lite.result.technicalSpecs.length).toBeLessThan(full);
    const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.addInitScript((p) => { window.__gbPatch = p; }, { colls: { analysis: { [RICH]: lite } }, full: { ["analysis/" + RICH]: SEED.colls.analysis[RICH] } });
    await page.route((u) => !/^http:\/\/127\.0\.0\.1:\d+\//.test(u.href), (r) => r.fulfill({ status: 200, body: "" }));
    const errors = []; page.on("pageerror", (e) => errors.push(e.message));
    await openApp(page);
    // Công suất ở danh sách đọc từ dòng thông số công suất mà bản rút gọn giữ lại.
    await expect(page.locator(`#grid tr[data-key="${RICH}"] td.c-cap`)).toContainText("160 kVA");
    expect(await page.evaluate(() => window.__gb.fulls)).toEqual([]);
    await page.locator(`#grid tr[data-key="${RICH}"] td.c-name`).click();
    await expect.poll(() => page.evaluate(() => window.__gb.fulls)).toEqual(["analysis/" + RICH]);
    await openTab(page, "analysis");
    await expect(page.locator("#dbody table.spec1 tbody tr")).toHaveCount(full);
    // Gói khác không bị đọc bản đầy đủ.
    expect(await page.evaluate((k) => window.__gb.fulls.filter((p) => !p.endsWith(k)), RICH)).toEqual([]);
    expect(errors).toEqual([]);
    await ctx.close();
  });

  test("bản đầy đủ chưa về: tab Phân tích hiện 'Đang tải kết quả phân tích...' thay vì bảng thông số rút gọn", async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.addInitScript((p) => { window.__gbPatch = p; }, { colls: { analysis: { [RICH]: lite } } }); // không có bản đầy đủ
    await page.route((u) => !/^http:\/\/127\.0\.0\.1:\d+\//.test(u.href), (r) => r.fulfill({ status: 200, body: "" }));
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "analysis");
    await expect(page.locator("#dbody")).toContainText("Đang tải kết quả phân tích...");
    await expect(page.locator("#dbody table.spec1")).toHaveCount(0);
    await ctx.close();
  });
});

test.describe("luật tên gói máy phát (isGensetName) cho dấu \"Chưa có HSMT\"", () => {
  // Gói BỊA. Luật tên gói chung GenbidBidprice.isGensetName (W2 thay includes("máy phát điện") riêng của index.html):
  // nhận "MPĐ", loại máy phát điện gió và tổ máy của nhà máy điện. Luật chỉ chọn dấu "Chưa có HSMT" của gói Mới chưa có
  // tệp; gói nào cũng ở lại danh sách, kể cả gói đang theo dõi mà luật mới coi là không phải máy phát.
  const base = { investorName: "Bên mời thầu BỊA", location: "Thành phố Huế", bidForm: "CHCT", field: "HH", isInternet: true, publicDate: "2026-11-11T02:00:00.000Z", bidCloseDate: "2030-02-10T03:00:00.000Z", estimatedPrice: 1e9, sourceUrl: "" };
  const MPD = { ...base, notifyNo: "IB2699000901", bidName: "Mua sắm MPĐ dự phòng 300 kVA (BỊA)" };
  const WIND = { ...base, notifyNo: "IB2699000902", bidName: "Mua sắm cụm cơ khí và máy phát điện gió (BỊA)" };
  const PLANT = { ...base, notifyNo: "IB2699000903", bidName: "Sửa chữa máy phát điện tổ máy H1 nhà máy thủy điện (BỊA)" };
  test.use({ patch: { colls: {
    feed: { current: { ...SEED.colls.feed.current, tenders: [...SEED.colls.feed.current.tenders, MPD, WIND] } },
    tracked: { [PLANT.notifyNo]: { stage: "preparing", note: "", tender: PLANT } },
  } } });
  const mark = (page, k) => page.locator(`#grid tr[data-key="${k}"] .aicon[aria-label="Chưa phân tích, chưa có HSMT"]`);

  test("MPĐ có dấu; máy phát điện gió không có dấu nhưng vẫn trong tab Mới; gói đang theo dõi bị luật loại vẫn ở tab của nó", async ({ page }) => {
    await openApp(page);
    await expect(page.locator(`#grid tr[data-key="${MPD.notifyNo}"]`)).toBeVisible();
    await expect(mark(page, MPD.notifyNo)).toHaveCount(1);
    await expect(page.locator(`#grid tr[data-key="${WIND.notifyNo}"]`)).toBeVisible();
    await expect(mark(page, WIND.notifyNo)).toHaveCount(0);
    // Gói có "máy phát điện" trong tên (luật cũ) vẫn có dấu như trước.
    await expect(mark(page, "IB2699000102")).toHaveCount(1);
    await page.locator('#stageTabs [data-stage="preparing"]').click();
    await expect(page.locator(`#grid tr[data-key="${PLANT.notifyNo}"]`)).toBeVisible();
  });
});
