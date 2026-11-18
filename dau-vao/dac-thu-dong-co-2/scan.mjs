// node scan.mjs <worktree> <specsDir> <analysis.json>: every hit of the engine / controller terms in every HSMT.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [wt, specs, analysis] = process.argv.slice(2);
const ET = await import(pathToFileURL(path.join(wt, "suppliers", "engine-traits.mjs")).href);
const traits = ET.load().traits;
const texts = new Map();
for (const k of fs.readdirSync(specs)) { const f = path.join(specs, k, "text.txt"); if (fs.existsSync(f)) texts.set(k, fs.readFileSync(f, "utf8")); }
let an = {}; try { const j = JSON.parse(fs.readFileSync(analysis, "utf8")); for (const [id, d] of Object.entries(j.docs)) an[id] = d.d?.result || d.d || d; } catch (e) { console.error(e.message); }
const keys = new Set([...texts.keys(), ...Object.keys(an)]);
let n = 0, nT = 0, nA = 0;
const rows = [];
for (const k of [...keys].sort()) {
  n++;
  let t = texts.get(k);
  let from = "text";
  if (!t) { const ts = an[k]?.technicalSpecs || []; if (!ts.length) continue; t = ts.map((r) => [r.item, r.quote || r.requirement].filter(Boolean).join(" | ")).join("\n"); from = "analysis"; nA++; } else nT++;
  const hits = ET.traitsIn(t, traits);
  if (!hits.length) continue;
  const f = ET.filterOf(t, traits);
  rows.push({ k, from, engineMake: f.engineMake, conflict: f.engineConflict || null, ctl: f.controllers.map((c) => c.term), hits: hits.map((h) => `${h.group}/${h.at}${h.equivalent ? "/tđ" : ""} ${h.term} «${h.word}» L${h.lineNo}: ${h.line.slice(0, 140)}`) });
}
console.log(`gói: ${n} (chữ HSMT ${nT}, chỉ Phân tích ${nA}); có từ: ${rows.length}`);
for (const r of rows) { console.log(`\n${r.k} [${r.from}] lọc hãng: ${r.engineMake || "-"}${r.conflict ? ` XUNG ĐỘT ${r.conflict}` : ""}; BĐK: ${r.ctl.join(", ") || "-"}`); for (const h of r.hits) console.log("  " + h); }
