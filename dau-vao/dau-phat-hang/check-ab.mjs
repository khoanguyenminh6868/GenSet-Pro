// Chạy lại `check` + `rankConfigs` trên kết quả Gợi ý đã lưu (doc-cache\configmatch.json) bằng code của MỘT gốc repo,
// NCC = suppliers/cn của gốc đó, nguồn = suppliers/sources của gốc đó, chữ HSMT đọc từ web (chỉ đọc). Check byCode
// đạt / không đạt được gỡ trước (suppliers/CLAUDE.md). In bản tóm tắt như regress (configSummary).
// node check-ab.mjs <gốc repo> <out.json> <TBMT>...
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, out, ...keys] = process.argv.slice(2), root = path.resolve(rootArg);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const RG = await import(pathToFileURL(path.join(root, "suppliers", "fixtures", "runs", "regress.mjs")).href);
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const cm = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/configmatch.json", "utf8")), all = cm[Object.keys(cm)[0]];
const res = {};
for (const key of keys) {
  const result = JSON.parse(JSON.stringify(all[key].d.result || all[key].d));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const { text } = await CB.hsmtTextOf(key);
  const o = CB.check(result, { hsmtText: text, suppliers: sups, readWeb: () => null, origin: result.origin, sourcesDir: path.join(root, "suppliers", "sources") });
  CB.rankConfigs(o.result);
  res[key] = { summary: RG.configSummary(o), alt: (o.result.configs || []).map((c) => ({ rank: c.rank, alt: c.alternator?.model, checks: (c.checks || []).filter((x) => x.part === "alternator").map((x) => `${x.item}: ${x.status}${x.offered ? ` (${x.offered})` : ""}`) })) };
  console.log(key, "xong");
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
