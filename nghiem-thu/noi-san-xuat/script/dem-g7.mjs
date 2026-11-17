// Đếm gói máy phát theo cách HSMT đòi G7 / G20 (originOfHsmt): phạm vi tổ máy / bộ phận, thương hiệu / xuất xứ
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const hist = Object.values(JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa/bidhist.json", "utf8")).docs).map((x) => x.d)
  .filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const c = {}, ex = {};
for (const d of hist) {
  const o = B.originOfHsmt(d.config.text);
  const k = o ? `${o.origin} | ${o.scope === "parts" ? "chỉ bộ phận" : "cả tổ máy"} | ${o.scope === "parts" ? "-" : o.basis}` : "không đòi G7/G20";
  c[k] = (c[k] || 0) + 1;
  if (o && (ex[k] || []).length < 2) (ex[k] ||= []).push(`${d.notifyNo}: ${o.quote.slice(0, 110)}`);
}
console.log("tổng", hist.length);
for (const [k, n] of Object.entries(c).sort((a, b) => b[1] - a[1])) { console.log(String(n).padStart(5), k); for (const x of ex[k] || []) console.log("        " + x); }
