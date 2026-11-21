// Mọi lượt có luật hình học: ngưỡng dung tích / xi lanh lấy từ mục của cỡ máy NÀO trong HSMT? Báo khi nhãn mục gần nhất khác cỡ của lượt. Chỉ đọc; tệp ra có chữ HSMT: không commit.
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich-2.json", import.meta.url), "utf8"));
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byNo = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo && d.config?.text).map((d) => [d.notifyNo, d]));
const GEO = new Set(["cyl", "layout", "disp", "maxDisp"]), rows = T.lost.filter((x) => x.ruled.some((r) => GEO.has(r))), runs = new Map(), out = [], p = (...a) => out.push(a.join(" "));
for (const x of rows) { const e = runs.get(x.run) || { lim: x.lim, rows: [], rules: new Set() }; e.rows.push(x); x.ruled.filter((r) => GEO.has(r)).forEach((r) => e.rules.add(r)); runs.set(x.run, e); }
const kvaRe = /(\d[\d.,]*)\s*k\s*va/gi, toK = (s) => { const c = s.replace(/[.,](?=\d{3}\b)/g, "").replace(",", "."); return +c; };
const forms = (v) => { const s = String(v); return [...new Set([s, s.replace(".", ","), Number(v).toFixed(3), Number(v).toFixed(3).replace(".", ",")])]; };
const labelBefore = (t, i) => { let last = null; for (const m of t.slice(Math.max(0, i - 260), i).matchAll(kvaRe)) last = toK(m[1]); return last; };
let multi = 0, bad = 0;
for (const [run, e] of runs) {
  const d = byNo.get(run.split("#")[0]), t = d?.config?.text || "", sizes = [...new Set([...t.matchAll(kvaRe)].map((m) => toK(m[1])))], cap = e.lim.cap.value;
  if (sizes.length > 1) multi++;
  const flags = [];
  for (const [name, v] of [["minDisp", e.lim.minDisp], ["maxDisp", e.lim.maxDisp]]) {
    if (v == null) continue;
    const hits = [];
    for (const f of forms(v)) { const re = new RegExp(`(?:dung\\s*tích|displacement)[^.;\\n]{0,45}?${f.replace(/[.]/g, "\\.")}`, "gi"); for (const m of t.matchAll(re)) hits.push({ i: m.index, l: labelBefore(t, m.index) }); }
    const labels = [...new Set(hits.map((h) => h.l))];
    if (!hits.length) flags.push(`${name} ${v}: không thấy số trong câu dung tích`);
    else if (!labels.includes(cap) && labels.some((l) => l != null)) { const h = hits[0]; flags.push(`${name} ${v}: mục ${labels.join("/")} ≠ cỡ ${cap} «${t.slice(Math.max(0, h.i - 45), h.i + 60).replace(/\s+/g, " ")}»`); }
  }
  if (flags.length) { bad++; p(`\n## ${run} cap ${cap}; ${e.rows.length} dòng; luật ${[...e.rules]}; cỡ trong HSMT ${sizes.slice(0, 8).join(",")}; top30: ${e.rows.filter((x) => x.top >= 0).length}`); flags.forEach((f) => p("  ", f)); p("   máy:", [...new Set(e.rows.map((x) => x.model))].slice(0, 6).join(", ")); const re = new RegExp(`[^.\\n]{0,40}${cap}\\s*k\\s*va[^.\\n]{0,40}(?:dung\\s*tích\\s*(?:xi|xy)|xi\\s*lanh|xy\\s*lanh)[^.\\n]{0,50}`, "gi"); const own = [...t.matchAll(re)].slice(0, 3).map((m) => m[0].replace(/\s+/g, " ")); p("   câu của đúng cỡ:", own.length ? own.join(" ¦ ") : "(không có)"); }
}
p(`\nLượt: ${runs.size} | HSMT nhiều cỡ: ${multi} | cần xem: ${bad}`);
fs.writeFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/soat-1022/soat-muc.txt", out.join("\n"));
console.log(out.join("\n").slice(0, 16000));
