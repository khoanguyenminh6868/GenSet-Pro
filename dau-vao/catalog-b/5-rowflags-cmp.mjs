// node 5-rowflags-cmp.mjs <gốc.json> <nhánh.json>: cờ row-flags có ở một bên mà không ở bên kia (khoá = mọi trường trừ số đếm).
import fs from "node:fs";
const [A, B] = process.argv.slice(2);
const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const key = (x) => JSON.stringify(x);
const a = load(A), b = load(B), ka = new Set(a.map(key)), kb = new Set(b.map(key));
for (const x of a) if (!kb.has(key(x))) console.log("CHỈ GỐC\t" + key(x));
for (const x of b) if (!ka.has(key(x))) console.log("CHỈ NHÁNH\t" + key(x));
