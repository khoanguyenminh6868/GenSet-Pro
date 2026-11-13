// Test khói giao diện web: chạy trên CI (job "web", .github/workflows/test-web.yml) với chromium của Playwright.
// Cục bộ trên Windows không tải được trình duyệt của Playwright: PW_CHANNEL=msedge dùng Edge có sẵn.
import { defineConfig } from "@playwright/test";

const PORT = 4317;
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
  },
  webServer: { command: `node serve.mjs ${PORT}`, url: `http://127.0.0.1:${PORT}/`, reuseExistingServer: !process.env.CI, timeout: 20000 },
});
