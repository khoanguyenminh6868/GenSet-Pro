// node dumpH.cjs <selH.json> <thư mục ra>: mở trang kết quả từng gói (hồ sơ trình duyệt riêng .genbid-browser-probe, như
// genbid-sync.js history) và ghi dữ liệu THÔ của trang (lotResultDTO, lotOpenDetails) ra <thư mục>\<id>.json. Chỉ đọc.
const fs = require("fs"), path = require("path");
const KIT = "C:/Projects/GenSet Pro/genbid-hsmt";
const PLAT = require(KIT + "/platform.js");
const [sel, out] = process.argv.slice(2);
const list = JSON.parse(fs.readFileSync(sel, "utf8"));
fs.mkdirSync(out, { recursive: true });
const RAW = `(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let root = null, kq = null;
  for (let i = 0; i < 40; i++) {
    root = [...document.querySelectorAll("[id]")].map((e) => e.__vue__).find((v) => v && v === v.$root && v.$data && ("dtlKqlcnt" in v.$data || "dtlRoundMngRes" in v.$data));
    kq = root?.$data.dtlKqlcnt?.bideContractorInputResultDTO;
    if (kq && (kq.lotResultDTO?.length || kq.lotOpenDetails?.length)) break;
    if (i === 4 && root && root.$data.isLoadedKqlcnt === false && /step=kqlcnt/.test(location.search))
      [...document.querySelectorAll("a")].find((a) => a.textContent.trim() === "Kết quả lựa chọn nhà thầu")?.click();
    await sleep(500);
  }
  if (!kq) return { error: "không có kq", captcha: /xác minh bạn không phải|not a robot|unusual traffic/i.test(document.body.innerText.slice(0, 5000)) };
  return JSON.parse(JSON.stringify({ bidPrice: kq.bidPrice, bidEstimatePrice: kq.bidEstimatePrice, lotResultDTO: kq.lotResultDTO, lotOpenDetails: kq.lotOpenDetails }));
})()`;
(async () => {
  const { chromium } = require(path.join(KIT, "node_modules", "playwright-core"));
  const exe = PLAT.chromePath();
  const ctx = await chromium.launchPersistentContext(path.join(PLAT.ROOT, ".genbid-browser-probe"), {
    headless: false, ...(exe ? { executablePath: exe } : { channel: "msedge" }), viewport: { width: 1280, height: 900 }, args: ["--window-position=0,0", "--window-size=900,700"],
  });
  ctx.setDefaultTimeout(45000);
  const page = ctx.pages()[0] || (await ctx.newPage());
  let ok = 0, bad = 0;
  try {
    for (const x of list) {
      const f = path.join(out, x.id + ".json");
      if (fs.existsSync(f)) { ok++; continue; }
      try {
        await page.goto(x.url, { waitUntil: "domcontentloaded" });
        const r = await page.evaluate(RAW);
        if (r.error) { bad++; console.log(x.id, r.error, r.captcha ? "CAPTCHA" : ""); if (r.captcha) break; continue; }
        fs.writeFileSync(f, JSON.stringify(r)); ok++;
      } catch (e) { bad++; console.log(x.id, e.message.split("\n")[0]); }
      await page.waitForTimeout(800 + Math.random() * 1200);
    }
  } finally { await ctx.close().catch(() => {}); }
  console.log(`xong ${ok}/${list.length}, lỗi ${bad}`);
})();
