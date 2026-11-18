// Bảng / dòng / giá trị danh mục KHÔNG đọc (chat-luong-3, Khoa 18/11/2026: "thà thiếu còn hơn sai" — bố cục mã chưa hiểu
// thì để thiếu VÀ ghi vào danh sách, để các phiên sửa bộ đọc biết bảng nào đáng viết mã). Đọc web/catalog.js `unread()`:
// mỗi ghi chú của fromSupplier (chốt chặn bỏ dòng / số, kèm lý do) và mỗi bảng có dòng mà không cho bản ghi nào.
// Không phải việc tay của Khoa; không có màn hình nào hiện danh sách này.
//   node suppliers/unread-tables.mjs                  tóm tắt theo lý do, NCC nhiều nhất
//   node suppliers/unread-tables.mjs --reason "<lý do>" [--id <NCC>]   liệt kê từng mục
//   node suppliers/unread-tables.mjs --json [tệp]     ghi danh sách theo bảng (mặc định suppliers/unread-tables.json)
// Tệp JSON là bản chụp lúc chạy: dữ liệu `cn/` đổi (bot gộp Tìm Thông Số) thì nó cũ đi; chạy lại khi cần. Bản luôn mới là
// dòng "Chưa đọc được" trong tóm tắt của spec-diff.mjs trên mỗi PR sửa mã đọc.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// Per table: { supplierId, n, table, title, reasons: { lý do: số mục }, rows: { lý do: [dòng...] }, sample: { lý do: chi tiết đầu } }.
export function byTable(notes) {
  const m = new Map();
  for (const x of notes) {
    const k = `${x.supplierId}|${x.n}|${x.table}`;
    if (!m.has(k)) m.set(k, { supplierId: x.supplierId, n: x.n, table: x.table, title: x.title, reasons: {}, rows: {}, sample: {} });
    const t = m.get(k);
    t.reasons[x.reason] = (t.reasons[x.reason] || 0) + 1;
    if (x.row != null) { const r = (t.rows[x.reason] = t.rows[x.reason] || []); if (!r.includes(x.row) && r.length < 50) r.push(x.row); }
    if (!(x.reason in t.sample)) t.sample[x.reason] = x.detail;
  }
  return [...m.values()].sort((a, b) => a.supplierId.localeCompare(b.supplierId) || a.n - b.n || a.table - b.table);
}
// { lý do: { items, tables, sups } }
export function summary(notes) {
  const out = {};
  for (const x of notes) {
    const s = (out[x.reason] = out[x.reason] || { items: 0, tables: new Set(), sups: new Set() });
    s.items++; s.tables.add(`${x.supplierId}|${x.n}|${x.table}`); s.sups.add(x.supplierId);
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, { items: v.items, tables: v.tables.size, sups: v.sups.size }]));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
  const C = globalThis.GenbidCatalog;
  const S = fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));
  const notes = C.unread(S);
  const argv = process.argv.slice(2), opt = (f) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : null; };
  if (argv.includes("--json")) {
    const file = opt("--json") && !opt("--json").startsWith("--") ? opt("--json") : path.join(ROOT, "unread-tables.json");
    fs.writeFileSync(file, JSON.stringify({ note: "node suppliers/unread-tables.mjs --json (bản chụp; dữ liệu cn/ đổi thì chạy lại)", summary: summary(notes), tables: byTable(notes) }, null, 1) + "\n", "utf8");
    console.log(`đã ghi ${file}: ${byTable(notes).length} bảng`);
  } else if (opt("--reason")) {
    for (const x of notes.filter((x) => x.reason === opt("--reason") && (!opt("--id") || x.supplierId === opt("--id"))))
      console.log(`${x.supplierId} n${x.n} b${x.table} dòng ${x.row ?? "-"} | ${x.detail ?? ""}`);
  } else {
    for (const [k, v] of Object.entries(summary(notes)).sort((a, b) => b[1].items - a[1].items)) console.log(`${String(v.items).padStart(7)} mục  ${String(v.tables).padStart(5)} bảng  ${String(v.sups).padStart(4)} NCC  ${k}`);
    const bySup = new Map();
    for (const x of notes) bySup.set(x.supplierId, (bySup.get(x.supplierId) || 0) + 1);
    console.log("NCC nhiều nhất:", [...bySup].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([s, n]) => `${s} ${n}`).join(", "));
  }
}
