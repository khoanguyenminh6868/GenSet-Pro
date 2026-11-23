// So MỌI bản ghi fromSupplier trước ↔ sau, khoá = vai + model + tổ máy + chữ dòng (KHÔNG có số trang: dòng trùng giữa các trang
// được bộ đọc giữ ở trang đầu, nên đổi trang không phải mất). Đếm theo từng trường đổi; chi tiết ghi tệp.
//   node recdiff2.mjs <gốc catalog> <gốc trước> <gốc sau> <id,id,...> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [root, before, after, idArg, outDir] = process.argv.slice(2);
await import(pathToFileURL(path.join(root, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const recs = (r, id) => C.fromSupplier(JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8")), []);
const key = (r) => [r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const body = (r) => { const { table, row, also, header, lines, n, ...x } = r; return x; };
const group = (l) => { const m = new Map(); for (const r of l) { const k = key(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); } return m; };
fs.mkdirSync(outDir, { recursive: true });
const rowsOut = [];
for (const id of idArg.split(",")) {
  const A = recs(before, id), B = recs(after, id), ga = group(A), gb = group(B);
  let add = 0, del = 0, same = 0, chg = 0, page = 0; const fields = {}, out = [];
  for (const [k, rb] of gb) {
    const ra = ga.get(k) || [];
    for (const r of rb.slice(ra.length)) { add++; out.push(`THÊM\tn${r.n}\t${r.kind}\t${r.model}\t${JSON.stringify(r.power)}\t${(r.line || "").slice(0, 130)}`); }
    ra.slice(0, rb.length).forEach((x, i) => {
      const y = rb[i]; if (x.n !== y.n) page++;
      const p = body(x), q = body(y), diff = [...new Set([...Object.keys(p), ...Object.keys(q)])].filter((f) => JSON.stringify(p[f]) !== JSON.stringify(q[f]));
      if (!diff.length) { same++; return; }
      chg++; for (const f of diff) fields[f] = (fields[f] || 0) + 1;
      out.push(`ĐỔI\tn${x.n}→n${y.n}\t${x.kind}\t${x.model}\t${diff.map((f) => `${f}: ${JSON.stringify(p[f])} → ${JSON.stringify(q[f])}`).join(" ; ").slice(0, 500)}\t${(x.line || "").slice(0, 100)}`);
    });
  }
  for (const [k, ra] of ga) { const rb = gb.get(k) || []; for (const r of ra.slice(rb.length)) { del++; out.push(`MẤT\tn${r.n}\t${r.kind}\t${r.model}\t\t${(r.line || "").slice(0, 130)}`); } }
  fs.writeFileSync(path.join(outDir, `${id}.tsv`), out.join("\n") + "\n", "utf8");
  const line = `${id}: ${A.length} → ${B.length}; thêm ${add}, MẤT ${del}, đổi ${chg}, y nguyên ${same}, đổi trang ${page}; trường: ${JSON.stringify(fields)}`;
  console.log(line); rowsOut.push(line);
}
fs.writeFileSync(path.join(outDir, "_tong.txt"), rowsOut.join("\n") + "\n", "utf8");
