// So rt-goc.json ↔ rt-nhanh.json: model / cấu hình nào có đầu vào ratings khác. node rt-so.mjs rt-goc.json rt-nhanh.json
import fs from "node:fs";
const [A, B] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, "utf8")));
for (const part of ["alt", "eng", "attr", "configs"]) {
  const keys = new Set([...Object.keys(A[part]), ...Object.keys(B[part])]), diff = [];
  for (const k of keys) if (JSON.stringify(A[part][k] || null) !== JSON.stringify(B[part][k] || null)) diff.push(k);
  const gained = diff.filter((k) => !A[part][k] || (Array.isArray(A[part][k]) && !A[part][k].length) || (A[part][k]?.alt && !A[part][k].alt.length));
  console.log(`${part}: ${keys.size} khoá, khác ${diff.length} (trước không có gì: ${gained.length})`);
  for (const k of diff) {
    const a = A[part][k], b = B[part][k], n = (x) => (Array.isArray(x) ? x.length : x ? `${x.alt.length}/${x.attr.length}` : 0);
    // Mục cũ phải còn nguyên trong bản mới.
    const lost = Array.isArray(a) ? a.filter((x) => !(b || []).some((y) => JSON.stringify(y) === JSON.stringify(x))).length : a ? a.alt.filter((x) => !b.alt.some((y) => JSON.stringify(y) === JSON.stringify(x))).length : 0;
    console.log(`  ${k}: ${n(a)} → ${n(b)}${lost ? `  MẤT ${lost} mục cũ` : ""}`);
  }
}
