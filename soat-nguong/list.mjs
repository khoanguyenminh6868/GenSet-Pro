// Soát ngưỡng dung tích 155 gói (sau #576). node list.mjs -> out.json + out.txt. CHỈ ĐỌC (không mạng, không agent, không ghi web).
import fs from "node:fs";
import { pathToFileURL } from "node:url";
const WT = "C:/Projects/GenSet Pro/wt-soat-nguong/suppliers";
const B = await import(pathToFileURL(WT + "/_instr.mjs").href);
const W = "C:/Projects/GenSet Pro/genbid-work", KR = W + "/dieu-phoi/kiem-rong/data", LN = W + "/dieu-phoi/loai-nguon/out";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const an = Object.fromEntries(Object.entries(J(W + "/doc-cache/analysis.json").docs).map(([k, v]) => [k, (v.d || v).result]).filter(([, r]) => r));
const CMkeys = new Set(Object.keys(J(W + "/doc-cache/configmatch.json").docs));
const C = new Map(), add = (key, src, text, parts) => { if (!C.has(key) && an[key] && text && text.trim()) C.set(key, { key, src, text, parts: parts || [text], analysis: an[key] }); };
for (const f of fs.readdirSync(KR).filter((f) => /^hsmt-IB\d+\.json$/.test(f))) { const h = J(KR + "/" + f); add(f.slice(5, -5), "full12", h.text, h.parts); }
for (const f of fs.readdirSync(KR + "/hc")) { const h = J(KR + "/hc/" + f); add(f.slice(0, -5), "hc243", h.text, [h.text]); }
for (const k of fs.readdirSync(W + "/specs")) { const p = `${W}/specs/${k}/text.txt`; if (fs.existsSync(p)) add(k, "specs", fs.readFileSync(p, "utf8")); }
// 155 gói: các lượt có dòng bị loại thêm (newlyDropped>0) ở d-*.jsonl
const runs = [];
for (let s = 0; s < 6; s++) for (const l of fs.readFileSync(`${LN}/d-${s}.jsonl`, "utf8").split("\n").filter(Boolean)) { const r = JSON.parse(l); if (r.newlyDropped > 0) runs.push({ key: r.key, i: r.i, cap: r.cap, newly: r.newlyDropped, h: r.h }); }
const keys = [...new Set(runs.map((r) => r.key))].sort();
console.error("lượt", runs.length, "gói", keys.length);
const out = [];
for (const key of keys) {
  const e = C.get(key); const a = e.analysis, name = a?.keyInfo?.bidName || "";
  const found = B.sizesOf([a?.keyInfo?.generatorCapacity, name], name);
  const multi = found.length > 1;
  for (const r of runs.filter((x) => x.key === key)) {
    globalThis.__src = [];
    let sizing = null;
    if (multi && r.i != null) sizing = { size: found[r.i], sizes: found.slice(0, B.MAX_SIZES) };
    const h = B.hintsOf(e.text, "", sizing), hp = B.plausible(h, r.cap);
    const cells = globalThis.__src.slice();
    const hw = (() => { globalThis.__src = []; return B.hintsOf(e.text, ""); })();
    out.push({ key, i: r.i, multi, nSizes: found.length, cap: r.cap, newly: r.newly, measured: r.h, minDisp: hp.minDisp, maxDisp: hp.maxDisp, rawMin: h.minDisp, rawMax: h.maxDisp, wholeMin: hw.minDisp, wholeMax: hw.maxDisp,
      cells: [...new Map(cells.map((c) => [c.k + c.v + c.cell, c])).values()], cm: CMkeys.has(key), src: e.src, sizes: multi ? found.map((s) => s.cap) : null });
  }
}
fs.writeFileSync("out.json", JSON.stringify(out, null, 1));
console.error("rows", out.length);
process.exit(0);
