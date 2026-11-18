// Tiêu đề thẻ cấu hình ghi kèm hãng như các dòng Động cơ / Đầu phát / Bộ điều khiển bên dưới (Khoa 18/11/2026):
// "V2203-K3A (Kubota) + InteliLite 4 MRS16 (ComAp)". Phần không có hãng chỉ ghi model.
import { test, expect, SEED, RICH, openApp, openTab } from "./fixtures.mjs";

test("tiêu đề cấu hình có tên hãng của từng phần", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "config");
  const cards = page.locator("#dbody .cfgcard");
  await expect(cards.first()).toBeVisible();
  const configs = SEED.colls.configmatch[RICH].result.configs;
  for (let i = 0; i < configs.length; i++) {
    const c = configs[i];
    const want = [c.engine, c.alternator, c.controller].filter((p) => p?.model).map((p) => (p.make ? `${p.model} (${p.make})` : p.model)).join(" + ");
    await expect(cards.nth(i).locator("summary .cfgparts")).toHaveText(want);
  }
  expect(configs.some((c) => c.engine?.make)).toBe(true);
  if (process.env.PW_SHOTS) await cards.nth(0).locator("summary").first().screenshot({ path: `${process.env.PW_SHOTS}/cfg-header-make.png` });
});
