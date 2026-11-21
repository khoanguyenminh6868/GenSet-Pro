// node dong.mjs <worktree> <regex> <IB#ri>... (CHỈ ĐỌC, chỉ in màn hình): dòng HSMT khớp regex, kèm chủ dòng (tag) và khối.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, RE, ...runs] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byKey = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo).map((d) => [d.notifyNo, d]));
const re = new RegExp(RE, "i");
for (const run of runs) {
  const [no, ri] = run.split("#"), d = byKey.get(no);
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const t = B.technicalPart(d.config.text), r = B.minsForSize(t, found[+ri], found), { L, runs: bl, tags } = B.sizeBlocks(t, found);
  console.log(`\n=== ${run} cỡ ${found.map((s) => s.cap.value).join("/")} lượt ${found[+ri].cap.value} | minPrime ${JSON.stringify(r.mins.minPrime)} how ${r.how.minPrime} | khối ${bl.map((b) => `${b.size}:${b.start}-${b.to}`).join(" ")}`);
  L.forEach((l, i) => { if (re.test(l)) console.log(`  d${i} tag ${tags[i]} khối ${bl.find((b) => i >= b.start && i < b.to)?.size ?? "ngoài"}: ${l.trim().slice(0, 340)}`); });
}
