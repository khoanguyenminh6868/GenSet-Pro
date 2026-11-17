// Spinner không bị việc ngầm giữ lại (Khoa 17/11/2026: "spinner cứ xoay hoài không tắt"). Trang tự đọc lại HSMT của mọi gói
// (cột Công Suất) bằng một vòng đọc nối tiếp; bấm một nút trong lúc đó thì mỗi lần đọc kế tiếp bắt đầu khi việc có spinner
// còn chạy, nên spinner bám theo cả vòng. Việc ngầm truyền window.genbidQuietSignal() → không tính.
import { test, expect, openApp } from "./fixtures.mjs";

test("vòng đọc ngầm có tín hiệu im lặng không giữ spinner sau khi việc của cú bấm xong", async ({ page }) => {
  await page.route("**/__slow/**", async (route) => {
    const ms = Number(new URL(route.request().url()).searchParams.get("ms") || 0);
    await new Promise((r) => setTimeout(r, ms));
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await openApp(page);
  await page.evaluate(() => {
    window.__loop = { on: true, n: 0 };
    // Vòng đọc ngầm: đọc nối tiếp, lần sau bắt đầu ngay khi lần trước xong (như scanCapacities).
    (async () => {
      while (window.__loop.on) {
        const r = await fetch("/__slow/bg?ms=150", { signal: window.genbidQuietSignal() });
        await r.json();
        window.__loop.n++;
      }
    })();
    // Cú bấm bắt đầu một việc có spinner, 1 giây.
    const b = document.createElement("button");
    b.id = "slowBtn"; b.textContent = "Chậm";
    b.onclick = () => fetch("/__slow/act?ms=1000").then((r) => r.json());
    document.body.appendChild(b);
  });
  await page.click("#slowBtn");
  await expect(page.locator("html")).toHaveClass(/gb-busy/);
  // Việc của cú bấm xong sau 1 s; vòng ngầm vẫn chạy mà spinner phải tắt.
  await expect(page.locator("html")).not.toHaveClass(/gb-busy/, { timeout: 3000 });
  expect(await page.evaluate(() => window.__loop.n)).toBeGreaterThan(3);
  await page.evaluate(() => { window.__loop.on = false; });
});
