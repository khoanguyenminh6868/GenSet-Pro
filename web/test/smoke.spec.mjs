// Test khói giao diện web (việc T7, 13/11/2026): web/index.html thật, DB giả trong bộ nhớ (fake-shim.js) với dữ liệu
// mẫu fixtures/seed.json. Mỗi ca tự kiểm không có lỗi console / pageerror (fixtures.mjs).
// Số mong đợi lấy từ quy tắc nghiệp vụ (web/CLAUDE.md, chú thích trong index.html), không chép đầu ra của trang.
import { test, expect, SEED, SRC_MARK, RICH, openApp, writesOf, gridKeys, byPubDesc } from "./fixtures.mjs";

// Gói mẫu (fixtures/make-seed.mjs).
const G = {
  new2: "IB2699000102", prep: "IB2699000103", sub: "IB2699000104", cancelled: "IB2699000105", dropped: "IB2699000106", new3: "IB2699000107",
  won: "IB2400337979", lost: "IB2400379144", s1: "IB2200004914", s2: "IB2300231276", subHist: "IB2600452452",
  inv: ["IB2500258586", "IB2500313344", "IB2600241796"], project: "DA-2026-11-04-01",
};
// Tab của từng gói theo quy tắc: gói đang mở theo trạng thái theo dõi; gói lịch sử (bidhist) có Thảo Nguyên dự thì Đã nộp
// (chưa có kết quả) / Trúng thầu / Không trúng; gói hết hạn hoặc đã hủy TBMT mà còn ở Mới / Bỏ qua → Đã đóng.
const TAB = {
  new: [RICH, G.new2, G.new3],
  preparing: [G.prep],
  submitted: [G.sub, G.subHist],
  won: [G.won],
  lost: [G.lost],
  closed: [G.cancelled, G.s1, G.s2, ...G.inv],
  dropped: [G.dropped],
  project: [G.project],
};
TAB.all = Object.entries(TAB).filter(([k]) => k !== "project").flatMap(([, v]) => v);
const INVESTOR = SEED.colls.bidhist[G.inv[0]].investorName;
const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k) || SEED.colls.bidhist[k];

test("trang tải: danh sách gói, KPI, tab trạng thái, không lỗi console", async ({ page }) => {
  await openApp(page);
  await expect(page.locator("#kpis .kpi").first()).toBeVisible();
  await expect(page.locator("#stageTabs [data-stage]")).toHaveCount(1 + 8);
  await expect(page.locator("#authGate")).toHaveCount(0);
});

test("mỗi tab trạng thái có đúng các gói, xếp theo ngày đăng giảm dần", async ({ page }) => {
  await openApp(page);
  for (const [stage, keys] of Object.entries(TAB)) {
    await page.locator(`#stageTabs [data-stage="${stage}"]`).click();
    await expect(page.locator(`#stageTabs [data-stage="${stage}"]`)).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => gridKeys(page), { message: `tab ${stage}` }).toEqual(byPubDesc(keys));
    await expect(page.locator(`#stageTabs [data-stage="${stage}"]`)).toContainText(String(keys.length));
  }
});

test("đổi thứ tự rồi sang tab khác: tab mới lại theo ngày đăng giảm dần (không lưu thứ tự)", async ({ page }) => {
  await openApp(page);
  await page.locator('#stageTabs [data-stage="closed"]').click();
  await page.locator('#grid th [data-sort="name"]').click();
  const byName = await gridKeys(page);
  expect(byName).not.toEqual(byPubDesc(TAB.closed)); // tên gói không trùng thứ tự ngày đăng ở dữ liệu mẫu
  await page.locator('#stageTabs [data-stage="all"]').click();
  await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(TAB.all));
  await page.locator('#stageTabs [data-stage="closed"]').click();
  await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(TAB.closed));
});

test("mở gói bằng #goi/<TBMT>: Tổng quan (nhà thầu), Phân tích, Cấu hình gợi ý, Giá gợi ý", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  const drawer = page.locator("#drawer"), body = page.locator("#dbody");
  await expect(drawer).toHaveClass(/\bopen\b/);
  await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
  await expect(page.locator('#dtabs [data-dt="info"]')).toHaveAttribute("aria-selected", "true");
  // Tổng quan: chủ đầu tư dẫn tới trang chủ đầu tư; bảng nhà thầu đủ dòng của bidders/<TBMT>.
  await expect(body.locator("[data-invopen]")).toHaveText(tender(RICH).investorName);
  const bidders = SEED.colls.bidders[RICH].list;
  await expect(body.locator("table.bdtbl tbody tr")).toHaveCount(bidders.length);
  for (const b of bidders) await expect(body.locator("table.bdtbl")).toContainText(b.name);

  await page.locator('#dtabs [data-dt="analysis"]').click();
  await expect(page.locator('#dtabs [data-dt="analysis"]')).toHaveAttribute("aria-selected", "true");
  await expect(body).toContainText(SEED.colls.analysis[RICH].result.summary.slice(0, 40));

  await page.locator('#dtabs [data-dt="config"]').click();
  const cfg = SEED.colls.configmatch[RICH].result.configs;
  for (const c of cfg) await expect(body).toContainText(c.engine.model);

  await page.locator('#dtabs [data-dt="price"]').click();
  await expect(body.locator("#bpRun")).toBeVisible();
  await expect(body).toContainText("Đã gợi ý giá");
  expect(new URL(page.url()).hash).toBe("#goi/" + RICH);
});

// Dữ liệu mẫu có câu trích (đã gắn dấu SRC_MARK): nếu dấu lọt ra màn hình (chữ hoặc title...) là lộ nguồn.
async function srcLeaks(page, tab) {
  expect(JSON.stringify(SEED.colls[tab === "config" ? "configmatch" : "analysis"][RICH])).toContain(SRC_MARK);
  await openApp(page, "#goi/" + RICH);
  {
    await page.locator(`#dtabs [data-dt="${tab}"]`).click();
    await expect(page.locator(`#dtabs [data-dt="${tab}"]`)).toHaveAttribute("aria-selected", "true");
    await page.locator("#dbody details").evaluateAll((ds) => ds.forEach((d) => (d.open = true)));
    // Chữ trên màn hình (cả phần đang gập) và các thuộc tính người dùng thấy được; data-* (vd. data-supline để cuộn tới
    // dòng của NCC) là dữ liệu, không in ra.
    const shown = await page.locator("#dbody").evaluate((el) => [el.textContent, ...[...el.querySelectorAll("*")].flatMap((e) =>
      ["title", "aria-label", "alt", "placeholder", "href", "value"].map((a) => e.getAttribute(a) || ""))].join("\n"));
    expect(shown.length, tab).toBeGreaterThan(500);
    const leaks = [...shown.matchAll(new RegExp(SRC_MARK + "[^\\n]{0,60}", "g"))].map((m) => m[0]);
    expect(leaks, `tab ${tab}: câu trích nguồn lộ ra màn hình`).toEqual([]);
  }
}
test("SHOW_SRC=false: Cấu hình gợi ý không in câu trích / dòng / link nguồn nào", async ({ page }) => { await srcLeaks(page, "config"); });
test("SHOW_SRC=false: Phân tích không in câu trích HSMT / chỗ dẫn chiếu (thông số, điều khoản, năng lực)", async ({ page }) => {
  await srcLeaks(page, "analysis");
});

test("Nhà cung cấp: danh sách, chi tiết, sao yêu thích và loại trừ ghi DB với updated_at mới", async ({ page }) => {
  await openApp(page);
  await page.locator("#supBtn").click();
  const rows = page.locator("#supBody tr[data-supopen]");
  await expect(rows).toHaveCount(Object.keys(SEED.colls.supplier).length);
  expect(new URL(page.url()).hash).toBe("#nha-cung-cap");
  // NCC yêu thích sẵn trong dữ liệu mẫu hiện sao vàng.
  await expect(page.locator('#supBody [data-supfav="tecgen-fujian"]')).toHaveClass(/\bon\b/);
  const star = page.locator('#supBody [data-supfav="hosem-power"]');
  await expect(star).not.toHaveClass(/\bon\b/);
  await star.click();
  await expect(star).toHaveClass(/\bon\b/);
  await expect.poll(() => writesOf(page, "supfav/hosem-power")).toHaveLength(1);
  const [fav] = await writesOf(page, "supfav/hosem-power");
  expect(fav.data.on).toBe(true);
  expect(fav.updated_at > SEED.stamp).toBe(true);

  // Chi tiết NCC rồi loại trừ.
  await page.locator('#supBody tr[data-supopen="hosem-power"] .hlname').click();
  await expect(page.locator("#supBack")).toBeVisible();
  await expect(page.locator("#supBody h3.hlname")).toContainText(/hosem/i);
  await page.locator("#supExcl").click();
  await expect.poll(() => writesOf(page, "supexcl/hosem-power")).toHaveLength(1);
  const [ex] = await writesOf(page, "supexcl/hosem-power");
  expect(ex.data.on).toBe(true);
  expect(ex.updated_at > fav.updated_at).toBe(true);
  await page.locator("#supBack").click();
  // NCC bị loại trừ vẫn trong danh sách, mờ đi và có nhãn.
  await expect(page.locator('#supBody tr[data-supopen="hosem-power"]')).toHaveClass(/\bsupexcl\b/);
  await expect(page.locator('#supBody tr[data-supopen="hosem-power"]')).toContainText("Đã loại trừ");
});

test("Nhà thầu: danh sách và trang một nhà thầu", async ({ page }) => {
  await openApp(page);
  await page.locator("#bdBtn").click();
  expect(new URL(page.url()).hash).toBe("#nha-thau");
  const first = page.locator("#bdList [data-bdopen]").first();
  await expect(first).toBeVisible();
  const name = (await first.innerText()).split("\n")[0].trim();
  await first.click();
  await expect(page.locator("#bdBody")).toContainText(name);
  await expect(page.locator("#bdList")).toHaveCount(0);
});

test("Danh mục Thông số cấu hình (động cơ, đầu phát, bộ điều khiển) mở bằng nút", async ({ page }) => {
  await openApp(page);
  await page.locator('header [data-catopen="engine"]').click();
  await expect(page.locator("#catTitle")).toBeVisible();
  await expect(page.locator("#catBody .loading")).toHaveCount(0, { timeout: 20000 });
  await expect(page.locator("#catBody")).not.toBeEmpty();
});

// Mở thẳng bằng link (tải lại trang ở màn hình): openScreenFromUrl() chạy trước initDb() — màn phải tự tải nhà cung cấp, giữ hash.
for (const hash of ["dong-co", "dau-phat", "bo-dieu-khien"]) {
  test(`mở thẳng /#${hash} hiện danh mục, giữ hash`, async ({ page }) => {
    await page.goto("/#" + hash);
    await expect(page.locator("#catTitle")).toBeVisible();
    await expect(page.locator("#catBody .loading")).toHaveCount(0, { timeout: 20000 });
    await expect(page.locator("#catBody tr, #catBody .lrow, #catBody [data-catopen]").first()).toBeVisible();
    await expect(page.locator("#catBody")).not.toContainText("Đang tải nhà cung cấp");
    expect(new URL(page.url()).hash).toBe("#" + hash);
  });
}
test("mở thẳng /#nha-cung-cap hiện danh sách nhà cung cấp, giữ hash", async ({ page }) => {
  await page.goto("/#nha-cung-cap");
  await expect(page.locator("#supBody tr[data-supopen]")).toHaveCount(Object.keys(SEED.colls.supplier).length);
  expect(new URL(page.url()).hash).toBe("#nha-cung-cap");
});
test("mở thẳng /#nha-thau hiện danh sách nhà thầu, giữ hash", async ({ page }) => {
  await page.goto("/#nha-thau");
  await expect(page.locator("#bdList [data-bdopen]").first()).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#nha-thau");
});

test("trang Chủ đầu tư #cdt/<tên>: mọi gói của chủ đầu tư, mới đăng trước", async ({ page }) => {
  await openApp(page, "#cdt/" + encodeURIComponent(INVESTOR));
  await expect(page.locator("#dtitle")).toHaveText(INVESTOR);
  await expect(page.locator("#dmeta")).toContainText(`${G.inv.length} gói`);
  await expect.poll(() => page.locator("#dbody .lrow").evaluateAll((rs) => rs.map((r) => r.dataset.openkey))).toEqual(byPubDesc(G.inv));
});

test("Back: gói → trang chủ đầu tư → gói khác, Back ba lần về đúng từng màn trước", async ({ page }) => {
  await openApp(page);
  const title = page.locator("#dtitle"), drawer = page.locator("#drawer");
  const [x, y] = byPubDesc(G.inv);
  await page.locator('#stageTabs [data-stage="closed"]').click();
  await page.locator(`#grid tr[data-key="${x}"] td.c-name`).click();
  await expect(title).toHaveText(tender(x).bidName);
  await page.locator("#dbody [data-invopen]").click();
  await expect(title).toHaveText(INVESTOR);
  await page.locator(`#dbody .lrow[data-openkey="${y}"]`).click();
  await expect(title).toHaveText(tender(y).bidName);

  await page.goBack();
  await expect(title).toHaveText(INVESTOR);
  await page.goBack();
  await expect(title).toHaveText(tender(x).bidName);
  await expect(drawer).toHaveClass(/\bopen\b/);
  await page.goBack();
  await expect(drawer).not.toHaveClass(/\bopen\b/);
  await expect(page.locator('#stageTabs [data-stage="closed"]')).toHaveAttribute("aria-selected", "true");
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/); // Back không rời trang
});

test("Back: Nhà cung cấp → chi tiết NCC → Back về danh sách → Back đóng màn", async ({ page }) => {
  await openApp(page);
  await page.locator("#supBtn").click();
  await page.locator('#supBody tr[data-supopen="kaichen-jiangsu"] .hlname').click();
  await expect(page.locator("#supBack")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#supBody tr[data-supopen]").first()).toBeVisible();
  await expect(page.locator("#supBack")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
});

test("Back: Nhà thầu → một nhà thầu → gói của nhà thầu đó → Back ba lần", async ({ page }) => {
  await openApp(page);
  await page.locator("#bdBtn").click();
  await page.locator("#bdList [data-bdopen]").first().click();
  await expect(page.locator("#bdList")).toHaveCount(0);
  const link = page.locator("#bdBody [data-bdtender]").first();
  const key = await link.getAttribute("data-bdtender");
  await link.click();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(page.locator("#dtitle")).toHaveText(tender(key).bidName);

  await page.goBack();
  await expect(page.locator("#bdBody")).toBeVisible();
  await expect(page.locator("#bdList")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#bdList [data-bdopen]").first()).toBeVisible();
  await page.goBack();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(page.locator("#drawer")).not.toHaveClass(/\bopen\b/);
});

// Màn Nhà thầu mở từ bảng nhà thầu của gói: gói đầu tiên của nhà thầu thường chính là gói vừa mở. Bấm nó là một bước mới,
// không phải Back (W2: trước đây navSync coi là Back, Back sau đó về thẳng danh sách).
test("Back: gói → nhà thầu (từ bảng nhà thầu của gói) → gói của nhà thầu, Back về nhà thầu, gói đầu, danh sách", async ({ page }) => {
  await openApp(page);
  const title = page.locator("#dtitle"), drawer = page.locator("#drawer");
  await page.locator(`#grid tr[data-key="${RICH}"] td.c-name`).click();
  await expect(title).toHaveText(tender(RICH).bidName);
  const bd = page.locator("#dbody table.bdtbl [data-bdopen]").first();
  const bdName = (await bd.innerText()).trim();
  await bd.click();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  const links = page.locator("#bdBody [data-bdtender]");
  // Ca khó: gói của nhà thầu trùng gói đang mở bên dưới.
  const link = page.locator(`#bdBody [data-bdtender="${RICH}"]`).first();
  await expect(links.first()).toBeVisible();
  await (await link.count() ? link : links.first()).click();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(drawer).toHaveClass(/\bopen\b/);

  await page.goBack();
  await expect(page.locator("#ov")).toBeVisible();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  await page.goBack();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(drawer).toHaveClass(/\bopen\b/);
  await expect(title).toHaveText(tender(RICH).bidName);
  await page.goBack();
  await expect(drawer).not.toHaveClass(/\bopen\b/);
  await page.goBack();
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//); // Back không rời trang
  await expect(page.locator(`#grid tr[data-key="${RICH}"]`)).toBeVisible();
});

test("đổi trạng thái gói (Mới → Chuẩn bị HSDT) ghi tracked/<TBMT> với updated_at mới", async ({ page }) => {
  await openApp(page);
  await page.locator('#stageTabs [data-stage="new"]').click();
  await page.locator(`#grid tr[data-key="${G.new2}"] [data-step="preparing"]`).click();
  await expect.poll(() => writesOf(page, "tracked/" + G.new2)).toHaveLength(1);
  const [w] = await writesOf(page, "tracked/" + G.new2);
  expect(w.data.stage).toBe("preparing");
  expect(w.data.tender.notifyNo).toBe(G.new2);
  expect(w.updated_at > SEED.stamp).toBe(true);
  await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(TAB.new.filter((k) => k !== G.new2)));
  await page.locator('#stageTabs [data-stage="preparing"]').click();
  await expect.poll(() => gridKeys(page)).toEqual(byPubDesc([...TAB.preparing, G.new2]));
});

test.describe("đổi trạng thái khi DB không ghi được", () => {
  test.use({ patch: { failSet: ["tracked"] } });
  test("gói về lại tab cũ, báo chưa lưu được, không báo Đã chuyển sang (Argon review 13/11)", async ({ page }) => {
    await openApp(page);
    await page.locator('#stageTabs [data-stage="new"]').click();
    await page.locator(`#grid tr[data-key="${G.new2}"] [data-step="preparing"]`).click();
    await expect(page.locator(".toast", { hasText: "Chưa lưu được" })).toBeVisible();
    await expect(page.locator(".toast", { hasText: "Đã chuyển sang" })).toHaveCount(0);
    await expect.poll(() => gridKeys(page)).toEqual(byPubDesc(TAB.new));
    expect(await writesOf(page, "tracked/" + G.new2)).toHaveLength(0);
  });
});

test("lưu ghi chú nội bộ của gói ghi tracked/<TBMT> (giữ trạng thái) với updated_at mới", async ({ page }) => {
  await openApp(page, "#goi/" + G.prep);
  const note = page.locator("#dNote");
  await note.fill("Gọi nhà cung cấp lấy báo giá");
  await note.blur();
  await expect.poll(() => writesOf(page, "tracked/" + G.prep)).toHaveLength(1);
  const [w] = await writesOf(page, "tracked/" + G.prep);
  expect(w.data.note).toBe("Gọi nhà cung cấp lấy báo giá");
  expect(w.data.stage).toBe("preparing");
  expect(w.updated_at > SEED.stamp).toBe(true);
  // Ghi chú hiện ở dòng của gói trong danh sách.
  await expect(page.locator(`#grid tr[data-key="${G.prep}"]`)).toContainText("Gọi nhà cung cấp lấy báo giá");
});
