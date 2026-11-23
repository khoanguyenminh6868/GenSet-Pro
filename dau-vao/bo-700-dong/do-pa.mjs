// So phương án: cỡ thô / gzip và thời gian CPU của C.build, đo xen kẽ: node do-pa.mjs <worktree> <tran.tsv> <out.json>
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const [wt, tsv, out] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const { controllerSheet } = await import(pathToFileURL(path.join(SUP, "maker-datasheets.mjs")).href);
const { tablesOf } = await import(pathToFileURL(path.join(SUP, "crawl-specs.mjs")).href);
const all = fs.readdirSync(path.join(SUP, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8")));
const hits = fs.readFileSync(tsv, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t")).map((c) => ({ cap: +c[0], id: c[1], n: +c[2] }));
const fullOf = (h) => {
  const raw = fs.readFileSync(path.join(SUP, "sources", h.id, `${h.n}.md`), "utf8").replace(/\r/g, "");
  if (h.cap === 700) return controllerSheet(raw.replace(/^URL:.*\nAccessed:.*\n(From:.*\n)?\n?/, "")).rows;
  return tablesOf(raw).filter((t) => t.sheet).flatMap((t) => t.rows);
};
const variant = (skip) => {
  const m = new Map();
  for (const h of hits) {
    if (skip(h)) continue;
    const r = m.get(h.id) || structuredClone(all.find((x) => x.id === h.id)); m.set(h.id, r);
    const t = r.specTables.find((x) => x.n === h.n && x.rows.length >= (h.cap === 700 ? 699 : h.cap)) || r.specTables.find((x) => x.n === h.n);
    const have = new Set(t.rows); t.rows = [...t.rows, ...fullOf(h).filter((l) => !have.has(l))];
  }
  return all.map((r) => m.get(r.id) || r);
};
const A = variant(() => false), Bc = variant((h) => h.cap === 700), Cc = variant((h) => h.id === "sices");
const js = (r) => JSON.stringify(r, null, 2) + "\n";
const raw = (l) => l.reduce((a, r) => a + Buffer.byteLength(js(r)), 0), gz = (l) => l.reduce((a, r) => a + zlib.gzipSync(js(r)).length, 0);
const cpu = (l) => { const c = structuredClone(l); global.gc?.(); const s = process.cpuUsage(); C.build(c); const d = process.cpuUsage(s); return Math.round((d.user + d.system) / 1000); };
const times = { goc: [], A: [] };
for (let i = 0; i < 3; i++) { times.goc.push(cpu(all)); times.A.push(cpu(A)); }
const res = {};
for (const [k, l] of Object.entries({ goc: all, A_giu_du: A, B_chi_bo_60_250: Bc, C_tru_sices: Cc })) res[k] = { rawBytes: raw(l), gzipBytes: gz(l) };
const r = { res, cpuMs: times };
fs.writeFileSync(out, JSON.stringify(r, null, 1));
console.log(JSON.stringify(r, null, 1));
