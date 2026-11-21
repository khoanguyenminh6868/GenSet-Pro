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
});
