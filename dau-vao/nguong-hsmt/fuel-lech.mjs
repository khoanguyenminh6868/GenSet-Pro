// node fuel-lech.mjs <worktree> <ngưỡng.json> (CHỈ ĐỌC, chỉ in màn hình): đọc lại tiêu hao theo từng vế câu (ngăn bằng ; hoặc dấu phẩy trước số), mức tải ghi NGAY trong vế đó,
// rồi so với maxFuel / 75 / 50 của hints: số code gán cho mức tải X mà vế chứa số đó ghi mức tải khác.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, JS] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const H = JSON.parse(fs.readFileSync(JS, "utf8"));
const LOAD = { maxFuel: 100, maxFuel75: 75, maxFuel50: 50 };
const num = (s) => Number(s.replace(",", "."));
const FIG = /(\d{1,4}(?:[.,]\d+)?)\s*(?:l[íi]t|l)\s*\/\s*(?:gi[ờo]|hr|h)(?![a-z])/gi;
let checked = 0, bad = 0;
const textOf = (k) => { if (k[0] === "H") return byKey.get(k.slice(2).split("#")[0])?.config?.text; const f = `C:/Projects/GenSet Pro/genbid-work/specs/${k.slice(2).split("#")[0]}/text.txt`; return fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null; };
for (const [k, v] of Object.entries(H)) {
  const h = JSON.parse(v), want = Object.keys(LOAD).filter((f) => h[f] != null);
  if (!want.length) continue;
  const t = textOf(k); if (!t) continue;
  const lines = B.technicalPart(t).split("\n").filter((l) => /ti[êe]u\s*(hao|th[ụu])|nhi[êe]n li[ệe]u/i.test(l));
  for (const f of want) {
    checked++;
    const seen = new Set();
    for (const l of lines) for (const c of l.split(/;/)) for (const m of c.matchAll(FIG)) {
      if (Math.abs(num(m[1]) - h[f]) > 1e-9) continue;
      const pct = [...c.matchAll(/(\d{2,3})\s*%/g)].map((x) => +x[1]);
      if (pct.length === 1) seen.add(pct[0]);
    }
    if (seen.size && !seen.has(LOAD[f])) { bad++; console.log(`${k} ${f}=${h[f]}: vế câu chứa số này ghi mức tải ${[...seen].join("/")}%`); }
  }
}
console.log(`đã so ${checked} ngưỡng; lệch mức tải: ${bad}`);
