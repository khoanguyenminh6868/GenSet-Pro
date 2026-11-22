// md5 của JSON build() trên suppliers/cn của một thư mục gốc repo. node build-md5.mjs <root> [--diff <out.json>]
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { pathToFileURL } from "node:url";
const R = path.resolve(process.argv[2]);
await import(pathToFileURL(path.join(R, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(R, "suppliers", "cn");
const recs = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const b = C.build(recs);
const out = {};
for (const k of Object.keys(b)) out[k] = crypto.createHash("md5").update(JSON.stringify(b[k])).digest("hex");
console.log(JSON.stringify(out));
