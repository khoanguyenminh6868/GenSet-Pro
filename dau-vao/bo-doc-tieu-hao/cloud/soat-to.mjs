// Soát TOÀN BỘ tờ có dòng tiêu hao theo mức tải (mẫu "100% load(Prime power)", "100%负载油耗"): thân tờ có khớp model ở tiêu đề không.
import fs from "node:fs";
import path from "node:path";
const CN = "C:/Projects/GenSet Pro/wt-do-1022-nhanh/suppliers/cn";
const J = JSON.parse(fs.readFileSync(new URL("./giai-thich.json", import.meta.url), "utf8"));
const lostBy = new Map(); for (const x of J.lost) if ((x.ruled || []).some((r) => /fuel|cyl|layout/.test(r))) { const k = `${x.sup}|${x.model}`; lostBy.set(k, (lostBy.get(k) || 0) + 1); }
const out = [], p = (...a) => out.push(a.join(" "));
const cells = (r) => String(r).split("|").map((c) => c.trim()).filter(Boolean);
const after = (rows, re) => { for (const r of rows) { const c = cells(r); const i = c.findIndex((x) => re.test(x)); if (i >= 0) { for (let j = i + 1; j < c.length; j++) { const m = c[j].match(/^\d+(?:[.,]\d+)?(?:\s*[*×x]\s*\d+(?:\.\d+)?)?/); if (m && !/^(kw|kva|l\/h|mm|l)$/i.test(c[j])) return c[j]; } } } return null; };
const toNum = (s) => (s == null ? null : +String(s).replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0]);
let sheets = 0; const bad = [];
for (const f of fs.readdirSync(CN).filter((x) => x.endsWith(".json"))) {
  const d = JSON.parse(fs.readFileSync(path.join(CN, f), "utf8"));
  for (const t of d.specTables || []) {
    const rows = [...(t.header || []), ...(t.rows || [])];
    if (!rows.some((r) => /100%\s*load\s*\(Prime|100%负载油耗/i.test(r))) continue;
    sheets++;
    const title = rows.map(cells).find((c) => c[0] === "POWER YOUR FUTURE")?.[1] || null;
    const engModel = rows.map(cells).filter((c) => /^Model$/i.test(c[0]) && c[1] && !/LONGKAI/i.test(c[1]) && !/^L[GK]/.test(c[1])).map((c) => c[1])[0] || null;
    const model = title || engModel;
    const cylT = rows.map(cells).find((c) => /No\.?\s*cylinders|气缸数|缸数/i.test(c[0]))?.[1] || null, cyl = toNum(cylT);
    const disp = toNum(after(rows, /^Displacement$|排量/i));
    const bs = String(after(rows, /Bore\s*\*\s*Stroke|缸径/i) || "").match(/(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)/);
    const prime = toNum(after(rows, /^Prime power$/i)), net = toNum(after(rows, /Rated net power/i)), f100 = toNum(after(rows, /100%\s*load|100%负载油耗/i));
    const flags = [];
    const nameDisp = model?.match(/(\d{1,2}\.\d)/)?.[1], nameCyl = model?.match(/^(\d{1,2})[A-Z]/)?.[1];
    if (nameDisp && disp && Math.abs(+nameDisp / disp - 1) > 0.08) flags.push(`tên ${nameDisp} L ≠ thân ${disp} L`);
    if (nameCyl && cyl && +nameCyl !== cyl) flags.push(`tên ${nameCyl} xi lanh ≠ thân ${cyl}`);
    if (bs && cyl && disp) { const g = Math.PI / 4 * bs[1] ** 2 * bs[2] * cyl / 1e6; if (Math.abs(g / disp - 1) > 0.06) flags.push(`hình học ${g.toFixed(2)} L ≠ ${disp} L`); }
    if (prime && net && net / prime > 1.6) flags.push(`net ${net} kW / prime ${prime} kW`);
    if (prime && f100 && (f100 / prime > 0.40 || f100 / prime < 0.18)) flags.push(`suất ${(f100 / prime).toFixed(3)} L/kWh (${f100}/${prime})`);
    if (flags.length) bad.push({ sup: d.id || f.replace(".json", ""), n: t.n, model, flags, lost: lostBy.get(`${d.id || f.replace(".json", "")}|${model}`) || 0 });
  }
}
p("Số tờ soát:", sheets, "| tờ có điểm lệch:", bad.length);
for (const b of bad.sort((x, y) => y.lost - x.lost)) p(`${b.sup} n${b.n} ${b.model} (dòng mất ${b.lost}):`, b.flags.join("; "));
p("\n== generatordieselchina: tờ có ô đa mức tải");
const g = JSON.parse(fs.readFileSync(path.join(CN, "generatordieselchina.json"), "utf8"));
let shown = 0;
for (const t of g.specTables || []) { const rows = [...(t.header || []), ...(t.rows || [])]; if (rows.some((r) => /@75%\s*\/\s*@100%/.test(r)) && shown++ < 2) { p("n" + t.n, t.title); rows.forEach((r) => p("  ", String(r).slice(0, 110))); } }
fs.writeFileSync(new URL("./soat-to.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 11000));
