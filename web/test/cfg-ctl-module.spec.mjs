// Bộ điều khiển + mô-đun truyền thông trên thẻ cấu hình (bdk-mo-dun-4, Khoa 20/11/2026): nhãn "NCC chưa chào" của bộ điều
// khiển chọn theo tài liệu hãng (controller.fromMaker), mô-đun + mã đặt hàng (controller.modules), "Phương án khác đạt tương
// đương" (controller.alternatives). Kết quả cũ không có các trường này: thẻ như trước (không dòng mô-đun / phương án khác).
import { test, expect, SEED, RICH, openApp, openTab } from "./fixtures.mjs";

const cm = SEED.colls.configmatch[RICH];

test("kết quả cũ: không dòng mô-đun, phương án khác, nhãn NCC chưa chào", async ({ page }) => {
  await openApp(page, "#goi/" + RICH);
  await openTab(page, "config");
  await expect(page.locator("#dbody .cfgcard").first()).toBeVisible();
  await expect(page.locator("#dbody .cfgmod, #dbody .cfgalt")).toHaveCount(0);
  await expect(page.locator("#dbody .cfgcard", { hasText: "NCC chưa chào" })).toHaveCount(0);
});

test.describe("có mô-đun và phương án khác", () => {
  const c0 = cm.result.configs[0];
  const controller = { ...c0.controller, model: "DSE7420 MKII", make: "Deep Sea", src: { kind: "maker", supplierId: "deep-sea-electronics", n: 3001 }, fromMaker: true,
    label: "Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào",
    modules: [{ model: "DSE890 MKII", make: "Deep Sea", order: "0890-04", compat: [], offeredBy: null, label: "Mô-đun chọn theo tài liệu hãng, NCC chưa chào", why: ["Ethernet", "4G"] }],
    alternatives: [
      { model: "DSE7320 MKII", make: "Deep Sea", notOffered: true, label: "Bộ điều khiển chọn theo tài liệu hãng, NCC chưa chào", kind: "amf", met: 6, total: 7, unclear: ["Cổng kết nối từ xa"], modules: [{ model: "DSE890 MKII", make: "Deep Sea", order: "0890-04" }] },
      { model: "DSE7310 MKII", make: "Deep Sea", offeredAs: "DSE7310", offeredBy: "ncc-thu", kind: "start", met: 5, total: 7, unclear: [], modules: [] },
    ] };
  const doc = { ...cm, result: { ...cm.result, configs: [{ ...c0, controller }, ...cm.result.configs.slice(1)] } };
  test.use({ patch: { colls: { configmatch: { [RICH]: doc } } } });

  test("thẻ #1 hiện nhãn, mô-đun + mã đặt hàng, phương án khác", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    const card = page.locator("#dbody .cfgcard").first();
    await expect(card.locator(".cfgblk", { hasText: "Bộ điều khiển:" }).first()).toContainText("NCC chưa chào");
    await expect(card.locator(".cfgblk", { hasText: "Bộ điều khiển:" }).first()).toContainText("Tài liệu hãng");
    const mod = card.locator(".cfgmod");
    await expect(mod).toHaveCount(1);
    await expect(mod).toContainText("DSE890 MKII");
    await expect(mod).toContainText("mã đặt hàng 0890-04");
    await expect(mod).toContainText("Mô-đun chọn theo tài liệu hãng, NCC chưa chào");
    await expect(mod).toContainText("Ethernet nằm trên mô-đun DSE890 MKII");
    const li = card.locator(".cfgalt li");
    await expect(li).toHaveCount(2);
    await expect(li.nth(0)).toContainText("DSE7320 MKII + DSE890 MKII (0890-04)");
    await expect(li.nth(0)).toContainText("đạt 6/7, chưa rõ: Cổng kết nối từ xa");
    await expect(li.nth(0)).toContainText("AMF");
    await expect(li.nth(0)).toContainText("NCC chưa chào");
    await expect(li.nth(1)).toContainText("NCC ncc-thu chào");
    await expect(li.nth(1)).toContainText("chỉ tự khởi động");
    // Các thẻ khác của cùng kết quả không có trường mới: không có dòng.
    await expect(page.locator("#dbody .cfgcard").nth(1).locator(".cfgmod, .cfgalt")).toHaveCount(0);
  });

  test("danh mục thiếu model rồi bản nhà cung cấp mới về: bỏ chữ chưa có, hiện link", async ({ page }) => {
    test.setTimeout(150000); // Danh mục dựng lúc trang rảnh, chậm khi chạy song song.
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    const blk = page.locator("#dbody .cfgcard").first().locator(".cfgblk", { hasText: "Bộ điều khiển:" }).first();
    await expect(blk).toContainText("chưa có trong danh mục", { timeout: 60000 });
    await page.evaluate(async () => {
      const db = await window.claude.use("db");
      await db.doc("supplier/deep-sea-electronics").set({ id: "deep-sea-electronics", names: { en: "Deep Sea Electronics" }, status: "partial", role: "controller_maker", sources: [{ n: 3001, url: "https://example.test/ds.pdf" }],
        controllers: [{ brand: "Deep Sea", model: "DSE7420 MKII", text: "DSE7420 MKII", line: "| DSE7420 MKII", src: [3001] }] });
    });
    await expect(blk).not.toContainText("chưa có trong danh mục", { timeout: 60000 });
    await expect(blk.locator('a[data-catopen="controller"]')).toHaveText("DSE7420 MKII");
    // Mô-đun không có compat thì không có link gốc.
    await expect(page.locator("#dbody .cfgcard").first().locator('.cfgmod a[href*="example.test"]')).toHaveCount(0);
  });
});

test.describe("đầu phát và mô-đun theo tài liệu hãng", () => {
  const c0 = cm.result.configs[0];
  const alternator = { ...c0.alternator, model: "LSA 49.3 M8", make: "Leroy-Somer", fromMaker: true, src: { kind: "maker", supplierId: "leroy-somer-fuzhou", n: 1012, url: "https://example.test/lsa.pdf" } };
  const controller = { ...c0.controller, modules: [{ model: "DSE890 MKII", make: "Deep Sea", order: "0890-04", compat: { supplierId: "deep-sea-electronics", n: 1001 }, offeredBy: null }] };
  const doc = { ...cm, result: { ...cm.result, configs: [{ ...c0, alternator, controller }, ...cm.result.configs.slice(1)] } };
  const supplier = { "deep-sea-electronics": { id: "deep-sea-electronics", names: { en: "Deep Sea Electronics" }, status: "partial", role: "controller_maker", sources: [] } };
  test.use({ patch: { colls: { configmatch: { [RICH]: doc }, supplier } } });

  test("có link tới thông số / hồ sơ hãng và link gốc của đầu phát", async ({ page }) => {
    await openApp(page, "#goi/" + RICH);
    await openTab(page, "config");
    const card = page.locator("#dbody .cfgcard").first();
    const alt = card.locator('a[data-catopen="alternator"]');
    await expect(alt).toHaveText("LSA 49.3 M8");
    await expect(alt).toHaveAttribute("data-catkey", "LSA493M8");
    await expect(card.locator('.cfgmod [data-supopen="deep-sea-electronics"]')).toHaveText("DSE890 MKII");
    await expect(card.locator('a[href="https://example.test/lsa.pdf"]')).toHaveCount(1);
  });
});
