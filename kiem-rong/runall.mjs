// node runall.mjs <shard> <nshards>  -> out/run-<shard>.jsonl  (một dòng JSON mỗi lượt gói×cỡ)
// Chạy candidates() thật (và bản dải cũ 95–140%) trên mọi gói có văn bản HSMT + phân tích. Không mạng.
import fs from "node:fs";
import * as L from "./lib.mjs";
const [shard = 0, nsh = 1] = process.argv.slice(2).map(Number);
fs.mkdirSync(L.HERE + "/out", { recursive: true });
const outF = `${L.HERE}/out/run-${shard}.jsonl`;
fs.writeFileSync(outF, "");
const C = L.corpus(), sups = L.loadSuppliers(), env = new L.Env(sups), supMap = new Map(sups.map((s) => [s.id, s]));
const CMR = L.configmatch();
const all = [...C.keys()].sort(); let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const rest = all.filter((k) => C.get(k).src !== "full12").map((k) => [rnd(), k]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const keys = [...all.filter((k) => C.get(k).src === "full12"), ...rest].filter((_, i) => i % nsh === shard);
const MAKE_CAP = L.B.MAKE_CAP, MAX = 30;
const mk = (r) => (r.e.make || "?").split(" / ")[0];
let n = 0;
for (const key of keys) {
  const e = C.get(key), { found, runs } = L.sizesOfEntry(e);
  for (const run of runs) {
    const cap = run.cap;
    const base = { key, src: e.src, i: run.i, nSizes: found.length, nRuns: runs.length, cap, sizeLabel: run.size?.label || null };
    if (!cap) { fs.appendFileSync(outF, JSON.stringify({ ...base, noCap: true }) + "\n"); continue; }
    try {
      // keep: như lượt thật, cấu hình lượt trước (chỉ có cho 12 gói của configmatch)
      let keep = null; const prev = CMR[key];
      if (prev) { const pr = prev.sizes ? prev.sizes.find((x) => x.cap?.value === cap.value || x.kva === cap.value)?.result : prev; keep = L.B.keepOf(pr); }
      const r = env.prep(e, cap, { keep });
      
      const hints = r.hints, rows = r.all, top = r.top, viol = [];
      // dải cũ: đếm rẻ luôn; chạy đầy đủ chỉ khi dải mới thiếu ứng viên (top<30 hoặc <60 dòng) hoặc gói của configmatch
      const o = (top.length < 30 || rows.length < 60 || prev) ? env.prep(e, cap, { keep, mod: L.OLD }) : null;
      // I1: công suất mọi dòng trong top trong 99,5–120%
      for (const x of top) { const rs = L.ratioOf(x.u, cap); if (!rs.some((v) => L.inNew(v * cap.value, cap))) viol.push({ t: "band", sup: x.u.supplierId, eng: x.e.model, ratios: rs.map((v) => +v.toFixed(3)) }); }
      for (const x of rows) { const rs = L.ratioOf(x.u, cap); if (!rs.some((v) => L.inNew(v * cap.value, cap))) viol.push({ t: "bandAll", sup: x.u.supplierId, eng: x.e.model, ratios: rs.map((v) => +v.toFixed(3)) }); }
      // I2: không dòng ruled trong top / rows trừ named
      for (const x of top) if (x.ruled.length && !x.named) viol.push({ t: "ruledTop", sup: x.u.supplierId, eng: x.e.model, ruled: x.ruled });
      for (const x of rows) if (x.ruled.length && !x.named) viol.push({ t: "ruledRows", sup: x.u.supplierId, eng: x.e.model, ruled: x.ruled });
      // I3: trần 10 / hãng
      const namedAny = rows.some((x) => x.named), capOn = !hints.engineMakes.length && !namedAny;
      const mc = {}; for (const x of top) mc[mk(x)] = (mc[mk(x)] || 0) + 1;
      if (capOn) for (const [m, c] of Object.entries(mc)) if (c > MAKE_CAP) {
        // còn dòng hợp lệ nào hãng khác bị bỏ sót (chưa chọn, không vướng giới hạn engine/supplier/choiceKey) không?
        const have = new Set(top.map(L.choiceKey)), pe = {}, ps = {};
        for (const x of top) { pe[x.e.key] = (pe[x.e.key] || 0) + 1; ps[x.u.supplierId] = (ps[x.u.supplierId] || 0) + 1; }
        const left = rows.filter((x) => !top.includes(x) && (mc[mk(x)] || 0) < MAKE_CAP && !have.has(L.choiceKey(x)) && (pe[x.e.key] || 0) < (x.named ? 8 : 3) && (ps[x.u.supplierId] || 0) < 4).length;
        viol.push({ t: "makeCap", make: m, n: c, topN: top.length, otherLeft: left, keepRun: !!keep?.size, sync: !!r.sync });
      }
      // I4: trùng dòng
      const ck = new Map(); for (const x of top) ck.set(L.choiceKey(x), (ck.get(L.choiceKey(x)) || 0) + 1);
      for (const [k, c] of ck) if (c > 1) viol.push({ t: "dupChoice", key: k.replace(/\n/g, "|"), n: c });
      if (new Set(top).size !== top.length) viol.push({ t: "dupObject" });
      const pe = {}, ps = {}; for (const x of top) { pe[x.e.key] = (pe[x.e.key] || 0) + 1; ps[x.u.supplierId] = (ps[x.u.supplierId] || 0) + 1; }
      for (const [k, c] of Object.entries(pe)) { const nm = top.some((x) => x.e.key === k && x.named); if (c > (nm ? 8 : 3)) viol.push({ t: "perEngine", engine: k, n: c, keepRun: !!keep?.size }); }
      for (const [k, c] of Object.entries(ps)) if (c > 4) viol.push({ t: "perSupplier", sup: k, n: c, keepRun: !!keep?.size });
      if (top.length > MAX) viol.push({ t: "topOver30", n: top.length });
      if (hints.freq) for (const x of top) if (x.u.freq && x.u.freq !== hints.freq) viol.push({ t: "freq", sup: x.u.supplierId, eng: x.e.model, f: x.u.freq });
      // dropped theo loại
      const dropBy = { disp: 0, maxDisp: 0, cyl: 0, prime: 0 }; let dropMulti = 0;
      for (const d of r.dropped) { for (const k of d.ruled) dropBy[k]++; if (d.ruled.length > 1) dropMulti++; }
      // bằng chứng cho dòng bị loại: thống kê toàn bộ + mẫu rải đều (5 dòng mỗi loại mỗi lượt)
      const facts = r.opts.facts || env.catFor(r.origin, r.sync, r.partsOnly, r.brand).facts, ev = { primeKinds: {}, primeLabelled: { yes: 0, no: 0 }, dispUnitOdd: 0, dispCalcOnly: 0, dispTank: 0 }, samples = [];
      const byKind = { disp: [], maxDisp: [], cyl: [], prime: [] };
      for (const d of r.dropped) for (const k of d.ruled) byKind[k].push(d);
      for (const [k, list] of Object.entries(byKind)) {
        const step = Math.max(1, Math.floor(list.length / 5));
        list.forEach((d, idx) => {
          const need = idx % step === 0 && idx / step < 5, all = k === "prime" || k === "disp";
          if (!need && !all) return;
          const x = L.evidence(d, hints, facts, cap);
          if (k === "prime") { ev.primeKinds[x.powerKinds] = (ev.primeKinds[x.powerKinds] || 0) + 1; ev.primeLabelled[x.primeLabelled ? "yes" : "no"]++; if (!x.primeLabelled && ev.primeLabelled.no <= 12) samples.push({ ...x, why: "prime-unlabelled" }); }
          if (k === "disp") { if (x.disp.some((q) => /cc|cm|ml|mm|\bl\/|lít\/|\/h|kg|bar/i.test(q.v + " " + q.label) || q.litres == null)) { ev.dispUnitOdd++; if (ev.dispUnitOdd <= 12) samples.push({ ...x, why: "disp-odd" }); } if (!x.disp.length) ev.dispCalcOnly++; if (x.disp.some((q) => /bình|bồn|tank|fuel|nhiên liệu|dầu|oil|coolant/i.test(q.label || ""))) ev.dispTank++; }
          if (need) samples.push({ ...x, why: "spread-" + k });
        });
      }
      let oldBand = 0; { const pr2 = L.preRows(r.cat, cap, hints, r.origin, env.cn); for (const { u } of pr2) if (L.ratioOf(u, cap).some((v) => v >= 0.95 && v <= 1.4 + 1e-9)) oldBand++; }
      // dòng gần nhất ngoài dải
      const pre = L.preRows(r.cat, cap, hints, r.origin, env.cn); let above = null, below = null;
      for (const { u } of pre) for (const v of L.ratioOf(u, cap)) { if (v > 1.2 + 1e-9 && (above == null || v < above)) above = v; if (v < 0.995 && (below == null || v > below)) below = v; }
      const cols = (x) => ({ sup: x.u.supplierId, ek: x.e.key, model: x.e.model, make: x.e.make || null, alt: x.a?.model || x.u.other || null, ratios: L.ratioOf(x.u, cap).map((v) => +v.toFixed(3)), ruled: x.ruled, named: x.named, score: x.score, ctry: supMap.get(x.u.supplierId)?.country || null });
      const rec = { ...base, origin: r.origin, sync: !!r.sync, partsOnly: r.partsOnly, brand: r.brand, hasPrev: !!prev, keepN: keep?.size || 0,
        freq: hints.freq, engineMakes: hints.engineMakes,
        h0: { minDisp: r.hints0.minDisp, maxDisp: r.hints0.maxDisp, minCyl: r.hints0.minCyl, minPrime: r.hints0.minPrime, maxFuel: r.hints0.maxFuel },
        h1: { minDisp: hints.minDisp, maxDisp: hints.maxDisp, minCyl: hints.minCyl, minPrime: hints.minPrime },
        nBand: rows.length + r.dropped.length, nRows: rows.length, nDropped: r.dropped.length, dropBy, dropMulti, topN: top.length, capOn, makes: mc,
        old: { nBand: oldBand, nRows: o ? o.all.length : null, topN: o ? o.top.length : null, full: !!o },
        above: above == null ? null : +above.toFixed(3), below: below == null ? null : +below.toFixed(3),
        top: top.map(cols), viol, ev, samples: samples.slice(0, 80) };
      fs.appendFileSync(outF, JSON.stringify(rec) + "\n"); n++;
    } catch (err) { fs.appendFileSync(outF, JSON.stringify({ ...base, error: String(err.stack || err).slice(0, 600) }) + "\n"); }
  }
  if (n % 20 === 0) console.log(`shard ${shard}: ${n} lượt, tới ${key}`);
}
console.log(`shard ${shard} xong: ${n} lượt`);
process.exit(0);
