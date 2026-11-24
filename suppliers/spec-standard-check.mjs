// Kiểm chéo TOÀN BỘ bản chuẩn (không lấy mẫu): node suppliers/spec-standard-check.mjs [--json <tệp>]
// Với MỌI thông số của MỌI dòng catalog, tính lại số gốc từ SN.normalizeRecord và so với giá trị bản chuẩn. Số đổi phải
// thuộc một luật gộp có tên; giá trị phải có mặt trong doc; `raw` phải nằm trong dòng nguồn. Thoát 1 khi có ca không giải thích được.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { standardOf, stable, joinKey, tidyText } from "./spec-standard.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CAT = globalThis.GenbidCatalog;
const dir = path.join(ROOT, "cn");
const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const c = { readings: 0, kept: 0, dropped: {}, identical: 0, byRule: {}, unexplained: 0, absent: 0, rawChecked: 0, rawNotInLine: 0, rawFixspec: 0, rawNoLine: 0 };
const bad = [], seen = [], rawBad = [], bySup = new Map(all.map((s) => [s.id, s]));
const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
// The figure the normalizer itself gives, as text, to compare with the standard value.
function normText(n) {
  if (!n) return null;
  if (n.count != null) return String(n.count);
  if (n.num != null) return String(n.num);
  if (n.bore) return n.bore.stroke != null ? `${n.bore.bore} × ${n.bore.stroke}` : String(n.bore.bore);
  if (n.dims) return (n.dims.asWritten || Object.values(n.dims)).join(" × ");
  if (n.range) return `${n.range[0]}-${n.range[1]}`;
  if (n.options) return stable(n.options);
  if (n.enum) return String(n.enum);
  return null;
}
const audit = (a) => {
  c.readings++;
  if (a.drop) { bump(c.dropped, a.drop); return; }
  c.kept++;
  seen.push([a.part, a.key, a.fid, typeof a.value === "string" ? joinKey(a.value) : stable(a.value)]);
  const v = typeof a.value === "string" ? a.value : stable(a.value);
  const from = a.rules?.includes("hp-giu-nguyen") ? String(a.n.conv.from.num) : a.n ? normText(a.n) : tidyText(a.sp.value).text;
  const rules = a.rules || [];
  if (v === from) { if (!a.n && from === String(a.sp.value)) c.identical++; else if (a.n) c.identical++; else bump(c.byRule, "gon-khoang-trang"); }
  else if (!a.n && a.value === Number(tidyText(a.sp.value).text)) c.identical++;
  else if (!a.n && (rules.includes("same") || rules.includes("hoa-thuong"))) bump(c.byRule, "enum");
  else { c.unexplained++; if (bad.length < 40) bad.push({ model: a.key, fid: a.fid, raw: a.sp.value, norm: from, std: v }); }
  for (const r of rules) bump(c.byRule, `luat:${r}`);
  const raw = a.sp.fixed?.from ?? a.sp.value;
  if (a.sp.fixed) c.rawFixspec++;
  // The record's own row, plus the rows and header of a label table (its figures sit on other lines than `line`).
  const text = [a.u.line, ...(a.u.lines?.rows || []), ...(a.u.lines?.header || []), ...(a.u.header || [])].filter(Boolean).join("\n");
  if (!text) c.rawNoLine++;
  else {
    c.rawChecked++;
    const flat = (s) => String(s).normalize("NFKC").replace(/[\s|]+/g, "");
    // A record with no row of its own (vertical sheet, src.row null) points at its table: the text is looked for there.
    // So does a listed engine row (ENGINE_LINES: `line` is its model row, the figures are on other rows of the table).
    const t = bySup.get(a.u.supplierId)?.specTables?.[a.u.table];
    const inTable = t && flat([...(t.header || []), ...(t.rows || [])].join("\n")).includes(flat(raw));
    // Cells the catalog joined ("lt | 3,3" → "3,3 L"): every figure of the value must stand in that table.
    const tableText = t ? [...(t.header || []), ...(t.rows || [])].join("\n") : "";
    const figs = String(raw).match(/\d+(?:[.,]\d+)?/g) || [];
    const joined = !!t && !inTable && figs.length > 0 && figs.every((x) => new RegExp(`(?<![\\d.,])${x.replace(".", "\\.")}(?![\\d])`).test(tableText));
    if (joined) c.rawJoinedFiguresInTable = (c.rawJoinedFiguresInTable || 0) + 1;
    else if (inTable && !text.includes(raw)) c.rawInTableOnly = (c.rawInTableOnly || 0) + 1;
    else if (!a.sp.fixed && !text.includes(raw) && !flat(text).includes(flat(raw))) { c.rawNotInLine++; if (rawBad.length < 8) rawBad.push({ s: a.u.supplierId, n: a.u.n, fid: a.fid, raw, line: String(a.u.line).slice(0, 90) }); }
  }
};
const docs = standardOf(all, { audit });
const have = new Set();
for (const d of docs) {
  const add = (key, fields) => { for (const [id, items] of Object.entries(fields)) for (const it of items) {
    const value = id === "power_kwm" ? it.value.kwm : id === "power_hp" ? it.value.hp : it.value;
    have.add(stable([d.part, key, id === "power_hp" ? "power_kwm" : id, typeof value === "string" ? joinKey(value) : stable(value)]));
  } };
  if (d.part === "genset") for (const [k, m] of Object.entries(d.models)) add(`${d.supplierId}|${k}`, m.fields); else add(d.key, d.fields);
}
for (const s of seen) if (!have.has(stable(s))) { c.absent++; if (bad.length < 40) bad.push({ absent: s }); }
c.docs = docs.length;
console.log(JSON.stringify(c, null, 1));
if (bad.length) console.log(JSON.stringify(bad.slice(0, 6)));
if (rawBad.length) console.log(JSON.stringify(rawBad));
const i = process.argv.indexOf("--json");
if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify({ c, bad }, null, 1));
void CAT;
process.exit(c.unexplained || c.absent || c.rawNotInLine ? 1 : 0);
