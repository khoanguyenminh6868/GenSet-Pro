// node quet.mjs <worktree> <out.json> (CHỈ ĐỌC): ngưỡng hintsOf của MỌI HSMT (genbid-work\specs, cỡ theo Phân tích) và MỌI lượt bidhist.
// Chỉ ghi số thông báo + các ngưỡng, không ghi chữ HSMT.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const ROOT = "C:/Projects/GenSet Pro/genbid-work";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const KEYS = ["minDisp", "maxDisp", "minCyl", "cylExact", "minPrime", "maxFuel", "maxFuel75", "maxFuel50", "compr", "comprExact", "cylLayout", "freq", "fuel"];
const pick = (h) => JSON.stringify(Object.fromEntries(KEYS.map((k) => [k, h[k] ?? null])));
const out = {};
const an = new Map();
for (const [k, x] of Object.entries(J(`${ROOT}/doc-cache/analysis.json`).docs)) { const r = x.d?.result; if (!r) continue; an.set(k, r); const no = r.keyInfo?.notifyNo || x.d?.notifyNo; if (no && !an.has(no)) an.set(no, r); }
let nSpec = 0, noAn = 0;
for (const dir of fs.readdirSync(`${ROOT}/specs`)) {
  const f = `${ROOT}/specs/${dir}/text.txt`;
  if (!fs.existsSync(f)) continue;
  nSpec++;
  const text = fs.readFileSync(f, "utf8"), a = an.get(dir);
  if (!a) noAn++;
  const name = a?.keyInfo?.bidName || "", found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  if (found.length > 1) found.slice(0, B.MAX_SIZES).forEach((s, i) => { out[`S:${dir}#${i}`] = pick(B.hintsOf(text, "", { size: s, sizes: found })); });
  else out[`S:${dir}#0`] = pick(B.hintsOf(text, ""));
}
const hist = Object.values(J(`${ROOT}/doc-cache/bidhist.json`).docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
for (const d of hist) {
  const kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, i) => { if (rn.cap) out[`H:${d.notifyNo}#${i}`] = pick(B.hintsOf(d.config.text, "", rn.sizing)); });
}
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`HSMT ${nSpec} (không có Phân tích ${noAn}), gói bidhist ${hist.length}, tổng lượt ${Object.keys(out).length}`);
