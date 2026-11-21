// Bước 1: đếm lại + trích mọi bảng không ra bản ghi (cùng định nghĩa catalog.unread()), chạy MỘT tiến trình node.
// Dùng:  node 1-trich.mjs <thư mục worktree origin/main> <thư mục ra>
// Ra: dem-theo-ncc.tsv, bang-chua-doc-tho.json (đủ nội dung bảng), model-da-co.json (khoá model đã có từ bảng khác)
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [WT, OUT] = process.argv.slice(2);
await import(pathToFileURL(path.join(WT, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const dir = path.join(WT, "suppliers", "cn");
const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));

const norm = (r) => String(r).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}¦]/gu, "");
const readAny = new Map(), readBySup = new Map(), readTab = new Set(), readTabs = [], postings = new Map();
const per = [], unread = [], known = new Set(), knownGen = new Set();
let skipped = [];
for (const s of S) {
  const tabs = s.specTables || [];
  const row = { id: s.id, status: s.status || "", role: s.role || "", tables: tabs.length, withRows: tabs.filter((t) => (t.rows || []).length).length, used: 0, unread: 0, counted: false };
  if (s.status === "incomplete" || s.role === "controller_maker") { skipped.push(s.id); per.push(row); continue; }
  row.counted = true;
  const recs = C.fromSupplier(s);
  const used = new Set();
  for (const o of recs) {
    used.add(o.table); for (const a of o.also || []) used.add(a.table);
    if (o.model) known.add(C.keyOf(o.model));
    if (o.genset) knownGen.add(C.keyOf(o.genset));
  }
  tabs.forEach((t, ti) => {
    if (!(t.rows || []).length) return;
    if (used.has(ti)) {
      row.used++;
      t.__ti = ti; readSet(s.id, t);
      return;
    }
    row.unread++;
    unread.push({ sup: s.id, country: s.country || "", n: t.n, ti, title: t.title || "", header: t.header || [], rows: t.rows, src: t.src || null });
  });
  per.push(row);
}
// Trùng nội dung: chuẩn hoá mỗi dòng (chữ thường, bỏ mọi ký tự không phải chữ/số); dòng ≥ 6 ký tự mới tính.
function readSet(sid, t) {
  for (const r of [...(t.header || []), ...t.rows]) {
    const k = norm(r); if (k.length < 6) continue;
    if (!readAny.has(k)) readAny.set(k, sid + "#n" + t.n);
    if (!readBySup.has(sid)) readBySup.set(sid, new Set());
    readBySup.get(sid).add(k);
  }
  readTab.add(norm([...(t.header || []), ...t.rows].join("¦")));
  const id = readTabs.length; readTabs.push({ sid, n: t.n, ti: t.__ti, nrows: [...(t.header || []), ...t.rows].length });
  for (const r of new Set([...(t.header || []), ...t.rows].map(norm))) { if (r.length < 6) continue; if (!postings.has(r)) postings.set(r, []); postings.get(r).push(id); }
}
// Bảng đọc xong rồi mới biết hết tập dòng đã đọc (bảng chưa đọc có thể đứng trước bảng đã đọc trong danh sách NCC).
for (const u of unread) {
  const rs = [...u.header, ...u.rows].map(norm).filter((k) => k.length >= 6);
  const same = readBySup.get(u.sup) || new Set();
  u.nrows = rs.length;
  u.covSame = rs.filter((k) => same.has(k)).length;
  u.covAny = rs.filter((k) => readAny.has(k)).length;
  const uk = [...new Set(rs)];
  const cnt = new Map(); for (const k of uk) for (const id of postings.get(k) || []) if ((postings.get(k) || []).length <= 300) cnt.set(id, (cnt.get(id) || 0) + 1);
  const best = (same) => { let b = null; for (const [id, c] of cnt) { const r = readTabs[id]; if ((r.sid === u.sup) !== same) continue; if (!b || c > b.c) b = { c, ref: r.sid + "#n" + r.n + "#b" + r.ti, rt: r.nrows }; } return b; };
  u.bestSame = best(true); u.bestOther = best(false); u.nuniq = uk.length;
  u.coverBy = [];
  u.dupTab = readTab.has(norm([...u.header, ...u.rows].join("¦")));
}
fs.writeFileSync(path.join(OUT, "dem-theo-ncc.tsv"), ["ncc\tvai-tro\ttrang-thai\ttinh-vao-thong-ke\ttong-bang\tbang-co-dong\tbang-ra-ban-ghi\tbang-khong-ra-ban-ghi"].concat(per.map((r) => [r.id, r.role, r.status, r.counted ? 1 : 0, r.tables, r.withRows, r.used, r.unread].join("\t"))).join("\n") + "\n");
fs.writeFileSync(path.join(OUT, "bang-chua-doc-tho.json"), JSON.stringify(unread));
fs.writeFileSync(path.join(OUT, "model-da-co.json"), JSON.stringify({ models: [...known], gensets: [...knownGen] }));
const sum = (k, f = () => true) => per.filter(f).reduce((a, r) => a + r[k], 0);
console.log(JSON.stringify({ suppliers: S.length, counted: per.filter((r) => r.counted).length, skippedNotCounted: skipped.length, totalTables: sum("tables"), tablesInCounted: sum("tables", (r) => r.counted), withRowsInCounted: sum("withRows", (r) => r.counted), usedInCounted: sum("used"), unread: sum("unread"), unreadSuppliers: per.filter((r) => r.unread).length, knownModels: known.size, knownGensets: knownGen.size }, null, 1));
