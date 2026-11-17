import fs from "node:fs";
import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-soat-nguong/suppliers";
const B = await import(pathToFileURL(WT + "/_instr.mjs").href);
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const o = J("out.json").filter((r) => r.multi);
const text = (k) => { if (fs.existsSync(`${KR}/hc/${k}.json`)) return J(`${KR}/hc/${k}.json`).text; if (fs.existsSync(`${KR}/hsmt-${k}.json`)) return J(`${KR}/hsmt-${k}.json`).text; return fs.readFileSync(`${W}/specs/${k}/text.txt`, "utf8"); };
const an = Object.fromEntries(Object.entries(J(W + "/doc-cache/analysis.json").docs).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r));
for (const r of o) {
  const t = text(r.key), a = an[r.key], name = a?.keyInfo?.bidName || "";
  const found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  const tp = B.technicalPart(t);
  const sz = r.i != null ? found[r.i] : null;
  const m = B.minsForSize(tp, sz, found.slice(0, B.MAX_SIZES));
  const L = B.withoutOtherEquipment(B.unflatten(tp)).split("\n");
  const dl = L.map((l, i) => [i + 1, l]).filter(([, l]) => /dung t[íi]ch|displacement/i.test(l) && !/bình|bồn|nhớt|làm mát|nước|nhiên liệu|dầu/i.test(l)).map(([i, l]) => `L${i}: ${l.replace(/\s+/g, " ").slice(0, 90)}`);
  console.log(`## ${r.key} cỡ ${r.cap.value}${r.cap.unit} lượt ${r.i} / ${found.map((s) => s.cap.value + s.cap.unit).join(",")} | how.minDisp=${m.how.minDisp} min=${m.mins.minDisp} | blocks ${m.blocks.map((b) => `${b.size}:${b.from}-${b.to}`).join(" ")}`);
  console.log("   " + dl.slice(0, 6).join("\n   "));
}
process.exit(0);
