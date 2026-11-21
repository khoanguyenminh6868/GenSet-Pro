// #1024: chụp "Câu hỏi làm rõ HSMT" + thẻ #2 IB2600603983. Trước = web origin/main + goc-2.json (bản đang đăng);
// sau = web nhánh + sau-2.json (check của nhánh). Server thử + DB giả, thêm hồ sơ hãng Deep Sea, Leroy-Somer từ suppliers/cn.
// node shot-link.mjs <web/test cũ> <web/test mới> <thư mục node_modules có playwright> <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const [oldT, newT, nm, root] = process.argv.slice(2), here = import.meta.dirname, KEY = "IB2600603983";
const { chromium } = createRequire(path.join(nm, "x.js"))("@playwright/test");
const read = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const seed = read(path.join(newT, "fixtures", "seed.json")), feed = seed.colls.feed.current;
const tender = { ...feed.tenders[0], notifyNo: KEY, bidName: "Gói IB2600603983 (dữ liệu Gợi ý cấu hình thật, ảnh nghiệm thu)" };
const supplier = Object.fromEntries(["deep-sea-electronics", "leroy-somer-fuzhou"].map((id) => [id, read(path.join(root, "suppliers", "cn", id + ".json"))]));
const browser = await chromium.launch({ channel: "msedge" });
for (const [tag, dir, port, file] of [["truoc", oldT, 4333, "goc-2.json"], ["sau", newT, 4334, "sau-2.json"]]) {
  const patch = { colls: { feed: { current: { ...feed, tenders: [tender, ...feed.tenders] } }, configmatch: { [KEY]: read(path.join(here, file)) }, supplier } };
  const { start } = await import(pathToFileURL(path.join(dir, "serve.mjs")).href);
  const server = await start(port);
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  await page.route((u) => !/^http:\/\/127\.0\.0\.1:\d+\//.test(u.href), (r) => r.fulfill({ status: 200, body: "" }));
  await page.addInitScript((p) => { window.__gbPatch = p; }, patch);
  await page.goto(`http://127.0.0.1:${port}/#goi/${KEY}`);
  await page.locator('#dtabs [data-dt="config"]').click();
  const card = page.locator("#dbody .cfgcard").nth(1);
  await card.waitFor();
  if ((await card.getAttribute("open")) === null) await card.locator("summary").first().click();
  await page.waitForTimeout(9000);
  const blocks = card.locator(":scope > .cfgblk, :scope .cfgblk");
  const n = await blocks.count(), texts = [];
  for (let i = 0; i < Math.min(n, 6); i++) texts.push((await blocks.nth(i).innerText()).replace(/\s+/g, " ").slice(0, 110));
  const links = await card.evaluate((c) => ({ alt: c.querySelectorAll('[data-catopen="alternator"]').length, ctl: c.querySelectorAll('[data-catopen="controller"]').length, mod: c.querySelectorAll(".cfgmod [data-supopen]").length }));
  const clarify = await page.locator("#dbody").innerText().then((t) => (t.match(/Ổn định điện áp/g) || []).length);
  const top = await page.locator("#dbody .cfgcard").first().boundingBox();
  await card.scrollIntoViewIfNeeded();
  const b = await card.boundingBox();
  await page.screenshot({ path: path.join(here, `${tag}-link-2.png`), clip: { x: b.x, y: b.y, width: b.width, height: Math.min(b.height, 520) }, fullPage: true });
  const body = await page.locator("#dbody").boundingBox();
  await page.screenshot({ path: path.join(here, `${tag}-lam-ro.png`), clip: { x: body.x, y: Math.max(body.y, top.y - 420), width: body.width, height: 420 }, fullPage: true });
  console.log(tag, JSON.stringify({ links, clarifyWords: clarify, errs }), "\n  " + texts.join("\n  "));
  await page.close(); server.close();
}
await browser.close();
