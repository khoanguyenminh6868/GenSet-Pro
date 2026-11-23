// node trung-ten.mjs → model "thiếu tờ" mà tờ đã lưu có model cùng khoá chuẩn (bỏ khoảng trắng, "-", ".", "_", đuôi 1)
import fs from "node:fs";
const j = JSON.parse(fs.readFileSync(new URL("./hien-trang.json", import.meta.url), "utf8"));
const norm = (s) => s.toUpperCase().replace(/[\s\-._/]+/g, "");
const sheetModels = [];
for (const m of Object.values(j.makers)) for (const [k, v] of Object.entries(m.models)) sheetModels.push({ maker: m.id, model: k, sheets: v.sheets });
const by = new Map();
for (const s of sheetModels) by.set(norm(s.model), s);
const rows = j.catalog.rows.filter((r) => /stamford|leroy|mecc|marathon/i.test(r.make));
const out = [];
for (const r of rows) {
  if (r.ratingRows || r.attrKeys.length || r.makerSup.length) continue;
  const n = norm(r.model);
  const s = by.get(n) || by.get(n.replace(/1$/, "")) || by.get(n + "1");
  if (s) out.push({ make: r.make, model: r.model, nSup: r.nSup, to: s.model, hoSo: s.maker, tep: s.sheets });
}
console.log(sheetModels.length, "model trong tờ;", out.length, "trùng tên");
console.log(out.map((o) => `${o.make}: ${o.model} (${o.nSup}) ↔ ${o.to} [${o.hoSo} ${o.tep}]`).join("\n"));
fs.writeFileSync(new URL("./trung-ten.json", import.meta.url), JSON.stringify(out, null, 1));
