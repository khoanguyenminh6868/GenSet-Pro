// Chạy lại `check` + `rankConfigs` trên MỌI kết quả Gợi ý đã chụp (snap/configmatch.json, 17 lượt = toàn bộ web 20/11/2026)
// bằng code + NCC (suppliers/cn) + nguồn (suppliers/sources) của MỘT gốc repo. Check byCode đạt / không đạt gỡ trước
// (suppliers/CLAUDE.md). cap tính như prep (Phân tích). Không ghi gì lên web. node check-all.mjs <gốc repo> <out.json>
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
for (const { id: key, data } of list) {
  const result = JSON.parse(JSON.stringify(data.result || data));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const text = fs.readFileSync(path.join(here, "hsmt", `${key}.txt`), "utf8");
  const a = ana[key]?.result;
  const cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const before = (result.configs || []).map((c) => `${c.engine?.model || "-"} | ${c.alternator?.model || "-"}`);
  const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap });
  CB.rankConfigs(o.result);
  res[key] = { cap, makerAlt: o.result.makerAlt || null, before, problems: o.problems.length,
    configs: (o.result.configs || []).map((c) => ({ rank: c.rank, engine: c.engine?.model || null, alt: c.alternator?.model || null, fromMaker: !!c.alternator?.fromMaker, byCode: !!c.alternator?.byCode,
      was: c.alternator?.was?.model || null, wasWhy: c.alternator?.wasWhy || null, options: c.alternator?.options?.map((x) => `${x.what} ${x.value}`) || [], score: CB.scoreOf(c, o.result.requirements || []),
      checks: (c.checks || []).map((x) => `${x.part}|${x.item}|${x.status}${x.offered ? ` (${String(x.offered).slice(0, 90)})` : ""}`), gaps: (c.gaps || []).filter((g) => /datasheet hãng/.test(g)) })) };
  console.log(key, (o.result.configs || []).length, o.result.makerAlt ? JSON.stringify(o.result.makerAlt) : "");
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
