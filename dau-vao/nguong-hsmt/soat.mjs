// node soat.mjs <worktree nhánh> <doi-nguong.tsv> (CHỈ ĐỌC, chỉ in màn hình): mỗi ngưỡng MỚI của lượt đổi: các dòng thuộc đúng cỡ đó có nêu số ấy.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, TSV] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const WORD = { minDisp: /dung t[íi]ch|xi.?lanh|xy.?lanh/i, maxDisp: /dung t[íi]ch|xi.?lanh|xy.?lanh/i, minCyl: /x[iy].?lanh/i, maxFuel: /ti[êe]u (hao|th[ụu])|nhi[êe]n li[ệe]u/i, maxFuel75: /ti[êe]u (hao|th[ụu])|nhi[êe]n li[ệe]u/i, maxFuel50: /ti[êe]u (hao|th[ụu])|nhi[êe]n li[ệe]u/i };
const forms = (v) => { const s = String(v), c = s.replace(".", ","), cc = String(Math.round(v * 1000)); return [s, c, ...(v < 100 ? [cc] : [])].map((t) => new RegExp(`(^|[^\\d.,])0?${t.replace(".", "\\.")}($|[^\\d])`)); };
for (const l of fs.readFileSync(TSV, "utf8").trim().split("\n").slice(1)) {
  const [k, diff] = l.split("\t"), [no, ri] = k.slice(2).split("#"), d = byKey.get(no);
  const kvaText = (d.config.kvas || []).map((x) => `${x.v} ${x.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName), j = +ri;
  const tp = B.technicalPart(d.config.text), { L, runs, tags } = B.sizeBlocks(tp, found);
  for (const m of diff.matchAll(/(minDisp|maxDisp|minCyl|maxFuel75|maxFuel50|maxFuel): (\S+) → ([\d.]+)/g)) {
    const [, f, old, nv] = m, re = forms(+nv);
    const hit = L.map((x, i) => ({ x, i })).filter(({ x, i }) => WORD[f].test(x) && re.some((r) => r.test(x)) && (tags[i] === j || (tags[i] < 0 && runs.some((b) => b.size === j && i >= b.start && i < b.to))));
    const c = hit[0];
    console.log(`${k} [${found.map((s) => s.cap.value).join("/")}] ${f} ${old}→${nv} | ${c ? c.x.trim().slice(0, 118) : "KHÔNG THẤY DÒNG"}`);
  }
}
