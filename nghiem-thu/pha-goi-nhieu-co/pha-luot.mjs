// node pha-luot.mjs <worktree> <bidhist.json> <out.tsv> [notifyNo]
// Số pha (hints.phase) và how.phase của mọi lượt như do-gop.mjs.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, OUT, ONLY] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const raw = JSON.parse(fs.readFileSync(BH, "utf8"));
const docs = raw.docs || raw;
const hist = Object.values(docs).map((x) => x.d || x.data || x).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const rows = ["goi\tluot\tco\tkieu\tpha\thow"];
for (const d of hist) {
  if (ONLY && d.notifyNo !== ONLY) continue;
  const text = d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    const h = B.hintsOf(text, "", rn.sizing);
    let how = "";
    if (rn.sizing) how = B.minsForSize(B.technicalPart(text), rn.sizing.size, rn.sizing.sizes, "").how.phase;
    rows.push([d.notifyNo, ri, `${rn.cap.value} ${rn.cap.unit}`, rn.sizing ? "nhieu-co" : "mot-co", h.phase ?? "-", how].join("\t"));
  });
}
fs.writeFileSync(OUT, rows.join("\n") + "\n");
console.error("lượt", rows.length - 1);
