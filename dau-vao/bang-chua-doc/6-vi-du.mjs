// Bước 6: viết phần "ví dụ nguyên văn" (3 bảng / nhóm, khác NCC khi có thể) ra vi-du-nhom.md. Chạy: node 6-vi-du.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GROUPS } from "./2-phan-loai.mjs";
const D = path.dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(fs.readFileSync(path.join(D, "bang-chua-doc-tho.json"), "utf8"));
const P = JSON.parse(fs.readFileSync(path.join(D, "phan-loai.json"), "utf8"));
const cut = (s, n = 170) => { s = String(s).replace(/\s+$/g, ""); return s.length > n ? s.slice(0, n) + " …(cắt)" : s; };
const out = [];
for (const g of Object.keys(GROUPS)) {
  const L = P.filter((p) => p.grp === g).sort((a, b) => a.sup.localeCompare(b.sup) || a.n - b.n || a.ti - b.ti);
  if (!L.length) { out.push(`### ${g} — ${GROUPS[g]}\n\n(không có bảng nào)\n`); continue; }
  const picks = [], used = new Set();
  for (const f of [1 / 6, 3 / 6, 5 / 6]) {
    let j = Math.floor(f * L.length);
    for (let d = 0; d < L.length; d++) { const c = L[(j + d) % L.length]; if (!used.has(c.sup) || d === L.length - 1 || picks.length >= used.size + 3) { if (!picks.includes(c)) { picks.push(c); used.add(c.sup); break; } } }
  }
  out.push(`### ${g} — ${L.length} bảng, ${new Set(L.map((p) => p.sup)).size} NCC\n\n*Định nghĩa:* ${GROUPS[g]}\n`);
  for (const p of picks) {
    const t = T[p.i], lines = [...t.header.slice(0, 1), ...t.rows].slice(0, 3);
    out.push(`- NCC \`${p.sup}\`, bảng n=${p.n} (thứ tự trong hồ sơ b${p.ti}), ${t.rows.length} dòng, tiêu đề: \`${cut(t.title, 110)}\`${p.models ? `; mã model nhìn thấy: ${p.modelList.slice(0, 5).join(", ")}${p.models > 5 ? " …" : ""}` : ""}\n` + "  ```\n" + lines.map((r) => "  " + cut(r).replace(/\n/g, " ")).join("\n") + "\n  ```");
  }
  out.push("");
}
fs.writeFileSync(path.join(D, "vi-du-nhom.md"), out.join("\n") + "\n");
console.log("ok", out.length);
