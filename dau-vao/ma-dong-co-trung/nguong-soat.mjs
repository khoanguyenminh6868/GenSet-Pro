// node nguong-soat.mjs <thư mục code> (CHỈ ĐỌC): các lượt có dòng mất vì luật cyl / disp / maxDisp / layout: tìm hai kiểu đọc ngưỡng nghi sai.
// (a) số xi lanh coi là "đúng bằng" mà dòng HSMT có chữ tối thiểu; (b) gói nhiều cỡ mà dòng nêu ngưỡng ghi một mục có công suất khác cỡ của lượt.
// In ra màn hình, không ghi chữ HSMT vào tệp.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [WT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const runs = new Map();
for (const c of fs.readFileSync(path.join(HERE, "mat-dong.tsv"), "utf8").trim().split("\n").slice(1).map((x) => x.split("\t"))) {
  if (!runs.has(c[0])) runs.set(c[0], { n: 0, rules: new Map() });
  const r = runs.get(c[0]); r.n++;
  for (const x of c[5].split(",")) r.rules.set(x, (r.rules.get(x) || 0) + 1);
}
const CYL = /x[iy].?lanh/i, MIN = /không\s+(ít|nhỏ|thấp|dưới)|tối thiểu|ít nhất|trở lên|≥|>=/i;
let multi = 0, multiRows = 0;
for (const [run, r] of runs) {
  const [no, ri] = run.split("#"), d = byKey.get(no);
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const sizing = found.length > 1 ? { size: found[+ri], sizes: found } : null;
  const h = B.hintsOf(d.config.text, "", sizing), lines = d.config.text.split("\n");
  const numLine = (l) => new RegExp(`(^|[^\\d.,])${h.minCyl}\\s*(x[iy].?lanh|$)|:\\s*${h.minCyl}\\b`, "i").test(l);
  if (h.cylExact && r.rules.get("cyl")) {
    const bad = lines.filter((l) => CYL.test(l) && !/dung tích/i.test(l) && numLine(l) && MIN.test(l));
    if (bad.length) console.log(`(a) ${run} =${h.minCyl}, ${r.rules.get("cyl")} dòng: ${bad[0].trim().slice(0, 110)}`);
  }
  if (sizing) {
    multi++; multiRows += r.n;
    const own = sizing.size.cap.value;
    const tag = (l) => { const m = l.match(/(\d+(?:[.,]\d+)?)(?:\s*\/\s*\d+(?:[.,]\d+)?)?\s*kva/i); return m ? +m[1].replace(",", ".") : null; };
    const hit = lines.filter((l) => /x[iy].?lanh/i.test(l) && tag(l) != null && Math.abs(tag(l) - own) / own > 0.25);
    const same = lines.filter((l) => /x[iy].?lanh/i.test(l) && tag(l) != null && Math.abs(tag(l) - own) / own <= 0.25);
    if (hit.length) console.log(`(b) ${run} cỡ ${own}, ${r.n} dòng [${[...r.rules].map(([k, v]) => `${k}:${v}`).join(" ")}], minCyl ${h.minCyl ?? "-"}${h.cylExact ? "=" : ""}, minDisp ${h.minDisp ?? "-"}, maxDisp ${h.maxDisp ?? "-"}; dòng đúng mục: ${same.length}, mục khác: ${hit.length} | ${hit[0].trim().slice(0, 85)}`);
  }
}
console.log(`lượt có dòng mất: ${runs.size}; trong đó nhiều cỡ: ${multi} (${multiRows} dòng)`);
