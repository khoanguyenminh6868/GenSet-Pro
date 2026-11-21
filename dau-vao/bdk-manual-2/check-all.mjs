// check + rankConfigs trên MỌI lượt của bản chụp (cả các cỡ), ghi trạng thái TỪNG check và TỪNG phần. node check-all.mjs <gốc repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg), here = import.meta.dirname;
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const list = JSON.parse(fs.readFileSync(path.join(here, "snap", "configmatch.json"), "utf8"));
const ana = JSON.parse(fs.readFileSync(path.join(here, "snap", "analysis.json"), "utf8"));
const res = {};
const one = (key, data, r0, tag) => {
  const result = JSON.parse(JSON.stringify(r0));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const text = fs.readFileSync(path.join(here, "hsmt", `${key}.txt`), "utf8"), a = ana[key]?.result;
  const cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap });
  CB.rankConfigs(o.result);
  res[`${key}${tag}`] = (o.result.configs || []).map((c) => ({ rank: c.rank, cfg: `${c.engine?.model || "-"} + ${c.alternator?.model || "-"} + ${c.controller?.model || "-"}`, score: CB.scoreOf(c, o.result.requirements || []),
    checks: (c.checks || []).map((x) => ({ k: `${x.part}|${x.item}`, s: x.status, parts: (x.parts || []).map((p) => ({ i: p.item, s: p.status, q: p.status === "confirm" ? p.sourceQuote : undefined })) })) }));
};
for (const { id: key, data } of list) {
  const r = data.result || data;
  one(key, data, r, "");
  for (const z of r.sizes || []) if (z.result) one(key, data, z.result, ` [${z.label}]`);
  console.log(key);
}
fs.writeFileSync(out, JSON.stringify(res));
