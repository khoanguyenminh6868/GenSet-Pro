// node cap.mjs <thư mục code> <IB#ri>... (CHỈ ĐỌC): cỡ máy của từng lượt và ngưỡng xi lanh / dung tích code đọc cho cỡ đó.
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
  const sizing = found.length > 1 ? { size: found[+ri], sizes: found } : null;
  const h = B.hintsOf(d.config.text, "", sizing);
  console.log(run, "các cỡ:", found.map((s) => `${s.cap.value}${s.cap.unit}`).join(", ") || kvaText, "| lượt này:", sizing ? `${sizing.size.cap.value}${sizing.size.cap.unit}` : "một cỡ", "| minCyl", h.minCyl, "exact", !!h.cylExact, "minDisp", h.minDisp, "maxDisp", h.maxDisp);
}
