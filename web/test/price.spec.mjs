// Báo giá NCC, Sổ báo giá, giá vốn và lợi nhuận kỳ vọng (tab Giá gợi ý; việc H2, 13/11/2026).
// Báo giá, tỷ giá, lịch sử thầu dùng ở đây là BỊA (fixtures/fake-data.mjs). Số mong đợi tính tay từ công thức của
// web/bidprice.js (quoteCost, profitTable, quoteStale), không chép từ màn hình.
import { test, expect, SEED, RICH, openApp, openTab, writesOf } from "./fixtures.mjs";
import { NOW, daysAgo, onlyFakeHist, winOf, P_RICH, FX_USD, VAT, ITEM, EXTRAS, GOODS, EXTRA, VAT_AMT, COST, fmtVnd } from "./fixtures/fake-data.mjs";

const supName = (id) => { const s = SEED.colls.supplier[id]; return s.names?.en || s.names?.zh || id; };
const NEW2 = "IB2699000102";
// NCC yêu thích: tecgen (seed), hosem, abz; abz bị loại trừ → không có trong danh sách chọn.
const FAV = { "hosem-power": { on: true }, "abz-power": { on: true } };
const EXCL = { "abz-power": { on: true } };

// Giờ chạy tiếp từ NOW (giờ đứng yên thì updatedAt không đổi, khung chi tiết không vẽ lại).
test.beforeEach(async ({ page }) => { await page.clock.install({ time: new Date(NOW) }); });

async function openPrice(page) {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "price");
  await expect(page.locator("#dbody .qrow").first()).toBeVisible();
}
const profit = (page) => page.locator("#dbody section.profit");

test.describe("nhập báo giá qua giao diện", () => {
  // Bản lưu trước (bịa) có trường khác ngoài rows / cost để kiểm "lưu giữ trường khác".
  test.use({ patch: { colls: { supfav: FAV, supexcl: EXCL, bidhist: onlyFakeHist(),
    quote: { _cost: { rate: 9, by: "seed" }, [RICH]: { rows: [{ id: "r1", supplierId: "", files: [] }], memo: "giữ trường này", updatedAt: "2026-10-01T00:00:00.000Z" } } } } });

  test("chỉ NCC yêu thích (không bị loại trừ) trong danh sách; dòng giá, tỷ giá + thuế dùng chung, chi phí phát sinh → giá vốn và bảng lợi nhuận", async ({ page }) => {
    await openPrice(page);
    const sel = page.locator('[data-qsup="r1"]');
    // Danh sách chọn: chỉ tecgen (yêu thích ở seed) và hosem; abz yêu thích nhưng bị loại trừ; kaichen, sices không yêu thích.
    const opts = await sel.locator("option").evaluateAll((os) => os.filter((o) => o.value).map((o) => o.value));
    expect(opts.sort()).toEqual(["hosem-power", "tecgen-fujian"]);
    // Chưa có giá vốn: có ghi chú, không có bảng xác suất / lợi nhuận.
    await expect(profit(page)).toContainText("Chưa có giá vốn");
    await expect(profit(page).locator(".ptable")).toHaveCount(0);

    await sel.selectOption("tecgen-fujian");
    await expect.poll(async () => (await writesOf(page, "quote/" + RICH)).length).toBe(1);
    let [w] = await writesOf(page, "quote/" + RICH);
    expect(w.data.rows[0].supplierId).toBe("tecgen-fujian");
    expect(w.data.memo).toBe("giữ trường này");
    expect(w.data.updatedAt).not.toBe("2026-10-01T00:00:00.000Z");
    expect(w.updated_at > SEED.stamp).toBe(true);

    // Thêm dòng giá: đơn giá "12.500" (dấu chấm là phân cách nghìn), USD, 2 máy.
    await page.locator('[data-qitem="r1"]').click();
    await page.locator("#qiDesc").fill(ITEM.desc);
    await page.locator("#qiKva").fill("160");
    await page.locator("#qiQty").fill("2");
    await page.locator("#qiPrice").fill("12.500");
    await page.locator("#qiCur").selectOption("USD");
    await page.locator("#qiTerms").fill("CIF");
    await page.locator("#qiDate").fill(daysAgo(12));
    await page.locator("#qiOk").click();
    await expect.poll(async () => (await writesOf(page, "quote/" + RICH)).length).toBe(2);
    w = (await writesOf(page, "quote/" + RICH))[1];
    expect(w.data.rows[0].items).toHaveLength(1);
    expect(w.data.rows[0].items[0]).toMatchObject({ desc: ITEM.desc, kva: 160, qty: 2, unitPrice: 12500, currency: "USD", date: daysAgo(12), vatIncl: false });
    expect(w.data.memo).toBe("giữ trường này");
    // Chưa có tỷ giá USD: không đoán, chưa có giá vốn.
    const row = page.locator('#dbody [data-qrow="r1"]');
    await expect(row).toContainText("Chưa có tỷ giá USD");
    await expect(profit(page)).toContainText("Chưa có giá vốn");

    // Tỷ giá + thuế GTGT dùng chung (quote/_cost), giữ lãi suất đã có.
    await page.locator("#qAll").click();
    await page.locator("#fx-USD").fill("25.000");
    await page.locator("#qaVat").fill("10");
    await page.locator("#qaOk").click();
    await expect.poll(async () => (await writesOf(page, "quote/_cost")).length).toBe(1);
    const [g] = await writesOf(page, "quote/_cost");
    expect(g.data).toMatchObject({ fx: { USD: FX_USD }, vat: VAT, rate: 9 });
    expect(g.updated_at > w.updated_at).toBe(true);
    await expect(page.locator("#dbody .qall")).toContainText("1 USD = 25.000");
    await expect(page.locator("#dbody .qall")).toContainText("thuế GTGT 10%");

    // Chi phí phát sinh của gói: 5.000.000 đồng + 2% tiền hàng.
    await page.locator("#qCost").click();
    await page.locator('[data-exl="0"]').fill(EXTRAS[0].label);
    await page.locator('[data-exv="0"]').fill("5.000.000");
    await page.locator("#qcAdd").click();
    await page.locator('[data-exl="1"]').fill(EXTRAS[1].label);
    await page.locator('[data-exv="1"]').fill("2");
    await page.locator('[data-exk="1"]').selectOption("pct");
    await page.locator("#qcOk").click();
    await expect.poll(async () => (await writesOf(page, "quote/" + RICH)).length).toBe(3);
    w = (await writesOf(page, "quote/" + RICH))[2];
    expect(w.data.cost.extras).toEqual(EXTRAS);
    expect(w.data.rows[0].items).toHaveLength(1); // dòng giá còn nguyên
    expect(w.data.memo).toBe("giữ trường này");

    // Giá vốn = 625 triệu + 17,5 triệu + thuế 10% × 642,5 triệu = 706,75 triệu.
    await expect(row).toContainText(`Tiền hàng ${fmtVnd(GOODS)} + chi phí phát sinh ${fmtVnd(EXTRA)} + thuế GTGT 10% ${fmtVnd(VAT_AMT)} = giá vốn ${fmtVnd(COST)}`);
    await expect(profit(page).locator(".kpi").first()).toContainText(fmtVnd(COST));
    await expect(profit(page).locator(".ptable")).toHaveCount(1);
  });
});

test.describe("lợi nhuận kỳ vọng từ giá vốn", () => {
  test.use({ patch: { colls: { bidhist: onlyFakeHist(), quote: {
    _cost: { fx: { USD: FX_USD }, vat: VAT },
    [RICH]: { rows: [{ id: "r1", supplierId: "tecgen-fujian", files: [], items: [ITEM] }], cost: { extras: EXTRAS }, updatedAt: "2026-11-02T00:00:00.000Z" } } } } });

  test("bảng: giá bỏ, xác suất thắng, lãi nếu trúng; mức kỳ vọng cao nhất = max w × (P·r − giá vốn) trong các mức có lãi", async ({ page }) => {
    await openPrice(page);
    // Tính tay trên lưới 60%..100% bước 1%: w theo lịch sử BỊA, lãi = P·r − giá vốn.
    const grid = Array.from({ length: 41 }, (_, i) => Math.round((0.6 + i * 0.01) * 100) / 100);
    const rows = grid.map((r) => ({ r, w: winOf(r), m: P_RICH * r - COST })).filter((x) => x.m > 0);
    const best = rows.reduce((a, x) => (x.w * x.m > a.w * a.m ? x : a));
    expect(best.r).toBe(0.89); // ngay dưới mức 0,90 của lịch sử BỊA
    const bestPrice = Math.round((P_RICH * best.r) / 1000) * 1000;
    const kpi = profit(page).locator(".kpi.bplev");
    await expect(kpi).toContainText(fmtVnd(bestPrice));
    await expect(kpi).toContainText(`thắng khoảng ${Math.round(100 * best.w)}%`);
    await expect(kpi).toContainText(`lãi nếu trúng ${fmtVnd(Math.round(best.m))}`);

    await profit(page).locator("details.pfold").evaluate((d) => (d.open = true));
    const tr = profit(page).locator("tr.pbest");
    await expect(tr).toHaveCount(1);
    const cells = (await tr.locator("td").allInnerTexts()).map((s) => s.replace(/\s+/g, " ").trim());
    expect(cells[0]).toContain("89%");
    expect(cells[1]).toBe(bestPrice.toLocaleString("vi-VN"));
    expect(cells[2]).toBe(Math.round(100 * best.w) + "%");
    expect(cells[3]).toContain(fmtVnd(Math.round(best.m)));
    expect(cells[4]).toBe(fmtVnd(Math.round(best.w * best.m)));
    // Mức lỗ (giá bỏ ≤ giá vốn, r ≤ 0,78) đánh dấu ploss và không có lợi nhuận kỳ vọng.
    const loss = profit(page).locator("tr.ploss");
    await expect(loss.first()).toBeVisible();
    for (const t of await loss.locator("td:nth-child(5)").allInnerTexts()) expect(t).toBe("—");
    // Mức 98% trở lên: xác suất thắng 0.
    const r98 = profit(page).locator("tbody tr", { has: page.locator("td:first-child b", { hasText: /^98%$/ }) });
    await expect(r98.locator("td").nth(2)).toHaveText("0%");
  });
});

test.describe("báo giá cũ", () => {
  // 3 dòng giá (bịa): 12 ngày, đúng 180 ngày (chưa cũ), 196 ngày (cũ); thêm một dòng không ghi ngày.
  const items = [{ ...ITEM }, { ...ITEM, id: "i2", desc: "Tủ ATS 400A (BỊA)", qty: 1, unitPrice: 800, date: daysAgo(180) },
    { ...ITEM, id: "i3", desc: "Bồn dầu 6 giờ (BỊA)", qty: 1, unitPrice: 300, date: daysAgo(196) }, { ...ITEM, id: "i4", desc: "Phụ kiện lắp đặt (BỊA)", qty: 1, unitPrice: 500, date: "" }];
  test.use({ patch: { colls: { bidhist: onlyFakeHist(), quote: { _cost: { fx: { USD: FX_USD }, vat: VAT }, [RICH]: { rows: [{ id: "r1", supplierId: "tecgen-fujian", files: [], items }] } } } } });

  test("dòng giá quá 180 ngày hoặc không ghi ngày có nhãn; đúng 180 ngày thì chưa; giá vốn nhắc hỏi lại giá", async ({ page }) => {
    await openPrice(page);
    const line = (desc) => page.locator("#dbody table.qitems tbody tr", { hasText: desc });
    await expect(line(items[0].desc)).not.toContainText("Báo giá cũ");
    await expect(line(items[1].desc)).not.toContainText("Báo giá cũ");
    await expect(line(items[2].desc)).toContainText("Báo giá cũ 196 ngày: nên hỏi lại giá");
    await expect(line(items[3].desc)).toContainText("Chưa ghi ngày báo giá");
    await expect(profit(page)).toContainText("Báo giá đang dùng có 2 dòng giá cũ hơn 180 ngày hoặc chưa ghi ngày");
  });
});

test.describe("Sổ báo giá", () => {
  test.use({ patch: { colls: { quote: {
    [RICH]: { rows: [{ id: "r1", supplierId: "tecgen-fujian", files: [], items: [ITEM, { ...ITEM, id: "i2", desc: "Tổ máy 200 kVA (BỊA)", kva: 200, date: daysAgo(200) }] }] },
    [NEW2]: { rows: [{ id: "r1", supplierId: "hosem-power", files: [], items: [{ ...ITEM, id: "j1", desc: "Tổ máy 250 kVA (BỊA)", kva: 250, unitPrice: 15000, date: daysAgo(30) }] }] } } } } });

  test("mọi dòng giá mọi gói, mới nhất trước; lọc theo nhà cung cấp; mã gói mở gói ở tab Giá gợi ý", async ({ page }) => {
    await openPrice(page);
    await page.locator("#qLedger").click();
    const body = page.locator("#qlBody tbody tr");
    await expect(page.locator("#qlCount")).toHaveText("3 dòng giá");
    expect((await body.locator("td:first-child b").allInnerTexts())).toEqual([ITEM.desc, "Tổ máy 250 kVA (BỊA)", "Tổ máy 200 kVA (BỊA)"]);
    await page.locator("#qlSup").selectOption("hosem-power");
    await expect(page.locator("#qlCount")).toHaveText("1 / 3 dòng giá");
    await expect(body).toHaveCount(1);
    await expect(body).toContainText(supName("hosem-power"));
    await body.locator(`a[data-qtender="${NEW2}"]`).click();
    await expect(page.locator("#ov")).toBeHidden();
    await expect(page.locator("#dtitle")).toHaveText(SEED.colls.feed.current.tenders.find((t) => t.notifyNo === NEW2).bidName);
    await expect(page.locator('#dtabs [data-dt="price"]')).toHaveAttribute("aria-selected", "true");
  });
});
