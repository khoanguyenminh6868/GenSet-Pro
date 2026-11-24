// Removes the notes check() piled up on saved Gợi ý cấu hình results (configmatch/<key>) before #1080 made it idempotent
// (mk-lap-3, 24/11/2026: IB2600601812 had 62 checks whose note said "cần xác nhận đời (MK)" three times).
// Only the repeats go: the first sentence of each kind stays where it stood; nothing else in the result changes.
//   node suppliers/dedupe-notes.mjs [--key IB...] [--write]     (no --write: read-only, prints what would change)
import { allDocs, doc, post } from "./config-bot.mjs";
import { BMS_NOTE } from "./ctl-module.mjs";

const VERSION_NOTE = /\s*Nguồn là datasheet [^;]*; nhà cung cấp ghi [^,]*, cần xác nhận đời \(MK\) của bộ điều khiển\./g;
const CODE_LINE = /^Kiểm tra bằng code:/;

// "BMS qua Modbus/SNMP …" written by the agent (config-prompt.md) and again by commWords (IB2600603983, 21/11/2026).
const BMS = new RegExp(`\\s*${BMS_NOTE.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}`, "g");

// One string: each distinct MK / BMS sentence kept once, at its first place. Returns [text, removed MK, removed BMS].
export function dedupeNote(s) {
  if (typeof s !== "string") return [s, 0, 0];
  const seen = new Set();
  let mk = 0, bms = 0;
  let out = s.replace(VERSION_NOTE, (m) => { const k = m.trim(); if (!seen.has(k)) { seen.add(k); return m; } mk++; return ""; });
  let first = true;
  out = out.replace(BMS, (m) => { if (first) { first = false; return m; } bms++; return ""; });
  return [out, mk, bms];
}
// A result (or one size's result), changed in place. Counts what went, and where.
export function dedupeResult(result, where = "") {
  const st = { mk: 0, mkFields: 0, bms: 0, bmsFields: 0, codeLines: 0, places: [] };
  const fix = (o, k, at) => {
    const [v, mk, bms] = dedupeNote(o[k]);
    if (!mk && !bms) return;
    o[k] = v; st.places.push(at);
    if (mk) { st.mk += mk; st.mkFields++; }
    if (bms) { st.bms += bms; st.bmsFields++; }
  };
  for (const c of result?.configs || []) {
    const name = `${where}#${c.rank ?? "?"}`;
    for (const x of c.checks || []) {
      fix(x, "note", `${name} ${x.item}`);
      for (const p of x.parts || []) fix(p, "note", `${name} ${x.item}/${p.item}`);
      if (x.codeWas) fix(x.codeWas, "note", `${name} ${x.item} (codeWas)`);
    }
  }
  // notes[] identical lines (an older check() added "Kiểm tra bằng code: …" each run): the same text twice, the first stays.
  // Lines that differ (another count) are not repeats and stay.
  const notes = result?.notes;
  if (Array.isArray(notes)) {
    const seen = new Set(), keep = notes.filter((n) => typeof n !== "string" || !CODE_LINE.test(n) || (!seen.has(n) && seen.add(n)));
    if (keep.length < notes.length) { st.codeLines += notes.length - keep.length; st.places.push(`${where} notes[]`); result.notes = keep; }
  }
  return st;
}
export function dedupeMatch(data) {
  const r = data?.result, all = { mk: 0, mkFields: 0, bms: 0, bmsFields: 0, codeLines: 0, places: [] };
  const add = (s) => { for (const k of ["mk", "mkFields", "bms", "bmsFields", "codeLines"]) all[k] += s[k]; all.places.push(...s.places); };
  if (r?.sizes) for (const z of r.sizes) { if (z.result) add(dedupeResult(z.result, `máy ${z.label || z.kva || "?"} `)); }
  else if (r) add(dedupeResult(r));
  return all;
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("dedupe-notes.mjs")) {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i < 0 ? null : process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true; };
  const write = !!arg("write"), key = arg("key");
  const docs = key ? [{ id: key, data: await doc("configmatch", key) }] : await allDocs("configmatch");
  const tot = { n: 0, mk: 0, mkFields: 0, bms: 0, bmsFields: 0, codeLines: 0 };
  const rows = [];
  for (const d of docs) {
    if (!d.data) continue;
    const data = JSON.parse(JSON.stringify(d.data));
    const s = dedupeMatch(data);
    if (!s.mk && !s.bms && !s.codeLines) continue;
    tot.n++; for (const k of ["mk", "mkFields", "bms", "bmsFields", "codeLines"]) tot[k] += s[k];
    console.log(`${d.id}: bỏ ${s.mk} câu MK lặp ở ${s.mkFields} ghi chú, ${s.bms} câu BMS lặp ở ${s.bmsFields} ghi chú, ${s.codeLines} dòng "Kiểm tra bằng code" cũ`);
    if (arg("verbose")) for (const p of s.places) console.log(`   ${p}`);
    rows.push({ coll: "configmatch", id: d.id, data });
  }
  console.log(`\n${docs.length} gói có configmatch; ${tot.n} gói có lặp: ${tot.mk} câu MK lặp ở ${tot.mkFields} ghi chú, ${tot.bms} câu BMS lặp ở ${tot.bmsFields} ghi chú, ${tot.codeLines} dòng "Kiểm tra bằng code" cũ.`);
  if (write && rows.length) {
    // `at` stays: the result is the same suggestion, only its repeated words are gone.
    for (let i = 0; i < rows.length; i += 5) console.log(await post(rows.slice(i, i + 5)));
  } else if (!write) console.log("(--dry: chưa ghi gì; thêm --write để ghi)");
}
