// So loại BĐK của MỌI model (mọi hãng controller_maker) gốc ↔ nhánh. node kinds-all.mjs <suppliers>
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const R = path.resolve(process.argv[2]);
const bot = await import(pathToFileURL(path.join(R, "config-bot.mjs")).href);
const CM = await import(pathToFileURL(path.join(R, "ctl-module.mjs")).href);
const recs = fs.readdirSync(path.join(R, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(R, "cn", f), "utf8")));
console.log(JSON.stringify([...CM.ctlKinds(recs, { modelsIn: bot.ctlModelsIn })].sort()));
