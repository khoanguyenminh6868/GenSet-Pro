// Đo bước ứng viên (candidates, không agent) với cờ GENBID_SPEC_NORM tắt ↔ bật, cùng một commit (wt-noi-chuan-hoa).
// Gói: mọi gói mua sắm máy phát có chữ Chương V trong bidhist (bộ lọc như gaps.mjs: isGensetName, bidKind supply, config.text).
// Dữ liệu: bản chụp cố định genbid-test/noi-chuan-hoa/{bidhist,supplier}.json (chép từ doc-cache 14/11). CHỈ ĐỌC, không mạng.
//   node do-ung-vien.mjs  → ung-vien.json + ung-vien.tsv cạnh tệp này
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SNAP = "C:/Projects/GenSet Pro/genbid-test/noi-chuan-hoa";
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-noi-chuan-hoa/suppliers/config-bot.mjs").href);
const CAT = globalThis.GenbidCatalog, BP = globalThis.GenbidBidprice;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = Object.values(J(`${SNAP}/supplier.json`).docs).map((x) => x.d).filter((d) => d && d.status !== "incomplete");
const hist = Object.values(J(`${SNAP}/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
console.error(`gói: ${hist.length}, NCC: ${sups.length}`);
const full = CAT.build(sups), cn = B.cnSuppliers(sups), cache = new Map();
function catFor(origin, sync, partsOnly, brand) {
  const k = [origin, !!sync, partsOnly, brand].join("|");
  if (!cache.has(k)) {
    const grp = B.groupSuppliers(sups, origin, !!sync, partsOnly, brand);
    const cat = { ...full, engines: B.byOrigin(full.engines, origin, cn, grp) };
    const facts = grp ? B.modelFacts({ ...full, engines: B.byOrigin(full.engines, origin, cn) }, sups) : B.modelFacts(cat, sups);
    cache.set(k, { cat, facts });
  }
  return cache.get(k);
}
const rowKey = (r) => `${r.u.supplierId}|${r.u.n}|${r.u.table}|${r.u.row ?? ""}|${r.e.key}|${CAT.keyOf(r.u.line || (r.u.lines?.rows || []).join(" "))}`;
const band = (cap) => { const kva = cap.unit === "kW" ? cap.value / 0.8 : cap.value; return kva <= 30 ? "≤30 kVA" : kva <= 100 ? "31–100" : kva <= 300 ? "101–300" : kva <= 700 ? "301–700" : kva <= 1500 ? "701–1500" : ">1500"; };
const run1 = (v, cat, cap, hints, opts) => { if (v) process.env.GENBID_SPEC_NORM = v; else delete process.env.GENBID_SPEC_NORM; try { return B.candidates(cat, cap, hints, opts); } finally { delete process.env.GENBID_SPEC_NORM; } };
// Variants of the flag: every group ("1"), then each group alone. A group with no limit of its kind in the run gives the
// same result as off (not run).
const VARS = ["1", "fuel", "disp", "other"], NEEDS = { "1": ["minDisp", "maxDisp", "minCyl", "maxFuel", "maxFuel75", "maxFuel50"], fuel: ["maxFuel", "maxFuel75", "maxFuel50"], disp: ["minDisp", "maxDisp"], other: ["minCyl"] };
const out = { packages: hist.length, vars: VARS, runs: [], noCap: [], errors: [], samples: [] };
for (const d of hist) {
  const key = d.notifyNo, text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  for (const rn of runs) {
    if (!rn.cap) { out.noCap.push(key); continue; }
    try {
      const hints0 = B.hintsOf(text, "", rn.sizing), auto = B.originOfHsmt(text), origin = auto?.origin || "all", sync = BP.brandSyncOf(text);
      const partsOnly = B.partsOnlyOf(origin, text), brand = auto?.basis === "brand" && !partsOnly;
      const { cat, facts } = catFor(origin, sync, partsOnly, brand);
      const opts = { suppliers: sups, origin, cn, sync, facts };
      const h = B.plausible(hints0, rn.cap);
      const limits = Object.fromEntries(NEEDS["1"].filter((k) => h[k] != null).map((k) => [k, h[k]]));
      const A = run1(null, cat, rn.cap, hints0, opts), ta = A.top.map(rowKey), dA = new Map(A.dropped.map((x) => [rowKey(x), x]));
      const byRule = (list, m) => { const o = {}; for (const k of list) for (const r of m.get(k).ruled) o[r] = (o[r] || 0) + 1; return o; };
      const fo = (R) => R.all.filter((r) => r.fuelOver).length;
      const rec = { key, bidName: d.bidName, cap: `${rn.cap.value} ${rn.cap.unit}`, band: band(rn.cap), limits, rows: A.all.length + A.dropped.length, droppedA: A.dropped.length, fuelOverA: fo(A), fuelNoLoadA: A.all.filter((r) => r.fuelNoLoad).length, v: {} };
      for (const v of VARS) {
        if (!NEEDS[v].some((k) => limits[k] != null)) { rec.v[v] = { same: true, dropped: A.dropped.length, kept: 0, keptByRule: {}, newly: 0, newlyByRule: {}, fuelOver: fo(A), top30Changed: false, top30SetChanged: false, topIn: 0, topOut: 0 }; continue; }
        const N = run1(v, cat, rn.cap, hints0, opts), tn = N.top.map(rowKey), dN = new Map(N.dropped.map((x) => [rowKey(x), x]));
        const kept = [...dA.keys()].filter((k) => !dN.has(k)), newly = [...dN.keys()].filter((k) => !dA.has(k));
        rec.v[v] = { dropped: N.dropped.length, kept: kept.length, keptByRule: byRule(kept, dA), newly: newly.length, newlyByRule: byRule(newly, dN), fuelOver: fo(N),
          top30Changed: JSON.stringify(ta) !== JSON.stringify(tn), top30SetChanged: ta.some((k) => !tn.includes(k)) || tn.some((k) => !ta.includes(k)), topIn: tn.filter((k) => !ta.includes(k)).length, topOut: ta.filter((k) => !tn.includes(k)).length };
        if (v !== "1") continue;
        for (const k of kept.slice(0, 2)) { const x = dA.get(k), y = N.all.find((r) => rowKey(r) === k); out.samples.push({ key, cap: rec.cap, limits, kind: "giữ lại", ruledBefore: x.ruled, supplierId: x.u.supplierId, n: x.u.n, engine: x.e.model, line: x.u.line || (x.u.lines?.rows || []).join(" ; "), header: (x.u.header || x.u.lines?.header || []).join(" / "), title: x.u.title, skip: (y?.normSkip || []).slice(0, 6) }); }
        for (const k of newly.slice(0, 2)) { const x = dN.get(k); out.samples.push({ key, cap: rec.cap, limits, kind: "mới bị loại", ruledAfter: x.ruled, supplierId: x.u.supplierId, n: x.u.n, engine: x.e.model, line: x.u.line || (x.u.lines?.rows || []).join(" ; "), header: (x.u.header || x.u.lines?.header || []).join(" / "), title: x.u.title, skip: (x.normSkip || []).slice(0, 6) }); }
      }
      out.runs.push(rec);
    } catch (e) { out.errors.push({ key, err: String(e?.stack || e).slice(0, 300) }); }
  }
  if (out.runs.length % 50 === 0) console.error(out.runs.length, key);
}
fs.writeFileSync(path.join(HERE, "ung-vien.json"), JSON.stringify(out, null, 1));
const base = ["key", "cap", "band", "limits", "rows", "droppedA", "fuelOverA", "fuelNoLoadA"], per = ["dropped", "kept", "keptByRule", "newly", "newlyByRule", "fuelOver", "top30SetChanged", "topIn", "topOut"];
const head = [...base, ...VARS.flatMap((v) => per.map((c) => `${v === "1" ? "all" : v}.${c}`))];
const cell = (x) => (typeof x === "object" ? JSON.stringify(x) : x);
fs.writeFileSync(path.join(HERE, "ung-vien.tsv"), [head.join("\t"), ...out.runs.map((r) => [...base.map((c) => cell(r[c])), ...VARS.flatMap((v) => per.map((c) => cell(r.v[v][c])))].join("\t"))].join("\n") + "\n");
console.error("xong", out.runs.length, "lượt;", out.noCap.length, "không đọc được công suất;", out.errors.length, "lỗi");
