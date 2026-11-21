// In nguyên dòng thông số của 16 tờ lệch, luật đã loại của model đó, và kiểm số generatordieselchina = Prime × g/kWh / 0,84.
import fs from "node:fs";
import path from "node:path";
const CN = "C:/Projects/GenSet Pro/wt-do-1022-nhanh/suppliers/cn";
const J = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const L = JSON.parse(fs.readFileSync(path.join(CN, "longkai-power.json"), "utf8"));
const NS = [1053, 1009, 1012, 1018, 1069, 1045, 1124, 1144, 1085, 1104, 1105, 1107, 1118, 1158, 1159];
const RE = /POWER YOUR|Prime Power:|No\. ?cylinders|Displacement|Bore|Prime power \||Rated net|100% load|75% load|50% load|^\| Model \| (?!LONGKAI|LG|LK)/i;
for (const n of NS) {
  const t = L.specTables.find((x) => x.n === n); if (!t) { console.log("n" + n, "không thấy"); continue; }
  const rows = [...(t.header || []), ...(t.rows || [])].filter((r) => RE.test(r)).map((r) => String(r).replace(/\s+/g, " ").slice(0, 60));
  const m = rows.find((r) => /POWER YOUR/.test(r))?.split("|")[2]?.trim();
  const lost = J.lost.filter((x) => x.sup === "longkai-power" && x.model === m), rules = {}; for (const x of lost) for (const r of x.ruled) rules[r] = (rules[r] || 0) + 1;
  console.log(`\nn${n} ${m} | dòng mất ${lost.length} ${JSON.stringify(rules)}\n  ` + rows.join(" ; "));
}
console.log("\n== generatordieselchina: 100% = Prime × g/kWh / 0,84 ?");
const G = JSON.parse(fs.readFileSync(path.join(CN, "generatordieselchina.json"), "utf8"));
const models = new Set(J.lost.filter((x) => x.sup === "generatordieselchina").map((x) => x.model));
for (const t of G.specTables || []) {
  const rows = [...(t.header || []), ...(t.rows || [])].map(String), e = rows.find((r) => /\| Engine Model \|/.test(r))?.split("|")[2]?.trim();
  if (!models.has(e)) continue;
  const pr = +rows.find((r) => /\| Prime Power \|/.test(r))?.match(/([\d.]+)\s*kW/)?.[1], sb = +rows.find((r) => /\| Standby Power \|/.test(r))?.match(/([\d.]+)\s*kW/)?.[1], g = +rows.find((r) => /Fuel Efficiency \|/.test(r))?.match(/([\d.]+)\s*g/)?.[1], f = rows.find((r) => /Fuel Consumption \|/.test(r))?.match(/\/\s*([\d.]+)\s*L/)?.[1], hz = rows[0].match(/(\d\d)Hz/)?.[1];
  console.log(`n${t.n} ${e} ${hz}Hz prime ${pr} standby ${sb} g ${g} 100%=${f} | theo Prime ${(pr * g / 840).toFixed(1)} | theo Standby ${(sb * g / 840).toFixed(1)}`);
}
