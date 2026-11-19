// node probe.mjs <worktree>: trên fixture so-dong-dung-tich.json, in nhóm phiếu dung tích (dispVoters) và số đông trước / sau.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const sups = JSON.parse(fs.readFileSync(path.join(WT, "suppliers", "fixtures", "so-dong-dung-tich.json"), "utf8"));
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), sup = new Map(sups.map((s) => [s.id, s]));
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };
for (const k of ["TAD1341GE", "6R1600G70F", "12V2000G25", "S12RPTAC", "TAD531GE", "TAD1351GE"]) {
  const e = cat.engines.find((x) => x.key === k);
  if (!e) { console.log(k, "KHÔNG CÓ"); continue; }
  const ef = facts.get(`engine:${k}`) || [];
  const v = B.dispVoters(e, ef, { suppliers: sup, read });
  const groups = {}; for (const [s, r] of v) (groups[r] ||= []).push(s);
  const figs = [...ef.filter((f) => f.key === "disp").map((f) => [f.supplierId, read(f)])];
  for (const u of e.uses) for (const f of u.specs || []) if (f.key === "disp") figs.push([u.supplierId, read(f, B.useNormCtx(u))]);
  console.log(k, "| nhóm:", JSON.stringify(Object.values(groups).filter((g) => g.length > 1)), "| trước:", JSON.stringify(B.majorityOf(figs)), "| sau:", JSON.stringify(B.majorityOf(figs.map(([s, x]) => [v.get(s) ?? s, x]))));
}
