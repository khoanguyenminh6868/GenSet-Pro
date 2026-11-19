// node eng-v.mjs <worktree nhánh>: số đông dung tích theo từng (động cơ, dòng) như candidates, V tắt (majorityOf) và V bật
// (majorityRound). In mọi nhóm (động cơ, trước, sau, nhóm thắng V) khác nhau, 7 nhóm sai đã biết, và khoá động cơ có ký tự lạ.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), sup = new Map(sups.map((s) => [s.id, s]));
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };
const diff = new Map();
const KNOWN = ["6R1600G70F", "6R1600G80F", "8V1600G70F", "8V1600G80F", "10V1600G70F", "12V1600G80F", "TAD1341GE"];
const known = new Map();
for (const e of cat.engines) {
  const ef = facts.get(`engine:${e.key}`) || [];
  let v = null;
  for (const u of e.uses) {
    if (!u.line && !u.lines) continue;
    const ctxU = B.useNormCtx(u);
    const figs = [...ef.map((f) => [f, undefined]), ...(u.specs || []).map((f) => [f, ctxU])].filter(([f]) => f.key === "disp").map(([f, ctx]) => [f.supplierId ?? u.supplierId, read(f, ctx)]);
    if (!figs.length) continue;
    v ||= B.dispVoters(e, ef, { suppliers: sup, read: (f, ctx) => read(f, ctx) });
    const m = figs.map(([s, x]) => [v.get(s) ?? s, x]);
    const a = B.majorityOf(m), b = B.majorityRound(m);
    const s = `${e.key}|${a?.win ?? null}|${b?.win ?? null}|${(b?.group || []).join("/")}|trước ${JSON.stringify(a?.votes || {})}|V ${JSON.stringify(b?.votes || {})}`;
    if (KNOWN.includes(e.key)) known.set(s, (known.get(s) || 0) + 1);
    const changed = (a?.win ?? null) !== (b?.win ?? null) || (b?.group || []).length > 1;
    if (changed) diff.set(s, (diff.get(s) || 0) + 1);
  }
}
console.log(`Nhóm (động cơ, trước, sau) đổi hoặc nhóm thắng V có > 1 số: ${diff.size}`);
for (const [s, n] of [...diff].sort()) console.log(`  ${s}  (${n} dòng)`);
console.log("7 nhóm sai đã biết:");
for (const [s, n] of [...known].sort()) console.log(`  ${s}  (${n} dòng)`);
const odd = cat.engines.filter((e) => /[^A-Z0-9.\-/]/.test(e.key));
console.log(`Khoá động cơ có ký tự ngoài A-Z 0-9 . - /: ${odd.length}`);
for (const e of odd) console.log(`  ${e.key}  NCC: ${[...new Set(e.uses.map((u) => u.supplierId))].join(", ")}`);
