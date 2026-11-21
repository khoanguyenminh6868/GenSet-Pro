// Với mọi check tiêu hao "chưa rõ" trong <check-all.json>: dòng nguồn của cấu hình (genset.src / engine.src trong ảnh chụp
// configmatch) và MỌI bản ghi catalog / tờ hãng ghi động cơ đó, số tiêu hao đọc qua lớp chuẩn hoá (đơn vị, mức tải) +
// chữ L/h có trong nguồn. node fuel-src.mjs <gốc repo> <check-all.json> > out.tsv
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [rootArg, res] = process.argv.slice(2), root = path.resolve(rootArg), snap = path.join(import.meta.dirname, "..", "dau-phat-hang-b");
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
await import(pathToFileURL(path.join(root, "web", "spec-norm.js")).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const cnDir = path.join(root, "suppliers", "cn");
const sups = fs.readdirSync(cnDir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cnDir, f), "utf8"))).filter((s) => s.status !== "incomplete");
const byEng = new Map(), byLine = new Map();
for (const s of sups) for (const r of C.fromSupplier(s, [])) {
  const rows = s.specTables?.[r.table]?.rows || [];
  const fuels = (r.specs || []).filter((x) => /^fuel(75|50)?$/.test(x.key)).map((x) => ({ x, n: SN.normalize(x, { title: r.title, header: r.header || r.lines?.header || [], rows }) }));
  const txt = r.line ? [...(r.header || []), r.line].join(" ") : (r.lines?.rows || []).join(" ");
  const lh = /(?<![a-z])l\s*\/\s*h(r|our)?\b|lph\b|升\s*\/\s*小?时/i.test(txt);
  const o = { s: s.id, role: s.role, n: r.n, kind: r.kind, model: r.model, fuels, lh, line: r.line || "(nhãn)" };
  if (r.model) { const k = C.keyOf(r.model); byEng.set(k, [...(byEng.get(k) || []), o]); }
  if (r.line) byLine.set(`${s.id}|${r.n}|${C.keyOf(r.line)}`, o);
}
const fmt = (o) => `${o.s}[${o.n}] ${o.fuels.map(({ x, n }) => `${x.key}=${x.value}${n?.unit ? ` ${n.unit}` : " ?đv"}${n?.cond?.load ? `@${n.cond.load}` : ""}`).join(", ") || "-"}${o.lh ? " (có chữ L/h)" : ""}`;
const list = JSON.parse(fs.readFileSync(path.join(snap, "snap", "configmatch.json"), "utf8"));
const R = JSON.parse(fs.readFileSync(res, "utf8"));
for (const { id: key, data } of list) {
  const result = data.result || data;
  for (const c of R[key]?.configs || []) {
    const un = (c.checks || []).filter((x) => /ti[êe]u\s*hao/i.test(x.k) && /\|unclear/.test(x.k));
    if (!un.length) continue;
    const src = (result.configs || []).find((y) => y.engine?.model === c.engine && y.alternator?.model === c.alt) || {};
    const g = src.genset?.src || src.engine?.src || {};
    const row = g.line ? byLine.get(`${g.supplierId}|${Number(g.n)}|${C.keyOf(g.line)}`) : null;
    const others = (byEng.get(C.keyOf(c.engine || "")) || []).filter((o) => o.fuels.some(({ n }) => n?.unit === "L/h") || o.lh);
    console.log([key, `#${c.rank}`, c.engine, un.map((x) => x.k.split("|")[1]).join(" ; "), row ? fmt(row) : `dòng ${g.supplierId || "?"}[${g.n || "?"}] không thấy`,
      `${others.length} bản ghi khác có L/h: ${others.slice(0, 6).map(fmt).join(" || ")}`].join("\t"));
  }
}
