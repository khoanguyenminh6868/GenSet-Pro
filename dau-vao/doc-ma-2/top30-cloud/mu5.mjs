// Loại thông số (eKeys, mỗi loại +8 điểm, tối đa 8) của các khoá đổi điểm; số bore để giải thích luật disp của 6M31.
// node mu5.mjs <code> <cn>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), facts = B.modelFacts(full, sups);
for (const m of ["6M31G1000/5", "6M31G1000/5^", "6M31G800/6", "6M31G800/6^", "8M33G900/6", "8M33G900/6^", "20M33G4D3/5", "20M33G4D3/5^", "8M33D1012E311", "8M33D1012E311^"]) {
  const f = B.factsFor(facts, "engine", m);
  if (!f.length) { console.log(m, "(không có khoá)"); continue; }
  const keys = [...new Set(f.map((x) => x.key))].sort();
  const bore = [...new Set(f.filter((x) => x.key === "bore").map((x) => `${x.supplierId}:${x.value}`))];
  console.log(`${m}\t${keys.length} loại: ${keys.join(",")}\tbore ${bore.join(" ; ") || "-"}`);
}
