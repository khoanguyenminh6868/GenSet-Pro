// node shot.mjs <worktree> <outdir> : mở hồ sơ NCC thật trên server thử, chụp mục "Tổ máy (bảng không ghi mã động cơ)"
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
const req = createRequire(path.join(WT, "web", "test", "package.json"));
const { chromium } = req("playwright");
const { start } = await import(pathToFileURL(path.join(WT, "web", "test", "serve.mjs")).href);
const IDS = ["googol", "superwatt-swt", "westinpower", "zc-power"];
const sup = Object.fromEntries(IDS.map((id) => [id, JSON.parse(fs.readFileSync(path.join(WT, "suppliers", "cn", id + ".json"), "utf8"))]));
const server = await start(4391);
const browser = await chromium.launch({ channel: "msedge" });
const out = {};
for (const [w, tag] of [[1280, "desk"], [390, "phone"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  await page.addInitScript((p) => { window.__gbPatch = p; }, { colls: { supplier: sup } });
  for (const id of tag === "desk" ? IDS : ["googol"]) {
    await page.goto("about:blank");
    await page.goto("http://127.0.0.1:4391/#nha-cung-cap");
    await page.fill("#supQ", sup[id].names.en.split(/\s+/)[0]);
    await page.waitForTimeout(500);
    await page.click(`[data-supopen="${id}"]`);
    const box = page.locator("#supModels:not([data-id])");
    await box.waitFor({ timeout: 60000 });
    const d = box.locator("details", { hasText: "Tổ máy (bảng không ghi mã động cơ)" });
    if ((await d.count()) && (await d.getAttribute("open")) === null)await d.locator("summary").click();
    await page.waitForTimeout(300);
    out[`${tag}-${id}`] = (await d.count()) ? await d.innerText() : "(không có mục)";
    if (tag === "phone") { await d.locator("summary").scrollIntoViewIfNeeded(); await page.evaluate(() => window.scrollBy(0, 0)); await page.screenshot({ path: path.join(OUT, `${tag}-${id}.png`) }); }
    else await (await d.count() ? d : box).screenshot({ path: path.join(OUT, `${tag}-${id}.png`) });
  }
  out[`${tag}-errors`] = errs;
  await page.close();
}
await browser.close(); server.close();
fs.writeFileSync(path.join(OUT, "shot.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1).slice(0, 4000));
