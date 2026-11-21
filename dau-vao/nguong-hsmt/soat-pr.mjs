// node soat-pr.mjs <worktree> <tsv> (CHỈ ĐỌC, chỉ in màn hình): mỗi lượt đổi tiêu hao: ngưỡng mới + đoạn chữ HSMT từ số L/h đầu tới số cuối ở các dòng thuộc cỡ của lượt.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, TSV] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const an = new Map();
for (const [k, x] of Object.entries(JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/analysis.json", "utf8")).docs)) { const r = x.d?.result; if (!r) continue; an.set(k, r); const no = r.keyInfo?.notifyNo || x.d?.notifyNo; if (no && !an.has(no)) an.set(no, r); }
const FIG = /\d{1,4}(?:[.,]\d+)?\s*(?:l[íi]t|l)\s*\/\s*(?:gi[ờo]|hr|h)(?![a-z])/gi;
for (const l of fs.readFileSync(TSV, "utf8").trim().split("\n").slice(1)) {
  const [k, diff] = l.split("\t"), [no, ri] = k.slice(2).split("#"), j = +ri;
  let text, found;
  if (k[0] === "H") { const d = byKey.get(no); text = d.config.text; found = B.sizesOf([(d.config.kvas || []).map((x) => `${x.v} ${x.u}`).join(", "), d.bidName], d.bidName); }
  else { text = fs.readFileSync(`C:/Projects/GenSet Pro/genbid-work/specs/${no}/text.txt`, "utf8"); const a = an.get(no), n = a?.keyInfo?.bidName || ""; found = B.sizesOf([a?.keyInfo?.generatorCapacity, n], n); }
  const tp = B.technicalPart(text);
  let lines;
  if (found.length > 1) { const { L, runs, tags } = B.sizeBlocks(tp, found); lines = L.filter((_, i) => tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to))); }
  else lines = tp.split("\n");
  const seg = lines.filter((x) => /ti[êe]u|nhi[êe]n li[ệe]u|fuel/i.test(x) && (x.match(FIG) || []).length).map((x) => { const f = [...x.matchAll(FIG)], a = Math.max(0, f[0].index - 28), b = Math.min(x.length, f.at(-1).index + f.at(-1)[0].length + 26); return x.slice(a, b).replace(/\s+/g, " ").trim(); });
  console.log(`${k.slice(0, 1)} ${k.slice(2)} ${diff.replace(/maxFuel75/g, "75").replace(/maxFuel50/g, "50").replace(/maxFuel/g, "100")}\n    ${[...new Set(seg)].slice(0, 3).join(" ¦ ").slice(0, 330)}`);
}
