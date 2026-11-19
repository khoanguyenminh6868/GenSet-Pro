// Bước 5: số liệu cho báo cáo: nhà cung cấp nhiều nhất theo nhóm, tổng dòng của bảng đã đọc / chưa đọc, mẫu "model chưa có" để kiểm tay.
// Chạy: node 5-thong-ke.mjs <thư mục suppliers/cn của worktree>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const D = path.dirname(fileURLToPath(import.meta.url));
const CN = process.argv[2];
const P = JSON.parse(fs.readFileSync(path.join(D, "phan-loai.json"), "utf8"));
const per = fs.readFileSync(path.join(D, "dem-theo-ncc.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const counted = new Set(per.filter((r) => r[3] === "1").map((r) => r[0]));
let rowsAll = 0, rowsUnread = P.reduce((a, p) => a + p.rows, 0);
for (const id of counted) { const s = JSON.parse(fs.readFileSync(path.join(CN, id + ".json"), "utf8")); for (const t of s.specTables || []) rowsAll += (t.rows || []).length; }
console.log("tổng dòng bảng (NCC tính)", rowsAll, "dòng bảng chưa đọc", rowsUnread, ((100 * rowsUnread) / rowsAll).toFixed(1) + "%");
const by = {};
for (const p of P) { (by[p.grp] ||= {}); by[p.grp][p.sup] = (by[p.grp][p.sup] || 0) + 1; }
for (const g of Object.keys(by).sort()) console.log(g, Object.entries(by[g]).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s, n]) => `${s} ${n}`).join(", "));
// 10 NCC nhiều nhất
const sup = {};
for (const p of P) sup[p.sup] = (sup[p.sup] || 0) + 1;
const top = Object.entries(sup).sort((a, b) => b[1] - a[1]);
let c = 0; console.log("10 NCC đầu:", top.slice(0, 10).map(([s, n]) => (c += n, `${s} ${n}`)).join(", "), "→", c, "bảng =", ((100 * c) / P.length).toFixed(1) + "%");
c = 0; console.log("20 NCC đầu:", top.slice(0, 20).reduce((a, [, n]) => a + n, 0));
// mẫu "model chưa có" cách đều để kiểm tay
const GEN = new Set(["R1", "R2", "T1", "P1", "V1", "V2", "V4", "V5", "V6", "F1"]);
const pool = []; for (const p of P) if (GEN.has(p.grp)) for (const k of p.newKeys) pool.push([p.i, p.grp, p.sup, p.n, k]);
console.log("pool model chưa có (theo bảng, có lặp giữa bảng):", pool.length);
const picks = Array.from({ length: 48 }, (_, j) => pool[Math.floor(((j + 0.5) * pool.length) / 48)]);
fs.writeFileSync(path.join(D, "mau-model-chua-co.json"), JSON.stringify(picks));
