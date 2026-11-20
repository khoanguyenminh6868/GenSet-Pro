// altAttrChecks trên LSA 49.3 M8 (tờ 1012) với yêu cầu quá tốc / kiểu / kích từ của IB2600603983. node os-dbg.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const text = fs.readFileSync(path.join(root, "suppliers", "sources", "leroy-somer-fuzhou", "1012.md"), "utf8");
const attrs = R.lsSheetAttrs(text).map((a) => ({ ...a, supplierId: "leroy-somer-fuzhou", n: 1012, model: "LSA 49.3 M8", range: true }));
const reqs = [
  { item: "Quá tốc đầu phát", code: "other", part: "alternator", requirement: "≤ 2250 vòng/phút", level: "core" },
  { item: "Kiểu đầu phát (không chổi than, tự kích)", code: "alt_type", part: "alternator", requirement: "Xoay chiều, từ trường quay, không chổi than, tự kích từ", level: "core" },
  { item: "Kích từ đầu phát (PMG / AREP)", code: "alt_excitation", part: "alternator", requirement: "Không chổi than, tự động kích từ", level: "core" },
];
const c = { alternator: { model: "LSA 49.3 M8" }, checks: [] };
CB.altAttrChecks(c, reqs, attrs, []);
for (const x of c.checks) console.log(x.item, x.status, x.offered);
