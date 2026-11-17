// Build a config regression fixture of a stored configmatch/<key> (a size of it with --size i): the stored result as the
// agent's answer, the HSMT text (fetched read-only), meta (origin, basis, sized) and the supplier rows it needs.
// Mode A: suppliers referenced by the result only; mode B: A + every row of the DB that names a model of the result.
// Prints the summary of check on the full DB vs A vs B.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const S = "C:/Projects/GenSet Pro/wt-test-t4/suppliers/";
const CB = await import(pathToFileURL(S + "config-bot.mjs").href);
const { summarize } = await import(pathToFileURL(path.join(process.env.LOCALAPPDATA, "Temp/claude/t4/summary.mjs")).href);
const snap = path.join(process.env.LOCALAPPDATA, "Temp/claude/t4snap");
const [key, sizeArg, mode = "B", outDir] = process.argv.slice(2);
const cmAll = JSON.parse(fs.readFileSync(path.join(snap, "configmatch.json"), "utf8")).docs[key], cm = cmAll.d.result;
const sized = sizeArg && sizeArg !== "-";
const stored = sized ? cm.sizes[Number(sizeArg) - 1].result : cm;
const all = Object.values(JSON.parse(fs.readFileSync(path.join(snap, "supplier.json"), "utf8")).docs).map((x) => x.d).filter((s) => s && s.status !== "incomplete");
// Emails in the HSMT (investor staff) are not kept: the repo is public.
const hsmtText = fs.readFileSync(path.join(snap, "hsmt", `${key}.txt`), "utf8").replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+.[A-Za-z]{2,}/g, "[email]");
const origin = stored.origin || cm.origin || "all";
const meta = { origin, ...(stored.originAuto?.basis || cm.originAuto?.basis ? { basis: stored.originAuto?.basis || cm.originAuto.basis } : {}), ...(origin === "g7eu" ? { basis: "origin" } : {}), ...(sized ? { sized: true } : {}) };
const K = (m) => String(m || "").normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "");
// Referenced (supplierId, n, line) anywhere in the result.
const refs = new Map(), lines = new Set();
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (!o || typeof o !== "object") return;
  if (typeof o.supplierId === "string") { if (!refs.has(o.supplierId)) refs.set(o.supplierId, new Set()); if (o.n != null) refs.get(o.supplierId).add(Number(o.n)); if (o.line) lines.add(K(o.line)); }
  Object.values(o).forEach(walk);
})(stored);
const models = new Set();
for (const c of stored.configs || []) for (const p of ["engine", "alternator", "controller", "genset"]) { const k = K(c[p]?.model); if (k.length >= 4) models.add(k); }
const mentions = (row) => { const k = K(row); return lines.has(k) || [...models].some((m) => k.includes(m)); };
const ROW_MAX = 40;
function trim(s) {
  const own = refs.get(s.id) || new Set();
  const tables = [];
  for (const t of s.specTables || []) {
    const ref = own.has(Number(t.n));
    const hit = (t.rows || []).filter(mentions);
    const head = [...(t.header || []), t.title || ""].some(mentions);
    if (!(ref || hit.length || (mode === "B" && head))) continue;
    if (mode === "A" && !ref) continue;
    // A small table whole (label tables of one model, model columns); a long one: only the rows that name a model / are quoted.
    tables.push((t.rows || []).length <= ROW_MAX || head || (ref && /^Datasheet/i.test(t.title || "")) ? t : { ...t, rows: (t.rows || []).filter((r, i) => i < 3 || mentions(r)) });
  }
  if (!tables.length && !own.size) return null;
  const ns = new Set([...own, ...tables.map((t) => Number(t.n))]);
  const controllers = (s.controllers || []).filter((c) => (c.src || []).some((n) => own.has(Number(n))) || models.has(K(c.model)) || [...models].some((m) => K(c.line).includes(m)));
  for (const c of controllers) for (const n of c.src || []) ns.add(Number(n));
  const { specTables, controllers: _c, sources, strengths, certifications, exportMarkets, missing, ...rest } = s;
  return { ...rest, sources: (sources || []).filter((x) => ns.has(Number(x.n))), specTables: tables, controllers };
}
const fix = all.map(trim).filter(Boolean).filter((s) => mode === "B" || refs.has(s.id));
const run = (suppliers, sourcesDir) => {
  const result = JSON.parse(JSON.stringify(stored));
  const out = CB.check(result, { hsmtText, suppliers, readWeb: () => null, origin, basis: meta.basis, sized: !!meta.sized, sourcesDir });
  CB.rankConfigs(out.result);
  globalThis.__probs = (globalThis.__probs || []).concat([out.problems]); return summarize(out);
};
const full = run(all), mine = run(fix);
console.log(key, sizeArg || "", "mode", mode, "suppliers", fix.length, "bytes", JSON.stringify(fix).length, "same as full DB:", JSON.stringify(full) === JSON.stringify(mine));
if (JSON.stringify(full) !== JSON.stringify(mine)) { const [pf, pm] = globalThis.__probs; console.log(" only full:", pf.filter((p) => !pm.includes(p))); console.log(" only mine:", pm.filter((p) => !pf.includes(p))); console.log(" full", JSON.stringify(full).slice(0, 1500)); console.log(" mine", JSON.stringify(mine).slice(0, 1500)); }
if (outDir) {
  // sources/<id>/<n>.md that sourceRatings would read (ratings sheets) for the suppliers kept.
  const sources = {};
  for (const s of fix) for (const x of s.sources || []) {
    const f = path.join(S, "sources", s.id, `${x.n}.md`);
    if (!fs.existsSync(f)) continue;
    const text = fs.readFileSync(f, "utf8");
    if (!/RATINGS|TEMPERATURE RISE|^Ratings (50|60) Hz|rpm \((50|60) Hz Ratings\)/im.test(text)) continue;
    sources[`${s.id}/${x.n}.md`] = text;
  }
  const { writeBundle } = await import(pathToFileURL(S + "fixtures/runs/regress.mjs").href);
  fs.mkdirSync(path.dirname(outDir), { recursive: true });
  writeBundle(outDir, { from: { tender: key, size: sized ? Number(sizeArg) : null, configmatchAt: cmAll.d.at, supplierSnapshot: "genbid-work/doc-cache/supplier.json 2026-11-13 06:31", hsmt: "web hsmttext + notice, đọc 2026-11-13" }, meta, result: stored, hsmtText, suppliers: fix, sources });
  const tmp = fs.mkdtempSync(path.join(process.env.LOCALAPPDATA, "Temp/claude/t4src-"));
  for (const [f, t] of Object.entries(sources)) { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.writeFileSync(path.join(tmp, f), t); }
  const withSrc = run(fix, tmp);
  console.log(" ratings files", Object.keys(sources).length, "frozen-sources same:", JSON.stringify(withSrc) === JSON.stringify(mine), "bundle bytes", fs.statSync(outDir).size);
}
