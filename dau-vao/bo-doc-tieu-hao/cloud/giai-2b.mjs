// #1022 đo lần 2: dòng mất mới: bộ số tiêu hao đã soát ở lần 1 chưa; ngưỡng có phải của cỡ khác không; 33 dòng sizeBlocks còn mất không. Chữ HSMT chỉ in ra màn hình.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
process.env.GENBID_SPEC_NORM = "1";
const D = process.argv[2], HERE = import.meta.dirname, R = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const B = await import(pathToFileURL("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/config-bot.mjs").href);
const T3 = R(path.join(D, "giai-thich-3.json")), T1 = R(path.join(HERE, "giai-thich-2.json")), J = R(path.join(D, "doi-chieu-2.json")), docs = R("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json").docs;
const byNo = new Map(Object.values(docs).map((x) => x.d).filter((d) => d?.notifyNo && d.config?.text).map((d) => [d.notifyNo, d]));
// `k` trong giai-thich bị cắt 120 ký tự: so bằng khoá đã cắt.
const cut = (s) => { const i = s.indexOf("\t"); return s.slice(0, i + 121); }, id = (x) => `${x.run}\t${x.k}`, newSet = new Set(J.newLost.map(cut)), gone = new Set(J.goneLost.map(cut)), rows = T3.lost.filter((x) => newSet.has(id(x)));
const tuple = (x) => `${x.sup}|${x.model}|${(x.fuel || []).map((f) => `${f.k}=${f.v}`).sort().join(";")}`, seen = new Set(T1.lost.map(tuple)), RF = new Set(["fuel", "fuel75", "fuel50"]);
const nf = new Map(); for (const x of rows) if (x.ruled.some((r) => RF.has(r)) && !seen.has(tuple(x))) { const e = nf.get(tuple(x)) || { n: 0, x }; e.n++; nf.set(tuple(x), e); }
console.log("Dòng mất mới có tiêu hao:", rows.filter((x) => x.ruled.some((r) => RF.has(r))).length, "| bộ số CHƯA có ở lần 1:", nf.size);
for (const [k, e] of nf) console.log(" ", e.n, k.slice(0, 130), "|", e.x.line.slice(0, 90));
const num = (s) => +String(s).replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
const foreign = (line, cap, all) => { const h = line.split(":")[0]; if (h.length > 90) return false; const k = [...h.matchAll(/(\d[\d.,]*)\s*k\s*va/gi)].map((m) => num(m[1])); if (!k.length) return false; const near = (x) => all.reduce((b, v) => (Math.abs(v - x) < Math.abs(b - x) ? v : b), all[0]); return k.every((x) => near(x) !== cap); };
const KEYS = ["minDisp", "maxDisp", "minCyl", "maxFuel", "maxFuel75", "maxFuel50"], RULE = { disp: "minDisp", maxDisp: "maxDisp", cyl: "minCyl", fuel: "maxFuel", fuel75: "maxFuel75", fuel50: "maxFuel50" };
let oan = 0; const runs = [...new Set(rows.map((x) => x.run))];
for (const run of runs) {
  const [no, ri] = run.split("#"), d = byNo.get(no), t = d.config.text, kv = (d.config.kvas || []).map((k) => `${k.v} ${k.u}`).join(", "), found = B.sizesOf([kv, d.bidName], d.bidName), rr = rows.filter((x) => x.run === run);
  let diff = [];
  if (found.length > 1) { const s = found[+ri], caps = found.map((x) => x.cap.value), a = B.minsForSize(t, s, found).mins, b = B.minsForSize(t.split("\n").map((x) => (foreign(x, s.cap.value, caps) ? "" : x)).join("\n"), s, found).mins; diff = KEYS.filter((k) => (a[k] ?? null) !== (b[k] ?? null)); if (diff.length) console.log("NGƯỠNG CỠ KHÁC", run, diff.map((k) => `${k} ${a[k] ?? "-"}→${b[k] ?? "-"}`).join("; ")); }
  const dep = rr.filter((x) => x.ruled.every((r) => diff.includes(RULE[r]))); oan += dep.length;
  if (rr.some((x) => x.ruled.some((r) => !RF.has(r)))) { console.log(`\n# ${run} cỡ ${rr[0].lim.cap?.value}, ${rr.length} dòng, chỉ vì ngưỡng cỡ khác: ${dep.length}`); const S = new Set(); for (const m of t.matchAll(/(?:dung\s*tích\s*(?:xi|xy)|tổng dung tích|số\s*x[iy][\s-]*lanh)/gi)) { const c = t.slice(Math.max(0, m.index - 38), m.index + 58).replace(/\s+/g, " "); if (S.size < 4 && !S.has(c)) S.add(c); } S.forEach((c) => console.log("  «" + c + "»")); }
}
console.log("\nDòng mất mới chỉ vì ngưỡng cỡ khác:", oan);
const OAN = new Set(["IB2300260615#1", "IB2300162912#0", "IB2300046353#1"]), old = T1.lost.filter((x) => OAN.has(x.run) && x.ruled[0] !== "(không thấy trong dropped)");
const c = new Map(); for (const x of old) { const k = `${x.run} ${gone.has(id(x)) ? "hết mất" : "còn mất"}`; c.set(k, (c.get(k) || 0) + 1); } console.log("Dòng ở 3 lượt sizeBlocks:", JSON.stringify([...c]));
const prevF = new Set(T1.fuelMinus.map(tuple)), nm = new Map(); for (const x of T3.fuelMinus) if (!prevF.has(tuple(x))) nm.set(tuple(x), (nm.get(tuple(x)) || 0) + 1); console.log("−300: bộ số chưa có ở lần 1:", JSON.stringify([...nm]));
