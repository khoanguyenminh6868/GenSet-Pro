// Chụp thẻ cấu hình IB2600603983 (sau.json = kết quả check của nhánh trên dữ liệu web thật) trên web cũ (origin/main) và
// mới (nhánh), server thử web/test/serve.mjs + DB giả (seed.json, thêm gói IB2600603983 vào feed bằng __gbPatch).
// node shot.mjs <web/test cũ> <web/test mới> <thư mục node_modules có playwright>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const [oldT, newT, nm] = process.argv.slice(2), here = import.meta.dirname, KEY = "IB2600603983";
const { chromium } = createRequire(path.join(nm, "x.js"))("@playwright/test");
const sau = JSON.parse(fs.readFileSync(path.join(here, "sau.json"), "utf8"));
const seed = JSON.parse(fs.readFileSync(path.join(newT, "fixtures", "seed.json"), "utf8"));
const feed = seed.colls.feed.current;
const tender = { ...feed.tenders[0], notifyNo: KEY, bidName: "Gói IB2600603983 (dữ liệu Gợi ý cấu hình thật, ảnh nghiệm thu)" };
const patch = { colls: { feed: { current: { ...feed, tenders: [tender, ...feed.tenders] } }, configmatch: { [KEY]: sau } } };
const browser = await chromium.launch({ channel: "msedge" });
for (const [tag, dir, port] of [["truoc", oldT, 4331], ["sau", newT, 4332]]) {
  const { start } = await import(pathToFileURL(path.join(dir, "serve.mjs")).href);
  const server = await start(port);
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.route((u) => !/^http:\/\/127\.0\.0\.1:\d+\//.test(u.href), (r) => r.fulfill({ status: 200, body: "" }));
  await page.addInitScript((p) => { window.__gbPatch = p; }, patch);
  await page.goto(`http://127.0.0.1:${port}/#goi/${KEY}`);
  await page.locator('#dtabs [data-dt="config"]').click();
  const cards = page.locator("#dbody .cfgcard");
  await cards.first().waitFor();
  await page.waitForTimeout(1500);
  for (const i of [0, 2]) {
    const c = cards.nth(i);
    if (!(await c.getAttribute("open")) && (await c.getAttribute("open")) !== "") await c.locator("summary").first().click();
    // Chỉ phần đầu thẻ (các bộ phận + mô-đun + phương án khác), không cả bảng yêu cầu.
    const box = await c.boundingBox(), grid = await c.locator(".cfgcols, details").first().boundingBox().catch(() => null);
    await c.scrollIntoViewIfNeeded();
    const b2 = await c.boundingBox();
    const h = grid ? Math.min(b2.height, grid.y - box.y + 10) : Math.min(b2.height, 700);
    await page.screenshot({ path: path.join(here, `${tag}-cau-hinh-${i + 1}.png`), clip: { x: b2.x, y: b2.y, width: b2.width, height: Math.max(120, h) }, fullPage: true });
    console.log(tag, i + 1, (await c.innerText()).split("\n").slice(0, 12).join(" | "));
  }
  console.log(tag, "pageerror:", errs);
  await page.close(); server.close();
}
await browser.close();
