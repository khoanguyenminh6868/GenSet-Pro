// #1022 đo lần 2: top 30 đổi có quy về dòng mất / thêm / đổi điểm không; dòng còn mất ở IB2300162912#0; dòng thêm; bộ 97.7 L/h của longkai.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const D = process.argv[2], R = (f) => JSON.parse(fs.readFileSync(path.join(D, f), "utf8")), Z = (f) => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(D, f)))), noAlt = (k) => { const p = k.split("|"); p[2] = ""; return p.join("|"); };
const G = Z("gop-goc.json.gz"), N = Z("gop-nhanh.json.gz"), T3 = R("giai-thich-3.json"), J = R("doi-chieu-2.json");
const best = (l) => { const m = new Map(); for (const [k, s] of l) { const x = noAlt(k); if (!m.has(x) || m.get(x) < s) m.set(x, s); } return m; };
let same = 0, explained = 0, topIn = 0, topInNotAll = 0, outKept = 0; const bad = [], outBad = [];
for (const run of Object.keys(G)) {
  const a = best(G[run].all), b = best(N[run].all), ga = G[run].top.map(noAlt), na = N[run].top.map(noAlt), lostN = [...a.keys()].filter((k) => !b.has(k)).length, addN = [...b.keys()].filter((k) => !a.has(k)).length, chg = [...a].filter(([k, s]) => b.has(k) && b.get(k) !== s), topChanged = ga.join("\n") !== na.join("\n");
  if (!topChanged) { same++; continue; }
  if (lostN + addN + chg.length) explained++; else bad.push(run);
  const gs = new Set(ga), ns = new Set(na); for (const k of na) if (!gs.has(k)) { topIn++; if (!a.has(k)) topInNotAll++; }
  // Dòng ra top mà còn trong all, điểm không đổi: phải có dòng khác trong lượt vượt lên (được cộng điểm) hoặc trần NCC / hãng đổi vì dòng mất.
  for (const k of ga) if (!ns.has(k) && b.has(k)) { outKept++; if (b.get(k) === a.get(k) && !chg.some(([x, s]) => b.get(x) > s) && !lostN && !addN) outBad.push(`${run} ${k.slice(0, 60)}`); }
}
console.log(`Lượt top không đổi thứ tự: ${same} | top đổi: ${explained + bad.length} | có dòng mất / thêm / đổi điểm trong lượt: ${explained} | KHÔNG có: ${bad.length}`, bad.slice(0, 10).join(" "));
console.log(`Vào top: ${topIn}, không có trong all gốc: ${topInNotAll} | Ra top còn trong all: ${outKept}, không có nguyên nhân trong lượt: ${outBad.length}`, outBad.slice(0, 5).join(" ; "));
for (const x of T3.lost.filter((y) => y.run === "IB2300162912#0")) console.log("Còn mất:", x.run, x.sup, x.model, x.ruled.join(","), JSON.stringify(x.lim).slice(0, 160), (x.fuel || []).map((f) => `${f.k}=${f.v}`).join(" "));
console.log("Thêm:", JSON.stringify(J.add).slice(0, 220));
const L = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/wt-tieu-hao/suppliers/cn/longkai-power.json", "utf8")), g = new Map();
for (const b of L.specTables) { const r = [...(b.header || []), ...(b.rows || [])].map(String), f = r.find((x) => /100% load\(Prime power\)\s*\|\s*L\/h/i.test(x)); if (!f) continue; const v = f.split("|").map((s) => s.trim()).filter(Boolean).at(-1), t = r.find((x) => /POWER YOUR FUTURE \|/.test(x))?.split("|").map((s) => s.trim()).filter(Boolean).at(1), p = r.find((x) => /Prime Power:/i.test(x))?.match(/Prime Power:\s*([\d.]+)KW/i)?.[1], gk = r.find((x) => /100% load\(Prime power\)\s*\|\s*g/i.test(x))?.split("|").map((s) => s.trim()).filter(Boolean).at(-1); if (v === "97.7") g.set(`n${b.n} ${t}`, `Prime ${p} kW, g/kWh ${gk ?? "-"}`); }
console.log("Tờ longkai ghi 97.7 L/h:", g.size); for (const [k, v] of g) console.log(" ", k, v);
for (const x of T3.lost.filter((y) => ["WP13D490E310", "6M26D484E200"].includes(y.model) && (y.fuel || []).some((f) => String(f.v) === "97.7") && new Set(J.newLost.map((k) => k.split("\t")[0])).has(y.run))) console.log("Dòng:", x.run, x.model, "ngưỡng 100%", x.lim.maxFuel, x.ruled.join(","));
