const fs = require("fs");
const { C, S } = require("./load.cjs")(process.argv[2]);
const all = JSON.parse(fs.readFileSync(__dirname + "/all.json", "utf8"));
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 25) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const band = (n) => (n < 100 ? "1-99" : n < 1001 ? "101+ crawl" : n < 2001 ? "1001+ datasheet" : n < 3001 ? "2001+ Tim NCC" : n < 4001 ? "3001+ BDK" : n < 5001 ? "4001+ OCR" : "5001+ catalog PDF");
const byId = new Map(S.map((s) => [s.id, s]));

// 1. tables yielding no record
const used = new Set(all.map((o) => `${o.supplierId}|${o.table}`));
const dark = new Map(), tot = new Map(), darkRows = new Map(), totRows = new Map(), darkSup = new Map();
for (const s of S) {
  if (s.role === "controller_maker") continue;
  (s.specTables || []).forEach((t, i) => {
    const b = `${s.role === "genset_oem" || s.role === "distributor" ? "to may" : s.role.split("_")[0]} / ${band(t.n)}`;
    cnt(tot, b); cnt(totRows, b, t.rows.length);
    if (!used.has(`${s.id}|${i}`)) { cnt(dark, b); cnt(darkRows, b, t.rows.length); cnt(darkSup, s.id, t.rows.length); }
  });
}
console.log("== 1. BANG KHONG DOC RA BAN GHI NAO (du lieu toi) ==");
for (const [b, n] of [...tot].sort()) console.log(`  ${b.padEnd(34)} bang ${dark.get(b) || 0}/${n} (${pct(dark.get(b) || 0, n)})  dong ${darkRows.get(b) || 0}/${totRows.get(b)} (${pct(darkRows.get(b) || 0, totRows.get(b))})`);
console.log("  NCC nhieu dong toi nhat:", top(darkSup, 18).map((x) => x.join("=")).join(", "));
// sample dark table headers from genset crawl band
const dh = new Map();
for (const s of S) if (s.role === "genset_oem") (s.specTables || []).forEach((t, i) => { if (!used.has(`${s.id}|${i}`) && t.n >= 101 && t.n < 1001 && t.header?.length) cnt(dh, t.header[0].slice(0, 110)); });
console.log("  tieu de bang toi hay gap (to may, crawl):"); for (const [h, n] of top(dh, 14)) console.log("     ", n, h);

// 2. duplicate rows: where
console.log("\n== 2. DONG TRUNG NGUYEN VAN: O DAU ==");
const dupBand = new Map(), dupSup = new Map(), cross = { same: 0, other: 0 };
const dupText = new Map();
for (const s of S) {
  const seen = new Map();
  for (const t of s.specTables || []) for (const r of t.rows) {
    const k = String(r).replace(/\s+/g, " ").trim(); if (k.length <= 12) continue;
    if (seen.has(k)) { cnt(dupBand, band(t.n)); cnt(dupSup, s.id); band(seen.get(k)) === band(t.n) ? cross.same++ : cross.other++; cnt(dupText, k.slice(0, 70)); } else seen.set(k, t.n);
  }
}
console.log("  theo dai nguon:", top(dupBand).map((x) => x.join("=")).join(", "), "| cung dai:", cross.same, "khac dai:", cross.other);
console.log("  NCC:", top(dupSup, 14).map((x) => x.join("=")).join(", "));
console.log("  dong lap nhieu nhat:"); for (const [k, n] of top(dupText, 10)) console.log("     ", n, k);
// duplicates among rows that are read as genset rows
const engU = all.filter((o) => o.kind === "engine" && o.line);
const seenU = new Set(); let du = 0;
for (const o of engU) { const k = o.supplierId + "|" + String(o.line).replace(/\s+/g, " ").trim(); if (seenU.has(k)) du++; seenU.add(k); }
console.log("  ban ghi dong co doc ra tu dong trung (cung NCC):", du, pct(du, engU.length));

// 3. reference coverage: popular engine models with a maker-sourced row
console.log("\n== 3. NGUON CHUAN CUA HANG (dong co / dau phat) ==");
for (const kind of ["engine", "alternator"]) {
  const m = new Map();
  for (const o of all) if (o.kind === kind) { const k = C.keyOf(o.model); const e = m.get(k) || { model: o.model, sup: new Set(), maker: false, makes: new Set() }; e.sup.add(o.supplierId); const r = byId.get(o.supplierId).role; if (r === (kind === "engine" ? "engine_maker" : "alternator_maker")) e.maker = true; for (const x of o.makes) e.makes.add(x.name); m.set(k, e); }
  for (const th of [2, 5, 10]) { const pop = [...m.values()].filter((e) => e.sup.size >= th); console.log(`  ${kind}: model dung boi >=${th} NCC: ${pop.length} | co dong tu chinh hang: ${pop.filter((e) => e.maker).length} (${pct(pop.filter((e) => e.maker).length, pop.length)})`); }
  const pop = [...m.values()].filter((e) => e.sup.size >= 10 && !e.maker).sort((a, b) => b.sup.size - a.sup.size);
  const mk = new Map(); for (const e of pop) cnt(mk, [...e.makes][0] || "?");
  console.log("    model pho bien (>=10 NCC) chua co dong hang, theo hang:", top(mk, 14).map((x) => x.join("=")).join(", "));
  console.log("    vd:", pop.slice(0, 14).map((e) => `${e.model}(${e.sup.size})`).join(", "));
}

// 4. sample: displacement conflict - parser or source?
console.log("\n== 4. MAU MAU THUAN DUNG TICH: do nguon hay do doc? ==");
const want = ["WP6D132E200", "WP10D200E200", "WP4.1D100E200"];
for (const w of want) {
  const rows = all.filter((o) => o.kind === "engine" && C.keyOf(o.model) === C.keyOf(w));
  const seen = new Set();
  for (const o of rows) { const d = (o.specs || []).find((x) => x.key === "disp"); if (!d) continue; const k = d.value; if (seen.has(k)) continue; seen.add(k); console.log(`  ${w} [${o.supplierId} n${o.n}] disp="${d.value}" nhan="${d.label}"\n     dong: ${String(o.line).slice(0, 230)}`); }
}
// 5. power: rows without power — why
console.log("\n== 5. DONG TO MAY KHONG DOC DUOC CONG SUAT ==");
const np = all.filter((o) => o.kind === "engine" && !o.own && !o.power);
const npSup = new Map(); for (const o of np) cnt(npSup, o.supplierId);
console.log("  ", np.length, "dong; NCC:", top(npSup, 12).map((x) => x.join("=")).join(", "));
for (const o of np.filter((x, i) => i % Math.ceil(np.length / 8) === 0).slice(0, 8)) console.log("     ", o.supplierId, "|", String(o.line).slice(0, 170));
// 6. freq null: does supplier state freq anywhere
const fn = all.filter((o) => o.kind === "engine" && !o.own && !o.freq);
const fnSup = new Map(); for (const o of fn) cnt(fnSup, o.supplierId);
console.log("\n== 6. KHONG RO TAN SO ==", fn.length, "dong o", fnSup.size, "NCC; nhieu nhat:", top(fnSup, 10).map((x) => x.join("=")).join(", "));
// 7. schema drift
console.log("\n== 7. SCHEMA ==");
const extra = new Map(); for (const s of S) for (const t of s.specTables || []) for (const k of Object.keys(t)) if (!["n", "title", "header", "rows"].includes(k)) cnt(extra, k + " @ " + s.id);
console.log("  khoa la trong specTables:", top(extra, 10).map((x) => x.join("=")).join(", "));
const tb = new Map(); for (const s of S) for (const t of s.specTables || []) cnt(tb, typeof t.title + "/" + (Array.isArray(t.header) ? "arr" : typeof t.header));
console.log("  kieu title/header:", top(tb).map((x) => x.join("=")).join(", "));
let emptyTitle = 0, urlTitle = 0, nt = 0; for (const s of S) for (const t of s.specTables || []) { nt++; if (!String(t.title || "").trim()) emptyTitle++; if (/^https?:|\.pdf$/i.test(String(t.title))) urlTitle++; }
console.log("  bang khong co title:", emptyTitle, pct(emptyTitle, nt), "| title la URL/ten tep:", urlTitle);
const noOfficial = S.filter((s) => (s.sources || []).every((x) => x.official === undefined)).length;
console.log("  NCC ma moi nguon chua co co 'official':", noOfficial, "/", S.length);
