// Forward của trình duyệt sau khi Back từ link thẳng (phủ test còn thiếu, 19/11/2026; Back từ link thẳng do W2 / #691 sửa và
// do back-link.spec.mjs phủ, nhưng Forward thì chưa test nào đụng tới). Mã: navTap / navSync / navRestore / popstate của index.html
// ("Back"): trang mở thẳng bằng link thì navDirect, mục lịch sử 0 đứng cho trang chủ, mục 1 là màn của link; Back từ màn của link
// về mục 0 thì trang vẽ trang chủ rồi tự history.forward() sang mục 1 (cũng là trang chủ) để Back không rời trang.
// Kiểm: Forward sau Back về lại đúng bước đã bỏ; Forward sau khi Back hết (về trang chủ) không làm gì và không lỗi; đóng
// bằng nút rồi Forward; bước mới sau Back xoá nhánh Forward.
import { test, expect, SEED, RICH, openApp } from "./fixtures.mjs";

const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k) || SEED.colls.bidhist[k];
const INV = ["IB2500258586", "IB2500313344", "IB2600241796"];
const INVESTOR = SEED.colls.bidhist[INV[0]].investorName;

async function atHome(page) {
  await expect(page.locator("#ov")).toBeHidden();
  await expect(page.locator("#drawer")).not.toHaveClass(/\bopen\b/);
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/);
}
// Back chỉ có mục đệm "trang chủ" sau lần chạm đầu tiên (navTap): chưa chạm gì thì Back rời trang như mọi trang web. Các ca
// dưới luôn chạm (bấm nút) trước khi Back; ca chỉ mở link rồi Back ngay không thuộc phạm vi (xem báo cáo).
const touch = (page) => page.locator("#dtitle, #bdList, #supBody, #catList").first().click({ position: { x: 2, y: 2 }, force: true });
// Địa chỉ trang vẫn là của trang (Forward / Back không đưa sang about:blank hay trang khác).
const onPage = (page) => expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\//);

const LINKS = [
  {
    name: "#goi/<TBMT> → chủ đầu tư",
    hash: "#goi/" + RICH,
    at: async (page) => { await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/); await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName); },
    step: (page) => page.locator("#dbody [data-invopen]").first().click(),
    next: (page) => expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName),
  },
  {
    name: "#cdt/<tên> → một gói",
    hash: "#cdt/" + encodeURIComponent(INVESTOR),
    at: (page) => expect(page.locator("#dtitle")).toHaveText(INVESTOR),
    step: (page) => page.locator(`#dbody .lrow[data-openkey="${INV[0]}"]`).click(),
    next: (page) => expect(page.locator("#dtitle")).toHaveText(tender(INV[0]).bidName),
  },
  {
    name: "#nha-thau → một nhà thầu",
    hash: "#nha-thau",
    at: (page) => expect(page.locator("#bdList [data-bdopen]").first()).toBeVisible(),
    step: (page) => page.locator("#bdList [data-bdopen]").first().click(),
    next: (page) => expect(page.locator("#bdBack")).toBeVisible(),
  },
  {
    name: "#nha-cung-cap → một NCC",
    hash: "#nha-cung-cap",
    at: (page) => expect(page.locator("#supBody tr[data-supopen]").first()).toBeVisible(),
    step: (page) => page.locator('#supBody tr[data-supopen="kaichen-jiangsu"] .hlname').click(),
    next: (page) => expect(page.locator("#supBack")).toBeVisible(),
  },
  {
    name: "#dong-co → một động cơ",
    hash: "#dong-co",
    at: (page) => expect(page.locator("#catList tr[data-catitem]").first()).toBeVisible({ timeout: 20000 }),
    step: (page) => page.locator("#catList tr[data-catitem]").first().click(),
    next: (page) => expect(page.locator("#catBack")).toBeVisible(),
  },
];

for (const device of ["máy tính", "điện thoại"]) {
  test.describe(device, () => {
    if (device === "điện thoại") test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    for (const L of LINKS) {
      test(`mở thẳng ${L.name}: Back về màn của link rồi Forward về bước đã bỏ, Back lại về màn của link`, async ({ page }) => {
        await openApp(page, L.hash);
        await L.at(page);
        await L.step(page);
        await L.next(page);
        await page.goBack();
        await L.at(page);
        await page.goForward();
        await L.next(page);
        await page.goBack();
        await L.at(page);
        // Back hết: trang chủ, rồi Back nữa vẫn ở trang.
        await page.goBack();
        await atHome(page);
        await page.goBack();
        await atHome(page);
      });

      test(`mở thẳng ${L.name}: Back hết về trang chủ, Forward mở lại bước đã bỏ (mục lịch sử 2 còn đó), Back về trang chủ, Back nữa vẫn ở trang`, async ({ page }) => {
        await openApp(page, L.hash);
        await L.at(page);
        await L.step(page);
        await L.next(page);
        await page.goBack();
        await page.goBack();
        await atHome(page);
        await page.goForward();
        await L.next(page); // đo ngày 19/11/2026: luôn mở lại bước đã bỏ (cả 5 link, máy tính và điện thoại)
        await onPage(page);
        await page.goBack();
        await atHome(page);
        await page.goBack();
        await atHome(page);
      });
    }

    test("mở thẳng #goi/<TBMT>: Forward ngay khi chưa Back không làm gì", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await page.goForward().catch(() => {});
      await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await onPage(page);
    });

    test("mở thẳng #goi/<TBMT>, Back về trang chủ: Forward không làm gì (đang ở mục cuối), Back vẫn ở trang", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await touch(page);
      await page.goBack();
      await atHome(page);
      await page.goForward().catch(() => {});
      await atHome(page);
      await page.goBack();
      await atHome(page);
    });

    test("mở thẳng #goi/<TBMT>, đóng bằng nút Đóng: Forward / Back không mở lại gói", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await page.locator("#dclose").click();
      await atHome(page);
      await page.goForward().catch(() => {});
      await atHome(page);
      await page.goBack();
      await atHome(page);
      await page.goForward().catch(() => {});
      await atHome(page);
    });

    test("mở thẳng #goi/<TBMT> → chủ đầu tư, Back, rồi bấm bước KHÁC: nhánh Forward cũ bị bỏ, Forward không mở lại chủ đầu tư", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await page.locator("#dbody [data-invopen]").first().click();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.locator('#dtabs [data-dt="analysis"]').click();
      await page.locator('#dtabs [data-dt="info"]').click();
      await page.locator("#dbody [data-invopen]").first().click(); // chủ đầu tư lại: bước mới (cùng màn với nhánh cũ)
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.goForward();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await page.goBack();
      await atHome(page);
    });

    test("trang chủ (không mở bằng link): gói → chủ đầu tư, Back, Forward, Back, Back: đúng từng bước, không rời trang", async ({ page }) => {
      await openApp(page);
      await page.locator(`#grid tr[data-key="${RICH}"] td.c-name`).click();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.locator("#dbody [data-invopen]").first().click();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.goForward();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await page.goBack();
      await atHome(page);
      await page.goForward();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.goForward();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
    });
  });
}
