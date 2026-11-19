// node 2-tim-dong.mjs <worktree> <regex dòng nguồn> [kind]: mọi bản ghi CAT.build có dòng nguồn khớp (in kind, model, NCC, n, bảng, dòng).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, RE, KIND] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), re = new RegExp(RE, "i");
for (const kind of ["engines", "alternators"]) {
  if (KIND && !kind.startsWith(KIND)) continue;
  for (const e of cat[kind]) for (const u of e.uses) {
    const l = String(u.line || "");
    if (re.test(l)) console.log(`${kind}\t${e.key}\t${u.supplierId}\tn${u.n}\tb${u.table}\tr${u.row}\t${JSON.stringify(u.power)}\t${l.slice(0, 200)}`);
  }
}
