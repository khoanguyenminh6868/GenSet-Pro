// Quét ĐỦ bidhist: mọi gói máy phát (cung cấp, có config.text), mọi cỡ (y như do-gop.mjs). Ghi hints của một bản code ra JSON
// (khoá `thông báo#chỉ số cỡ`) để so cũ ↔ mới từng byte; kèm các dòng HSMT có "N kỳ / thì / kì / stroke / cycle" (ngữ cảnh ngắn).
// node quet-hints.mjs <worktree> <bidhist.json> <out.json>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, BH, OUT] = process.argv.slice(2);
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const BP = globalThis.GenbidBidprice;
const raw = JSON.parse(fs.readFileSync(BH, "utf8")), docs = raw.docs || raw;
const hist = Object.values(docs).map((x) => x.d).filter((d) => d && BP.isGensetName(d.bidName) && BP.bidKind(d.bidName) === "supply" && d.config?.text);
const STROKE = /(?<![\d.,])0?(\d{1,2})\s*-?\s*(?:k[ỳìyi]|th[ìi]|stroke|cycle)(?![a-zà-ỹ])/i;
const out = {}, ctx = {};
for (const d of hist) {
  // XOA_KY=1: thay mọi "N kỳ / thì / kì / stroke / cycle" bằng "bốn kỳ" (không còn chữ số) để chứng minh bản mới = bản cũ bỏ số đó.
  const text = process.env.XOA_KY ? d.config.text.replace(new RegExp(STROKE.source, "gi"), (m) => m.replace(/\d+/, "bốn")) : d.config.text, kvaText = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", ");
  const found = B.sizesOf([kvaText, d.bidName], d.bidName);
  const runs = found.length > 1 ? found.slice(0, B.MAX_SIZES).map((s) => ({ cap: s.cap, sizing: { size: s, sizes: found } })) : [{ cap: B.capacity([d.bidName, kvaText]), sizing: null }];
  runs.forEach((rn, ri) => {
    if (!rn.cap) return;
    const h = B.hintsOf(text, "", rn.sizing);
    const { text: _t, bounds: _b, ...rest } = h; // chữ dồn / bounds không đổi giữa hai bản, bỏ cho tệp nhỏ
    out[`${d.notifyNo}#${ri}`] = JSON.stringify(rest);
  });
  const ls = text.split("\n").filter((l) => STROKE.test(l)).map((l) => { const m = l.match(STROKE); return l.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " "); });
  if (ls.length) ctx[d.notifyNo] = ls;
}
fs.writeFileSync(OUT, JSON.stringify({ hints: out, ctx }));
console.error("gói", hist.length, "lượt", Object.keys(out).length, "gói có N kỳ/thì", Object.keys(ctx).length);
