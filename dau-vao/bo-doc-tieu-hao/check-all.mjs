// bdk-mo-dun PR 2: chạy lại `check` + `rankConfigs` trên MỌI kết quả Gợi ý đã chụp (../dau-phat-hang-b/snap/configmatch.json,
// 17 lượt = toàn bộ web 20/11/2026) bằng code + NCC + nguồn của MỘT gốc repo; gỡ check byCode đạt / không đạt trước
// (suppliers/CLAUDE.md); cap như prep. Không ghi gì lên web. Chạy check HAI lần (lần hai trên kết quả lần một) để kiểm
// tính lặp lại được. node check-all.mjs <gốc repo> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg), snap = path.join(import.meta.dirname, "..", "dau-phat-hang-b");
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const list = JSON.parse(fs.readFileSync(path.join(snap, "snap", "configmatch.json"), "utf8"));
const ana = JSON.parse(fs.readFileSync(path.join(snap, "snap", "analysis.json"), "utf8"));
const res = {};
const dump = (o) => (o.result.configs || []).map((c) => ({ rank: c.rank, engine: c.engine?.model || null, alt: c.alternator?.model || null, controller: c.controller?.model || null,
  modules: c.controller?.modules || null, alternatives: c.controller?.alternatives || null, altLine: c.controller?.altLine || null, score: CB.scoreOf(c, o.result.requirements || []),
  checks: (c.checks || []).map((x) => ({ k: `${x.part}|${x.item}|${x.status}${x.offered ? ` (${String(x.offered).slice(0, 120)})` : ""}`, note: x.note || "",
    parts: (x.parts || []).map((p) => `${p.item}|${p.status}|${p.offered || ""}|${p.note || ""}${p.viaModule ? `|via ${p.viaModule.join("+")}` : ""}${p.alsoQuotes ? `|also ${p.alsoQuotes.map((a) => `${a.sub}:${a.line}`).join(" ; ")}` : ""}${p.bmsVia ? `|bms ${p.bmsVia}` : ""}`) })) }));
for (const { id: key, data } of list) {
  const result = JSON.parse(JSON.stringify(data.result || data));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const text = fs.readFileSync(path.join(snap, "hsmt", `${key}.txt`), "utf8");
  const a = ana[key]?.result;
  const cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const opts = { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap };
  const o = CB.check(result, opts);
  CB.rankConfigs(o.result);
  const first = JSON.stringify(dump(o));
  const o2 = CB.check(o.result, opts);
  CB.rankConfigs(o2.result);
  const again = JSON.stringify(dump(o2)) === first;
  res[key] = { cap, problems: o.problems.length, again, configs: dump(o) };
  console.log(key, (o.result.configs || []).length, again ? "lặp lại: giống" : "lặp lại: KHÁC");
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
