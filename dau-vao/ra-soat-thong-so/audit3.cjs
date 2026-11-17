const fs = require("fs");
const { C, S } = require("./load.cjs")(process.argv[2]);
const all = JSON.parse(fs.readFileSync(__dirname + "/all.json", "utf8"));
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 25) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const nums = (v) => (String(v).replace(/(\d),(\d{3})/g, "$1$2").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
const eng = all.filter((o) => o.kind === "engine");

// --- A. engine constants disagreeing across rows for the same model key
const byModel = new Map();
for (const o of eng) { const k = C.keyOf(o.model); if (!byModel.has(k)) byModel.set(k, []); byModel.get(k).push(o); }
console.log("== A. MAU THUAN HANG SO DONG CO (cung model, khac gia tri) ==");
console.log("model dong co (khoa chuan hoa):", byModel.size, "| xuat hien o >=2 NCC:", [...byModel.values()].filter((u) => new Set(u.map((x) => x.supplierId)).size >= 2).length);
const canon = {
  cyl: (v) => { const m = String(v).match(/\d{1,2}/); return m ? Number(m[0]) : null; },
  disp: (v) => { const n = nums(v)[0]; if (n == null) return null; return /cc|ml/i.test(v) || n > 150 ? Math.round(n / 100) / 10 : Math.round(n * 10) / 10; },
  bore: (v) => { const n = nums(v); return n.length >= 2 ? `${Math.round(n[0])}x${Math.round(n[1])}` : null; },
  compr: (v) => { const n = nums(v)[0]; return n ? Math.round(n * 10) / 10 : null; },
};
for (const k of Object.keys(canon)) {
  let withVal = 0, multi = 0, conflict = 0; const ex = [];
  for (const [mk, uses] of byModel) {
    const vals = new Map();
    for (const u of uses) for (const x of u.specs || []) if (x.key === k) { const c = canon[k](x.value); if (c != null) { if (!vals.has(c)) vals.set(c, new Set()); vals.get(c).add(u.supplierId); } }
    if (!vals.size) continue; withVal++;
    const sup = new Set([...vals.values()].flatMap((s) => [...s]));
    if (sup.size >= 2) { multi++; if (vals.size >= 2) { conflict++; if (ex.length < 8) ex.push(`${uses[0].model}: ${[...vals].map(([v, s]) => `${v}(${s.size} NCC)`).join(" / ")}`); } }
  }
  console.log(`  ${k}: model co gia tri ${withVal}, co >=2 NCC ghi ${multi}, MAU THUAN ${conflict} (${pct(conflict, multi)})`);
  for (const e of ex) console.log("      ", e);
}

// --- B. model identity
console.log("\n== B. NHAN DANG MODEL ==");
const names = new Map(); for (const [k, u] of byModel) names.set(k, new Set(u.map((x) => x.model)));
console.log("khoa co >=2 cach viet (da gop nho keyOf):", [...names.values()].filter((s) => s.size >= 2).length);
const loose = new Map();
const looseKey = (k) => k.replace(/O/g, "0").replace(/[IL]/g, "1").replace(/[()（）\[\]*#/,]/g, "");
for (const k of byModel.keys()) { const lk = looseKey(k); if (!loose.has(lk)) loose.set(lk, []); loose.get(lk).push(k); }
const split = [...loose.values()].filter((v) => v.length >= 2);
console.log("nhom model chi khac O/0, I/L/1, dau ngoac (CHUA gop):", split.length, "vd:", split.slice(0, 14).map((v) => v.join("~")).join("; "));
const stripped = new Map();
for (const k of byModel.keys()) { const s = k.replace(/^(CUMMINS|PERKINS|WEICHAI|YUCHAI|SDEC|VOLVO|DEUTZ|DOOSAN|MTU|BAUDOUIN|MITSUBISHI|KUBOTA|YANMAR|ISUZU|RICARDO|FAWDE|DCEC|CCEC)/, ""); if (s !== k && byModel.has(s)) cnt(stripped, `${k}->${s}`); }
console.log("model mang tien to hang trung voi model khong tien to:", stripped.size, [...stripped.keys()].slice(0, 8).join("; "));
const junk = [...byModel.entries()].filter(([k, u]) => /^\d+(KW|KVA|HP|V|HZ|A|MM|KG|L)$/.test(k) || /^(IP|ISO|CE|GB|EN)\d/.test(k) || /^\d{2,4}[X*]\d{2,4}/.test(k) || k.length > 24);
console.log("'model' dang ngo (don vi, tieu chuan, qua dai):", junk.length, junk.slice(0, 25).map(([k, u]) => `${u[0].model}[${u[0].supplierId}]`).join("; "));
const noMake = [...byModel.values()].filter((u) => !u.some((x) => x.makes.length));
console.log("model dong co KHONG biet hang:", noMake.length, pct(noMake.length, byModel.size), "| trong do o >=2 NCC:", noMake.filter((u) => new Set(u.map((x) => x.supplierId)).size >= 2).length);
const multiMake = [...byModel.values()].map((u) => [u[0].model, new Set(u.flatMap((x) => x.makes.map((m) => m.name)))]).filter(([, s]) => s.size >= 2);
console.log("model bi gan >=2 hang khac nhau:", multiMake.length, pct(multiMake.length, byModel.size), multiMake.slice(0, 15).map(([m, s]) => `${m}:${[...s].join("/")}`).join("; "));

// --- C. plausibility
console.log("\n== C. KIEM TRA HOP LY VAT LY ==");
const g = eng.filter((o) => !o.own && o.power);
let both = 0, ratioBad = 0, eq = 0; const rex = [];
const pfm = new Map();
for (const o of g) {
  for (const p of Object.values(o.power)) if (p.kVA && p.kW) cnt(pfm, (p.kW / p.kVA).toFixed(2));
  const a = o.power.prime, b = o.power.standby; if (!a || !b) continue; both++;
  if (!(a.kVA && b.kVA) && !(a.kW && b.kW)) continue;
  const x = a.kVA && b.kVA ? a.kVA : a.kW, y = a.kVA && b.kVA ? b.kVA : b.kW;
  const r = y / x;
  if (r === 1) eq++;
  else if (r < 1.03 || r > 1.2) { ratioBad++; if (rex.length < 8) rex.push(`${o.supplierId} ${o.genset || o.model}: prime ${x} / standby ${y} (x${r.toFixed(2)})`); }
}
console.log("cos phi ngam (kW/kVA):", top(pfm, 12).map((x) => `${x[0]}x${x[1]}`).join("  "));
console.log("dong co ca prime+standby:", both, "| standby = prime:", eq, pct(eq, both), "| ti le ngoai 1,03-1,20:", ratioBad, pct(ratioBad, both));
for (const e of rex) console.log("     ", e);
let fl = 0, flBad = 0; const fex = []; const sfc = [];
for (const o of g) {
  const kW = (o.power.prime || o.power.rated || o.power.standby).kW; if (!kW) continue;
  for (const x of o.specs || []) if (x.key === "fuel") {
    const t = (x.label + " " + x.value).toLowerCase(); const n = nums(x.value)[0]; if (n == null) continue;
    const isG = /g\s*\/\s*\(?kw|g\/kwh/.test(t) || (n >= 150 && n <= 260 && !/l\s*\/\s*h/.test(t)); if (isG) continue;
    fl++; const r = n / kW; sfc.push(r);
    if (r < 0.17 || r > 0.36) { flBad++; if (fex.length < 8) fex.push(`${o.supplierId} ${o.genset || o.model}: ${x.value} "${x.label.slice(0, 30)}" voi ${kW} kW -> ${r.toFixed(2)} L/kWh`); }
  }
}
sfc.sort((a, b) => a - b);
console.log("tieu hao L/h co kW di kem:", fl, "| ngoai khoang 0,17-0,36 L/kWh:", flBad, pct(flBad, fl), "| trung vi", sfc[Math.floor(sfc.length / 2)]?.toFixed(3), "p5", sfc[Math.floor(sfc.length * 0.05)]?.toFixed(3), "p95", sfc[Math.floor(sfc.length * 0.95)]?.toFixed(3));
for (const e of fex) console.log("     ", e);
const bad = new Map();
const BADRE = { cooling: /ats|control|module|screen|panel/i, start: /soft|limit/i, excit: /bearing/i };
for (const o of all) for (const x of o.specs || []) if (BADRE[x.key]?.test(x.value)) cnt(bad, `${x.key}: "${x.value.slice(0, 40)}" [${o.supplierId}]`);
console.log("gia tri nghi lech cot:", [...bad.values()].reduce((a, b) => a + b, 0), top(bad, 10).map((x) => `${x[0]}x${x[1]}`).join("; "));

// --- D. duplicates
console.log("\n== D. TRUNG LAP ==");
let dupRows = 0, totalRows = 0, dupTables = 0, tables = 0;
for (const s of S) {
  const seen = new Set(), tseen = new Set();
  for (const t of s.specTables || []) {
    tables++; const sig = (t.header || []).join("\n") + "\n" + t.rows.join("\n"); if (tseen.has(sig)) dupTables++; tseen.add(sig);
    for (const r of t.rows) { totalRows++; const k = String(r).replace(/\s+/g, " ").trim(); if (k.length > 12) { if (seen.has(k)) dupRows++; seen.add(k); } }
  }
}
console.log("bang trung nguyen van trong cung NCC:", dupTables, pct(dupTables, tables), "| dong trung nguyen van trong cung NCC:", dupRows, pct(dupRows, totalRows));
const gm = new Map();
for (const o of eng) if (o.genset && o.power) { const k = o.supplierId + "|" + C.keyOf(o.genset); const p = o.power.prime || o.power.rated || o.power.standby; const v = p.kVA || p.kW; if (!gm.has(k)) gm.set(k, new Set()); gm.get(k).add(v + "|" + (o.freq || "")); }
const gconf = [...gm].filter(([, s]) => s.size >= 2);
console.log("model to may (cung NCC) co >=2 muc cong suat khac nhau:", gconf.length, pct(gconf.length, gm.size), gconf.slice(0, 6).map(([k, s]) => `${k}:{${[...s].join(",")}}`).join("; "));

// --- E. sources, freshness, product lines
console.log("\n== E. NGUON VA DO TUOI ==");
const tier = new Map(), month = new Map(), off = new Map(); let nsrc = 0;
for (const s of S) for (const x of s.sources || []) { nsrc++; cnt(tier, x.tier); cnt(month, String(x.accessedAt).slice(0, 7)); cnt(off, String(x.official)); }
console.log("nguon:", nsrc, "| tier:", top(tier).map((x) => x.join("=")).join(", "), "| official:", top(off).map((x) => x.join("=")).join(", "));
console.log("thang doc nguon:", [...month].sort().map((x) => x.join("=")).join(", "));
const rating = new Map(), unit = new Map(); let pl = 0, plPower = 0, plFreq = 0, plVolt = 0, plEm = 0, plStd = 0, plEngModels = 0, plAlt = 0;
for (const s of S) for (const p of s.productLines || []) { pl++; if (p.power) { plPower++; cnt(rating, p.power.rating); cnt(unit, p.power.unit); } if (p.frequency?.length) plFreq++; if (p.voltage?.length) plVolt++; if (p.emission?.length) plEm++; if (p.standards?.length) plStd++; if (p.engineModels?.length) plEngModels++; if (p.alternatorMakes?.length) plAlt++; }
console.log("productLines:", pl, "| co cong suat:", plPower, pct(plPower, pl), "| rating:", top(rating).map((x) => x.join("=")).join(", "), "| don vi:", top(unit).map((x) => x.join("=")).join(", "));
console.log("  co tan so:", pct(plFreq, pl), "| dien ap:", pct(plVolt, pl), "| khi thai:", pct(plEm, pl), "| tieu chuan:", pct(plStd, pl), "| engineModels:", pct(plEngModels, pl), "| alternatorMakes:", pct(plAlt, pl));
const fields = { website: (s) => !!s.website, founded: (s) => s.founded != null, certifications: (s) => s.certifications?.length, contacts: (s) => s.contacts?.length, controllers: (s) => s.controllers?.length, "hq.city": (s) => s.hq?.city, exportMarkets: (s) => s.exportMarkets?.length, "vietnam.distributors": (s) => s.vietnam?.distributors?.length, specTables: (s) => s.specTables?.length };
console.log("do phu truong ho so:", Object.entries(fields).map(([k, f]) => `${k}=${pct(S.filter(f).length, S.length)}`).join(", "));
const cert = new Map(); for (const s of S) for (const c of s.certifications || []) cnt(cert, c.name.toLowerCase().replace(/\s+/g, "")); console.log("ten chung nhan khac nhau:", cert.size, "| vd:", top(cert, 14).map((x) => x.join("x")).join(", "));
const miss = new Map(); for (const s of S) for (const m of s.missing || []) cnt(miss, m.toLowerCase().slice(0, 40)); console.log("missing[] khac nhau:", miss.size, "tren", [...miss.values()].reduce((a, b) => a + b, 0), "muc (van ban tu do)");
// by country coverage
const cc = new Map();
for (const s of S) { const k = s.country === "CN" ? "CN" : "ngoai CN"; const e = cc.get(k) || { n: 0, tbl: 0, rows: 0 }; e.n++; if (s.specTables?.length) e.tbl++; e.rows += (s.specTables || []).reduce((n, t) => n + t.rows.length, 0); cc.set(k, e); }
console.log("theo nuoc:", [...cc].map(([k, e]) => `${k}: ${e.n} NCC, ${e.tbl} co bang, ${e.rows} dong`).join(" | "));
const rr = new Map();
for (const s of S) { const e = rr.get(s.role) || { n: 0, tbl: 0, rows: 0, used: 0 }; e.n++; if (s.specTables?.length) e.tbl++; e.rows += (s.specTables || []).reduce((n, t) => n + t.rows.length, 0); rr.set(s.role, e); }
for (const o of all) { const s = S.find((x) => x.id === o.supplierId); rr.get(s.role).used++; }
console.log("theo vai tro:", [...rr].map(([k, e]) => `${k}: ${e.n} NCC, ${e.tbl} co bang, ${e.rows} dong -> ${e.used} ban ghi doc ra`).join(" | "));
