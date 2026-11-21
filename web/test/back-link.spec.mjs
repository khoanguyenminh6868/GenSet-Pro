// Back khi trang mở thẳng bằng link (việc W2, 13/11/2026): link gửi qua Zalo / tải lại trang ở #goi/<TBMT>, #cdt/<tên>,
// #nha-thau, #nha-cung-cap, #dong-co. Màn mở từ link là một bước của Back: bấm sang màn khác rồi Back về lại màn đó,
// Back nữa về danh sách gói, Back nữa vẫn ở trang (quy tắc Khoa 04/11: Back / quẹt luôn về màn hình trước đó).
// Trước W2, navTap() lần chạm đầu chỉ đẩy bước "trang chủ" nên Back đầu tiên đóng luôn màn mở từ link.
import { test, expect, SEED, RICH, openApp } from "./fixtures.mjs";

const tender = (k) => SEED.colls.feed.current.tenders.find((t) => t.notifyNo === k) || SEED.colls.bidhist[k];
const INV = ["IB2500258586", "IB2500313344", "IB2600241796"];
const INVESTOR = SEED.colls.bidhist[INV[0]].investorName;

// Màn chính: danh sách gói, không khung chi tiết, không màn đè; địa chỉ không còn hash của bước nào.
async function atHome(page) {
  await expect(page.locator("#ov")).toBeHidden();
  await expect(page.locator("#drawer")).not.toHaveClass(/\bopen\b/);
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
  expect(page.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/?$/);
}
// Back ở màn chính: vẫn ở trang, vẫn màn chính.
async function backStaysHome(page) {
  await page.goBack();
  await atHome(page);
}

// Mỗi link: mở, kiểm màn của link (at), bấm sang bước kế (step), kiểm bước kế (next).
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
      test(`mở thẳng ${L.name}: Back về màn của link, Back nữa về danh sách, Back nữa vẫn ở trang`, async ({ page }) => {
        await openApp(page, L.hash);
        await L.at(page);
        await L.step(page);
        await L.next(page);
        await page.goBack();
        await L.at(page);
        await page.goBack();
        await atHome(page);
        await backStaysHome(page);
        // Tải lại trang sau các bước Back: không mở lại màn của link.
        await page.reload();
        await atHome(page);
      });
    }

    test("mở thẳng #goi/<TBMT>, đóng bằng nút Đóng: Back không mở lại gói, không rời trang", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await expect(page.locator("#drawer")).toHaveClass(/\bopen\b/);
      await page.locator("#dclose").click();
      await atHome(page);
      await backStaysHome(page);
    });

    test("mở thẳng #goi/<TBMT>, đổi tab rồi sang chủ đầu tư: Back về gói, Back về danh sách", async ({ page }) => {
      await openApp(page, "#goi/" + RICH);
      await page.locator('#dtabs [data-dt="analysis"]').click();
      await page.locator('#dtabs [data-dt="info"]').click();
      await page.locator("#dbody [data-invopen]").first().click();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).investorName);
      await page.goBack();
      await expect(page.locator("#dtitle")).toHaveText(tender(RICH).bidName);
      await page.goBack();
      await atHome(page);
      await backStaysHome(page);
    });
  });
}
