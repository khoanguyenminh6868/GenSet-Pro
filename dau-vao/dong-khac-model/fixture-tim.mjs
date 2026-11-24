// node fixture-tim.mjs out-loai.json → mỗi chỗ trong result của lượt fixture có chuỗi trùng một dòng trong danh sách: đường dẫn, loại, bộ phận, trạng thái
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const dir = "C:/Projects/GenSet Pro/GenSet-Pro/suppliers/fixtures/runs";
const by = new Map();
for (const r of rows) if (r.line.length >= 12) { const a = by.get(r.line) || []; a.push(r); by.set(r.line, a); }
const hits = [];
for (const d of fs.readdirSync(dir)) {
  const p = path.join(dir, d); if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p).filter((x) => /^config.*\.input\.json\.gz$/.test(x))) {
    const j = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(p, f))).toString("utf8"));
    const walk = (v, pth, ctx) => {
      if (typeof v === "string") { for (const [line, rs] of by) if (v === line || v.includes(line)) hits.push({ run: `${d}/${f}`, pth, line, rs, ctx }); return; }
      if (Array.isArray(v)) return v.forEach((x, i) => walk(x, `${pth}[${i}]`, ctx));
      if (v && typeof v === "object") { const c2 = v.item || v.name || v.code ? { part: v.part, item: String(v.item || v.name || "").slice(0, 50), status: v.status, byCode: v.byCode } : ctx; for (const k of Object.keys(v)) walk(v[k], `${pth}.${k}`, c2); }
    };
    walk(j, "j", null);
    // trạng thái bộ điều khiển của cấu hình
  }
}
console.log("số chỗ trùng trong result:", hits.length);
for (const h of hits) console.log(h.run, h.pth, "| loại", [...new Set(h.rs.map((r) => r.loai))].join("/"), "| gắn", [...new Set(h.rs.map((r) => r.model))].join(",").slice(0, 40), "|", JSON.stringify(h.ctx), "|", h.line.slice(0, 70));
