// Báo cáo chất lượng thông số NCC sau lớp chuẩn hoá web/spec-norm.js (việc chuan-hoa-2, 14/11/2026). Chỉ đọc cn/*.json.
//   node suppliers/quality.mjs                     bảng độ phủ + tỉ lệ missing từng mã, mâu thuẫn hằng số động cơ
//   node suppliers/quality.mjs --json out.json     ghi số đo (kèm danh sách model mâu thuẫn)
//   node suppliers/quality.mjs --conflicts         in danh sách model mâu thuẫn
//   node suppliers/quality.mjs --check             so với quality-baseline.json; thoát 1 khi xấu đi quá ngưỡng (CI)
//   node suppliers/quality.mjs --write-baseline    ghi lại quality-baseline.json (giữ ngưỡng đang có)
//   node suppliers/quality.mjs --samples K [N]     in N mẫu raw ↔ chuẩn hoá của mã K (dò lỗi)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
for (const f of ["conversions.js", "catalog.js", "spec-norm.js"]) await import(pathToFileURL(path.join(ROOT, "..", "web", f)).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
export const BASELINE = path.join(ROOT, "quality-baseline.json");
// Thresholds when a baseline file has none: percentage points for rates, a count for conflicts.
// A key with fewer than smallN values (pf: 145, fuel50: 568) moves a lot with one supplier more or one label read
// differently, so its rate thresholds are multiplied by smallFactor.
export const DEFAULT_THRESHOLDS = { valuePctDrop: 2, missingPctRise: 2, powerPctRise: 1, conflictRise: 5, smallN: 1000, smallFactor: 5 };

const pct = (a, b) => (b ? Math.round((1000 * a) / b) / 10 : 0);
const nums = (v) => (String(v).replace(/(\d),(\d{3})/g, "$1$2").replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) || []).map(Number);
// Engine constants as the 14/11 audit (audit3.cjs) compared them on the raw strings: the "before" figure.
const RAW_CANON = {
  cyl: (v) => { const m = String(v).match(/\d{1,2}/); return m ? Number(m[0]) : null; },
  disp: (v) => { const n = nums(v)[0]; if (n == null) return null; return /cc|ml/i.test(v) || n > 150 ? Math.round(n / 100) / 10 : Math.round(n * 10) / 10; },
  bore: (v) => { const n = nums(v); return n.length >= 2 ? `${Math.round(n[0])}x${Math.round(n[1])}` : null; },
  compr: (v) => { const n = nums(v)[0]; return n ? Math.round(n * 10) / 10 : null; },
};
// The same constants read from the normalized value. strict: only with the unit written in the source (cc has no
// formula in conversions.js, so it is not compared with litres); loose: a value whose only gap is the unit counts too.
function normCanon(key, r, strict) {
  if (!r || r.missing.some((m) => m !== "unit" && m !== "layout")) return null;
  if (strict && r.missing.includes("unit")) return null;
  switch (key) {
    case "cyl": return r.count ?? null;
    case "compr": return r.num != null ? Math.round(r.num * 10) / 10 : null;
    case "disp": return r.num != null && (r.unit === "L" || (!strict && !r.unit)) ? Math.round(r.num * 10) / 10 : null;
    case "bore": return r.bore?.bore != null && r.bore?.stroke != null ? `${Math.round(r.bore.bore)}x${Math.round(r.bore.stroke)}` : null;
  }
  return null;
}

export function loadSuppliers(dir = path.join(ROOT, "cn")) {
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

// All the figures: per key, how many values, how many normalized to a figure, how many miss each kind of
// information; genset power flags; engine constants that disagree between suppliers before / after normalization.
export function measure(suppliers, { keepSamples = 0 } = {}) {
  const keys = Object.fromEntries(SN.KEYS.map((k) => [k, { n: 0, value: 0, missing: {} }]));
  const samples = Object.fromEntries(SN.KEYS.map((k) => [k, []]));
  const power = { n: 0, missing: {} };
  const byModel = new Map();
  for (const s of suppliers) {
    if (s.status === "incomplete") continue;
    for (const o of C.fromSupplier(s)) {
      const norm = SN.normalizeRecord(o);
      for (const r of norm) {
        const k = keys[r.key];
        k.n++;
        if (SN.hasValue(r)) k.value++;
        for (const m of r.missing) k.missing[m] = (k.missing[m] || 0) + 1;
        if (keepSamples && samples[r.key].length < keepSamples) samples[r.key].push({ supplierId: s.id, n: o.n, title: o.title, ...r });
      }
      if (o.kind !== "engine") continue;
      if (!o.own) {
        power.n++;
        for (const m of SN.powerFlags(o).missing) power.missing[m] = (power.missing[m] || 0) + 1;
      }
      const mk = C.keyOf(o.model);
      if (!byModel.has(mk)) byModel.set(mk, []);
      byModel.get(mk).push({ s: s.id, model: o.model, specs: o.specs || [], norm });
    }
  }
  const conflicts = {};
  for (const key of Object.keys(RAW_CANON)) {
    const res = {};
    for (const [mode, get] of [
      ["before", (u) => u.specs.filter((x) => x.key === key).map((x) => RAW_CANON[key](x.value))],
      ["strict", (u) => u.norm.filter((x) => x.key === key).map((x) => normCanon(key, x, true))],
      ["loose", (u) => u.norm.filter((x) => x.key === key).map((x) => normCanon(key, x, false))],
    ]) {
      let compared = 0;
      const list = [];
      for (const [mk, uses] of byModel) {
        const vals = new Map();
        for (const u of uses) for (const v of get(u)) if (v != null) { if (!vals.has(v)) vals.set(v, new Set()); vals.get(v).add(u.s); }
        const sup = new Set([...vals.values()].flatMap((x) => [...x]));
        if (sup.size < 2) continue;
        compared++;
        if (vals.size >= 2) list.push({ model: uses[0].model, key: mk, values: [...vals].map(([v, ss]) => ({ value: v, suppliers: [...ss].sort() })) });
      }
      list.sort((a, b) => a.key.localeCompare(b.key));
      res[mode] = { compared, conflicts: list.length, models: list };
    }
    conflicts[key] = res;
  }
  const out = { keys: {}, power: { n: power.n, missingPct: {} }, conflicts };
  for (const [k, v] of Object.entries(keys)) {
    out.keys[k] = { n: v.n, value: v.value, valuePct: pct(v.value, v.n), missing: v.missing, missingPct: Object.fromEntries(Object.entries(v.missing).map(([m, c]) => [m, pct(c, v.n)])) };
  }
  for (const [m, c] of Object.entries(power.missing)) out.power.missingPct[m] = pct(c, power.n);
  if (keepSamples) out.samples = samples;
  return out;
}

// Problems of `now` against `base`: a rate worse than its threshold, more conflicts. A key or missing kind absent from
// the baseline counts from 0 (a new kind of gap is a problem only past the threshold too).
export function check(now, base) {
  const t = { ...DEFAULT_THRESHOLDS, ...(base.thresholds || {}) };
  const bad = [];
  for (const [k, b] of Object.entries(base.keys || {})) {
    const n = now.keys[k];
    if (!n) { bad.push(`${k}: không còn trong báo cáo`); continue; }
    const f = Math.min(n.n, b.n ?? n.n) < t.smallN ? t.smallFactor : 1, drop = t.valuePctDrop * f, rise = t.missingPctRise * f;
    if (n.valuePct < b.valuePct - drop) bad.push(`${k}: tỉ lệ có số ${n.valuePct}% < mốc ${b.valuePct}% − ${drop}`);
    for (const m of new Set([...Object.keys(b.missingPct || {}), ...Object.keys(n.missingPct || {})])) {
      const x = n.missingPct?.[m] || 0, y = b.missingPct?.[m] || 0;
      if (x > y + rise) bad.push(`${k}: thiếu "${m}" ${x}% > mốc ${y}% + ${rise}`);
    }
  }
  for (const m of new Set([...Object.keys(base.power?.missingPct || {}), ...Object.keys(now.power?.missingPct || {})])) {
    const x = now.power?.missingPct?.[m] || 0, y = base.power?.missingPct?.[m] || 0;
    if (x > y + t.powerPctRise) bad.push(`công suất tổ máy: thiếu "${m}" ${x}% > mốc ${y}% + ${t.powerPctRise}`);
  }
  for (const [k, b] of Object.entries(base.conflicts || {})) {
    const x = now.conflicts?.[k]?.strict?.conflicts ?? 0, y = b.strict ?? 0;
    if (x > y + t.conflictRise) bad.push(`${k}: ${x} model mâu thuẫn (đủ đơn vị) > mốc ${y} + ${t.conflictRise}`);
  }
  return bad;
}

// The baseline keeps only the rates (not the counts, which grow with every crawl) and conflict totals.
export function baselineOf(m, thresholds = DEFAULT_THRESHOLDS) {
  return {
    note: "Mốc của suppliers/quality.mjs --check. Sinh lại: node suppliers/quality.mjs --write-baseline (chỉ khi thay đổi có chủ ý, ghi lý do trong PR).",
    thresholds,
    keys: Object.fromEntries(Object.entries(m.keys).map(([k, v]) => [k, { n: v.n, valuePct: v.valuePct, missingPct: v.missingPct }])),
    power: { n: m.power.n, missingPct: m.power.missingPct },
    conflicts: Object.fromEntries(Object.entries(m.conflicts).map(([k, v]) => [k, { before: v.before.conflicts, strict: v.strict.conflicts, loose: v.loose.conflicts }])),
  };
}

function report(m) {
  const lines = ["== Độ phủ và thiếu thông tin sau chuẩn hoá (web/spec-norm.js) ==", "mã        giá trị   có số    thiếu (tỉ lệ trên số giá trị)"];
  for (const [k, v] of Object.entries(m.keys)) {
    const miss = Object.entries(v.missingPct).sort((a, b) => b[1] - a[1]).map(([x, p]) => `${x} ${p}%`).join(", ");
    lines.push(`${k.padEnd(9)} ${String(v.n).padStart(7)}  ${String(v.valuePct).padStart(5)}%   ${miss || "—"}`);
  }
  lines.push(`công suất tổ máy (${m.power.n} dòng động cơ của tổ máy): ` + Object.entries(m.power.missingPct).map(([x, p]) => `thiếu ${x} ${p}%`).join(", "));
  lines.push("", "== Mâu thuẫn hằng số động cơ giữa các NCC (model có ≥2 NCC ghi) ==", "mã      trước (audit3)      sau, đủ đơn vị      sau, gồm giá trị thiếu đơn vị");
  for (const [k, v] of Object.entries(m.conflicts)) lines.push(`${k.padEnd(6)}  ${`${v.before.conflicts}/${v.before.compared}`.padEnd(18)}  ${`${v.strict.conflicts}/${v.strict.compared}`.padEnd(18)}  ${v.loose.conflicts}/${v.loose.compared}`);
  return lines.join("\n");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const si = argv.indexOf("--samples");
  const m = measure(loadSuppliers(), { keepSamples: si >= 0 ? 100000 : 0 });
  if (si >= 0) {
    const key = argv[si + 1], N = Number(argv[si + 2] || 40), only = argv[si + 3];
    let list = m.samples[key] || [];
    if (only) list = list.filter((r) => only === "ok" ? !r.missing.length : r.missing.includes(only));
    const seen = new Set();
    for (const r of list) {
      const sig = `${r.raw.label}|${r.raw.value}`;
      if (seen.has(sig)) continue; seen.add(sig);
      const { supplierId, raw, missing, key: _k, n: _n, title: _t, ...v } = r;
      console.log(`[${supplierId}] ${raw.label} => ${raw.value}  ⇒  ${JSON.stringify(v)} missing=${missing.join(",")}`);
      if (seen.size >= N) break;
    }
    process.exit(0);
  }
  console.log(report(m));
  if (argv.includes("--conflicts")) for (const [k, v] of Object.entries(m.conflicts)) {
    console.log(`\n-- ${k}: ${v.strict.conflicts} model mâu thuẫn (đủ đơn vị)`);
    for (const x of v.strict.models) console.log(`  ${x.model}: ${x.values.map((y) => `${y.value} [${y.suppliers.join(", ")}]`).join(" / ")}`);
  }
  const ji = argv.indexOf("--json");
  if (ji >= 0) fs.writeFileSync(argv[ji + 1], JSON.stringify(m, null, 1));
  if (argv.includes("--write-baseline")) {
    const old = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, "utf8")) : {};
    fs.writeFileSync(BASELINE, JSON.stringify(baselineOf(m, old.thresholds || DEFAULT_THRESHOLDS), null, 1) + "\n");
    console.log(`\nĐã ghi ${path.relative(process.cwd(), BASELINE)}`);
  }
  if (argv.includes("--check")) {
    const bad = check(m, JSON.parse(fs.readFileSync(BASELINE, "utf8")));
    if (bad.length) { console.log("\nCHẤT LƯỢNG XẤU ĐI so với quality-baseline.json:\n  " + bad.join("\n  ")); process.exit(1); }
    console.log("\n--check: không chỉ số nào xấu đi quá ngưỡng.");
  }
}
