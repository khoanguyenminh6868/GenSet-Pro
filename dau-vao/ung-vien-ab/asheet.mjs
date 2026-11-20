// Luật A trên toàn danh mục: động cơ nào có datasheet hãng, từ NCC nào; NCC engine_maker bị loại vì khác hãng.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const B = await import(pathToFileURL(process.argv[3] + "/suppliers/config-bot.mjs").href);
const CAT = globalThis.GenbidCatalog;
const all = JSON.parse(fs.readFileSync(process.argv[2], "utf8")), sup = new Map(all.map((s) => [s.id, s]));
const full = CAT.build(all), facts = B.modelFacts(full, all);
let yes = 0, n = 0; const bySup = {}, miss = {}, kinds = { sheet: 0, maker: 0 };
for (const e of full.engines) {
  n++;
  const ef = facts.get(`engine:${e.key}`) || [], s = B.engineMakerSheets(e, ef, sup);
  if (s.length) { yes++; for (const x of s) bySup[x] = (bySup[x] || 0) + 1; for (const f of ef.filter((f) => s.includes(f.supplierId))) kinds[f.sheet ? "sheet" : "maker"]++; }
  for (const f of ef) if ((f.sheet || f.maker) && sup.get(f.supplierId)?.role === "engine_maker" && !s.includes(f.supplierId)) { const k = `${f.supplierId} → ${e.make || "(chưa rõ hãng)"}`; (miss[k] ||= new Set()).add(e.model); }
}
console.log(`động cơ ${n}, có datasheet hãng ${yes}; fact theo loại`, kinds);
console.log("theo NCC:", JSON.stringify(Object.entries(bySup).sort((a, b) => b[1] - a[1])));
console.log("fact engine_maker KHÔNG tính (khác hãng / chưa rõ hãng):");
for (const [k, v] of Object.entries(miss)) console.log(`  ${k}: ${v.size} model, vd ${[...v].slice(0, 6).join(", ")}`);
