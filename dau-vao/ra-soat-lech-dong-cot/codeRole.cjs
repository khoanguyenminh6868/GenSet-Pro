// node codeRole.cjs <repo> <regex mã>: mọi model khớp regex, đếm bản ghi theo vai (engine / alternator) và theo NCC.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [repo, re] = process.argv.slice(2), R = new RegExp(re, "i");
const { C, S } = load(repo), m = new Map();
for (const s of S) { if (s.status === "incomplete") continue; for (const o of C.fromSupplier(s)) if (R.test(o.model)) { const k = o.kind + " " + o.supplierId; m.set(k, (m.get(k) || new Set()).add(o.model)); } }
for (const [k, v] of [...m].sort()) console.log(k, v.size, [...v].slice(0, 12).join(", "));
