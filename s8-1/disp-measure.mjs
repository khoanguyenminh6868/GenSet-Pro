// node disp-measure.mjs <code dir> <cn dir> <out.json>
// Kiểm kê mọi giá trị disp + số đông dung tích (majorityRound / dispExact) theo đúng đường candidates đọc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

process.env.GENBID_SPEC_NORM = "1";
const [WT, CN, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => J(path.join(CN, f))).filter((d) => d.status !== "incomplete");
const CATX = C.build(sups), FACTS = B.modelFacts(CATX, sups), supMap = new Map(sups.map((s) => [s.id, s]));
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };

// 1) Kiểm kê: mọi spec disp của mọi bản ghi fromSupplier (mọi vai), chuẩn hoá với bối cảnh bảng.
const inv = [];
for (const s of sups) {
  let recs = [];
  try { recs = C.fromSupplier(s) || []; } catch (e) { continue; }
  for (const r of recs) for (const sp of r.specs || []) {
    if (sp.key !== "disp") continue;
    const t = (s.specTables || [])[r.table] || {};
    const ctx = { title: t.title || r.title || "", header: t.header || r.header || [], rows: t.rows || (r.line ? [r.line] : []) };
    const x = B.normFig(sp, ctx, { unit: "L" });
    const nb = (r.specs || []).find((q) => q.key === "bore"), nc = (r.specs || []).find((q) => q.key === "cyl");
    const bb = nb ? B.normFig(nb, ctx, { unit: "mm" }) : null, cc = nc ? B.normFig(nc, ctx, {}) : null;
    const geo = bb?.ok && cc?.ok && bb.r.bore?.bore && bb.r.bore?.stroke && cc.r.count ? Math.PI / 4 * bb.r.bore.bore ** 2 * bb.r.bore.stroke * cc.r.count / 1e6 : null;
    inv.push({ sid: s.id, n: r.n ?? t.n, table: r.table, title: t.title || "", kind: r.kind, model: r.model, key: r.key ?? C.keyOf(r.model || ""), genset: r.genset ?? null,
      label: sp.label, value: sp.value, header0: (t.header || [])[0] || "", unit: x.r?.unit ?? null, unitFrom: x.r?.cond?.unitFrom ?? null, num: x.r?.num ?? null,
      conv: x.r?.conv ?? null, boreRaw: nb ? nb.value : null, cylRaw: nc ? nc.value : null, geo: geo == null ? null : Math.round(geo * 10000) / 10000, missing: x.r?.missing ?? [], ok: x.ok, why: x.why, line: r.line || "" });
  }
}

// 2) Số đông dung tích theo khoá động cơ (y như cand-disp-round.test.mjs votes()).
const maj = {};
for (const e of CATX.engines || []) {
  const ef = FACTS.get(`engine:${e.key}`) || [];
  const v = B.dispVoters(e, ef, { suppliers: supMap, read });
  const figs = ef.filter((f) => f.key === "disp").map((f) => [f.supplierId, read(f), f.value, f.label]);
  for (const u of e.uses) for (const f of u.specs || []) if (f.key === "disp") figs.push([u.supplierId, read(f, B.useNormCtx(u)), f.value, f.label]);
  if (!figs.length) continue;
  const m = figs.map(([s, x]) => [v.get(s) ?? s, x]);
  const mj = B.majorityRound(m);
  const show = (x) => (x === B.BLOCK ? "BLOCK" : x);
  const tally = {};
  for (const [s, x, val] of figs) { const k = String(show(x)); (tally[k] ||= new Set()).add(s); }
  maj[e.key] = { model: e.model, make: e.make || "", win: mj?.win ?? null, votes: mj?.votes ?? null, blocked: mj?.blocked ?? null, group: mj?.group ?? null,
    exact: mj ? B.dispExact(mj, "min") : null, figs: Object.fromEntries(Object.entries(tally).map(([k, ss]) => [k, [...ss].sort()])) };
}
fs.writeFileSync(OUT, JSON.stringify({ inv, maj }, null, 0));
console.error(`inv ${inv.length}, khoá có disp ${Object.keys(maj).length}`);
