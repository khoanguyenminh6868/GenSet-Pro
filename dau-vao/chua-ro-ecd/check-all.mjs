// E/C/D: chạy lại check + rankConfigs trên configmatch chụp mới nhất. Kết quả có chữ HSMT nên ghi NGOÀI sổ (doc-cache\soat-ecd).
// node check-all.mjs snap <gốc repo>            chụp configmatch (chỉ đọc web)
// node check-all.mjs run <gốc repo> <out.json>  chạy check hai lần, gỡ check byCode đạt / không đạt trước
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [mode, rootArg, out] = process.argv.slice(2), root = path.resolve(rootArg), OUT = "C:/Projects/GenSet Pro/genbid-work/doc-cache/soat-ecd", old = path.join(import.meta.dirname, "..", "dau-phat-hang-b");
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
if (mode === "snap") {
  fs.mkdirSync(OUT, { recursive: true });
  const cm = await CB.allDocs("configmatch"), list = Array.isArray(cm) ? cm : Object.entries(cm).map(([id, d]) => ({ id, ...d }));
  fs.writeFileSync(path.join(OUT, "configmatch.json"), JSON.stringify(list), "utf8");
  console.log("lượt", list.length, "| IB2600603983 lưu", list.find((x) => x.id === "IB2600603983")?.data?.at);
  process.exit(0);
}
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const list = JSON.parse(fs.readFileSync(process.env.CM_FILE || path.join(OUT, "configmatch.json"), "utf8")), ana = JSON.parse(fs.readFileSync(path.join(old, "snap", "analysis.json"), "utf8")), res = {};
const dump = (o) => (o.result.configs || []).map((c) => ({ rank: c.rank, engine: c.engine?.model || null, alt: c.alternator?.model || null, controller: c.controller?.model || null, score: CB.scoreOf(c, o.result.requirements || []),
  checks: (c.checks || []).map((x) => ({ k: `${x.part}|${x.item}|${x.status}${x.offered ? ` (${String(x.offered).slice(0, 120)})` : ""}`, note: x.note || "", q: x.byCode ? String(x.sourceQuote || "").slice(0, 160) : "" })) }));
for (const { id: key, data } of list) {
  const file = path.join(old, "hsmt", `${key}.txt`);
  if (!fs.existsSync(file)) { console.log(key, "không có chữ HSMT đã chụp, bỏ qua"); continue; }
  const result = JSON.parse(JSON.stringify(data.result || data));
  for (const c of result.configs || []) c.checks = (c.checks || []).filter((x) => !(x.byCode && (x.status === "met" || x.status === "not_met")));
  const a = ana[key]?.result, cap = CB.capacity([data.bidName, a?.keyInfo?.generatorCapacity, ...(a?.technicalSpecs || []).filter((s) => /công suất|capacity|power/i.test(s.item || "")).map((s) => s.requirement)]);
  const opts = { hsmtText: fs.readFileSync(file, "utf8"), suppliers: sups, readWeb: () => null, origin: result.origin, basis: result.originBasis, sized: false, sourcesDir: path.join(root, "suppliers", "sources"), cap };
  const o = CB.check(result, opts); CB.rankConfigs(o.result);
  const first = JSON.stringify(dump(o)), o2 = CB.check(o.result, opts); CB.rankConfigs(o2.result);
  res[key] = { cap, problems: o.problems.length, again: JSON.stringify(dump(o2)) === first, configs: dump(o) };
  console.log(key, (o.result.configs || []).length, res[key].again ? "lặp lại: giống" : "lặp lại: KHÁC");
}
fs.writeFileSync(out, JSON.stringify(res), "utf8");
