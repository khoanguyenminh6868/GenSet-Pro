// In tiêu đề bảng chứa các dòng cần xem, trước ↔ sau, gom theo bảng.
//   node heads-of.mjs <gốc sau> <gốc trước> <id> <regex model>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, id, re] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (r) => JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8"));
const R = new RegExp(re), ra = load(before), rb = load(after);
const mk = (r) => (r.makes || []).map((m) => m.name + "/" + m.via).join("+") || "—";
const show = (name, rec) => {
  const seen = new Map();
  for (const r of C.fromSupplier(rec, [])) {
    if (r.kind !== "engine" || !R.test(r.model)) continue;
    const t = rec.specTables.find((x) => x.n === r.n && x.rows.includes(r.line));
    const k = t ? `n${t.n} [${rec.specTables.indexOf(t)}] ${t.rows.length} dòng\n   title: ${(t.title || "").slice(0, 110)}\n   ` + t.header.map((h) => h.slice(0, 120)).join("\n   ") : "?";
    const e = seen.get(k) || { c: 0, m: new Set(), first: r.model }; e.c++; e.m.add(mk(r)); seen.set(k, e);
  }
  console.log(`=== ${name}`);
  for (const [k, e] of seen) console.log(`${k}\n   → ${e.c} bản ghi, hãng: ${[...e.m].join(", ")} (vd ${e.first})`);
};
show("TRƯỚC", ra); show("SAU", rb);
