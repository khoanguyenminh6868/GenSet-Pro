// Bảng hôm nay (main) có dòng mà không cho bản ghi nào trong danh mục (đã "chưa đọc được" sẵn, không báo ở đâu).
//   node unread-now.mjs <worktree>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const WT = process.argv[2];
const SD = await import(pathToFileURL(path.join(WT, "suppliers", "spec-diff.mjs")).href);
const side = SD.loadSide(SD.checkoutRef("origin/main", WT));
const recs = SD.records(side);
const used = new Set([...recs.values()].map((o) => `${o.supplierId}|${o.n}|${o.table}`));
let tables = 0, rows = 0, unread = 0, unreadRows = 0;
const bySup = new Map(), skipped = { controller: 0, incomplete: 0 };
for (const s of side.S) {
  if (s.status === "incomplete") { skipped.incomplete += (s.specTables || []).length; continue; }
  if (s.role === "controller_maker") { skipped.controller += (s.specTables || []).length; continue; }
  (s.specTables || []).forEach((t, ti) => {
    if (!(t.rows || []).length) return;
    tables++; rows += t.rows.length;
    if (!used.has(`${s.id}|${t.n}|${ti}`)) { unread++; unreadRows += t.rows.length; bySup.set(s.id, (bySup.get(s.id) || 0) + 1); }
  });
}
console.log(JSON.stringify({ tables, rows, unread, unreadRows, sups: bySup.size, skipped, top: [...bySup].sort((a, b) => b[1] - a[1]).slice(0, 15) }));
