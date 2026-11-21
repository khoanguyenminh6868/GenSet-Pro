// Phần dùng chung của test khói: trang không gọi mạng ngoài (thư viện CDN lấy bản cục bộ trong node_modules, font Google
// trả rỗng), mỗi ca tự kiểm không có lỗi console / pageerror, và đọc lại dữ liệu mẫu để tính số mong đợi.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, expect } from "@playwright/test";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SEED = JSON.parse(fs.readFileSync(path.join(HERE, "fixtures", "seed.json"), "utf8"));
export const SRC_MARK = "SRCQ_"; // tiền tố make-seed.mjs gắn vào mọi câu trích nguồn
export const RICH = "IB2600586587"; // gói có Phân tích + Cấu hình gợi ý + Giá gợi ý + nhà thầu
export { expect };

// Thư viện tải theo nhu cầu (LIBS của index.html, có SRI): cùng phiên bản, lấy từ node_modules của web/test (devDependencies),
// nên SRI của trang vẫn được trình duyệt kiểm. Phông DejaVu của PDF (/_blob/<id> trên Vercel, ITALIC_URL) cũng vậy.
const NM = path.join(HERE, "node_modules");
const LOCAL = [
  [/cdn\.jsdelivr\.net\/npm\/jspdf@2\.5\.1\/dist\/jspdf\.umd\.min\.js$/, "jspdf/dist/jspdf.umd.min.js"],
  [/cdn\.jsdelivr\.net\/npm\/docx@8\.5\.0\/build\/index\.umd\.js$/, "docx/build/index.umd.js"],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/xlsx\/0\.18\.5\/xlsx\.full\.min\.js$/, "xlsx/dist/xlsx.full.min.js"],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\/3\.11\.174\/pdf\.min\.js$/, "pdfjs-dist/build/pdf.min.js"],
  [/cdnjs\.cloudflare\.com\/ajax\/libs\/pdf\.js\/3\.11\.174\/pdf\.worker\.min\.js$/, "pdfjs-dist/build/pdf.worker.min.js"],
  [/cdn\.jsdelivr\.net\/npm\/mammoth@1\.8\.0\/mammoth\.browser\.min\.js$/, "mammoth/mammoth.browser.min.js"],
  [/cdn\.jsdelivr\.net\/npm\/dejavu-fonts-ttf@2\.37\.3\/ttf\/(DejaVuSans-(Bold)?Oblique\.ttf)$/, (m) => "dejavu-fonts-ttf/ttf/" + m[1]],
  [/\/_blob\/d78c7a10de9ee116b25dd1b64dd27321$/, "dejavu-fonts-ttf/ttf/DejaVuSans.ttf"],
  [/\/_blob\/06cb96b1e0a2d2b209cb05452505e90f$/, "dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf"],
];
function localFile(u) {
  for (const [re, f] of LOCAL) { const m = u.match(re); if (m) return path.join(NM, typeof f === "function" ? f(m) : f); }
  return null;
}
const typeOf = (f) => (/\.js$/.test(f) ? "text/javascript" : /\.ttf$/.test(f) ? "font/ttf" : "application/octet-stream");

export const test = base.extend({
  // Lỗi console / pageerror của ca; ca nào cố ý gây lỗi thì xoá phần tử khỏi mảng này.
  errors: async ({}, use) => { await use([]); },
  // Dữ liệu riêng của ca (xem fake-shim.js __gbPatch); đặt bằng test.use({ patch }) hoặc withPatch trước openApp.
  patch: [null, { option: true }],
  libs: async ({}, use) => { await use([]); }, // tệp cục bộ đã phục vụ thay CDN (ca kiểm thư viện thật sự được tải)
  page: async ({ page, errors, patch, libs }, use) => {
    if (patch) await page.addInitScript((p) => { window.__gbPatch = p; }, patch);
    await page.route((url) => !/^http:\/\/127\.0\.0\.1:\d+\/(?!_blob\/)/.test(url.href), (route) => {
      const u = route.request().url(), f = localFile(u);
      if (f) {
        libs.push(path.basename(f));
        // Thẻ script có crossorigin + integrity: cần CORS để trình duyệt kiểm SRI.
        return route.fulfill({ status: 200, contentType: typeOf(f), headers: { "access-control-allow-origin": "*" }, body: fs.readFileSync(f) });
      }
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
// Các yêu cầu gửi bot (genbidApi("/api/webreq", { coll, items })) của một collection.
export const reqsOf = (page, coll) => page.evaluate((c) => window.__gb.api.filter((a) => a.path === "/api/webreq" && a.body.coll === c).map((a) => a.body), coll);
export const gridKeys = (page) => page.locator("#grid tbody tr[data-key]").evaluateAll((rs) => rs.map((r) => r.dataset.key));
// Ngày đăng như danh sách gói dùng (pubOf): publicDate, dự án thì addedAt.
export function pubOfKey(key) {
  const c = SEED.colls, f = c.feed.current.tenders.find((t) => t.notifyNo === key);
  return f?.publicDate || c.bidhist[key]?.publicDate || c.manual[key]?.addedAt || "";
}
// Thứ tự mặc định: ngày đăng giảm dần, cùng ngày thì Mã số giảm dần.
export const byPubDesc = (keys) => keys.slice().sort((a, b) => pubOfKey(b).localeCompare(pubOfKey(a)) || b.localeCompare(a));
// Mở một tab của khung chi tiết gói.
export async function openTab(page, dt) {
  await page.locator(`#dtabs [data-dt="${dt}"]`).click();
  await expect(page.locator(`#dtabs [data-dt="${dt}"]`)).toHaveAttribute("aria-selected", "true");
}
