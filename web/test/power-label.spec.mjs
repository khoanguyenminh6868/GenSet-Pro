// Nhãn "Công suất chưa xác nhận" trên thẻ cấu hình (Khoa 17/11/2026): thẻ #2 của gói mẫu có mục công suất "Chưa rõ" (nguồn chỉ ghi
// một số), thẻ #1 đạt (Prime / Standby rõ). Chỉ hiển thị: thứ tự thẻ không đổi. Thử ở desktop và 375 px.
import { test, expect, SEED, RICH, openApp, openTab } from "./fixtures.mjs";

const doc = JSON.parse(JSON.stringify(SEED.colls.configmatch[RICH]));
const c2 = doc.result.configs.find((c) => c.rank === 2);
const p = c2.checks.find((x) => x.item === "Công suất liên tục");
Object.assign(p, { status: "unclear", offered: "200 kVA", note: "Nguồn chỉ ghi một số, không rõ Prime / Standby" });
test.use({ patch: { colls: { configmatch: { [RICH]: doc } } } });

async function open(page) {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "config");
  await expect(page.locator("#dbody .cfgcard").first()).toBeVisible();
}
const label = (page) => page.locator("#dbody .cfgpowwarn");

for (const [name, size] of [["desktop", { width: 1366, height: 900 }], ["375 px", { width: 375, height: 812 }]]) {
  test(`thẻ có mục công suất chưa rõ hiện nhãn, thẻ đạt không có — ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await open(page);
    await expect(label(page)).toHaveCount(1);
    await expect(label(page)).toHaveText("Công suất chưa xác nhận");
    await expect(label(page)).toBeVisible();
    const cards = page.locator("#dbody .cfgcard");
    expect(await cards.count()).toBe(SEED.colls.configmatch[RICH].result.configs.length);
    await expect(cards.filter({ has: page.locator(".cfgpowwarn") })).toHaveCount(1);
    await expect(cards.first().locator(".cfgpowwarn")).toHaveCount(0);
    // Thứ hạng giữ nguyên: #1 vẫn đầu, nhãn thuộc thẻ #2.
    await expect(cards.nth(0).locator("summary b").first()).toHaveText("#1");
    await expect(cards.nth(1).locator(".cfgpowwarn")).toHaveCount(1);
    // Không tràn ngang.
    const [sw, vw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(sw).toBeLessThanOrEqual(vw);
    const r = await label(page).boundingBox();
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.x + r.width).toBeLessThanOrEqual(size.width + 0.5);
    if (process.env.PW_SHOTS) {
      await cards.nth(0).screenshot({ path: `${process.env.PW_SHOTS}/the1-khong-nhan-${size.width}.png` });
      await cards.nth(1).screenshot({ path: `${process.env.PW_SHOTS}/the2-co-nhan-${size.width}.png` });
    }
  });
}
