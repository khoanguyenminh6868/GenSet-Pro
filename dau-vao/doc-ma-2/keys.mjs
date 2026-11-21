// node keys.mjs <dir> <regex> — khoá engines/alternators của build() khớp regex
import fs from "node:fs"; import path from "node:path"; import { loadWeb } from "./load.mjs";
const [dir, re] = process.argv.slice(2);
const C = loadWeb(dir);
const S = fs.readdirSync(path.join(dir, "suppliers/cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, "suppliers/cn", f), "utf8")));
const B = C.build(S);
const R = new RegExp(re);
for (const kind of ["engines", "alternators"]) for (const [k, v] of Object.entries(B[kind] || {})) if (R.test(k) || R.test(v.model || "")) console.log(kind, k, "|", v.model, "|", (v.uses || []).map((u) => u.supplierId + ":" + u.n).join(","));
