// node engFacts.cjs <repo> <regex model> [khoá thông số,…]: mọi bản ghi (động cơ) có model khớp, kèm thông số nêu, theo NCC / nguồn.
const load = require("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/ra-soat-thong-so/load.cjs");
const [R, RE, KS] = process.argv.slice(2), re = new RegExp(RE, "i"), ks = (KS || "cyl,disp,bore").split(",");
const { C, S } = load(R);
for (const s of S) { if (s.status === "incomplete") continue; for (const o of C.fromSupplier(s)) { if (o.kind !== "engine" || !re.test(o.model || "")) continue; const sp = (o.specs || []).filter((f) => ks.includes(f.key)).map((f) => `${f.key}[${f.label}]=${f.value}`).join(" ; "); console.log(`${s.id} n${o.n} ${o.model} :: ${sp || "-"} :: ${String(o.line || "").slice(0, 150)}`); } }
