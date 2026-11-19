// Kiểm chéo TOÀN BỘ nơi sản xuất (catalog.js madeAt / madeOf): gốc (git:<ref>) ↔ nhánh (thư mục worktree).
// node do-noi-sx.mjs <worktree-nhanh> <ref-goc> <ra.json>
import fs from "node:fs";
import crypto from "node:crypto";
const { loadSide, checkoutRef } = await import("file:///C:/Projects/GenSet%20Pro/wt-manufacturing/suppliers/spec-diff.mjs");

const [, , branchDir, ref, out] = process.argv;
const baseDir = checkoutRef(ref, branchDir);
const h = (x) => crypto.createHash("md5").update(String(x)).digest("hex").slice(0, 8);
function run(dir, tag) {
  const { C, S } = loadSide(dir);
  const cat = C.build(S);
  const rows = new Map();
  for (const kind of ["engines", "alternators", "controllers"]) for (const e of cat[kind]) {
    const mk = (e.makes || []).map((m) => m.name).sort().join("+");
    e.uses.forEach((u, i) => {
      const m = C.madeAt(e, u);
      // khoá: loại|khoá bản ghi|NCC|bảng|băm dòng|thứ tự trùng
      const k = [e.kind, e.key, u.supplierId, u.n, h(u.line || u.text || ""), i].join("|");
      rows.set(k, { kind: e.kind, key: e.key, model: e.model, makes: mk, at: m.at, why: m.why });
    });
    rows.set(`ENTRY|${e.kind}|${e.key}`, { kind: e.kind, key: e.key, model: e.model, makes: mk, of: C.madeOf(e).sort().join(",") });
  }
  console.log(tag, "bản ghi madeAt:", [...rows.keys()].filter((k) => !k.startsWith("ENTRY")).length, "entry:", [...rows.keys()].filter((k) => k.startsWith("ENTRY")).length);
  return rows;
}
const A = run(baseDir, "gốc"), B = run(branchDir, "nhánh");
const keys = new Set([...A.keys(), ...B.keys()]);
const layers = new Map(); const onlyA = [], onlyB = [];
for (const k of keys) {
  const a = A.get(k), b = B.get(k);
  if (!a) { onlyB.push(k); continue; }
  if (!b) { onlyA.push(k); continue; }
  const isE = k.startsWith("ENTRY");
  const va = isE ? a.of : `${a.at}`, vb = isE ? b.of : `${b.at}`;
  const whyChg = !isE && a.why !== b.why;
  if (va === vb && !whyChg) continue;
  const lk = [isE ? "madeOf" : "madeAt", a.kind, a.makes, va === vb ? `at ${va} (đổi why)` : `${va} → ${vb}`, whyChg ? `why: ${a.why} → ${b.why}` : ""].join(" | ");
  const l = layers.get(lk) || { n: 0, ex: [] };
  l.n++; if (l.ex.length < 3) l.ex.push(k);
  layers.set(lk, l);
}
const total = [...A.keys()].filter((k) => !k.startsWith("ENTRY")).length;
const res = { ref, total, onlyA: onlyA.length, onlyB: onlyB.length, layers: [...layers].map(([k, v]) => ({ layer: k, ...v })) };
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log("lớp thay đổi:", layers.size, "chỉ ở gốc:", onlyA.length, "chỉ ở nhánh:", onlyB.length);
for (const [k, v] of layers) console.log(v.n, k);

// Phân bố nơi sản xuất theo (loại, hãng) ở nhánh, để đối chiếu với manufacturing[] nguồn.
const dist = new Map();
for (const [k, r] of B) if (!k.startsWith("ENTRY") && r.kind !== "engine") { const d = `${r.kind} | ${r.makes || "(chưa rõ hãng)"} | ${r.at}`; dist.set(d, (dist.get(d) || 0) + 1); }
fs.writeFileSync(out.replace(/\.json$/, "-phan-bo.txt"), [...dist].sort().map(([k, n]) => `${n}\t${k}`).join("\n"));
