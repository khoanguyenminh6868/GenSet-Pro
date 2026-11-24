// So MỌI hồ sơ cn/ với một ref: bảng cũ giữ nguyên n, title, header, thứ tự; dòng cũ là phần đầu của dòng mới; mọi khoá khác không đổi.
// node soat-them.mjs <worktree> <ref> <out.tsv>
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [wt, ref, out] = process.argv.slice(2);
const git = (...a) => execFileSync("git", ["-C", wt, ...a], { encoding: "utf8", maxBuffer: 1 << 30 });
const baseFiles = git("ls-tree", "-r", "--name-only", ref, "suppliers/cn/").trim().split("\n").filter((f) => f.endsWith(".json"));
const nowFiles = fs.readdirSync(path.join(wt, "suppliers", "cn")).filter((f) => f.endsWith(".json")).map((f) => `suppliers/cn/${f}`);
const errors = [], lines = ["ho_so\tbang_cu\tbang_moi\tdong_cu\tdong_moi\tdong_them\tbyte_cu\tbyte_moi"];
const missing = baseFiles.filter((f) => !nowFiles.includes(f)), added = nowFiles.filter((f) => !baseFiles.includes(f));
for (const f of missing) errors.push(`${f}: mất tệp`);
for (const f of added) errors.push(`${f}: tệp mới`);
const changed = git("diff", "--name-only", ref, "--", "suppliers/cn/").trim().split("\n").filter(Boolean);
let totalAdded = 0;
for (const f of changed) {
  if (!baseFiles.includes(f) || !nowFiles.includes(f)) continue;
  const id = path.basename(f, ".json"), oldText = git("show", `${ref}:${f}`), newText = fs.readFileSync(path.join(wt, f), "utf8");
  const a = JSON.parse(oldText), b = JSON.parse(newText);
  const at = a.specTables || [], bt = b.specTables || [];
  if (at.length !== bt.length) errors.push(`${id}: số bảng ${at.length} -> ${bt.length}`);
  let ra = 0, rb = 0;
  at.forEach((t, i) => {
    const u = bt[i];
    if (!u) return;
    for (const k of ["n", "title"]) if (t[k] !== u[k]) errors.push(`${id} bảng ${i}: ${k} đổi`);
    if (JSON.stringify(t.header) !== JSON.stringify(u.header)) errors.push(`${id} bảng ${i}: header đổi`);
    if (Object.keys(t).join() !== Object.keys(u).join()) errors.push(`${id} bảng ${i}: khoá đổi`);
    if (u.rows.length < t.rows.length || t.rows.some((l, j) => l !== u.rows[j])) errors.push(`${id} bảng ${i} n${t.n}: dòng cũ đổi hoặc mất`);
    ra += t.rows.length; rb += u.rows.length;
  });
  const strip = (r) => { const c = structuredClone(r); delete c.specTables; return JSON.stringify(c); };
  if (strip(a) !== strip(b)) errors.push(`${id}: khoá ngoài specTables đổi`);
  totalAdded += rb - ra;
  lines.push([id, at.length, bt.length, ra, rb, rb - ra, Buffer.byteLength(oldText), Buffer.byteLength(newText)].join("\t"));
}
fs.writeFileSync(out, lines.join("\n") + "\n", "utf8");
console.log(lines.join("\n"));
console.log(JSON.stringify({ baseFiles: baseFiles.length, changed: changed.length, totalAdded, errors }, null, 1));
