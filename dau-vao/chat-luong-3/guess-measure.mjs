// chat-luong-3 chặng 1: đo từng đường đọc "đoán" của web/catalog.js trên TOÀN BỘ suppliers/cn (không lấy mẫu).
//   node guess-measure.mjs <worktree có catalog.js đã gắn nhãn> <thư mục ra>
// Bản gắn nhãn (wt-chat-luong-3, không push): mỗi bản ghi mang `guess`, mỗi thông số đọc theo vị trí mang `via`;
// GENBID_GUESS_OFF=<đường> tắt đường đó. Với mỗi đường: so main ↔ bản tắt bằng diff() của suppliers/spec-diff.mjs, rồi
// xét MỌI giá trị mất / đổi với dữ liệu của các NCC KHÁC trên main (cùng model):
//   vai động cơ / đầu phát: NCC khác đọc mã này ở cùng vai / vai kia (luật số đông ≥3 NCC và gấp ≥3 lần khi cả hai có);
//   công suất (theo model động cơ / đầu phát, cùng mức, cùng đơn vị): trùng ±2% một NCC khác = xác nhận; ≥2 NCC khác có số
//     mà mọi số lệch >15% = mâu thuẫn; còn lại "chưa rõ" (có số nhưng không đủ để phân xử) / "không đối chiếu" (không ai có);
//   thông số động cơ (xi lanh, dung tích, đường kính × hành trình, tỉ số nén, công suất động cơ): như công suất;
//   thông số tổ máy (khối lượng, kích thước, tiêu hao, dòng điện...): không có model chung để đối chiếu → chỉ TỰ KIỂM với công
//     suất của chính dòng (checkSpec của spec-diff): "hợp lý" / "vô lý" / "không kiểm được". Không phải xác nhận của nguồn khác.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [WT, OUT] = process.argv.slice(2);
const SD = await import(pathToFileURL(path.join(WT, "suppliers", "spec-diff.mjs")).href);
fs.mkdirSync(OUT, { recursive: true });

function side(dir, off) {
  const win = { GENBID_GUESS_OFF: off || "" };
  for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) {
    const p = path.join(dir, "web", f);
    if (fs.existsSync(p)) new Function("window", "module", fs.readFileSync(p, "utf8"))(win, undefined);
  }
  const cn = path.join(dir, "suppliers", "cn");
  const S = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8")));
  return { C: win.GenbidCatalog, S };
}
const mainDir = SD.checkoutRef(process.env.BASE || "7d632e30", WT);
const A = SD.records(side(mainDir));
const T0 = SD.records(side(WT, ""));

// ---- 1. ai đi qua đường nào (bản gắn nhãn, không tắt gì) ----
const PATHS = {
  E2: "Động cơ: tiêu đề có cột động cơ nhưng không dòng tiêu đề nào đặt nó đúng ô (tiêu đề nhiều tầng / khác độ rộng): chọn mã đầu tiên không dạng đầu phát",
  E3: "Động cơ: không có ô tiêu đề động cơ (chỉ hãng động cơ trong tiêu đề): chọn mã đầu tiên không dạng đầu phát",
  E4: "Động cơ: bảng của hãng động cơ (engine_maker), mã đầu tiên của dòng",
  A2: "Đầu phát: tiêu đề có cột đầu phát nhưng không đặt đúng ô: chọn theo dạng mã (ALT_CODE) hoặc mã duy nhất sau động cơ",
  A3: "Đầu phát: không có ô tiêu đề đầu phát: mã dạng đầu phát sau động cơ",
  G2: "Model tổ máy: ô 0 / 1 là mã, không có tiêu đề model trên nó",
  PW: "Công suất: tiêu đề không khớp dòng → ghép hai ô kề nhau đúng hệ số 0,8 (powersIn strict)",
  PWC: "Công suất: tiêu đề cột không ghi mức, mức lấy từ phần còn lại của tiêu đề / tên bảng",
  S2: "Thông số: dòng dài hơn tiêu đề 1 ô, ô đầu là mã → lệch 1 ô",
  WE: "Thông số: đi từng ô từ ô động cơ / đầu phát (tiêu đề khác độ rộng)",
  WG: "Thông số: đi từng ô từ model tổ máy ở ô 0",
  WR: "Thông số: đi từng ô từ ô cuối (không ô nào biết vị trí)",
  L1: "Bảng nhãn: \"Model\" trơ, vai theo thứ tự (Details) hoặc dạng mã",
  L2: "Bảng nhãn: \"Model\" kề dòng động cơ là động cơ (himoinsa, hipower)",
  L3: "Bảng nhãn: ô \"a/b\" không đơn vị ghép theo tỉ số 1,15–1,35",
  FL: "Dòng máy Tìm NCC: số còn lại của dòng ghép với số của dòng máy theo tỉ số (rowPowerOf)",
};
const GUARDS = {
  L3B: "Chốt: ô \"a/b\" chỉ ghép khi nhãn ghi mức / đơn vị / output (không chỉ chữ power trong tên hãng)",
  ONE: "Chốt: tiêu đề có cả cột động cơ và đầu phát mà dòng chỉ có 1 mã ngoài model tổ máy → để thiếu cả hai",
  LROW: "Chốt: dòng bảng tự là cặp nhãn | giá trị (ô \"型号\" / \"Model\" giữa dòng) → để thiếu",
  WCHK: "Chốt: dòng điện / điện áp đọc theo vị trí phải khớp công suất của dòng",
};
const tagStat = Object.fromEntries(Object.keys(PATHS).map((k) => [k, { rec: 0, tables: new Set(), sups: new Map(), specs: 0 }]));
const tabKey = (o) => `${o.supplierId}|${o.n}|${o.table}`;
for (const o of T0.values()) {
  const tags = new Set(o.guess || []);
  for (const s of o.specs || []) if (s.via) for (const v of s.via.split("+")) if (tagStat[v]) { tagStat[v].specs++; tags.add(v); }
  for (const g of tags) {
    const t = tagStat[g]; if (!t) continue;
    t.rec++; t.tables.add(tabKey(o)); t.sups.set(o.supplierId, (t.sups.get(o.supplierId) || 0) + 1);
  }
}
const allTables = new Set([...T0.values()].map(tabKey)), allSups = new Set([...T0.values()].map((o) => o.supplierId));

// ---- 2. tham chiếu của các NCC khác (main) ----
const RK = (m) => String(m || "").toUpperCase().replace(/[\s._/-]+/g, "");
const roles = new Map();       // model → { engine: Set(sup), alternator: Set(sup) }
const powerRef = new Map();    // kind|model|rating|unit → Map(sup → [v])
const specRef = new Map();     // model|key → Map(sup → [v])
const ENG_KEYS = new Set(["cyl", "disp", "bore", "compr", "engPower"]);
const firstNum = (v) => { const m = String(v).replace(/(\d),(\d{3})(?!\d)/g, "$1$2").replace(",", ".").match(/\d+(?:\.\d+)?/); return m ? +m[0] : null; };
const specNum = (key, v) => {
  const s = String(v);
  if (key === "bore") { const n = (s.match(/\d+(?:\.\d+)?/g) || []).map(Number); return n.length >= 2 ? n[0] * 1000 + n[1] : null; }
  if (key === "disp") { const x = firstNum(s); return x == null ? null : /cc|ml/i.test(s) || x >= 400 ? Math.round(x / 100) / 10 : x; }
  if (key === "compr") return firstNum(s);
  return firstNum(s);
};
const add = (map, k, sup, v) => { if (!map.has(k)) map.set(k, new Map()); const m = map.get(k); if (!m.has(sup)) m.set(sup, []); m.get(sup).push(v); };
for (const o of A.values()) {
  const k = RK(o.model);
  if (!roles.has(k)) roles.set(k, { engine: new Set(), alternator: new Set() });
  roles.get(k)[o.kind]?.add(o.supplierId);
  for (const [r, p] of Object.entries(o.power || {})) for (const u of ["kVA", "kW"]) if (p?.[u] > 0) add(powerRef, `${o.kind}|${k}|${r}|${u}`, o.supplierId, p[u]);
  if (o.kind === "engine") for (const s of o.specs || []) if (ENG_KEYS.has(s.key)) { const x = specNum(s.key, s.value); if (x != null) add(specRef, `${k}|${s.key}`, o.supplierId, x); }
}
// Calibration: of the values "xác nhận", how many would ALSO be confirmed if they were 10% off (a chance match among the many
// gensets one engine model drives): the weakness of the check, per reference (power / engine spec).
let CAL = {};
function judgeNum(map, k, sup, v, tol = 0.02, cal = true) {
  const r = judgeNum0(map, k, sup, v, tol);
  if (cal && r === "xác nhận") {
    const c = (CAL[map === powerRef ? "công suất" : "thông số động cơ"] ||= { n: 0, chance: 0 });
    c.n++;
    if (judgeNum(map, k, sup, v * 1.1, tol, false) === "xác nhận" || judgeNum(map, k, sup, v / 1.1, tol, false) === "xác nhận") c.chance++;
  }
  return r;
}
function judgeNum0(map, k, sup, v, tol) {
  const m = map.get(k); if (!m) return "không đối chiếu";
  const others = [...m].filter(([s]) => s !== sup); if (!others.length) return "không đối chiếu";
  const near = (x, t) => Math.abs(x - v) <= t * Math.max(Math.abs(v), 1e-9);
  if (others.some(([, xs]) => xs.some((x) => near(x, tol)))) return "xác nhận";
  if (others.length >= 2 && others.every(([, xs]) => xs.every((x) => !near(x, 0.15)))) return "mâu thuẫn";
  return "chưa rõ";
}
function judgeRole(kind, model, sup) {
  const r = roles.get(RK(model)); if (!r) return "không đối chiếu";
  const other = kind === "engine" ? "alternator" : "engine";
  const same = [...r[kind]].filter((x) => x !== sup).length, oth = [...r[other]].filter((x) => x !== sup).length;
  if (!same && !oth) return "không đối chiếu";
  if (same && !oth) return "xác nhận";
  if (oth && !same) return "mâu thuẫn";
  if (same >= 3 && same >= 3 * oth) return "xác nhận";
  if (oth >= 3 && oth >= 3 * same) return "mâu thuẫn";
  return "chưa rõ";
}
const parsePw = (s) => { const out = []; for (const m of String(s).matchAll(/([PSR]) (\S+)\/(\S+)/g)) { const r = { P: "prime", S: "standby", R: "rated" }[m[1]]; if (m[2] !== "·") out.push([r, "kVA", +m[2]]); if (m[3] !== "·") out.push([r, "kW", +m[3]]); } return out; };

// Phán xét các giá trị của bên `o` (bản ghi main) bị mất / đổi trong một thay đổi.
function judgeChange(ch, B) {
  const o = ch.o, sup = o.supplierId, kind = ch.kind, res = [];
  const [from, to] = String(ch.txt).split(" → ");
  if (kind === "MẤT bản ghi" || kind === "THÊM bản ghi" || kind === "model") {
    const m = kind === "model" ? from : o.model;
    res.push(["vai " + o.kind, judgeRole(o.kind, m, sup), m]);
    // a lost record takes its power with it
    if (kind === "MẤT bản ghi") for (const [r, p] of Object.entries(o.power || {})) for (const u of ["kVA", "kW"]) if (p?.[u] > 0) res.push(["công suất (theo bản ghi mất)", judgeNum(powerRef, `${o.kind}|${RK(o.model)}|${r}|${u}`, sup, p[u]), `${r} ${p[u]} ${u}`]);
    return res;
  }
  if (kind === "other") { if (from && from !== "null" && from !== "undefined") res.push(["vai " + (o.kind === "engine" ? "alternator" : "engine") + " (ô kia)", judgeRole(o.kind === "engine" ? "alternator" : "engine", from, sup), from]); return res; }
  if (kind === "power") {
    const after = new Set(parsePw(to).map((x) => x.join("|")));
    for (const x of parsePw(from)) if (!after.has(x.join("|"))) res.push(["công suất", judgeNum(powerRef, `${o.kind}|${RK(o.model)}|${x[0]}|${x[1]}`, sup, x[2]), `${x[0]} ${x[2]} ${x[1]}`]);
    const before = new Set(parsePw(from).map((x) => x.join("|")));
    for (const x of parsePw(to)) if (!before.has(x.join("|"))) res.push(["công suất (giá trị MỚI)", judgeNum(powerRef, `${o.kind}|${RK(o.model)}|${x[0]}|${x[1]}`, sup, x[2]), `${x[0]} ${x[2]} ${x[1]}`]);
    return res;
  }
  const m = kind.match(/^(\w+) (bỏ|đổi|thêm)$/);
  if (m) {
    const key = m[1];
    const val = m[2] === "thêm" ? to : from, tagNew = m[2] === "thêm" ? " (giá trị MỚI)" : "";
    if (ENG_KEYS.has(key) && o.kind === "engine") { const x = specNum(key, val); res.push([`thông số động cơ ${key}${tagNew}`, x == null ? "không đối chiếu" : judgeNum(specRef, `${RK(o.model)}|${key}`, sup, x, key === "engPower" ? 0.03 : 0.02), `${key}=${val}`]); }
    // checkSpec answers false for current / weight / engPower when the row has no power at all: that is no check.
    else { const noPw = /^(current|weight|engPower)$/.test(key) && !Object.values(o.power || {}).some((p) => p && (p.kVA || p.kW)); const ok = noPw ? null : SD.checkSpec(key, { value: val }, o); res.push([`thông số tổ máy ${key}${tagNew} (tự kiểm)`, ok === true ? "hợp lý (tự kiểm)" : ok === false ? "vô lý (tự kiểm)" : "không kiểm được", `${key}=${val}`]); }
    return res;
  }
  if (kind === "genset") return [["model tổ máy", "không đối chiếu", from]];
  if (kind === "makes") return [["hãng (hệ quả)", "không xét", `${from} → ${to}`]];
  return [[kind, "không xét", ch.txt]];
}

// ---- 3. từng đường ----
const report = { paths: {}, totals: { records: T0.size, tables: allTables.size, sups: allSups.size } };
const only = process.argv[4] ? process.argv[4].split(",") : Object.keys(PATHS);
for (const P of only) {
  const t0 = Date.now();
  const B = SD.records(side(WT, P.replace(/\+/g, ",")));
  CAL = {};
  const d = SD.diff(A, B);
  const verdict = {}, bySup = new Map(), ex = {}, perRec = new Map(), seenRow = new Set();
  // Engine records first: a row's specs and power sit on its engine and alternator records alike; count them once.
  const changes = [...d.changes].sort((x, y) => (x.o.kind === "engine" ? 0 : 1) - (y.o.kind === "engine" ? 0 : 1));
  for (const ch of changes) {
    const rowShared = /^\w+ (bỏ|đổi|thêm)$/.test(ch.kind) || ch.kind === "genset";
    if (rowShared) { const rk = `${ch.o.supplierId}|${ch.o.n}|${ch.o.table}|${ch.o.row}|${ch.kind}|${ch.txt}`; if (seenRow.has(rk)) continue; seenRow.add(rk); }
    for (const [what, v, val] of judgeChange(ch, B)) {
      const k = `${what} | ${v}`;
      verdict[k] = (verdict[k] || 0) + 1;
      const s = bySup.get(ch.o.supplierId) || {}; s[k] = (s[k] || 0) + 1; bySup.set(ch.o.supplierId, s);
      (ex[k] = ex[k] || []).push({ sup: ch.o.supplierId, n: ch.o.n, table: ch.o.table, row: ch.o.row, kind: ch.o.kind, model: ch.o.model, val, change: `${ch.kind}: ${ch.txt}`, header: (ch.o.header || ch.o.lines?.header || []).slice(0, 2).map((h) => String(h).slice(0, 220)), line: String(ch.o.line || (ch.o.lines?.rows || []).filter((r) => r.includes(ch.o.model)).slice(0, 2).join(" ¦ ") || "").slice(0, 260) });
    }
    const rk = `${ch.o.supplierId}|${ch.o.n}|${ch.o.table}|${ch.o.row}|${ch.o.kind}|${ch.o.model}`; perRec.set(rk, true);
  }
  const sw = SD.swaps(B.values());
  const ts = tagStat[P] || { rec: 0, specs: 0, tables: new Set(), sups: new Map() };
  report.paths[P] = {
    desc: PATHS[P] || GUARDS[P] || P, through: { records: ts.rec, specs: ts.specs, tables: ts.tables.size, sups: ts.sups.size, topSups: [...ts.sups].sort((a, b) => b[1] - a[1]).slice(0, 12) },
    diff: { changed: d.changed, onlyA: d.onlyA, onlyB: d.onlyB, kinds: d.kinds, recordsTouched: perRec.size, tables: d.tabs.size, sups: d.bySup.size },
    swaps: sw.n, verdict, cal: CAL, bySup: [...bySup].map(([s, v]) => [s, v]).sort((a, b) => Object.values(b[1]).reduce((x, y) => x + y, 0) - Object.values(a[1]).reduce((x, y) => x + y, 0)),
  };
  fs.writeFileSync(path.join(OUT, `ex-${P}.json`), JSON.stringify(ex, null, 1));
  fs.writeFileSync(path.join(OUT, `full-${P}.txt`), SD.fullText(d));
  console.log(P, `${((Date.now() - t0) / 1000).toFixed(0)}s`, `đi qua ${ts.rec} bản ghi / ${ts.tables.size} bảng / ${ts.sups.size} NCC`, `| đổi ${d.changed} mất ${d.onlyA} thêm ${d.onlyB}`, JSON.stringify(verdict));
}
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 1));
