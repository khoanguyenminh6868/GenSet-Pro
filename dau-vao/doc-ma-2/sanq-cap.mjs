// node sanq-cap.mjs <repoDir> — mỗi ô sanq "TADxxxGE(yyyGE)": dung tích / xi lanh mà NCC KHÁC ghi cho mã ngoài và mã trong ngoặc,
// và các bản ghi hiện có của dòng đó (để biết sửa thì mất gì). Căn cứ cho lỗi (3) của doc-ma-2.
import fs from "node:fs";
import path from "node:path";
import { loadWeb } from "./load.mjs";
const dir = process.argv[2];
const C = loadWeb(dir);
const cn = path.join(dir, "suppliers", "cn");
const S = fs.readdirSync(cn).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(cn, f), "utf8"))).filter((s) => s.status !== "incomplete");
const norm = (m) => String(m).toUpperCase().replace(/[\s\-_.]/g, "");
const votes = new Map();
const sanq = [];
for (const s of S) for (const r of C.fromSupplier(s)) {
  if (s.id === "sanq-power") { sanq.push(r); continue; }
  if (r.kind !== "engine") continue;
  const k = norm(r.model);
  if (!votes.has(k)) votes.set(k, { disp: {}, cyl: {} });
  for (const x of r.specs || []) if (x.key === "disp" || x.key === "cyl") { const b = votes.get(k)[x.key]; const v = String(x.value); (b[v] ||= new Set()).add(s.id); }
}
const show = (k, f) => Object.entries(votes.get(k)?.[f] || {}).sort((a, b) => b[1].size - a[1].size).map(([v, n]) => `${v}×${n.size}`).join(" ") || "-";
const seen = new Set();
for (const r of sanq) {
  const m = r.kind === "engine" && String(r.model).match(/^([A-Z]+)(\d+[A-Z]+)\((\d+[A-Z]+)\)$/);
  if (!m) continue;
  const key = r.model;
  const rows = sanq.filter((x) => x.n === r.n && x.table === r.table && x.row === r.row).map((x) => x.kind + ":" + x.model).join(", ");
  if (!seen.has(key)) {
    seen.add(key);
    const a = m[1] + m[2], b = m[1] + m[3];
    console.log([key, `${a} disp ${show(a, "disp")} cyl ${show(a, "cyl")}`, `${b} disp ${show(b, "disp")} cyl ${show(b, "cyl")}`, `n${r.n} r${r.row}: ${rows}`].join(" | "));
  }
}
console.log("bản ghi sanq dạng này:", sanq.filter((r) => r.kind === "engine" && /^[A-Z]+\d+[A-Z]+\(\d+[A-Z]+\)$/.test(r.model)).length);
