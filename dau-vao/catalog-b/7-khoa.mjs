// node 7-khoa.mjs <worktree> <khoá...>: specs bỏ phiếu (cyl / disp / bore / compr: win, votes) và từng dòng (NCC, n, model, cyl, disp) của khoá động cơ.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, ...KEYS] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups);
for (const k of KEYS) {
  const e = cat.engines.find((x) => x.key === k);
  if (!e) { console.log(`${k}: không có`); continue; }
  console.log(`## ${k} (${e.uses.length} dòng, ${e.suppliers.length} NCC, hãng ${e.make || "∅"}, kW ${e.kw}, kVA ${e.kva})`);
  for (const s of e.specs.filter((x) => x.win !== undefined)) console.log(`  ${s.key}: win ${s.win} votes ${JSON.stringify(s.votes)}`);
  for (const u of e.uses) console.log(`  ${u.supplierId} n${u.n} ${u.model} cyl=${(u.specs || []).filter((x) => x.key === "cyl").map((x) => x.value)} disp=${(u.specs || []).filter((x) => x.key === "disp").map((x) => x.value)} power=${JSON.stringify(u.power)}`);
}
