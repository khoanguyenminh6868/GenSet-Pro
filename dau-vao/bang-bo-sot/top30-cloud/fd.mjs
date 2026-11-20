// node fd.mjs : facts động cơ đổi gốc → nhánh (thêm / mất), theo khoá
import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("f-goc.json")), B = JSON.parse(fs.readFileSync("f-nhanh.json"));
const s = (f) => `${f.key}=${f.value} [${f.sup} n${f.n}]`;
for (const k of [...new Set([...Object.keys(A), ...Object.keys(B)])].sort()) {
  const a = new Set((A[k] || []).map(s)), b = new Set((B[k] || []).map(s));
  const add = [...b].filter((x) => !a.has(x)), rm = [...a].filter((x) => !b.has(x));
  if (!add.length && !rm.length) continue;
  const ka = new Set((A[k] || []).map((f) => f.key)), kb = new Set((B[k] || []).map((f) => f.key));
  console.log(`${k}: khoá thông số ${ka.size} → ${kb.size}${[...kb].filter((x) => !ka.has(x)).length ? " (mới: " + [...kb].filter((x) => !ka.has(x)).join(",") + ")" : ""}`);
  for (const x of add) console.log("   + " + x); for (const x of rm) console.log("   - " + x);
}
