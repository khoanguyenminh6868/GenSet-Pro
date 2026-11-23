// PR 2: so build() trên TOÀN BỘ cn/ trước ↔ sau theo khoá động cơ / đầu phát: khoá thêm / mất, hãng đổi.
//   node pr2-build.mjs <gốc sau> <gốc trước> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const all = (r) => { const d = path.join(r, "suppliers", "cn"); return fs.readdirSync(d).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))); };
const list = (x) => (x instanceof Map ? [...x.entries()] : Array.isArray(x) ? x.map((e) => [e.key ?? e.model, e]) : Object.entries(x || {}));
const mk = (e) => (e.makes || []).map((m) => (typeof m === "string" ? m : m.name)).sort().join("+") || "—";
const A = C.build(all(before)), B = C.build(all(after)), out = [];
for (const kind of ["engines", "alternators"]) {
  const a = new Map(list(A[kind])), b = new Map(list(B[kind]));
  const gone = [...a.keys()].filter((k) => !b.has(k)), added = [...b.keys()].filter((k) => !a.has(k));
  let changed = 0;
  for (const k of gone) out.push(`${kind}\tMẤT KHOÁ\t${k}\t${mk(a.get(k))}`);
  for (const k of added) out.push(`${kind}\tTHÊM KHOÁ\t${k}\t${mk(b.get(k))}`);
  for (const [k, e] of b) { const o = a.get(k); if (o && mk(o) !== mk(e)) { changed++; out.push(`${kind}\tĐỔI HÃNG\t${k}\t${mk(o)} → ${mk(e)}`); } }
  console.log(`${kind}: ${a.size} → ${b.size}; mất khoá ${gone.length}, thêm khoá ${added.length}, đổi hãng ${changed}`);
}
fs.writeFileSync(outFile, out.join("\n") + "\n", "utf8");
for (const l of out.slice(0, 40)) console.log(l);
