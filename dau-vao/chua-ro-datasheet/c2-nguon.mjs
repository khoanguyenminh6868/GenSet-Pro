// Cấu hình #2 IB2600603983: fact mà code có cho từng bộ phận, dòng tổ máy, các nguồn đã lưu. node c2-nguon.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog, cn = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const cat = C.build(sups), F = CB.modelFacts(cat, sups);
const show = (k) => { const l = F.get(k) || []; console.log(`\n## ${k}: ${l.length} fact`); const by = {}; for (const f of l) (by[f.key] = by[f.key] || new Set()).add(`${f.supplierId}[${f.n}]${f.sheet ? "*" : ""}=${String(f.value).slice(0, 34)}`); for (const [k2, s] of Object.entries(by)) console.log(`  ${k2}: ${[...s].slice(0, 5).join(" ; ")}${s.size > 5 ? ` … (${s.size})` : ""}`); };
show(`engine:${C.keyOf("6M31G825/5")}`);
show(`alternator:${C.keyOf("LSA 49.3 M8")}`);
console.log("alternator trong catalog:", (cat.alternators || []).some((e) => e.key === C.keyOf("LSA 49.3 M8")));
for (const k of [...F.keys()].filter((x) => /^controller:DSE7320/.test(x))) { const l = F.get(k); console.log(`\n## ${k}: ${l.length} dòng; nguồn ${[...new Set(l.map((f) => `${f.supplierId}[${f.n}]`))].join(", ")}`); }
const e = (cat.engines || []).find((x) => x.key === C.keyOf("6M31G825/5"));
console.log("\n## uses của động cơ:"); for (const u of e.uses) console.log(`  ${u.supplierId}[${u.n}] ${u.genset || ""} freq=${u.freq} power=${JSON.stringify(u.power)} specs=${(u.specs || []).map((s) => s.key).join(",")} | ${String(u.line || "(nhãn)").slice(0, 60)} | ${String(u.title || "").slice(0, 60)}`);
const agg = sups.find((s) => s.id === "agg-fuzhou"); for (const t of agg.specTables.filter((x) => x.n === 107 && x.rows.some((l) => l.includes("6M31G825/5")))) console.log("\n## agg-fuzhou n107:", t.title, "\n", (t.header || []).join("\n "));
const dse = sups.find((s) => s.id === "deep-sea-electronics") || JSON.parse(fs.readFileSync(path.join(cn, "deep-sea-electronics.json"), "utf8"));
console.log("\n## DSE bảng nhắc DSE7320:"); for (const t of dse.specTables || []) if (/7320/.test(`${t.title} ${t.rows.join(" ")}`)) console.log(`  n${t.n} dòng ${t.rows.length}: ${String(t.title).slice(0, 70)}`);
