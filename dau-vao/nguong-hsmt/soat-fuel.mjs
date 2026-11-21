// node soat-fuel.mjs <worktree nhánh> <doi-nguong.tsv> (CHỈ ĐỌC, chỉ in màn hình): mỗi ngưỡng tiêu hao MỚI: đoạn chữ quanh số đó ở các dòng thuộc đúng cỡ.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, TSV] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
let n = 0, none = 0;
for (const l of fs.readFileSync(TSV, "utf8").trim().split("\n").slice(1)) {
  const [k, diff] = l.split("\t"), [no, ri] = k.slice(2).split("#"), d = byKey.get(no), j = +ri;
  const kvaText = (d.config.kvas || []).map((x) => `${x.v} ${x.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const { L, runs, tags } = B.sizeBlocks(B.technicalPart(d.config.text), found);
  for (const m of diff.matchAll(/(maxFuel75|maxFuel50|maxFuel): (\S+) → ([\d.]+)/g)) {
    n++;
    const t = m[3].replace(".", "[.,]"), re = new RegExp(`(^|[^\\d.,])${t}(?:[.,]0+)?($|[^\\d])`);
    const own = (i) => tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to));
    const hits = L.map((x, i) => ({ x, i })).filter(({ x, i }) => own(i) && re.test(x) && /l[íi]t|\bl\s*\/|L\/h/i.test(x) && /ti[êe]u|nhi[êe]n li[ệe]u|fuel/i.test(x));
    if (!hits.length) none++;
    const c = hits[0], at = c ? c.x.search(re) : 0;
    const head = c ? (c.x.match(/^[^:]{0,40}:/) || [""])[0] : "";
    console.log(`${k} cỡ ${found[j]?.cap.value ?? "?"} ${m[1]} ${m[2]}→${m[3]} (${hits.length}) | ${c ? `${head} … ${c.x.slice(Math.max(0, at - 75), at + 45).trim()}` : "KHÔNG THẤY"}`);
  }
}
console.log(`ngưỡng tiêu hao mới: ${n}; không thấy dòng: ${none}`);
