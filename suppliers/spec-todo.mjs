// Nhà cung cấp còn cần tìm thông số (Khoa, 2026-11-13): NCC chưa có dòng bảng thông số nào, trừ NCC đã tìm mà không ra
// (spec-none.json: tìm website / cào / Tìm Thông Số đều không có bảng), để lần sau không tìm lại. gaps.mjs cũng không
// đưa NCC trong spec-none.json vào hàng chờ Tìm Thông Số. Xoá một mục khỏi spec-none.json khi có nguồn mới (website,
// catalog Khoa tải lên) để NCC quay lại danh sách.
//
//   node suppliers/spec-todo.mjs                         danh sách còn cần tìm (id, vai trò, có website hay không)
//   node suppliers/spec-todo.mjs --json                  như trên, dạng JSON
//   node suppliers/spec-todo.mjs --mark <id>... --why "…" đánh dấu đã tìm không ra (ghi ngày hôm nay, UTC)
//   node suppliers/spec-todo.mjs --unmark <id>...        bỏ dấu
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const NONE_FILE = path.join(ROOT, "spec-none.json");
// { "<id>": { "at": "YYYY-MM-DD", "why": "…" } }
export function specNone(file = NONE_FILE) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { if (e.code === "ENOENT") return {}; throw e; }
}
export const hasSpecRows = (rec) => (rec?.specTables || []).some((t) => (t.rows || []).length);
export const needsSpecs = (rec, none = {}) => !hasSpecRows(rec) && !none[rec.id];
export function specTodo(suppliers, none = {}) {
  return suppliers.filter((s) => needsSpecs(s, none)).map((s) => ({ id: s.id, role: s.role, website: s.website || null }));
}
export function mark(none, ids, why, at) {
  const out = { ...none };
  for (const id of ids) out[id] = { at, why };
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
const save = (none) => fs.writeFileSync(NONE_FILE, JSON.stringify(none, null, 1) + "\n", "utf8");
const loadAll = () => fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", f), "utf8")));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2), at = (k) => args.indexOf(k);
  const idsAfter = (k) => args.slice(at(k) + 1).filter((a, i, l) => !a.startsWith("--") && !l.slice(0, i).some((x) => x.startsWith("--")));
  const all = loadAll(), known = new Set(all.map((s) => s.id));
  if (at("--mark") >= 0) {
    const ids = idsAfter("--mark"), why = at("--why") >= 0 ? args[at("--why") + 1] : "";
    const bad = ids.filter((id) => !known.has(id));
    if (!ids.length || !why || bad.length) { console.error(bad.length ? `không có bản ghi: ${bad.join(", ")}` : "cần --mark <id>... --why \"…\""); process.exit(1); }
    save(mark(specNone(), ids, why, new Date().toISOString().slice(0, 10)));
    console.log(`đã đánh dấu ${ids.length} NCC`);
  } else if (at("--unmark") >= 0) {
    const none = specNone(); for (const id of idsAfter("--unmark")) delete none[id];
    save(none); console.log("đã bỏ dấu");
  } else {
    const none = specNone(), todo = specTodo(all, none);
    if (args.includes("--json")) console.log(JSON.stringify(todo));
    else {
      for (const t of todo) console.log(`${t.id}\t${t.role}\t${t.website || "KHÔNG website"}`);
      console.log(`\n${todo.length} NCC còn cần tìm; ${Object.keys(none).length} NCC đã tìm không ra (spec-none.json).`);
    }
  }
}
