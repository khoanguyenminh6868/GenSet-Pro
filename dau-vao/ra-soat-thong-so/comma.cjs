// Values the normalizer leaves as `missing: number` (comma + exactly 3 digits): what are they?
const fs = require("fs"), path = require("path");
const REPO = process.argv[2];
for (const f of ["web/conversions.js", "web/spec-norm.js"]) new Function(fs.readFileSync(path.join(REPO, f), "utf8"))();
const { C, S } = require("./load.cjs")(REPO);
const SN = globalThis.GenbidSpecNorm;
const by = new Map();
for (const s of S) {
  if (s.status === "incomplete") continue;
  for (const o of C.fromSupplier(s)) {
    const list = SN.normalizeRecord(o) || []; const arr = Array.isArray(list) ? list : list.specs || [];
    for (const r of arr) if (r.missing.includes("number")) {
      if (!by.has(r.key)) by.set(r.key, new Map());
      const m = by.get(r.key), k = `${s.id} | "${r.raw.label.slice(0, 40)}" = "${r.raw.value.slice(0, 40)}"`;
      m.set(k, (m.get(k) || 0) + 1);
    }
  }
}
for (const [k, m] of by) {
  const n = [...m.values()].reduce((a, b) => a + b, 0), sup = new Map();
  for (const [e, c] of m) { const id = e.split(" | ")[0]; sup.set(id, (sup.get(id) || 0) + c); }
  console.log(`\n${k}: ${n} gia tri | NCC: ${[...sup].sort((a, b) => b[1] - a[1]).map((x) => x.join("=")).join(", ")}`);
  for (const [e, c] of [...m].sort((a, b) => b[1] - a[1]).slice(0, 12)) console.log("   ", c, e);
}
