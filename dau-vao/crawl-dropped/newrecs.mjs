// Bản ghi fromSupplier của từng bảng MỚI (newtabs.json): số bản ghi theo vai, tần số đọc được, loại công suất, hãng.
//   node newrecs.mjs <gốc repo> <newtabs.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, file] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const all = JSON.parse(fs.readFileSync(file, "utf8"));
const tally = (a) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); return [...m].map(([k, v]) => `${k}×${v}`).join(", "); };
for (const id of [...new Set(all.map((t) => t.id))]) {
  const s = JSON.parse(fs.readFileSync(path.join(root, "suppliers", "cn", `${id}.json`), "utf8"));
  const notes = [], recs = C.fromSupplier(s, notes);
  for (const t of all.filter((x) => x.id === id)) {
    const set = new Set(t.rows), ti = s.specTables.findIndex((x) => x.n === t.n && x.rows.join("\n") === t.rows.join("\n"));
    const rs = recs.filter((r) => r.n === t.n && r.table === ti);
    const lines = new Set(rs.map((r) => r.line));
    const unread = t.rows.filter((l) => !lines.has(l));
    const elsewhere = unread.filter((l) => recs.some((r) => r.line === l)).length;
    const sect = t.header.filter((h) => h.split("|").map((x) => x.trim()).filter(Boolean).length === 1).map((h) => h.replace(/^\|\s*/, "")).join(" / ");
    console.log(`${id} n${t.n} L${t.at} [${sect || "—"}] ${ti < 0 ? "KHÔNG CÓ TRONG HỒ SƠ" : `b${ti}`}: ${t.rows.length} dòng → ${rs.length} bản ghi (${tally(rs.map((r) => r.kind))}); freq ${tally(rs.map((r) => r.freq ?? "null"))}; công suất ${tally(rs.map((r) => (r.power ? Object.keys(r.power).sort().join("+") : "null")))}; hãng ${tally(rs.map((r) => (r.makes || []).map((m) => `${m.name}(${m.via})`).join("/") || "—"))}; dòng không ra bản ghi ở bảng này ${unread.length} (đã có ở bảng khác ${elsewhere})`);
    for (const l of unread.filter((l) => !recs.some((r) => r.line === l)).slice(0, 4)) console.log(`     KHÔNG ĐỌC: ${l.slice(0, 180)}`);
  }
  for (const x of notes.filter((x) => all.some((t) => t.id === id && t.n === x.n))) console.log(`     ghi chú n${x.n}: ${x.reason} — ${String(x.detail).slice(0, 160)}`);
}
