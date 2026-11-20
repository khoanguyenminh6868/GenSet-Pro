// Tổ máy của bảng không ghi mã động cơ (việc C PR 2, Khoa 20/11/2026 "PA1 trước"): catalog.js gensetsOf / build().gensets
// hiện ở hồ sơ NCC (supGensetsPart), mỗi mức công suất như nguồn ghi, không câu trích / dòng nguồn (SHOW_SRC).
// Hồ sơ thật superwatt-swt (bảng trong GENSET_TABLES) trộn vào dữ liệu mẫu.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test, expect, SEED, openApp } from "./fixtures.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SID = "superwatt-swt";
const S = JSON.parse(fs.readFileSync(path.join(HERE, "..", "..", "suppliers", "cn", SID + ".json"), "utf8"));
const TITLE = "Tổ máy (bảng không ghi mã động cơ)";

test.use({ patch: { colls: { supplier: { [SID]: S } } } });

async function openSup(page, id) {
  await openApp(page);
  await page.locator("#supBtn").click();
  await expect(page.locator("#supBody tr[data-supopen]")).toHaveCount(Object.keys(SEED.colls.supplier).length + 1);
  await page.locator(`#supBody tr[data-supopen="${id}"] .hlname`).click();
  await expect(page.locator("#supModels:not([data-id])")).toBeVisible({ timeout: 30000 });
}

test("hồ sơ NCC: mục tổ máy với prime / standby / tần số / hãng, không chữ nguồn", async ({ page }) => {
  await openSup(page, SID);
  const d = page.locator("#supModels details", { hasText: TITLE });
  await expect(d).toHaveAttribute("open", "");
  await expect(d.locator("summary")).toHaveText(`${TITLE} · 7 model`);
  await expect(d).toContainText("Gợi ý cấu hình chưa dùng");
  const rows = d.locator("tbody tr");
  await expect(rows).toHaveCount(7);
  const row = (m) => rows.filter({ has: page.locator("td:first-child", { hasText: new RegExp(`^${m}$`) }) });
  const sc688 = row("SC688");
  await expect(sc688).toContainText("Liên tục (prime): 625 kVA / 500 kW");
  await expect(sc688).toContainText("Dự phòng (standby): 688 kVA / 550 kW");
  await expect(sc688).toContainText("50 Hz");
  await expect(sc688).toContainText("Cummins");
  await expect(row("SC688X")).toContainText("60 Hz");
  // SHOW_SRC = false: không link / câu trích nguồn trong mục.
  await expect(d.locator("a, q")).toHaveCount(0);
});

test("NCC không có bảng trong danh sách tổ máy: không có mục", async ({ page }) => {
  await openSup(page, "hosem-power");
  await expect(page.locator("#supModels details", { hasText: TITLE })).toHaveCount(0);
});
