// Soát MỌI lượt có dòng mất vì xi lanh / kiểu / dung tích: ngưỡng bot đọc ↔ chữ HSMT quanh "dung tích", "xi lanh". Chỉ đọc. Tệp ra có chữ HSMT: không commit.
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich-2.json", import.meta.url), "utf8"));
const docs = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const byNo = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo && d.config?.text).map((d) => [d.notifyNo, d]));
const GEO = new Set(["cyl", "layout", "disp", "maxDisp"]), out = [], p = (...a) => out.push(a.join(" "));
const rows = T.lost.filter((x) => x.ruled.some((r) => GEO.has(r))), runs = new Map();
for (const x of rows) { const e = runs.get(x.run) || { lim: x.lim, rows: [] }; e.rows.push(x); runs.set(x.run, e); }
const RE = /dung\s*tích|xi[\s-]*lanh|xy[\s-]*lanh|cylinder|displacement/gi;
const snips = (t) => { const s = [], seen = new Set(); let last = -999; for (const m of t.matchAll(RE)) { if (m.index - last < 70) continue; last = m.index; const c = t.slice(Math.max(0, m.index - 35), m.index + 85).replace(/\s+/g, " "); const k = c.slice(30, 70); if (seen.has(k)) continue; seen.add(k); s.push(c); if (s.length >= 5) break; } return s; };
p("Lượt có luật hình học:", runs.size, "| dòng:", rows.length);
for (const [run, e] of [...runs].sort((a, b) => b[1].rows.length - a[1].rows.length)) {
  const l = e.lim, d = byNo.get(run.split("#")[0]), r = new Map();
  for (const x of e.rows) for (const k of x.ruled) if (GEO.has(k)) r.set(k, (r.get(k) || 0) + 1);
  p(`\n## ${run} ${e.rows.length} dòng; cap ${JSON.stringify(l.cap)}; minCyl ${l.minCyl ?? "-"} exact ${l.cylExact ?? "-"} layout ${l.cylLayout ?? "-"} minDisp ${l.minDisp ?? "-"} maxDisp ${l.maxDisp ?? "-"}; luật ${[...r].map(([k, n]) => `${k}:${n}`).join(",")}`);
  p("  máy:", [...new Set(e.rows.map((x) => x.model))].slice(0, 6).join(", "));
  p("  vì:", (e.rows[0].why || []).filter((w) => /xi lanh|dung tích/.test(w)).join(" ; ").slice(0, 150) || JSON.stringify(e.rows[0].why).slice(0, 150));
  if (!d) { p("  KHÔNG THẤY HSMT"); continue; }
  snips(d.config.text).forEach((s) => p("  «" + s + "»"));
}
const eng = (name) => Object.values(T.eng).find((x) => x.model === name);
for (const m of ["20M33G2250/5", "WD145TAD35"]) { p(`\n== nguồn ${m}`); for (const f of eng(m)?.f || []) if (f.k === "cyl") p(`  ${f.s} n${f.n} ${f.v} sheet=${f.sheet} maker=${f.maker}`); for (const x of rows.filter((y) => y.model === m)) p("  loại:", x.run, x.sup, x.ruled.join(","), (x.why || []).filter((w) => /xi lanh|dung tích/.test(w)).join(" ; ").slice(0, 100)); }
fs.writeFileSync(new URL("./soat-nguong.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 28000));
