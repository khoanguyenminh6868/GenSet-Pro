// Link gốc của hãng trên thẻ cấu hình (Khoa 21/11/2026): ngoại lệ của SHOW_SRC, chỉ cho bộ phận fromMaker và mô-đun NCC chưa chào.
import { test, expect, SEED, RICH, openApp, openTab } from "./fixtures.mjs";

const cm = SEED.colls.configmatch[RICH], c0 = cm.result.configs[0];
const ALT = "https://example.test/lsa.pdf", CTL = "https://example.test/dse7320.pdf", MOD = "https://example.test/dse890.pdf";
const alternator = { ...c0.alternator, model: "LSA 49.3 M8", make: "Leroy-Somer", fromMaker: true, src: { kind: "maker", supplierId: "leroy-somer-fuzhou", n: 1012, url: ALT } };
const controller = { ...c0.controller, model: "DSE7320 MKII", make: "Deep Sea", fromMaker: true, src: { kind: "maker", supplierId: "deep-sea-electronics", n: 1001 },
  modules: [
    { model: "DSE890 MKII", make: "Deep Sea", order: "0890-04", compat: { supplierId: "deep-sea-electronics", n: 1002 }, offeredBy: null },
    { model: "DSE855", make: "Deep Sea", compat: { supplierId: "deep-sea-electronics", n: 9999 }, offeredBy: null },
    { model: "DSE892", make: "Deep Sea", compat: { supplierId: "deep-sea-electronics", n: 1002 }, offeredBy: "deep-sea-electronics" },
  ] };
const doc = { ...cm, result: { ...cm.result, configs: [{ ...c0, alternator, controller }, ...cm.result.configs.slice(1)] } };
const supplier = { "deep-sea-electronics": { id: "deep-sea-electronics", names: { en: "Deep Sea Electronics" }, status: "partial", role: "controller_maker", sources: [{ n: 1001, url: CTL }, { n: 1002, url: MOD }] } };

test.describe("bộ phận theo tài liệu hãng", () => {
  test.use({ patch: { colls: { configmatch: { [RICH]: doc }, supplier } } });

  test("hiện link gốc, mở tab mới; không có URL hoặc NCC đã chào thì không vẽ", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    const card = page.locator("#dbody .cfgcard").first();
    for (const url of [ALT, CTL, MOD]) {
      const a = card.locator(`a[href="${url}"]`);
      await expect(a).toHaveCount(1, { timeout: 30000 });
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", "noopener");
    }
    const mods = card.locator(".cfgmod");
    await expect(mods.nth(1).getByText("Tài liệu gốc")).toHaveCount(0);
    await expect(mods.nth(2).getByText("Tài liệu gốc")).toHaveCount(0);
    await expect(card.getByText("Tài liệu gốc")).toHaveCount(3);
  });
});

test("kết quả không theo tài liệu hãng: không có link gốc", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "config");
  await expect(page.locator("#dbody .cfgcard").first()).toBeVisible();
  await expect(page.locator("#dbody").getByText("Tài liệu gốc")).toHaveCount(0);
});
