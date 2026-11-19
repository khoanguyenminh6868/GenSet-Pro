// node soat-ds.mjs <worktree> <an-v.txt> <out.txt>: soát mọi nhóm "3b. V loại thêm" bằng đường kính × hành trình × số xi lanh
// do nguồn ghi (đọc qua lớp chuẩn hoá). Nhóm mà D×S×z nguồn ghi ĐẠT ngưỡng trong khi số đông (số chính xác nhất của nhóm thắng)
// không đạt → số đông có thể sai: liệt kê riêng. Chỉ đọc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, AN, OUT] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups), byKey = new Map(cat.engines.map((e) => [e.key, e]));
function dsOf(key) {
  const e = byKey.get(key); if (!e) return [];
  const ef = facts.get(`engine:${key}`) || [];
  const all = [...ef.map((f) => [f, undefined]), ...e.uses.flatMap((u) => (u.specs || []).map((f) => [{ ...f, supplierId: f.supplierId ?? u.supplierId }, B.useNormCtx(u)]))];
  const by = new Map();
  for (const [f, ctx] of all) {
    if (f.key !== "bore" && f.key !== "cyl") continue;
    const x = B.normFig(f, ctx, f.key === "bore" ? { unit: "mm" } : {});
    if (!x.ok) continue;
    const o = by.get(f.supplierId) || { bore: new Set(), cyl: new Set() };
    if (f.key === "bore" && x.r.bore?.bore && x.r.bore?.stroke) o.bore.add(`${x.r.bore.bore}×${x.r.bore.stroke}`);
    if (f.key === "cyl" && x.r.count) o.cyl.add(x.r.count);
    by.set(f.supplierId, o);
  }
  const out = new Map();
  for (const [, o] of by) for (const bs of o.bore) for (const z of o.cyl) {
    const [D, S] = bs.split("×").map(Number), l = Math.PI / 4 * D * D * S * z / 1e6, k = `${bs}×${z}=${l.toFixed(3)}`;
    out.set(k, { n: (out.get(k)?.n || 0) + 1, l });
  }
  return [...out].map(([k, o]) => ({ k, ...o }));
}
const lines = fs.readFileSync(AN, "utf8").split("\n");
const i0 = lines.findIndex((l) => l.startsWith("3b.")), i1 = lines.findIndex((l, i) => i > i0 && !l.startsWith("  "));
const L = [], cnt = {}, bad = [];
for (const l of lines.slice(i0 + 1, i1)) {
  const [e, rule, , grp, thr, , tail] = l.trim().split("\t");
  const t = Number(thr.replace(/[^\d.]/g, "")), g = grp.replace("nhóm ", "").split("/").map(Number);
  const exact = B.dispExact({ group: g, raw: {} }, rule === "disp" ? "min" : "max");
  const fails = (x) => (rule === "disp" ? x < t : x > t * 1.005);
  const ds = dsOf(e), ok = ds.filter((x) => !fails(x.l)), no = ds.filter((x) => fails(x.l));
  const v = !ds.length ? "không nguồn nào ghi D×S×z" : !ok.length ? "khớp: D×S×z cũng không đạt" : !no.length ? "TRÁI: D×S×z ĐẠT" : "D×S×z nguồn ghi khác nhau";
  cnt[v] = (cnt[v] || 0) + 1;
  const row = `${e}\t${rule} ${thr}\tnhóm ${g.join("/")} (chính xác ${exact}${fails(exact) ? "" : ", ĐẠT theo luật chốt"})\t${v}\t${ds.map((x) => `${x.k} (${x.n} NCC)`).join("; ")}\t${tail || ""}`;
  L.push(row);
  if (v.startsWith("TRÁI") || v.startsWith("D×S×z nguồn")) bad.push(row);
}
const head = [`Nhóm 3b: ${L.length}; ${JSON.stringify(cnt)}`, `\nTRÁI hoặc nguồn ghi khác nhau (${bad.length}):`, ...bad, "\nĐủ:"];
fs.writeFileSync(OUT, [...head, ...L].join("\n"));
console.log(head.join("\n"));
