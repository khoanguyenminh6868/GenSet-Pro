// bdk-mo-dun-4: đọc configmatch IB2600603983 trên web (chỉ đọc), chạy check + rankConfigs của <gốc repo> (cách run.mjs của
// bdk-baudouin-dse7320), ghi: goc.json (kết quả web), sau.json (sau check, có rfq), in bộ điều khiển / mô-đun / phương án
// khác / dòng rfq mới. node run.mjs <gốc repo>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), here = import.meta.dirname, KEY = "IB2600603983";
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const data = await CB.doc("configmatch", KEY), a = (await CB.doc("analysis", KEY))?.result;
fs.writeFileSync(path.join(here, "goc.json"), JSON.stringify(data));
const result = JSON.parse(JSON.stringify(data.result));
for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
const text = (await CB.hsmtTextOf(KEY)).text;
const cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap });
CB.rankConfigs(o.result);
fs.writeFileSync(path.join(here, "sau.json"), JSON.stringify({ ...data, result: o.result }));
for (const c of o.result.configs) {
  const t = c.controller || {};
  console.log(`#${c.rank} ${c.engine?.model} | ${t.model}${t.fromMaker ? " [NCC chưa chào]" : ""} ${(t.modules || []).map((m) => `+ ${m.model} ${m.order || ""}${m.offeredBy ? ` (${m.offeredBy})` : " (chưa chào)"}`).join(" ")}`);
  if (t.altLine) console.log(`   ${t.altLine}`);
  for (const q of (c.rfq || []).filter((x) => /^(Bộ điều khiển|Mô-đun) /.test(x.item))) console.log(`   RFQ: ${q.item} — ${q.ask}`);
}
console.log("problems", o.problems.length, "text", text?.length || 0);
