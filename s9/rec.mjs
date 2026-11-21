// node rec.mjs <code dir> <sid> <table index>: full records + notes of one table
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, SID, TI] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(path.join(WT, "suppliers", "cn", SID + ".json"), "utf8"));
const notes = [];
const recs = C.fromSupplier(s, notes).filter((r) => r.table === +TI);
for (const r of recs) { const { lines, header, ...x } = r; console.log(JSON.stringify(x)); }
for (const x of notes.filter((x) => x.table === +TI)) console.log("NOTE", JSON.stringify(x));
