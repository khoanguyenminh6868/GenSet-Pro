// node dbg-goi.mjs <worktree> <bidhist.json> <notifyNo> [ctx]
// In các khối cỡ và các dòng nêu pha (số dòng, khối, chữ rút gọn) của một gói. CHỈ để soát, không ghi tệp.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, ID, CTX] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const docs = JSON.parse(fs.readFileSync(BH, "utf8")).docs;
const d = Object.values(docs).map((x) => x.d).find((x) => x?.notifyNo === ID);
const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
const found = B.sizesOf([kvaText, d.bidName], d.bidName);
console.log("bidName:", d.bidName, "| kvas:", kvaText);
console.log("sizes:", found.map((s) => `${s.cap?.value} ${s.cap?.unit} [${s.label || ""}]`).join(" ; "));
const t = B.technicalPart(text), L = t.split("\n");
const r = found.length > 1 ? B.minsForSize(t, found[0], found, "") : null;
if (r) console.log("blocks:", JSON.stringify(r.blocks));
const ctx = Number(CTX || 0);
L.forEach((l, i) => {
  if (!/pha(?![\p{L}])|phase/iu.test(l)) return;
  const blk = r ? r.blocks.findIndex((b) => i + 1 >= b.from && i + 1 < b.to) : -1;
  const sz = blk >= 0 ? r.blocks[blk].size : "-";
  const lo = Math.max(0, i - ctx), hi = Math.min(L.length, i + ctx + 1);
  console.log(`#${i + 1} khối ${blk} cỡ ${sz} ${B.phaseOf(l) ?? "·"}: ${L.slice(lo, hi).join(" ⏎ ").slice(0, 220)}`);
});
