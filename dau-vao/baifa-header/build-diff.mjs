// So build() của toàn bộ cn/ khi thay MỘT hồ sơ: theo khoá động cơ / đầu phát / bộ điều khiển / tổ máy.
//   node build-diff.mjs <gốc repo> <id> <hồ sơ trước .json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, id, before] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(root, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const old = JSON.parse(fs.readFileSync(before, "utf8"));
const A = C.build(S.map((s) => (s.id === id ? old : s))), B = C.build(S);
console.log("phần của build():", Object.keys(B).join(", "));
const entries = (x) => (x instanceof Map ? [...x] : Array.isArray(x) ? x.map((v, i) => [v?.key ?? v?.model ?? i, v]) : Object.entries(x || {}));
const usesOf = (v) => v?.uses || [];
const noUses = (v) => { if (!v || typeof v !== "object") return JSON.stringify(v); const { uses, ...r } = v; return JSON.stringify(r); };
for (const part of Object.keys(B)) {
  if (!B[part] || typeof B[part] !== "object") continue;
  const a = new Map(entries(A[part])), b = new Map(entries(B[part]));
  let same = 0; const out = [];
  for (const [k, v] of b) {
    if (!a.has(k)) { out.push(`  KHOÁ MỚI ${k}: ${usesOf(v).length} dòng; hãng ${(v.makes || []).map((m) => m.name || m).join("/") || "—"}`); continue; }
    const o = a.get(k), ua = usesOf(o).length, ub = usesOf(v).length;
    if (noUses(o) === noUses(v) && ua === ub) { same++; continue; }
    const diff = [];
    if (ua !== ub) diff.push(`dòng ${ua} → ${ub}`);
    for (const f of new Set([...Object.keys(o || {}), ...Object.keys(v || {})])) if (f !== "uses" && JSON.stringify(o[f]) !== JSON.stringify(v[f])) diff.push(`${f}: ${JSON.stringify(o[f])?.slice(0, 160)} → ${JSON.stringify(v[f])?.slice(0, 160)}`);
    out.push(`  ĐỔI ${k}: ${diff.join(" ; ")}`);
  }
  for (const k of a.keys()) if (!b.has(k)) out.push(`  KHOÁ MẤT ${k}`);
  console.log(`\n${part}: ${a.size} → ${b.size} khoá; y nguyên ${same}; khác ${out.length}`);
  out.forEach((x) => console.log(x));
}
