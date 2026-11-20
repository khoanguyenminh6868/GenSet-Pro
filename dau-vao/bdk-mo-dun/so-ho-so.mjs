// So hồ sơ trước (git ref) ↔ sau (tệp trong worktree): mọi nguồn / bảng cũ phải giữ nguyên từng trường; chỉ được THÊM.
// Chạy trong thư mục suppliers của worktree: node so-ho-so.mjs <ref> <id>...
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const [ref, ...ids] = process.argv.slice(2);
for (const id of ids) {
  const a = JSON.parse(execFileSync("git", ["show", `${ref}:suppliers/cn/${id}.json`]).toString("utf8"));
  const b = JSON.parse(fs.readFileSync(`cn/${id}.json`, "utf8"));
  const by = (l) => new Map((l || []).map((x) => [x.n, JSON.stringify(x)]));
  const out = [];
  for (const k of ["sources", "specTables"]) {
    const A = by(a[k]), B = by(b[k]);
    for (const [n, v] of A) if (!B.has(n)) out.push(`${k} ${n}: MẤT`); else if (B.get(n) !== v) out.push(`${k} ${n}: ĐỔI`);
    out.push(`${k}: thêm ${[...B.keys()].filter((n) => !A.has(n)).join(", ") || "không"}`);
  }
  const rest = Object.keys({ ...a, ...b }).filter((k) => !["sources", "specTables"].includes(k) && JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  out.push(`trường khác đổi: ${rest.join(", ") || "không"}`);
  console.log(`# ${id}\n${out.join("\n")}`);
}
