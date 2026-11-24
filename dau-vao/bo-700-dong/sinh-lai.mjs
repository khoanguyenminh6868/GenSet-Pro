// Nối phần bị trần 700 / 250 / 60 cắt vào specs/<id>.json và datasheets/<id>.json, đọc từ sources/ (không tải lại).
// Giữ nguyên title, header, các dòng cũ và thứ tự. node sinh-lai.mjs <worktree> <out.tsv> [--write]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [wt, out, flag] = process.argv.slice(2), write = flag === "--write";
const SUP = path.join(wt, "suppliers");
const imp = (f) => import(pathToFileURL(path.join(SUP, f)).href);
await import(pathToFileURL(path.join(wt, "web", "catalog.js")).href);
const { controllerSheet } = await imp("maker-datasheets.mjs");
const { sheetOf } = await imp("crawl-datasheets.mjs");
const { tablesOf } = await imp("crawl-specs.mjs");

const bodyOf = (s) => s.replace(/\r/g, "").replace(/^URL:.*\nAccessed:.*\n(From:.*\n)?\n?/, "");
const isPrefix = (rows, full) => rows.length < full.length && rows.every((l, i) => l === full[i]);
const log = [], odd = [], ids = new Set();

for (const f of fs.readdirSync(path.join(SUP, "cn")).filter((x) => x.endsWith(".json"))) {
  const id = f.slice(0, -5), rec = JSON.parse(fs.readFileSync(path.join(SUP, "cn", f), "utf8"));
  const ctl = rec.role === "controller_maker";
  for (const d of ["specs", "datasheets"]) {
    const file = path.join(SUP, d, f);
    if (!fs.existsSync(file)) continue;
    const list = JSON.parse(fs.readFileSync(file, "utf8"));
    let changed = false;
    const doneCtl = new Set();
    for (const t of list) {
      const src = path.join(SUP, "sources", id, `${t.n}.md`);
      if (!fs.existsSync(src)) continue;
      const raw = fs.readFileSync(src, "utf8");
      let cap = 0, full = null;
      if (t.n >= 1001 && ctl) {
        // Một n có thể có hai bảng (DSE 1016): chỉ bảng datasheet đầu tiên của n.
        if (doneCtl.has(t.n)) continue;
        doneCtl.add(t.n);
        const rows = controllerSheet(bodyOf(raw)).rows;
        if (rows.length <= 700 || t.rows.length > 700) continue;
        cap = 700; full = rows;
      } else if (t.n >= 1001) {
        if (t.rows.length !== 250) continue;
        cap = 250; full = sheetOf(bodyOf(raw));
      } else {
        if (t.rows.length !== 60 || t.header.length) continue;
        cap = 60; full = tablesOf(raw).filter((x) => x.sheet).flatMap((x) => x.rows);
      }
      if (!isPrefix(t.rows, full)) {
        if (full.length > t.rows.length) odd.push(`${cap}\t${id}\t${t.n}\t${d}\tkhông phải phần đầu: lưu ${t.rows.length}, nguồn ${full.length}`);
        continue;
      }
      log.push([cap, id, t.n, d, t.rows.length, full.length, full.length - t.rows.length].join("\t"));
      t.rows = [...t.rows, ...full.slice(t.rows.length)];
      changed = true;
      ids.add(id);
    }
    if (changed && write) fs.writeFileSync(file, JSON.stringify(list, null, 1) + "\n", "utf8");
  }
}
fs.writeFileSync(out, ["tran\tho_so\tn\ttep\tdong_luu\tdong_day_du\tdong_them", ...log].join("\n") + "\n", "utf8");
const sum = {};
for (const l of log) { const c = l.split("\t"); (sum[c[0]] ||= { docs: 0, lines: 0 }).docs++; sum[c[0]].lines += +c[6]; }
console.log(JSON.stringify({ write, sum, ids: [...ids], odd }, null, 1));
