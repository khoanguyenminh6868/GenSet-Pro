// node 5-doi-khoa.mjs <worktree gốc> <worktree nhánh> <tên> → doi-khoa-<tên>.tsv + tóm tắt (CHỈ ĐỌC)
// Dựng catalog của suppliers/cn (bản của worktree nhánh, cùng dữ liệu cho hai bên) bằng catalog.js của từng bên (mỗi bên một tiến
// trình con). Mỗi dòng dùng (NCC, n, bảng, dòng, vai) → khoá động cơ / đầu phát hai bên. Liệt kê MỌI dòng đổi khoá, và với mỗi khoá
// đích: số dòng trước / sau, số dòng nhận thêm (phải bằng số dòng rời khoá cũ), hãng (make) trước / sau.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const [A, Bw, NAME = "pr"] = process.argv.slice(2);
if (process.env.DOI_KHOA_ONE) {
  await import(pathToFileURL(path.join(process.env.DOI_KHOA_ONE, "suppliers", "config-bot.mjs")).href);
  const CAT = globalThis.GenbidCatalog, dir = path.join(process.env.DOI_KHOA_DATA, "suppliers", "cn");
  const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
  const cat = CAT.build(sups), rows = {}, ents = {};
  for (const kind of ["engines", "alternators"]) for (const e of cat[kind]) {
    ents[`${kind}|${e.key}`] = { rows: e.uses.length, make: e.make || "", sups: e.suppliers.length, model: e.model };
    for (const u of e.uses) rows[`${kind}|${u.supplierId}|${u.n}|${u.table}|${u.row ?? ""}|${CAT.keyOf(u.line || "").slice(0, 80)}`] = { key: e.key, model: u.model };
  }
  fs.writeFileSync(process.env.DOI_KHOA_OUT, JSON.stringify({ rows, ents }));
  process.exit(0);
}
const run = (wt, out) => execFileSync(process.execPath, [fileURLToPath(import.meta.url)], { env: { ...process.env, DOI_KHOA_ONE: wt, DOI_KHOA_DATA: Bw, DOI_KHOA_OUT: out }, stdio: "inherit", maxBuffer: 1 << 30 });
const fa = path.join(HERE, `.dk-a-${NAME}.json`), fb = path.join(HERE, `.dk-b-${NAME}.json`);
run(A, fa); run(Bw, fb);
const a = JSON.parse(fs.readFileSync(fa, "utf8")), b = JSON.parse(fs.readFileSync(fb, "utf8"));
const lines = ["vai\tNCC\tn\tbang\tdong\tmodel_truoc\tkhoa_truoc\tmodel_sau\tkhoa_sau"], moved = new Map();
let only = { a: 0, b: 0 };
for (const [k, r] of Object.entries(a.rows)) {
  const s = b.rows[k];
  if (!s) { only.a++; continue; }
  if (s.key === r.key) continue;
  const [kind, sid, n, t, row] = k.split("|");
  lines.push([kind, sid, n, t, row, r.model, r.key, s.model, s.key].join("\t"));
  const m = `${kind}|${s.key}`; moved.set(m, (moved.get(m) || 0) + 1);
}
for (const k of Object.keys(b.rows)) if (!a.rows[k]) only.b++;
fs.writeFileSync(path.join(HERE, `doi-khoa-${NAME}.tsv`), lines.join("\n") + "\n");
const tl = ["vai_khoa_dich\tdong_truoc\tdong_sau\tnhan_them\tkhop\thang_truoc\thang_sau"];
let bad = 0, makeChg = 0;
for (const [m, add] of moved) {
  const x = a.ents[m] || { rows: 0, make: "(chưa có)" }, y = b.ents[m];
  const ok = y.rows - x.rows === add;
  if (!ok) bad++;
  if ((x.make || "") !== (y.make || "") && a.ents[m]) makeChg++;
  tl.push([m, x.rows, y.rows, add, ok ? "đúng" : "LỆCH", x.make, y.make].join("\t"));
}
fs.writeFileSync(path.join(HERE, `khoa-dich-${NAME}.tsv`), tl.join("\n") + "\n");
const gone = Object.keys(a.ents).filter((k) => !b.ents[k]), born = Object.keys(b.ents).filter((k) => !a.ents[k]);
console.log(`dòng đổi khoá: ${lines.length - 1}; dòng chỉ có ở gốc: ${only.a}, chỉ ở nhánh: ${only.b}`);
console.log(`khoá mất: ${gone.length} (động cơ ${gone.filter((k) => k.startsWith("engines")).length}); khoá mới: ${born.length} ${born.slice(0, 10).join(", ")}`);
console.log(`khoá đích: ${moved.size}; số dòng không khớp: ${bad}; khoá đích đổi hãng: ${makeChg}`);
for (const l of tl.slice(1).filter((l) => /LỆCH/.test(l) || l.split("\t")[5] !== l.split("\t")[6])) console.log("  " + l);
