// node khoi.mjs <thư mục code> <IB#ri>... (CHỈ ĐỌC, chỉ in màn hình): các khối cỡ máy của lượt, ngưỡng từng khối, nguồn ngưỡng (`how`), và dòng nêu xi lanh / dung tích kèm khối của nó.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, ...runs] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
for (const run of runs) {
  const [no, ri] = run.split("#"), d = byKey.get(no);
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const t = B.technicalPart(d.config.text), r = B.minsForSize(t, found[+ri], found);
  const { L, runs: bl } = B.sizeBlocks(t, found);
  console.log(`\n=== ${run} cỡ: ${found.map((s) => s.kva ?? s.cap.value).join(" / ")}, lượt này ${found[+ri].cap.value} | minDisp ${r.minDisp} maxDisp ${r.maxDisp} minCyl ${r.minCyl} | how ${JSON.stringify(r.how ? { d: r.how.minDisp, x: r.how.maxDisp, c: r.how.minCyl } : null)}`);
  console.log("  khối:", bl.map((b) => `[${b.size}:${b.start}-${b.to}]`).join(" "));
  L.forEach((l, i) => {
    if (!/x[iy].?lanh|dung t[íi]ch/i.test(l)) return;
    const k = bl.findIndex((b) => i >= b.start && i < b.to);
    console.log(`  d${i} khối ${k < 0 ? "ngoài" : bl[k].size}: ${l.trim().slice(0, 95)}`);
  });
}
