// node hieu-luc.mjs <thư mục code> <bidhist.json> <danh sách lượt.txt> <out.json> (CHỈ ĐỌC)
// Ngưỡng CÓ HIỆU LỰC của từng lượt: hintsOf rồi plausible(hints, cap), đúng bộ lọc mà candidates dùng (ngưỡng phi lý so với cỡ máy bị bỏ).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BIDHIST, LIST, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const want = new Set(fs.readFileSync(LIST, "utf8").split(/\r?\n/).map((x) => x.trim()).filter(Boolean));
const KEYS = ["minDisp", "maxDisp", "minCyl", "cylExact", "minPrime", "maxFuel", "maxFuel75", "maxFuel50"];
const hist = Object.values(JSON.parse(fs.readFileSync(BIDHIST, "utf8")).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const out = {};
for (const d of hist) {
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    const id = `${d.notifyNo}#${ri}`;
    if (!rn.cap || !want.has(id)) return;
    const raw = B.hintsOf(d.config.text, "", rn.sizing), eff = B.plausible(raw, rn.cap);
    const pick = (h) => Object.fromEntries(KEYS.map((k) => [k, h[k] ?? null]));
    out[id] = { cap: rn.cap, raw: pick(raw), eff: pick(eff) };
  });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${Object.keys(out).length}/${want.size} lượt → ${OUT}`);
