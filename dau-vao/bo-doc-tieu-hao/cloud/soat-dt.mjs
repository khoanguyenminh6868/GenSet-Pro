// Soát MỌI dòng mất vì xi lanh / kiểu xi lanh / dung tích (giai-thich-2.json, code nhánh đã có dropspec): số dùng để loại ↔ hình học, tờ hãng, tên model.
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync(new URL("./giai-thich-2.json", import.meta.url), "utf8"));
const out = [], p = (...a) => out.push(a.join(" "));
const GEO = new Set(["cyl", "layout", "disp", "maxDisp"]);
const nums = (v) => (String(v).replace(/,/g, ".").match(/\d+(?:\.\d+)?/g) || []).map(Number);
const cylOf = (v) => { const m = String(v).match(/\d{1,2}/); return m ? +m[0] : null; };
const litre = (v) => { const s = String(v), x = nums(s)[0]; if (x == null) return null; if (/cc|cm|ml/i.test(s) || x >= 400) return x / 1000; return x; };
const boreOf = (v) => { const m = String(v).match(/(\d{2,3}(?:\.\d+)?)\s*[*×xX\/]\s*(\d{2,3}(?:\.\d+)?)/); return m ? [+m[1], +m[2]] : null; };
const mode = (a) => { const m = new Map(); for (const x of a) m.set(x, (m.get(x) || 0) + 1); return [...m].sort((x, y) => y[1] - x[1]); };
const nameCyl = (m) => { const x = String(m).match(/^(\d{1,2})M\d\d/); return x ? +x[1] : null; };
const stillGone = T.lost.filter((x) => x.ruled[0] === "(không thấy trong dropped)");
p("Dòng mất theo cloud:", T.lost.length, "| không còn bị loại ở code mới:", stillGone.length);
const gByS = new Map(); for (const x of stillGone) { const k = `${x.sup} ${x.k.split("|")[1]}`; gByS.set(k, (gByS.get(k) || 0) + 1); } p(JSON.stringify([...gByS]));
const rows = T.lost.filter((x) => x.ruled.some((r) => GEO.has(r)));
const onlyGeo = rows.filter((x) => x.ruled.every((r) => GEO.has(r)));
p("Dòng có luật hình học:", rows.length, "| chỉ luật hình học:", onlyGeo.length);
const E = new Map();
for (const x of rows) {
  const e = E.get(x.ekey) || { model: x.model, n: 0, rules: new Map(), why: new Set(), sups: new Set() }; e.n++; e.sups.add(x.sup);
  for (const r of x.ruled) if (GEO.has(r)) e.rules.set(r, (e.rules.get(r) || 0) + 1);
  for (const w of x.why) if (/xi lanh|dung tích/.test(w)) e.why.add(w.replace(/\d+(?:\.\d+)? L (HSMT|<)/, "$&"));
  E.set(x.ekey, e);
}
const bad = [], okList = [];
for (const [key, e] of E) {
  const f = T.eng[key]?.f || [], cy = f.filter((x) => x.k === "cyl").map((x) => cylOf(x.v)).filter((x) => x), di = f.filter((x) => x.k === "disp").map((x) => litre(x.v)).filter((x) => x), bo = f.filter((x) => x.k === "bore").map((x) => boreOf(x.v)).filter(Boolean).map((x) => x.join("*"));
  const mc = mode(cy)[0]?.[0], md = mode(di)[0]?.[0], mb = mode(bo)[0]?.[0], [B, S] = mb ? mb.split("*").map(Number) : [], geo = B && mc ? Math.PI / 4 * B * B * S * mc / 1e6 : null;
  const maker = f.filter((x) => x.sheet || x.maker), mkC = [...new Set(maker.filter((x) => x.k === "cyl").map((x) => cylOf(x.v)))], mkD = [...new Set(maker.filter((x) => x.k === "disp").map((x) => litre(x.v)))];
  const flags = [];
  if (geo && md && Math.abs(geo / md - 1) > 0.05) flags.push(`hình học ${geo.toFixed(2)} ≠ dung tích số đông ${md}`);
  if (nameCyl(e.model) && mc && nameCyl(e.model) !== mc) flags.push(`tên ${nameCyl(e.model)} xi lanh ≠ số đông ${mc}`);
  if (mkC.length && mc && !mkC.includes(mc)) flags.push(`tờ hãng ${mkC} xi lanh ≠ số đông ${mc}`);
  if (mkD.length && md && !mkD.some((x) => Math.abs(x / md - 1) <= 0.02)) flags.push(`tờ hãng ${mkD} L ≠ số đông ${md}`);
  if (mode(cy).length > 1) flags.push(`xi lanh nguồn ghi ${JSON.stringify(mode(cy))}`);
  if (mode(di).length > 1 && Math.max(...di) / Math.min(...di) > 1.05) flags.push(`dung tích nguồn ghi ${JSON.stringify(mode(di).slice(0, 5))}`);
  if ((e.rules.has("disp") || e.rules.has("maxDisp")) && !di.length && !geo) flags.push("không có dung tích ở facts");
  if (e.rules.has("cyl") && !cy.length) flags.push("xi lanh chỉ ở dòng");
  const line = `${e.model} (${e.n} dòng, ${e.sups.size} NCC; ${[...e.rules].map(([r, n]) => `${r}:${n}`).join(",")}) xi lanh ${mc ?? "-"} (${cy.length}), dung tích ${md ?? "-"} (${di.length}), ${mb ?? "-"}${geo ? ` = ${geo.toFixed(2)} L` : ""}, tờ hãng ${mkC.join("/") || "-"} xl ${mkD.join("/") || "-"} L`;
  (flags.length ? bad : okList).push({ n: e.n, line, flags, why: [...e.why].slice(0, 3) });
}
p("\nĐộng cơ:", E.size, "| không điểm lệch:", okList.length, "| cần xem:", bad.length);
p("\n== Cần xem");
for (const b of bad.sort((x, y) => y.n - x.n)) { p(b.line); p("   LỆCH:", b.flags.join("; ")); b.why.forEach((w) => p("   vì:", w.slice(0, 120))); }
p("\n== Không điểm lệch");
for (const b of okList.sort((x, y) => y.n - x.n)) p(b.line);
p("\n== Ngưỡng HSMT 1 xi lanh");
for (const x of rows.filter((y) => y.lim?.minCyl === 1)) p(x.run, x.sup, x.model, x.why.join("; "));
fs.writeFileSync(new URL("./soat-dt.txt", import.meta.url), out.join("\n"));
console.log(out.join("\n").slice(0, 15000));
