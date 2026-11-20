// node run.mjs <gốc repo> : check + rankConfigs trên configmatch mới nhất IB2600603983 (cách check-all của bdk-mo-dun-2).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), here = import.meta.dirname;
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const data = JSON.parse(fs.readFileSync(path.join(here, "configmatch.json"), "utf8"));
const a = JSON.parse(fs.readFileSync(path.join(here, "analysis.json"), "utf8")).result;
const result = JSON.parse(JSON.stringify(data.result));
for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
const text = fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/dieu-phoi/dau-vao/dau-phat-hang-b/hsmt/IB2600603983.txt", "utf8");
const cap = CB.capacity([a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap });
CB.rankConfigs(o.result);
for (const c of o.result.configs) console.log(c.rank, c.engine?.make, c.engine?.model, "|", c.controller?.model, (c.controller?.modules || []).map((m) => m.model).join("+"), "\n   ", c.controller?.altLine || "(không có phương án khác)");
