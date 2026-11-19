// node 6-cap-gop.mjs <worktree gốc> > cap-gop.tsv
// Việc 1: mỗi khoá động cơ có ký tự lạ (★ ^ × * – — …) mà khoá sạch tồn tại riêng, trên GỐC: số bản ghi hai bên, hãng, và
// thông số cyl / disp / bore / công suất (kW, kVA) của dòng khoá lạ so với các dòng khoá sạch. Cột "mâu thuẫn" = giá trị của
// khoá lạ không có trong tập giá trị của khoá sạch.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "suppliers", "config-bot.mjs")).href);
const CAT = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const cat = CAT.build(sups), byKey = new Map(cat.engines.map((e) => [e.key, e]));
const BAD = /[^A-Z0-9.\-/()]/gu;
const vals = (e, k) => { const s = e.specs.find((x) => x.key === k); return s ? s.values.map((v) => v.value.replace(/\s+/g, "")) : []; };
const pw = (e) => e.uses.map((u) => Object.entries(u.power || {}).map(([r, p]) => `${r[0]}${p.kVA ?? ""}/${p.kW ?? ""}`).join(" ")).filter(Boolean);
const norm = (v) => String(v).toLowerCase().replace(/[^0-9.]/g, "").replace(/\.0+$/, "");
console.log(["khoá cũ", "khoá mới", "NCC khoá cũ", "bản ghi cũ", "bản ghi khoá sạch", "NCC khoá sạch", "hãng cũ", "hãng sạch", "cyl cũ", "cyl sạch", "disp cũ", "disp sạch", "bore cũ", "bore sạch", "công suất dòng cũ", "kW sạch (min–max)", "kVA sạch", "mâu thuẫn"].join("\t"));
for (const e of cat.engines) {
  if (!BAD.test(e.key)) { BAD.lastIndex = 0; continue; }
  BAD.lastIndex = 0;
  const clean = e.key.replace(BAD, "");
  const c = byKey.get(clean);
  if (!c) continue;
  const bad = [];
  for (const k of ["cyl", "disp", "bore"]) {
    const a = vals(e, k).map(norm), b = new Set(vals(c, k).map(norm));
    for (const v of a) if (b.size && !b.has(v)) bad.push(`${k} ${v}∉{${[...b].join(",")}}`);
  }
  for (const u of e.uses) for (const p of Object.values(u.power || {})) {
    if (p.kW && c.kw && (p.kW < c.kw[0] * 0.8 || p.kW > c.kw[1] * 1.25)) bad.push(`kW ${p.kW} ngoài ${c.kw.join("–")}`);
    if (p.kVA && c.kva && (p.kVA < c.kva[0] * 0.8 || p.kVA > c.kva[1] * 1.25)) bad.push(`kVA ${p.kVA} ngoài ${c.kva.join("–")}`);
  }
  console.log([e.key, clean, e.suppliers.join(","), e.uses.length, c.uses.length, c.suppliers.length, e.make || "", c.make || "",
    vals(e, "cyl").join(","), vals(c, "cyl").join(","), vals(e, "disp").join(","), vals(c, "disp").join(","), vals(e, "bore").join(","), vals(c, "bore").join(","),
    pw(e).join(" ; "), c.kw ? c.kw.join("–") : "", c.kva ? c.kva.join("–") : "", bad.join("; ") || "không"].join("\t"));
}
