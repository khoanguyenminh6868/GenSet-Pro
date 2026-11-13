// Phần dùng chung của test khói: trang không gọi mạng ngoài (thư viện CDN, font trả rỗng), mỗi ca tự kiểm không có lỗi
// console / pageerror, và đọc lại dữ liệu mẫu để tính số mong đợi.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, expect } from "@playwright/test";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SEED = JSON.parse(fs.readFileSync(path.join(HERE, "fixtures", "seed.json"), "utf8"));
export const SRC_MARK = "SRCQ_"; // tiền tố make-seed.mjs gắn vào mọi câu trích nguồn
export const RICH = "IB2600586587"; // gói có Phân tích + Cấu hình gợi ý + Giá gợi ý + nhà thầu
export { expect };

export const test = base.extend({
  // Lỗi console / pageerror của ca; ca nào cố ý gây lỗi thì xoá phần tử khỏi mảng này.
  errors: async ({}, use) => { await use([]); },
  page: async ({ page, errors }, use) => {
    // Không mạng ngoài: trả rỗng cho CDN (thư viện tải theo nhu cầu) và Google Fonts.
    await page.route((url) => !/^http:\/\/127\.0\.0\.1:/.test(url.href), (route) => {
      const u = route.request().url();
      route.fulfill({ status: 200, contentType: /\.css|fonts\.googleapis/.test(u) ? "text/css" : /\.js(\?|$)/.test(u) ? "text/javascript" : "application/octet-stream", body: "" });
    });
    page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await use(page);
    expect(errors, "lỗi console / pageerror trong ca").toEqual([]);
  },
});

// Mở trang (có thể kèm hash) và chờ danh sách gói vẽ xong.
export async function openApp(page, hash = "") {
  await page.goto("/" + hash);
  await expect(page.locator("#grid tbody tr[data-key]").first()).toBeVisible();
}
// Các lần ghi DB giả có đường dẫn bắt đầu bằng prefix.
export const writesOf = (page, prefix) => page.evaluate((p) => window.__gb.writes.filter((w) => w.path.startsWith(p)), prefix);
export const gridKeys = (page) => page.locator("#grid tbody tr[data-key]").evaluateAll((rs) => rs.map((r) => r.dataset.key));
// Ngày đăng như danh sách gói dùng (pubOf): publicDate, dự án thì addedAt.
export function pubOfKey(key) {
  const c = SEED.colls, f = c.feed.current.tenders.find((t) => t.notifyNo === key);
  return f?.publicDate || c.bidhist[key]?.publicDate || c.manual[key]?.addedAt || "";
}
// Thứ tự mặc định: ngày đăng giảm dần, cùng ngày thì Mã số giảm dần.
export const byPubDesc = (keys) => keys.slice().sort((a, b) => pubOfKey(b).localeCompare(pubOfKey(a)) || b.localeCompare(a));
