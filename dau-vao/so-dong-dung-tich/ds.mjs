// node ds.mjs <worktree> <động cơ,...>: đường kính × hành trình × số xi lanh do nguồn ghi (đọc qua lớp chuẩn hoá như
// candidates), mỗi NCC một dòng, kèm dung tích tính = π/4 · D² · S · z (lít, 3 chữ số) và dung tích nguồn ghi. Chỉ đọc.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, LIST] = process.argv.slice(2);
process.env.GENBID_SPEC_NORM = "1";
const B = await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), facts = B.modelFacts(cat, sups);
const want = new Set(LIST.split(","));
for (const e of cat.engines.filter((x) => want.has(x.key))) {
  const ef = facts.get(`engine:${e.key}`) || [];
  const all = [...ef.map((f) => [f, undefined]), ...e.uses.flatMap((u) => (u.specs || []).map((f) => [{ ...f, supplierId: f.supplierId ?? u.supplierId }, B.useNormCtx(u)]))];
  const by = new Map();
  for (const [f, ctx] of all) {
    if (!["bore", "cyl", "disp"].includes(f.key)) continue;
    const x = B.normFig(f, ctx, f.key === "bore" ? { unit: "mm" } : f.key === "disp" ? { unit: "L" } : {});
    if (!x.ok) continue;
    const o = by.get(f.supplierId) || { bore: new Set(), cyl: new Set(), disp: new Set() };
    if (f.key === "bore" && x.r.bore?.bore && x.r.bore?.stroke) o.bore.add(`${x.r.bore.bore}×${x.r.bore.stroke}`);
    if (f.key === "cyl" && x.r.count) o.cyl.add(x.r.count);
    if (f.key === "disp" && x.r.num != null) o.disp.add(x.r.num);
    by.set(f.supplierId, o);
  }
  const lines = [];
  for (const [s, o] of by) {
    if (!o.bore.size) continue;
    for (const bs of o.bore) for (const z of o.cyl.size ? o.cyl : [null]) {
      const [D, S] = bs.split("×").map(Number);
      lines.push(`    ${s}: ${bs} × ${z ?? "?"}${z ? ` = ${(Math.PI / 4 * D * D * S * z / 1e6).toFixed(3)} L` : ""}; dung tích ghi ${[...o.disp].join(" / ") || "-"}`);
    }
  }
  console.log(`${e.key}: ${lines.length ? "" : "không nguồn nào ghi đường kính × hành trình"}`);
  for (const l of [...new Set(lines)].sort()) console.log(l);
}
