// node votes.mjs <worktree> <động cơ,...>: phiếu dung tích của động cơ (cách candidates đếm ở mức động cơ: facts + specs của
// mọi dòng, dispVoters), số đông cũ (majorityOf) và mới (majorityRound + dispExact). Chỉ đọc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, LIST] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog, dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), sup = new Map(sups.map((s) => [s.id, s]));
const read = (f, ctx) => { const x = B.normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : B.BLOCK; };
for (const key of LIST.split(",")) {
  const e = cat.engines.find((x) => x.key === key); if (!e) { console.log(key, "không có"); continue; }
  const ef = facts.get(`engine:${key}`) || [];
  const v = B.dispVoters(e, ef, { suppliers: sup, read });
  const figs = ef.filter((f) => f.key === "disp").map((f) => [f.supplierId, read(f)]);
  for (const u of e.uses) for (const f of u.specs || []) if (f.key === "disp") figs.push([u.supplierId, read(f, B.useNormCtx(u))]);
  const m = figs.map(([s, x]) => [v.get(s) ?? s, x]), old = B.majorityOf(m), mj = B.majorityRound(m);
  const by = {}; for (const [s, x] of figs) (by[x] ||= new Set()).add(s);
  console.log(`${key}: số theo NCC ${Object.entries(by).map(([x, s]) => `${x}: ${[...s].join(",")}`).join(" | ")}`);
  console.log(`   cũ ${JSON.stringify(old)}; mới ${JSON.stringify(mj)}; chính xác (tối thiểu) ${mj ? B.dispExact(mj, "min") : "-"}`);
}
