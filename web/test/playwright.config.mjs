// Test khói giao diện web: chạy trên CI (job "web", .github/workflows/test-web.yml) với chromium của Playwright.
// Cục bộ trên Windows không tải được trình duyệt của Playwright: PW_CHANNEL=msedge dùng Edge có sẵn.
// Claude Code cloud: máy có sẵn Chromium ở /opt/pw-browsers nhưng là bản của Playwright khác (vd. 1243 khi dự án cần 1248)
// và không tải được bản mới → dùng thẳng tệp chạy đó (cloudChromium). PW_CHROMIUM=<đường dẫn> ép một tệp chạy khác.
import { defineConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}
function cloudChromium() {
  if (process.env.PW_CHROMIUM) return process.env.PW_CHROMIUM;
  if (process.env.PW_CHANNEL || process.platform !== "linux") return null;
  const root = "/opt/pw-browsers";
  if (isFile(path.join(root, "chromium"))) return path.join(root, "chromium");
  let dirs = [];
  try { dirs = fs.readdirSync(root).filter((d) => /^chromium-\d+$/.test(d)); } catch { return null; }
  dirs.sort((a, b) => +b.split("-")[1] - +a.split("-")[1]); // bản mới nhất trước
  for (const d of dirs) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) {
      const p = path.join(root, d, sub);
      if (isFile(p)) return p;
    }
  }
  return null;
}
const CHROMIUM = cloudChromium();

const PORT = +(process.env.PW_PORT || 4317); // PW_PORT: cổng khác khi 4317 đang bận (nhiều worktree)
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.mjs$/,
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // không chạy lại ca hỏng: ca chập chờn phải lộ ra
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1366, height: 900 },
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
    trace: "retain-on-failure",
    ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}),
    ...(CHROMIUM ? { launchOptions: { executablePath: CHROMIUM } } : {}),
  },
  webServer: { command: `node serve.mjs ${PORT}`, url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: false, timeout: 20000 },
});
