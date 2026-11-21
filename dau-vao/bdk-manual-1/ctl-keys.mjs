// Khoá controller:* của modelFacts (số dòng), loại BĐK (ctlKinds), số dòng mô-đun. node ctl-keys.mjs <worktree> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, out] = process.argv.slice(2);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(root, "suppliers", "ctl-module.mjs")).href);
const dir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((s) => s.role === "controller_maker");
const facts = CB.modelFacts({ engines: [], alternators: [] }, sups);
const keys = Object.fromEntries([...facts].filter(([k]) => k.startsWith("controller:")).map(([k, v]) => [k, v.length]).sort());
const kinds = Object.fromEntries([...CM.ctlKinds(sups, { modelsIn: CB.ctlModelsIn })].map(([k, v]) => [k, v]).sort());
const mods = Object.fromEntries([...CM.moduleFacts(sups)].map(([k, v]) => [k, v.length]).sort());
fs.writeFileSync(out, JSON.stringify({ keys, kinds, mods }, null, 1));
console.log("khoá", Object.keys(keys).length, "loại", Object.keys(kinds).length, "mô-đun", Object.keys(mods).length, "| 7310", keys["controller:DSE7310MKII"], "7320", keys["controller:DSE7320MKII"]);
