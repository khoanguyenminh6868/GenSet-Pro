// Phụ lục C (cỡ thiếu ứng viên), D (trần hãng / giới hạn), E (gói nhiều cỡ). node mkapp2.mjs
import fs from "node:fs";
const R = []; for (const f of fs.readdirSync("out").filter((f) => /^run-\d+\.jsonl$/.test(f))) for (const l of fs.readFileSync("out/" + f, "utf8").split("\n")) if (l.trim()) R.push(JSON.parse(l));
const ok = R.filter((r) => !r.error && !r.noCap), kva = (c) => (c.unit === "kVA" ? c.value : c.value / 0.8);
const th = (h) => Object.entries(h).filter(([, v]) => v != null).map(([k, v]) => `${k}=${typeof v === "object" ? Object.entries(v).map(([a, b]) => b + a).join("/") : v}`).join(", ") || "—";
const C = ["# Phụ lục C: cỡ thiếu ứng viên (mục 3)", "", "Cột: `cũ` = số dòng trong dải 95–140% (trước khi loại theo ngưỡng, đếm bằng bộ lọc đầu của `candidates()`); `mới` = số dòng trong dải 99,5–120% (trước khi loại); `sau` = số dòng còn xếp hạng sau khi loại theo ngưỡng HSMT (`rows`); `top` = số dòng trong 30 dòng ứng viên. 'gần nhất' = tỉ lệ công suất của dòng gần dải nhất ở dưới / trên dải (1,25 = 125% cỡ).", ""];
const risk = ok.filter((r) => r.old.nBand > 0 && r.nRows < 5).sort((a, b) => kva(a.cap) - kva(b.cap));
C.push(`## C1. Cỡ có ứng viên ở dải cũ mà dải mới (sau ngưỡng) < 5 dòng: ${risk.length} lượt`, "", "| gói | nguồn | cỡ | cũ | mới | sau | top | gần nhất dưới / trên | bị loại (disp/maxDisp/cyl/prime) | nguyên nhân | ngưỡng HSMT |", "|---|---|---|---|---|---|---|---|---|---|---|");
for (const r of risk) C.push(`| ${r.key} | ${r.src}${r.nSizes > 1 ? ` ${r.nSizes}cỡ` : ""} | ${r.cap.value} ${r.cap.unit} | ${r.old.nBand} | ${r.nBand} | ${r.nRows} | ${r.topN} | ${r.below ?? "—"} / ${r.above ?? "—"} | ${r.dropBy.disp}/${r.dropBy.maxDisp}/${r.dropBy.cyl}/${r.dropBy.prime} | ${r.nBand < 5 ? "dải" : "ngưỡng"} | ${th(r.h1)} |`);
const zero = ok.filter((r) => r.topN === 0).sort((a, b) => kva(a.cap) - kva(b.cap));
C.push("", `## C2. Cỡ có top = 0: ${zero.length} lượt`, "", "| gói | cỡ | cũ | mới | sau | gần nhất dưới / trên | ghi chú |", "|---|---|---|---|---|---|---|");
for (const r of zero) C.push(`| ${r.key} | ${r.cap.value} ${r.cap.unit} | ${r.old.nBand} | ${r.nBand} | ${r.nRows} | ${r.below ?? "—"} / ${r.above ?? "—"} | ${kva(r.cap) > 20000 ? "công suất đọc sai / ngoài catalog (HSMT không phải mua một tổ máy cỡ đó)" : r.nBand === 0 ? "catalog không có dòng nào trong dải" : "mọi dòng trong dải bị loại theo ngưỡng"} |`);
const lost = ok.filter((r) => r.old.nBand > 0 && r.nBand < r.old.nBand * 0.3).sort((a, b) => kva(a.cap) - kva(b.cap));
C.push("", `## C3. Dải mới giữ < 30% số dòng của dải cũ: ${lost.length} lượt`, "", lost.map((r) => `${r.key} ${r.cap.value}${r.cap.unit} (${r.old.nBand}→${r.nBand})`).join("; "));
const nocap = R.filter((r) => r.noCap);
C.push("", `## C4. Gói không đọc được cỡ (capacity() / sizesOf() không ra): ${nocap.length} gói`, "", nocap.map((r) => r.key).join(", "));
fs.writeFileSync("out/phu-luc-C.md", C.join("\n"));
// D
const D = ["# Phụ lục D: vi phạm 'trần 10 / hãng' và giới hạn mỗi động cơ / NCC (mục 2)", "", "Mọi vi phạm đều giải thích được bằng chỗ mã cố ý bỏ qua trần: dòng giữ chỗ cho hãng tổ máy khi HSMT đòi đồng bộ (`sync`, `exempt`, tối đa SYNC_ROWS = 6), dòng của cấu hình lượt trước (`keep`), hoặc bước lấp đầy `free` khi hết hãng khác (otherLeft = 0).", "", "| gói | cỡ | hãng | số dòng | topN | còn dòng hãng khác hợp lệ chưa chọn | sync | keep | giải thích |", "|---|---|---|---|---|---|---|---|---|"];
let unexplained = 0;
for (const r of ok) for (const v of r.viol.filter((v) => v.t === "makeCap")) { const why = v.sync && v.n - 10 <= 6 ? "sync: n−10 ≤ 6 dòng miễn trần" : v.keepRun ? "keep" : v.otherLeft === 0 ? "lấp đầy free (hết hãng khác)" : (unexplained++, "CHƯA GIẢI THÍCH"); D.push(`| ${r.key} | ${r.cap.value} ${r.cap.unit} | ${v.make} | ${v.n} | ${v.topN} | ${v.otherLeft} | ${v.sync ? "có" : ""} | ${v.keepRun ? "có" : ""} | ${why} |`); }
D.push("", `Chưa giải thích: ${unexplained}.`, "", "| gói | cỡ | loại | chi tiết |", "|---|---|---|---|");
for (const r of ok) for (const v of r.viol.filter((v) => v.t === "perEngine" || v.t === "perSupplier")) D.push(`| ${r.key} | ${r.cap.value} ${r.cap.unit} | ${v.t} | ${JSON.stringify(v)} (chỉ ở 12 gói có \`keep\` từ configmatch) |`);
fs.writeFileSync("out/phu-luc-D.md", D.join("\n"));
// E
const M = JSON.parse(fs.readFileSync("out/multi.json", "utf8"));
const E = ["# Phụ lục E: gói nhiều cỡ, ngưỡng null / ngưỡng của cỡ khác (mục 8)", "", "`null vì…` = HSMT ghi ≥ 2 giá trị khác nhau cho cùng ngưỡng nên `engineMins` / `powerMins` trả null cho MỌI cỡ (`one()` chỉ nhận danh sách một giá trị). `nghi` = ngưỡng sau `plausible` mâu thuẫn với một ngưỡng khác của cùng văn bản (suy ra thuộc cỡ khác).", ""];
const pk = {}; for (const m of M) if (Object.keys(m.nullBecause).length) (pk[m.key] = pk[m.key] || []).push(m);
E.push(`Gói nhiều cỡ: ${new Set(M.map((m) => m.key)).size}; lượt cỡ: ${M.length}; lượt cỡ có ít nhất một ngưỡng null: ${M.filter((m) => Object.keys(m.nullBecause).length).length} ở ${Object.keys(pk).length} gói.`, "", "| gói | cỡ | ngưỡng null vì khác giá trị |", "|---|---|---|");
for (const [k, list] of Object.entries(pk)) for (const m of list) E.push(`| ${k} | ${m.cap} (cỡ ${m.i + 1}/${m.nSizes}) | ${Object.entries(m.nullBecause).map(([a, b]) => `${a}: ${b}`).join("; ")} |`);
E.push("", "## Nghi nhận ngưỡng của cỡ khác (đã chạy lại với ngưỡng sửa tay, xem báo cáo)", "", "| gói | cỡ | nghi |", "|---|---|---|");
for (const m of M.filter((m) => Object.keys(m.suspect).length)) E.push(`| ${m.key} | ${m.cap} | ${Object.values(m.suspect).join("; ")} |`);
fs.writeFileSync("out/phu-luc-E.md", E.join("\n"));
console.log("C", risk.length, zero.length, lost.length, nocap.length, "| D unexplained", unexplained, "| E", Object.keys(pk).length);
