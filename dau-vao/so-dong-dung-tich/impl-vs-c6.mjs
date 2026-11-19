// node impl-vs-c6.mjs <worktree nhánh> <do-c6-main.json>: số đông dung tích theo MÃ NHÁNH (dispVoters, đọc như candidates:
// fact của động cơ đọc với NORM_CTX) so với phép đo C6 (do-c6.mjs). In mọi nhóm (model, trước, sau) khác nhau.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, C6] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), sup = new Map(sups.map((s) => [s.id, s]));
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };
const impl = new Set();
for (const e of cat.engines) {
  const ef = facts.get(`engine:${e.key}`) || [];
  if (!e.uses.some((u) => u.line || u.lines)) continue;
  let v = null;
  for (const u of e.uses) {
    if (!u.line && !u.lines) continue;
    const ctxU = B.useNormCtx(u);
    const figs = [...ef.map((f) => [f, undefined]), ...(u.specs || []).map((f) => [f, ctxU])].filter(([f]) => f.key === "disp").map(([f, ctx]) => [f.supplierId ?? u.supplierId, read(f, ctx)]);
    if (!figs.length) continue;
    v ||= B.dispVoters(e, ef, { suppliers: sup, read: (f, ctx) => read(f, ctx) });
    const w0 = B.majorityOf(figs)?.win ?? null, w1 = B.majorityOf(figs.map(([s, x]) => [v.get(s) ?? s, x]))?.win ?? null;
    if (w0 !== w1) impl.add(`${e.key}|${w0}|${w1}`);
  }
}
const c6 = new Set(JSON.parse(fs.readFileSync(C6, "utf8")).filter((g) => g.key === "disp" && g.c6 !== g.before).map((g) => `${g.ekey}|${g.before}|${g.c6}`));
console.log("mã nhánh:", impl.size, "nhóm; C6:", c6.size);
console.log("chỉ mã nhánh:", [...impl].filter((x) => !c6.has(x)));
console.log("chỉ C6:", [...c6].filter((x) => !impl.has(x)));
