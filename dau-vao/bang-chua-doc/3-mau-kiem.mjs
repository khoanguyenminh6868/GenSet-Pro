// Bước 3: mẫu kiểm tay, cố định (cách đều trong nhóm đã sắp theo NCC, n). Chạy: node 3-mau-kiem.mjs <nhóm...>  (không tham số = ghi mau-kiem.json)
// Người đọc mở từng bảng, ghi nhận xét vào ket-qua-kiem-tay.tsv (nhóm, stt, đúng/sai, ghi chú).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const D = path.dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(fs.readFileSync(path.join(D, "bang-chua-doc-tho.json"), "utf8"));
const P = JSON.parse(fs.readFileSync(path.join(D, "phan-loai.json"), "utf8"));
const SIZE = { A1: 14, A2: 10, B1: 7, C1: 9, F1: 14, F2: 14, H1: 14, L1: 8, M1: 14, O1: 14, O2: 8, P1: 14, R1: 18, R2: 12, R3: 6, S1: 1, T1: 14, T2: 12, T3: 12, V1: 14, V2: 14, V3: 16, V4: 14, V5: 8, V6: 8, Z: 14 };
export function sample() {
  const out = {};
  for (const g of Object.keys(SIZE)) {
    const L = P.filter((p) => p.grp === g).sort((a, b) => a.sup.localeCompare(b.sup) || a.n - b.n || a.ti - b.ti);
    const k = Math.min(SIZE[g], L.length);
    out[g] = Array.from({ length: k }, (_, j) => L[Math.floor(((j + 0.5) * L.length) / k)].i);
  }
  return out;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const S = sample();
  fs.writeFileSync(path.join(D, "mau-kiem.json"), JSON.stringify(S));
  for (const g of process.argv.slice(2)) {
    console.log(`=== ${g}: mẫu ${S[g].length}/${P.filter((p) => p.grp === g).length}`);
    for (const i of S[g]) {
      const t = T[i], p = P[i];
      console.log(`#${i} ${t.sup} n${t.n} r${t.rows.length} "${t.title.slice(0, 55)}"${p.models ? ` [model: ${p.modelList.slice(0, 4).join(", ")}${p.models > 4 ? "…" : ""}]` : ""}`);
      for (const r of [...t.header.slice(0, 1), ...t.rows].slice(0, Number(process.env.NL || 2))) console.log("    " + String(r).slice(0, 110));
    }
  }
}
