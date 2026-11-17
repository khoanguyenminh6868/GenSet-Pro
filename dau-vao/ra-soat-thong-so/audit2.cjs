const { C, S } = require("./load.cjs")(process.argv[2]);
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 25) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const byId = new Map(S.map((s) => [s.id, s]));
let all = [];
const perSup = new Map();
let rowTableRows = 0; const usedRows = new Set();
for (const s of S) {
  if (s.status === "incomplete") continue;
  const rows = C.fromSupplier(s);
  perSup.set(s.id, rows.length);
  for (const o of rows) { all.push(o); if (o.row != null) usedRows.add(`${s.id}|${o.table}|${o.row}`); }
}
let totalRows = 0; for (const s of S) for (const t of s.specTables || []) totalRows += t.rows.length;
const eng = all.filter((o) => o.kind === "engine"), alt = all.filter((o) => o.kind === "alternator");
console.log("== SẢN LƯỢNG ĐỌC ==");
console.log("dòng bảng:", totalRows, "| bản ghi đọc ra:", all.length, "(động cơ", eng.length, ", đầu phát", alt.length + ")");
console.log("dòng bảng ngang sinh ra bản ghi:", usedRows.size);
const zero = [...byId.values()].filter((s) => s.specTables?.length && !perSup.get(s.id));
console.log("NCC có bảng nhưng đọc ra 0 bản ghi:", zero.length, zero.slice(0, 40).map((s) => `${s.id}(${s.role[0]}${s.specTables.reduce((n, t) => n + t.rows.length, 0)})`).join(" "));
const low = [...byId.values()].filter((s) => s.specTables?.length).map((s) => { const r = s.specTables.reduce((n, t) => n + t.rows.length, 0); return [s.id, s.role, r, perSup.get(s.id) || 0]; }).filter((x) => x[2] >= 200 && x[3] / x[2] < 0.03);
console.log("NCC ≥200 dòng mà <3% dòng đọc ra:", low.length, low.sort((a,b)=>b[2]-a[2]).slice(0, 30).map((x) => `${x[0]}[${x[1].split("_")[0]}] ${x[3]}/${x[2]}`).join("; "));

// genset-level view: engine rows from non-engine-maker tables
const g = eng.filter((o) => !o.own);
const has = (o, k) => (o.specs || []).some((x) => x.key === k);
console.log("\n== ĐỘ PHỦ TRÊN DÒNG TỔ MÁY (dòng có model động cơ, không phải bảng của hãng động cơ):", g.length, "==");
const P = { prime: 0, standby: 0, rated: 0, none: 0, both: 0, kvaOnly: 0, kwOnly: 0, pair: 0 };
for (const o of g) {
  if (!o.power) { P.none++; continue; }
  if (o.power.prime) P.prime++; if (o.power.standby) P.standby++; if (o.power.rated) P.rated++;
  if (o.power.prime && o.power.standby) P.both++;
  const p = o.power.prime || o.power.standby || o.power.rated;
  if (p.kVA && p.kW) P.pair++; else if (p.kVA) P.kvaOnly++; else P.kwOnly++;
}
console.log("công suất: không đọc được", P.none, pct(P.none, g.length), "| có prime", P.prime, pct(P.prime, g.length), "| có standby", P.standby, pct(P.standby, g.length), "| cả hai", P.both, pct(P.both, g.length), "| chỉ 'rated' (không rõ chế độ)", P.rated, pct(P.rated, g.length));
console.log("  đơn vị: cặp kVA+kW", P.pair, "| chỉ kVA", P.kvaOnly, "| chỉ kW", P.kwOnly);
const fq = new Map(); for (const o of g) cnt(fq, String(o.freq)); console.log("tần số:", top(fq).map((x) => `${x[0]}=${x[1]} (${pct(x[1], g.length)})`).join(", "));
console.log("có model tổ máy:", g.filter((o) => o.genset).length, pct(g.filter((o) => o.genset).length, g.length), "| có đầu phát cùng dòng:", g.filter((o) => o.other).length, pct(g.filter((o) => o.other).length, g.length), "| biết hãng động cơ:", g.filter((o) => o.makes.length).length, pct(g.filter((o) => o.makes.length).length, g.length));
const keys = Object.keys(C.SPEC);
console.log("độ phủ từng thông số (số dòng tổ máy có giá trị):");
const cov = keys.map((k) => [k, g.filter((o) => has(o, k)).length]).sort((a, b) => b[1] - a[1]);
for (const [k, n] of cov) console.log("  ", k.padEnd(11), C.SPEC[k].vi.padEnd(30), String(n).padStart(6), pct(n, g.length));
// supplier-level coverage: suppliers with at least one row carrying key
const gs = new Map(); for (const o of g) { if (!gs.has(o.supplierId)) gs.set(o.supplierId, new Set()); for (const x of o.specs || []) gs.get(o.supplierId).add(x.key); }
console.log("số NCC (có dòng tổ máy):", gs.size, "| NCC có ít nhất 1 dòng mang thông số:");
console.log("  ", keys.map((k) => `${k}=${[...gs.values()].filter((v) => v.has(k)).length}`).join(", "));

// --- unit / format variety per key
const shape = (v) => String(v).toLowerCase().replace(/\d+([.,]\d+)?/g, "N").replace(/\s+/g, "").slice(0, 28);
console.log("\n== ĐỊNH DẠNG GIÁ TRỊ TRONG CÙNG MỘT THÔNG SỐ (mẫu hình, N = số) ==");
for (const k of ["fuel", "fuel75", "disp", "bore", "cyl", "weight", "dims", "noise", "voltage", "speed", "gov", "emission", "asp", "start", "cooling", "tank", "engPower", "phase", "pf", "insul", "ip", "excit", "controller"]) {
  const m = new Map(); let n = 0;
  for (const o of all) for (const x of o.specs || []) if (x.key === k) { cnt(m, shape(x.value)); n++; }
  console.log(`  ${k} (${n} giá trị, ${m.size} mẫu hình):`, top(m, 12).map((x) => `${x[0]}×${x[1]}`).join("  "));
}
// fuel units
const fu = new Map();
for (const o of all) for (const x of o.specs || []) if (/^fuel/.test(x.key)) {
  const t = (x.label + " " + x.value).toLowerCase();
  const u = /g\s*\/\s*\(?kw|g\/kwh|kg\/kw/.test(t) ? "g/kWh" : /l\s*\/\s*h|lph|litres?\/h|l\/hr|\(l\)|lít/.test(t) ? "L/h" : /m3|m³/.test(t) ? "m³/h (gas)" : /gal/.test(t) ? "gal/h" : /%/.test(x.value) ? "%" : "KHÔNG GHI ĐƠN VỊ";
  cnt(fu, u);
}
console.log("\nđơn vị tiêu hao nhiên liệu:", top(fu).map((x) => x.join("=")).join(", "));
const lo = new Map();
for (const o of all) for (const x of o.specs || []) if (x.key === "fuel") { const t = x.label.toLowerCase(); cnt(lo, /100\s*%|full|满载|4\/4/.test(t) ? "ghi 100% tải" : /75|50|25|3\/4|1\/2/.test(t) ? "nhiều mức trong 1 ô" : /prime|prp/.test(t) ? "ghi theo prime" : /standby|esp/.test(t) ? "ghi theo standby" : "KHÔNG GHI MỨC TẢI"); }
console.log("mức tải của cột tiêu hao (key fuel):", top(lo).map((x) => x.join("=")).join(", "));
const nz = new Map();
for (const o of all) for (const x of o.specs || []) if (x.key === "noise") { const t = (x.label + " " + x.value).toLowerCase(); cnt(nz, /7\s*m/.test(t) ? "@7m" : /1\s*m\b|lp1m/.test(t) ? "@1m" : /\d+\s*m\b/.test(t) ? "@khác" : /lwa|sound power/.test(t) ? "LwA" : "KHÔNG GHI KHOẢNG CÁCH"); }
console.log("độ ồn:", top(nz).map((x) => x.join("=")).join(", "));
require("fs").writeFileSync(__dirname + "/all.json", JSON.stringify(all.map(({ header, ...o }) => o)));
