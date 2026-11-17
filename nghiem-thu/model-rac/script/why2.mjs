import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM="1";
await import(pathToFileURL(path.resolve(process.argv[2])).href); const CAT = globalThis.GenbidCatalog;
const re = new RegExp(process.argv[3], "i");
const sups = fs.readdirSync("suppliers/cn").filter(f=>f.endsWith(".json")).map(f=>JSON.parse(fs.readFileSync("suppliers/cn/"+f,"utf8"))).filter(d=>d.status!=="incomplete");
let n=0;
for (const s of sups) { let rows; try { rows = CAT.fromSupplier ? CAT.fromSupplier(s) : null; } catch(e){ } if(!rows) break;
  for (const r of rows) if (re.test(r.model) && n++<40) console.log(s.id, r.table, r.model, "|", r.line, "|", String(JSON.stringify(r.header)).slice(0,120), r.kind); }
