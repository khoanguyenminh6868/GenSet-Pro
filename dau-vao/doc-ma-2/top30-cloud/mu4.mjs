// Số xi lanh / dung tích / tần số theo NCC của mỗi khoá nhóm ^, ở một bản code; không có chữ HSMT.
// node mu4.mjs <code> <cn> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, CN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const sups = fs.readdirSync(CN).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"))).filter((d) => d.status !== "incomplete");
const full = CAT.build(sups), facts = B.modelFacts(full, sups);
const GROUP = /^(12M55G3000\/5|12M55G6D3\/5|16M33D1980E310|16M33G2250\/5|16M33G8D3\/5|16M55G4000\/5|16M55G6D3\/5|20M33G2750\/5|20M33G4D3\/5|6M11G176\/6|6M31G1000\/5|6M31G800\/6|8M33D1012E311|8M33D975E310|8M33G6D3\/5|8M33G900\/6|WP6D180E201)\^?$/;
const out = {};
for (const e of Object.values(full.engines)) {
  if (!GROUP.test(e.key)) continue;
  const f = B.factsFor(facts, "engine", e.model);
  const by = (key) => { const m = {}; for (const x of f.filter((y) => y.key === key)) (m[x.supplierId ?? "?"] ||= new Set()).add(String(x.value)); return Object.fromEntries(Object.entries(m).map(([s, v]) => [s, [...v]])); };
  const freq = {}; for (const u of e.uses) { const k = u.freq || "không ghi"; freq[k] = (freq[k] || 0) + 1; }
  out[e.key] = { model: e.model, cyl: by("cyl"), disp: by("disp"), freq, rows: e.uses.length, sup: new Set(e.uses.map((u) => u.supplierId)).size };
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 0));
for (const k of Object.keys(out).sort()) {
  const x = out[k], s = (m) => { const c = {}; for (const v of Object.values(m)) for (const y of v) c[y] = (c[y] || 0) + 1; return Object.entries(c).map(([a, b]) => `${a}×${b}`).join(" ") || "-"; };
  console.log(`${k}\tdòng ${x.rows}/NCC ${x.sup}\tcyl ${s(x.cyl)}\tdisp ${s(x.disp)}\tHz ${JSON.stringify(x.freq)}`);
}
