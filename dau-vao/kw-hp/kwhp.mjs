import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const SC = "C:/Users/Khoa/AppData/Local/Temp/claude/d4c88f0a2fd88962/12cf46c0-582e-4b82-a872-97d5283432ea/scratchpad";
const R = SC + "/repo/suppliers";
const { standardOf } = await import(pathToFileURL(path.join(R, "spec-standard.mjs")).href);
const dir = path.join(R, "cn");
const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const reads = [];
const docs = standardOf(all, { sourcesDir: path.join(R, "sources"), audit: (a) => { if (a.sp) reads.push({ part: a.part, key: a.key, fid: a.fid, drop: a.drop, sp: a.sp, n: a.n, u: { supplierId: a.u.supplierId, n: a.u.n, table: a.u.table, title: a.u.title, row: a.u.row, line: a.u.line, header: a.u.header, power: a.u.power, freq: a.u.freq, model: a.u.model, genset: a.u.genset, kind: a.u.kind } }); } });
const hasKw = (s) => /kw/i.test(s || ""), hasHp = (s) => /\b(hp|bhp|ps)\b|马力/i.test(s || "");
const mix = reads.filter((r) => r.part === "engine" && hasKw(r.sp.label) && hasHp(r.sp.label));
fs.writeFileSync(SC + "/mix.json", JSON.stringify(mix));
// kW-only readings per engine key (labels without hp) for cross-check
const kwOnly = {};
for (const r of reads) if (r.part === "engine" && r.fid === "power_kwm" && r.n?.num != null && r.n.unit === "kW" && !hasHp(r.sp.label) && /kw/i.test(r.sp.label + (r.n.cond?.headerUnit || ""))) (kwOnly[r.key] ||= []).push({ v: r.n.num, s: r.u.supplierId, label: r.sp.label, tbl: r.u.table, row: r.u.row });
fs.writeFileSync(SC + "/kwonly.json", JSON.stringify(kwOnly));
// standard doc items with unit info, for counting
let stdItems = 0;
for (const d of docs) if (d.part === "engine" && d.fields.power_kwm) stdItems += d.fields.power_kwm.length;
console.log("mix readings", mix.length, "engine std power_kwm items", stdItems, "engines w/ kwonly", Object.keys(kwOnly).length);
const lab = {};
for (const r of mix) { const k = r.u.supplierId + " | " + r.sp.label + " | " + r.fid; lab[k] = (lab[k] || 0) + 1; }
console.log(Object.entries(lab).sort().map(([k, v]) => v + "  " + k).join("\n"));
// also other parts / fields with both kw & hp labels
const oth = {};
for (const r of reads) if (hasKw(r.sp.label) && hasHp(r.sp.label) && !(r.part === "engine")) { const k = r.part + " " + r.fid + " " + r.sp.label; oth[k] = (oth[k] || 0) + 1; }
console.log("non-engine mixed:", JSON.stringify(oth));
// docs-level: items whose raw label unknown; count single-number among mix
const single = mix.filter((r) => /^\s*[\d.,]+\s*$/.test(String(r.sp.value)));
console.log("mix single-number readings", single.length, "distinct(key,value)", new Set(single.map((r) => r.key + "|" + r.n?.num)).size, "distinct(key,value,supplier)", new Set(single.map((r) => r.key + "|" + r.n?.num + "|" + r.u.supplierId)).size);
