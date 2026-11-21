// Mọi fact của modelFacts (một gốc repo), mỗi dòng một fact, đã sắp. node facts-dump.mjs <gốc repo> <out.tsv>
// Kèm tự kiểm hình học: xi lanh × bore × hành trình ↔ dung tích trên MỖI bản ghi có số xi lanh đọc từ nhãn "in line" / "缸" / "Valves".
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
await import(pathToFileURL(path.join(root, "web", "spec-norm.js")).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const cn = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const facts = CB.modelFacts(C.build(sups), sups), rows = [];
const clean = (s) => String(s ?? "").replace(/[\t\r\n]+/g, " ");
for (const [k, list] of facts) for (const f of list) rows.push([k, f.supplierId, f.n, f.key, clean(f.label), clean(f.value), f.sheet ? "sheet" : "", f.unitCell || ""].join("\t"));
rows.sort();
fs.writeFileSync(out, rows.join("\n") + "\n");
const geo = { ok: 0, bad: [], none: 0 };
for (const s of sups) for (const r of C.fromSupplier(s, [])) {
  const y = (r.specs || []).find((x) => x.key === "cyl" && /in\s+line|\dinline|缸|^\d+\s*\/\s*\d+$/i.test(String(x.value)));
  if (!y) continue;
  const g = SN.selfCheck(SN.normalizeRecord(r, s.specTables?.[r.table]?.rows));
  if (!g) geo.none++; else if (g.bad) geo.bad.push(`${s.id} n${r.n} ${r.model} "${y.value}" tính ${g.calc} L, ghi ${g.disp} L`); else geo.ok++;
}
console.log("facts", rows.length, "| hình học: khớp", geo.ok, "lệch", geo.bad.length, "không đủ số", geo.none);
fs.writeFileSync(out.replace(/\.tsv$/, "-hinh-hoc.txt"), geo.bad.join("\n") + "\n");
