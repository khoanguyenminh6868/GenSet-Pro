// Cột Công Suất với dung sai "±" (Khoa 17/11/2026, gói IB2600612866: yêu cầu "≥ 8.5 ±0.5KVA; tối đa ≥ 9.35 kVA" hiện thành
// "0,5 kVA, 9,35 kVA"). Số sau "±" là dung sai, không phải công suất; phân tích đứng trước kết quả trang tự đọc tệp HSMT; kết quả
// đọc tệp cũ đã lưu trong trình duyệt (genbid:capScan) được đọc lại, "không thấy" thì giữ.
import { test, expect, SEED, RICH, openApp } from "./fixtures.mjs";

const doc = JSON.parse(JSON.stringify(SEED.colls.analysis[RICH]));
doc.result.keyInfo.generatorCapacity = "Công suất liên tục ≥ 8.5 ±0.5KVA; công suất tối đa ≥ 9.35 kVA (1 pha, 220V/50Hz)";
test.use({ patch: { colls: { analysis: { [RICH]: doc } } } });

test("dung sai ± không thành công suất; phân tích thắng kết quả tự đọc tệp; bộ nhớ đọc tệp cũ được đọc lại", async ({ page }) => {
  // Trình duyệt còn kết quả sai của bản cũ cho gói này và một gói "không thấy".
  await page.addInitScript((k) => {
    if (sessionStorage.getItem("seeded")) return;
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("genbid:capScan", JSON.stringify({ [k]: ["v1", { text: "0,5 kVA, 9,35 kVA", n: 0.5 }], IB0000000001: ["v1", null] }));
  }, RICH);
  await openApp(page);
  const row = page.locator(`#grid tbody tr[data-key="${RICH}"]`);
  await expect(row).toContainText("8.5");
  await expect(row).not.toContainText("0,5 kVA");
  // Sắp theo cột Công Suất dùng 8,5 (không phải 0,5): hàm đọc số được kiểm ở cap-read.test.mjs.
  // Khoá cũ bị bỏ; khoá mới giữ "không thấy", bỏ số cũ.
  const store = await page.evaluate(() => [localStorage.getItem("genbid:capScan"), JSON.parse(localStorage.getItem("genbid:capScan2"))]);
  expect(store[0]).toBeNull();
  expect(store[1].IB0000000001).toEqual(["v1", null]);
  expect(store[1][RICH]).toBeUndefined();
});
