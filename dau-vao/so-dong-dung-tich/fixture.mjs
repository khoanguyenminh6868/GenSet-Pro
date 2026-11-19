// node fixture.mjs <worktree> <out.json> <model,model...> : chép NGUYÊN VĂN các dòng bảng của suppliers/cn có nhắc một trong các
// model (khớp theo CAT.keyOf của từng ô), kèm tiêu đề / tên bảng / n / role / controllers, làm fixture test cho cand-disp-c.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [WT, OUT, MODELS] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const CAT = globalThis.GenbidCatalog;
const keys = new Set(MODELS.split(",").map((m) => CAT.keyOf(m)));
const dir = path.join(WT, "suppliers", "cn"), out = [];
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (s.status === "incomplete") continue;
  const tables = [];
  for (const t of s.specTables || []) {
    const titleHit = String(t.title || "").split(/[\s:–—|,/()]+/).some((w) => keys.has(CAT.keyOf(w)));
    const hit = (t.rows || []).filter((l) => CAT.cellsOf(l).some((c) => keys.has(CAT.keyOf(c))));
    // Tờ một model (không tiêu đề cột, dòng "nhãn | giá trị"): chép cả bảng, số nằm ở các dòng khác dòng có mã.
    const rows = titleHit || (hit.length && !(t.header || []).length && (t.rows || []).length <= 60) ? t.rows : hit;
    if (rows.length) tables.push({ n: t.n, title: t.title, header: t.header, rows });
  }
  if (tables.length) out.push({ id: s.id, country: s.country || "CN", role: s.role, confidence: s.confidence || "high", ...(s.controllers ? { controllers: s.controllers.map(({ brand, model }) => ({ brand, model })) } : {}), specTables: tables });
}
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.error(out.length, "NCC", out.reduce((n, s) => n + s.specTables.reduce((m, t) => m + t.rows.length, 0), 0), "dòng");
