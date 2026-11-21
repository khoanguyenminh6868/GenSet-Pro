// node why.mjs <thư mục code> <thư mục cn> <IB#ri> <mã động cơ>... (CHỈ ĐỌC): ngưỡng HSMT đọc được + mọi fact cyl / disp / bố trí của từng động cơ, kèm NCC và dòng nguồn.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, run, ...models] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), facts = B.modelFacts(full, sups);
const [key, ri] = run.split("#");
const d = Object.values(J("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs).map((x) => x.d).find((x) => x?.notifyNo === key);
const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
const rn = found.length > 1 ? { sizing: { size: found[+ri], sizes: found } } : { sizing: null };
const h = { ...B.hintsOf(d.config.text, "", rn.sizing) }; delete h.text;
console.log("hints:", JSON.stringify(h, (k, v) => (v instanceof Set ? [...v] : v)).slice(0, 900));
for (const line of d.config.text.split("\n").filter((l) => /xi.?lanh|xy.?lanh|dung tích/i.test(l)).slice(0, 8)) console.log("  HSMT:", line.trim().slice(0, 160));
for (const m of models) {
  const e = full.engines.find((x) => x.key === CAT.keyOf(m));
  if (!e) { console.log(`\n== ${m}: không có khoá`); continue; }
  console.log(`\n== ${e.model} | hãng ${e.make || "?"} | ${e.uses.length} dòng | ${e.suppliers.join(",")}`);
  for (const f of (facts.get(`engine:${e.key}`) || []).filter((x) => /^(cyl|disp|bore)/.test(x.key))) console.log(`  ${f.key}=${String(f.value).slice(0, 40)} | ${f.supplierId} n${f.n ?? ""} | ${String(f.line || "").slice(0, 170)}`);
}
