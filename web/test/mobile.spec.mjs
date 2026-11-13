// Điện thoại (việc H2, 13/11/2026): màn 390×844 có cảm ứng. Danh sách gói dạng thẻ, ghi chú nội bộ, mở gói bằng chạm,
// Back (quẹt về trên điện thoại là Back của trình duyệt) về đúng màn trước qua 4 bước và không rời trang, bảng rộng cuộn
// ngang trong khung của nó, trang không tràn ngang.
import { test, expect, SEED, RICH, openApp, openTab, writesOf } from "./fixtures.mjs";

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k) || SEED.colls.bidhist[k];
// Trang không tràn ngang: bề rộng cuộn của tài liệu không quá bề rộng màn hình.
async function noPageOverflow(page, where) {
  const [sw, vw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(sw, `tràn ngang trang: ${where}`).toBeLessThanOrEqual(vw);
}
// Phần tử nào (không nằm trong khung cuộn ngang) thò ra ngoài màn hình.
const sticking = (page) => page.evaluate(() => [...document.querySelectorAll("#grid *, #drawer.open #dbody *, #mdl *")].filter((e) => {
  if (!e.getClientRects().length || e.closest(".tablewrap,.gridwrap,.mscroll,pre,code")) return false;
  const r = e.getBoundingClientRect();
  return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1);
}).slice(0, 5).map((e) => `${e.tagName}.${e.className}: ${e.textContent.slice(0, 40)}`));

test("danh sách gói dạng thẻ (không có hàng tiêu đề bảng), ghi chú nội bộ hiện trên thẻ, không tràn ngang", async ({ page }) => {
  await openApp(page);
  await page.locator('#stageTabs [data-stage="submitted"]').tap();
  const card = page.locator('#grid tr[data-key="IB2699000104"]');
  await expect(card).toBeVisible();
  expect(await card.evaluate((tr) => getComputedStyle(tr).display)).toBe("grid");
  // Mỗi thẻ nằm gọn trong màn hình.
  const box = await card.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390 + 0.5);
  // Ghi chú nội bộ của gói (tracked.note) hiện trên thẻ, có nhãn.
  const note = card.locator(".mnote");
  await expect(note).toBeVisible();
  await expect(note).toHaveText(SEED.colls.tracked.IB2699000104.note);
  await expect(note).toHaveAttribute("data-l", "Ghi chú");
  await noPageOverflow(page, "danh sách");
  expect(await sticking(page)).toEqual([]);
});

test("chạm mở gói (toàn màn), sửa ghi chú nội bộ trên điện thoại ghi tracked/<TBMT> và hiện ngay trên thẻ", async ({ page }) => {
  const PREP = "IB2699000103";
  await openApp(page);
  await page.locator('#stageTabs [data-stage="preparing"]').tap();
  await page.locator(`#grid tr[data-key="${PREP}"] td.c-name`).tap();
  await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
  const d = await page.locator("#drawer").boundingBox();
  expect(Math.round(d.width)).toBeGreaterThanOrEqual(388); // khung chi tiết phủ cả bề ngang
  await page.locator("#dNote").fill("Hẹn NCC gửi catalogue");
  await page.locator("#dNote").blur();
  await expect.poll(async () => (await writesOf(page, "tracked/" + PREP)).length).toBe(1);
  expect((await writesOf(page, "tracked/" + PREP))[0].data).toMatchObject({ note: "Hẹn NCC gửi catalogue", stage: "preparing" });
  await page.goBack();
  await expect(page.locator("#drawer")).not.toHaveClass(/\bopen\b/);
  await expect(page.locator(`#grid tr[data-key="${PREP}"] .mnote`)).toHaveText("Hẹn NCC gửi catalogue");
});

test("Back qua 4 bước: Nhà thầu → một nhà thầu → gói của nhà thầu → chủ đầu tư; mỗi Back về đúng màn trước, không rời trang", async ({ page }) => {
  await openApp(page);
  const title = page.locator("#dtitle"), drawer = page.locator("#drawer"), ov = page.locator("#ov");
  // 1. Màn Nhà thầu (nút ở đầu trang).
  await page.locator("#bdBtn").tap();
  await expect(page.locator("#bdList [data-bdopen]").first()).toBeVisible();
  await noPageOverflow(page, "Nhà thầu");
  // 2. Một nhà thầu.
  const bd = page.locator("#bdList [data-bdopen]").first();
  const bdName = (await bd.innerText()).split("\n")[0].trim();
  await bd.tap();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  await expect(page.locator("#bdList")).toHaveCount(0);
  await noPageOverflow(page, "một nhà thầu");
  // 3. Một gói nhà thầu đó đã dự.
  const link = page.locator("#bdBody [data-bdtender]").first();
  const key = await link.getAttribute("data-bdtender");
  await link.tap();
  await expect(ov).toBeHidden();
  await expect(title).toHaveText(tender(key).bidName);
  await noPageOverflow(page, "gói");
  // 4. Trang chủ đầu tư của gói đó.
  await page.locator("#dbody [data-invopen]").tap();
  await expect(title).toHaveText(tender(key).investorName);
  await noPageOverflow(page, "chủ đầu tư");

  await page.goBack();
  await expect(title).toHaveText(tender(key).bidName);
  await expect(drawer).toHaveClass(/\bopen\b/);
  await page.goBack();
  await expect(ov).toBeVisible();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  await expect(page.locator("#bdList")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#bdList [data-bdopen]").first()).toBeVisible();
  await page.goBack();
  await expect(ov).toBeHidden();
  await expect(drawer).not.toHaveClass(/\bopen\b/);
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
  // Back thêm lần nữa ở màn đầu: vẫn ở trang (không về trang trước đó, không trang trắng).
  await page.goBack();
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
});

// Mở gói → bấm tên một nhà thầu trong bảng nhà thầu của gói (màn Nhà thầu mở đè lên khung chi tiết) → bấm một gói của nhà
// thầu đó (thường chính là gói đang mở) → Back về màn nhà thầu, rồi gói đầu (lỗi H2, sửa ở W2: navKey tính cả drawerBack).
test("Back: gói → nhà thầu (từ bảng nhà thầu của gói) → gói của nhà thầu → chủ đầu tư, Back về đúng từng màn", async ({ page }) => {
  await openApp(page);
  const title = page.locator("#dtitle"), drawer = page.locator("#drawer");
  // 1. Gói RICH từ tab Mới.
  await page.locator(`#grid tr[data-key="${RICH}"] td.c-name`).tap();
  await expect(title).toHaveText(tender(RICH).bidName);
  await noPageOverflow(page, "gói");
  // 2. Một nhà thầu trong bảng nhà thầu của gói.
  const bd = page.locator("#dbody table.bdtbl [data-bdopen]").first();
  const bdName = (await bd.innerText()).trim();
  await bd.tap();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  await noPageOverflow(page, "nhà thầu");
  // 3. Một gói nhà thầu đó đã dự.
  const link = page.locator("#bdBody [data-bdtender]").first();
  const key = await link.getAttribute("data-bdtender");
  await link.tap();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(title).toHaveText(tender(key).bidName);
  // 4. Trang chủ đầu tư của gói đó.
  const inv = tender(key).investorName;
  await page.locator("#dbody [data-invopen]").tap();
  await expect(title).toHaveText(inv);
  await noPageOverflow(page, "chủ đầu tư");

  await page.goBack();
  await expect(title).toHaveText(tender(key).bidName);
  await page.goBack();
  await expect(page.locator("#ov")).toBeVisible();
  await expect(page.locator("#bdBody")).toContainText(bdName);
  await page.goBack();
  await expect(page.locator("#ov")).toBeHidden();
  await expect(drawer).toHaveClass(/\bopen\b/);
  await expect(title).toHaveText(tender(RICH).bidName);
  await page.goBack();
  await expect(drawer).not.toHaveClass(/\bopen\b/);
  await expect(page.locator(`#grid tr[data-key="${RICH}"]`)).toBeVisible();
  // Back thêm lần nữa ở màn đầu: vẫn ở trang (không về trang trước đó, không trang trắng).
  await page.goBack();
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);
  await expect(page.locator(`#grid tr[data-key="${RICH}"]`)).toBeVisible();
});

test("các tab của gói (Tổng quan, Phân tích, Cấu hình gợi ý, Giá gợi ý) không tràn ngang; khung bảng không rộng hơn màn hình", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  for (const tab of ["info", "analysis", "config", "price"]) {
    await openTab(page, tab);
    await page.locator("#dbody details").evaluateAll((ds) => ds.forEach((d) => (d.open = true)));
    await noPageOverflow(page, "tab " + tab);
    expect(await sticking(page), "tab " + tab).toEqual([]);
    const wraps = await page.locator("#dbody .tablewrap").evaluateAll((ws) => ws.filter((w) => w.getClientRects().length).map((w) => ({
      wide: w.scrollWidth > w.clientWidth + 1, ox: getComputedStyle(w).overflowX, right: w.getBoundingClientRect().right })));
    for (const w of wraps) {
      expect(w.right, "tab " + tab).toBeLessThanOrEqual(390 + 0.5);
      if (w.wide) expect(["auto", "scroll"], "tab " + tab).toContain(w.ox);
    }
  }
});

// Tab Cấu hình gợi ý ở bề rộng 390 px: nhãn `.chip` dài ("dòng bảng không ghi đầu phát NIANFENG NF…") xuống dòng trong nhãn,
// không thò ra mép phải (lỗi H2, chỉ lộ trên CI ubuntu + chromium vì phông rộng hơn; sửa ở W2). Lượt hai giãn chữ để phông
// hẹp của Edge trên Windows cũng bắt được.
test("Cấu hình gợi ý trên điện thoại: không phần tử nào thò ra ngoài màn hình", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "config");
  await page.locator("#dbody details").evaluateAll((ds) => ds.forEach((d) => (d.open = true)));
  expect(await sticking(page)).toEqual([]);
  await page.addStyleTag({ content: "body,body *{letter-spacing:1.5px !important}" });
  expect(await sticking(page), "chữ giãn").toEqual([]);
});

test.describe("bảng rộng hơn màn hình", () => {
  // HSDT tham khảo (bịa) có bảng 8 cột: rộng hơn 390 px.
  const headers = ["Hạng mục", "Yêu cầu HSMT", "Đề xuất", "Hãng sản xuất", "Xuất xứ", "Số lượng", "Đơn vị", "Ghi chú"];
  const result = { summary: "Bảng rộng (BỊA)", sections: [{ title: "Bảng đáp ứng (BỊA)", paragraphs: [], table: { headers, rows: [headers.map((x) => x + " BỊA")] } }], checklist: [] };
  test.use({ patch: { colls: { hsmt: { [RICH]: { files: [{ name: "E-HSMT (BỊA).pdf", size: 1 }] } }, hsdt: { [RICH]: { at: "2026-11-10T02:00:00.000Z", result } } } } });

  test("cuộn ngang trong khung của nó, trang không tràn ngang và không cuộn theo", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "hsdt");
    const wrap = page.locator("#hsDoc .tablewrap");
    await expect(wrap).toBeVisible();
    const m = await wrap.evaluate((w) => ({ sw: w.scrollWidth, cw: w.clientWidth, ox: getComputedStyle(w).overflowX, right: w.getBoundingClientRect().right }));
    expect(m.sw).toBeGreaterThan(m.cw + 1);
    expect(["auto", "scroll"]).toContain(m.ox);
    expect(m.right).toBeLessThanOrEqual(390 + 0.5);
    await noPageOverflow(page, "HSDT tham khảo");
    // Vuốt ngang trên bảng: khung cuộn, trang đứng yên.
    await wrap.evaluate((w) => { w.scrollLeft = w.scrollWidth; });
    expect(await wrap.evaluate((w) => w.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  });
});

test("màn Nhà cung cấp (danh sách, chi tiết) trên điện thoại: không tràn ngang", async ({ page }) => {
  await openApp(page);
  await page.locator("#supBtn").tap();
  await expect(page.locator("#supBody tr[data-supopen]").first()).toBeVisible();
  await noPageOverflow(page, "Nhà cung cấp");
  expect(await sticking(page)).toEqual([]);
  await page.locator('#supBody tr[data-supopen="tecgen-fujian"] .hlname').tap();
  await expect(page.locator("#supBack")).toBeVisible();
  await noPageOverflow(page, "chi tiết NCC");
  expect(await sticking(page)).toEqual([]);
});
