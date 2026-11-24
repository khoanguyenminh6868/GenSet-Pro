// Hồ sơ mà specs/ lệch cn/ (merge-specs chết ENOENT hoặc thêm bảng ngoài ý): nối thẳng dòng vào đúng bảng của cn/.
// Bảng đích = cùng n và rows hiện tại là phần đầu của bảng trong specs/ hoặc datasheets/. node noi-cn.mjs <worktree> <id...>
import fs from "node:fs";
import path from "node:path";

const [wt, ...ids] = process.argv.slice(2), SUP = path.join(wt, "suppliers");
const read = (d, id) => { const f = path.join(SUP, d, `${id}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : []; };
for (const id of ids) {
  const file = path.join(SUP, "cn", `${id}.json`), rec = JSON.parse(fs.readFileSync(file, "utf8"));
  const found = [...read("specs", id), ...read("datasheets", id)];
  let added = 0, tables = 0;
  for (const t of rec.specTables || []) {
    const hit = found.filter((x) => x.n === t.n && x.rows.length > t.rows.length && t.rows.every((l, i) => l === x.rows[i]));
    if (!hit.length) continue;
    if (new Set(hit.map((x) => x.rows.join("\n"))).size > 1) throw new Error(`${id} n${t.n}: nhiều bảng khớp`);
    added += hit[0].rows.length - t.rows.length; tables++;
    t.rows = [...hit[0].rows];
  }
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + "\n", "utf8");
  console.log(id, "bảng", tables, "dòng thêm", added);
}
