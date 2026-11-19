// In ngưỡng HSMT liên quan (minCyl, cylExact, cylLayout, minDisp, maxDisp, cap) của các lượt nêu, để giải thích dòng rời all.
// node hints.mjs <worktree> <bidhist.json> <id...>
import fs from "node:fs"; import path from "node:path"; import { pathToFileURL } from "node:url";
const [WT, BH, ...ids] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const docs = JSON.parse(fs.readFileSync(BH, "utf8")).docs;
const want = new Set(ids);
for (const x of Object.values(docs)) {
  const d = x.d; if (!d?.config?.text || !BP.isGensetName(d.bidName)) continue;
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${d.notifyNo}#${ri}`; if (!want.has(id)) return;
    const h = B.hintsOf(d.config.text, "", rn.sizing);
    console.log([id, `cap ${rn.cap}`, `minCyl ${h.minCyl ?? "-"}`, `cylExact ${h.cylExact ?? "-"}`, `cylLayout ${h.cylLayout ?? "-"}`, `minDisp ${h.minDisp ?? "-"}`, `maxDisp ${h.maxDisp ?? "-"}`].join("\t"));
  });
}
