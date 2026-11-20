import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const bot = await import(pathToFileURL("C:/Projects/GenSet Pro/GenSet-Pro/suppliers/config-bot.mjs").href);
const out = process.argv[2], key = "IB2600603983";
for (const coll of ["configmatch", "configreq", "findmatch", "analysis"]) {
  try {
    const d = await bot.doc(coll, key);
    fs.writeFileSync(path.join(out, `${coll}.json`), JSON.stringify(d ?? null, null, 1), "utf8");
    console.log(coll, d ? Object.keys(d).join(",") : "không có");
  } catch (e) { console.log(coll, "lỗi", e.message); }
}
