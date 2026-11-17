const fs = require("fs");
const { C, S } = require("./load.cjs")(process.argv[2]);
const all = JSON.parse(fs.readFileSync(__dirname + "/all.json", "utf8"));
const cnt = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n);
const top = (m, n = 25) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
const nums = (v) => (String(v).replace(/(\d),(\d{3})/g, "$1$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
// a. loose label mappings that captured values
const loose = { eff: /thermal|overall|electrical efficiency|total/i, speed: /torque|扭矩|idle|怠速/i, pf: /datos|t[eé]cnic/i, start: /soft|limit/i, coolant: /heat|temer|charge air/i, compr: /micro|pilot/i, oil: /pressure|consum|耗/i, voltage: /battery|电池|control/i, weight: /net|gross|dry|wet|净|毛/i };
console.log("== a. Nhan cot long leo co thuc su lay gia tri ==");
for (const [k, re] of Object.entries(loose)) { const m = new Map(); let n = 0, tot = 0; for (const o of all) for (const x of o.specs || []) if (x.key === k) { tot++; if (re.test(x.label)) { n++; cnt(m, x.label.slice(0, 40).toLowerCase()); } } console.log(`  ${k}: ${n}/${tot}`, top(m, 5).map((x) => `"${x[0]}"x${x[1]}`).join(", ")); }
// b. emission classes
const em = new Map();
const emNorm = (v) => { const s = String(v).toLowerCase(); if (/国\s*[二ⅱ]|国ii\b|china\s*(ii|2)\b|\bt2\b|gb.*ii\b/.test(s) && !/iii|ⅲ|三/.test(s)) return "CN Stage II"; if (/国\s*[三ⅲ]|国iii|china\s*(iii|3)|\bt3\b/.test(s)) return "CN Stage III"; if (/国\s*[四ⅳ]|china\s*(iv|4)|\bt4\b/.test(s) && !/tier/.test(s)) return "CN Stage IV"; if (/tier\s*4|t4f/.test(s)) return "EPA Tier 4"; if (/tier\s*3/.test(s)) return "EPA Tier 3"; if (/tier\s*2/.test(s)) return "EPA Tier 2"; if (/stage\s*v\b/.test(s)) return "EU Stage V"; if (/stage\s*iii\s*a|stage\s*3a|iiia/.test(s)) return "EU Stage IIIA"; if (/stage\s*ii\b|euro\s*(ii|2)\b|eu\s*2/.test(s)) return "EU Stage II / Euro 2"; if (/exempt|non-?road|unregulated|none|n\/a/.test(s)) return "khong quy dinh / mien"; return "KHONG PHAN LOAI DUOC: " + s.slice(0, 18); };
let emT = 0; for (const o of all) for (const x of o.specs || []) if (x.key === "emission") { emT++; cnt(em, emNorm(x.value)); }
console.log("\n== b. Khi thai ==", emT, "gia tri:", top(em, 16).map((x) => x.join("=")).join(" | "));
// c. ambiguous fuel values
let amb = 0, nounit = 0;
for (const o of all) { if (o.kind !== "engine" || !o.power) continue; const kW = (o.power.prime || o.power.rated || o.power.standby).kW; for (const x of o.specs || []) if (x.key === "fuel") { const t = (x.label + " " + x.value).toLowerCase(); if (/g\s*\/\s*\(?kw|g\/kwh|kg\/kw|l\s*\/\s*h|lph|litres?\/h|l\/hr|\(l\)|m3|m³|gal/.test(t)) continue; nounit++; const n = nums(x.value)[0]; if (n >= 150 && n <= 280 && kW && n >= kW * 0.17 && n <= kW * 0.36) amb++; } }
console.log("\n== c. Tieu hao khong don vi:", nounit, "| trong do so vua hop L/h vua hop g/kWh (khong the phan biet):", amb);
// d. single-phase / pf=1 rows: adjacent equal numbers
const np = all.filter((o) => o.kind === "engine" && !o.own && !o.power && o.line);
let eqPair = 0, hasNum = 0; const ex = [];
for (const o of np) { const c = C.cellsOf(o.line).map((x) => (/^\d+(\.\d+)?$/.test(String(x).replace(/\s|kva|kw/gi, "")) ? Number(String(x).replace(/\s|kva|kw/gi, "")) : null)); if (c.some((x) => x != null)) hasNum++; let hit = false; for (let i = 0; i + 1 < c.length; i++) if (c[i] != null && c[i] === c[i + 1] && c[i] >= 1 && c[i] <= 60) hit = true; if (hit) { eqPair++; if (ex.length < 5) ex.push(`${o.supplierId} | ${String(o.line).slice(0, 140)}`); } }
console.log("\n== d. Dong khong doc duoc cong suat:", np.length, "| co o so:", hasNum, "| co cap so bang nhau lien ke <=60 (kW = kVA, 1 pha / cos phi 1):", eqPair); for (const e of ex) console.log("     ", e);
// single number power only
let single = 0; for (const o of np) { const cells = C.cellsOf(o.line); const n = cells.filter((x) => /^\d+(\.\d+)?\s*(kva|kw)?$/i.test(String(x).trim())).length; if (n >= 1) single++; } console.log("   co it nhat 1 o so don (co the la cong suat 1 don vi):", single);
// e. small gensets: phase info and fuel type
const small = all.filter((o) => o.kind === "engine" && !o.own && o.power && ((o.power.prime || o.power.rated || o.power.standby).kVA || (o.power.prime || o.power.rated || o.power.standby).kW / 0.8) < 30);
console.log("\n== e. Dong to may < 30 kVA:", small.length, "| co so pha:", small.filter((o) => o.specs.some((x) => x.key === "phase")).length, "| co dien ap:", small.filter((o) => o.specs.some((x) => x.key === "voltage")).length, "| co khoi dong:", small.filter((o) => o.specs.some((x) => x.key === "start")).length, "| co lam mat:", small.filter((o) => o.specs.some((x) => x.key === "cooling")).length);
const bands = [[0, 30], [30, 100], [100, 300], [300, 700], [700, 1500], [1500, 1e9]]; const bc = new Map();
for (const o of all) { if (o.kind !== "engine" || o.own || !o.power) continue; const p = o.power.prime || o.power.rated || o.power.standby; const k = p.kVA || p.kW / 0.8; const b = bands.find(([a, z]) => k >= a && k < z); cnt(bc, b.join("-")); }
console.log("   dong to may theo dai kVA:", [...bc].map((x) => x.join("=")).join(", "));
// f. fuel type of product lines
const fuel = new Map(); for (const s of S) for (const p of s.productLines || []) if (p.kind === "genset") cnt(fuel, String(p.fuel)); console.log("\n== f. productLines to may theo nhien lieu:", top(fuel).map((x) => x.join("=")).join(", "));
// g. controllers
let cs = 0, cm = 0; const cb = new Map(); for (const s of S) for (const c of s.controllers || []) { cs++; if (c.model) cm++; cnt(cb, c.brand); }
console.log("== g. controllers[]:", cs, "muc, co model:", cm, pct(cm, cs), "| hang:", top(cb, 12).map((x) => x.join("=")).join(", "));
// h. open vs silent ambiguity in dims/weight
let dimN = 0, dimCtx = 0; for (const o of all) for (const x of o.specs || []) if (x.key === "dims" || x.key === "weight") { dimN++; if (/open|silent|canopy|sound|开架|静音|敞开|container|集装箱/i.test(x.label + " " + (o.title || ""))) dimCtx++; }
console.log("== h. kich thuoc/khoi luong:", dimN, "gia tri | co ghi tran / vo cach am (trong nhan cot hoac ten bang):", dimCtx, pct(dimCtx, dimN));
