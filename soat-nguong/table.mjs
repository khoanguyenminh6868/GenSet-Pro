// Dựng bảng gói (155 dòng) từ out.json + phán đã đọc tay (VERDICT bên dưới, mỗi phán là kết quả đọc câu nguồn / văn bản HSMT).
import fs from "node:fs";
const o = JSON.parse(fs.readFileSync("out.json", "utf8"));
// Ghi đè phán (mặc định ĐÚNG khi câu nguồn là ngưỡng dung tích động cơ của đúng cỡ máy, đã đọc từng câu ở bước trước).
// key -> { v: "SAI"|"KHÔNG RÕ"|"ĐÚNG", g: nhóm, n: ghi chú, run: {lượt: ...} }
const OV = {
  IB2300363623: { v: "SAI", g: "ngưỡng của cỡ khác", n: "lượt 5 kW nhận > 1.758 L của máy 15 kVA (mục kW ghi 'Dung tích động cơ > 456cc' không đọc); lượt 15 kVA đúng" },
  IB2500385135: { v: "SAI", g: "ngưỡng của cỡ khác", n: "2.197 L chỉ có ở mục 20 kVA (dòng 148); mục 10.5 kVA (động cơ 12.8 kW) không ghi dung tích → lượt 10.5 kVA bị áp nhầm; lượt 20 kVA đúng" },
  IB2500512614: { v: "SAI", g: "ngưỡng của cỡ khác", n: "≥ 2.3 L là của mục máy 40 kVA (1.3.1); 22 kVA là điều chuyển máy cũ, không có yêu cầu động cơ → lượt 22 kVA bị áp nhầm" },
  IB2400313681: { v: "SAI", g: "ngưỡng của cỡ khác (lỏng)", n: "30 kVA '> 3.3 lit' đúng; 42 kVA ghi '>3.71ít' (≈ 3,7 L, OCR) không đọc được → lượt 42 kVA dùng 3.3 (thấp hơn thật, không loại oan)" },
  IB2300087393: { v: "SAI", g: "bỏ dung sai ±%", n: "'12,9 L (± 3%)' → ngưỡng thật ≥ 12,513 L; code dùng 12,9 (Volvo 12,78 L chẳng hạn bị loại)" },
  IB2300293753: { v: "SAI", g: "bỏ dung sai ±%", n: "lượt 10 kVA: '≥ 1,3 (lít) ± 5%' → ≥ 1,235 L; code dùng 1,3" },
  IB2500464050: { v: "KHÔNG RÕ", g: "dung sai ghi lạ", n: "'30L + 1%': dấu + có thể là ±; nếu ± thì ≥ 29,7 L" },
  IB2300253227: { v: "ĐÚNG", g: "", n: "5,9 l nằm ở cả hai mục cỡ (100 và 150 kVA)" },
  IB2300253626: { v: "ĐÚNG", g: "", n: "11,945 L ở mục 2.2.1 máy 220 kVA (lượt đang xét); mục 7,5 kVA không có (plausible cắt)" },
  IB2400495696: { v: "ĐÚNG", g: "", n: "4,837 L là của 100 kVA (động cơ 81,6 kW); 30/200 kVA (7,2551 L không đọc được) không nằm trong tập loại thêm" },
  IB2400487460: { v: "ĐÚNG", g: "", n: "lượt 40 kVA ≥ 3,9 L đúng; lượt 8,8 kVA mã thật không áp (đo #576 áp 3,9 nhầm)" },
};
// Lượt mã thật không áp ngưỡng nhưng đo #576 áp (đa cỡ, đo không theo cỡ)
const cut = (s, n = 150) => { s = s.replace(/\s+/g, " ").replace(/\|/g, "¦").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; };
const byKey = new Map();
for (const r of o) { if (!byKey.has(r.key)) byKey.set(r.key, []); byKey.get(r.key).push(r); }
const bare = (c) => !/[≥>]|tối thiểu|>=|ít nhất/i.test(c) || /^[^≥>]*$/.test(c) && !/tối thiểu|ít nhất/i.test(c);
const rows = [];
for (const [key, rs] of byKey) {
  const ov = OV[key] || { v: "ĐÚNG", g: "", n: "" };
  const parts = rs.map((r) => (r.minDisp ?? "—")), sizes = rs.map((r) => `${r.cap.value}${r.cap.unit}`);
  const r0 = rs.find((r) => r.minDisp != null) || rs[0];
  const want = new Set([r0.rawMin, r0.wholeMin, r0.rawMax, r0.wholeMax].filter((x) => x != null));
  const c = (r0.cells.filter((x) => want.has(x.v))[0] || r0.cells[0]);
  const nothing = rs.every((r) => r.minDisp == null && r.maxDisp == null);
  const stale = rs.filter((r) => r.measured.minDisp !== r.minDisp);
  const tags = [];
  if (rs.some((r) => /^IB26/.test(r.key))) tags.push("mới 2026");
  if (rs.some((r) => r.cm)) tags.push("CM");
  const isBare = c && !/[≥>]|>=|tối thiểu|ít nhất/i.test(c.cell);
  const g = ov.g || (isBare ? "số trần (L2)" : "");
  const v = nothing ? "ĐÚNG" : ov.v;
  rows.push({ key, sizes: [...new Set(sizes)].join(" / "), thr: rs.map((r) => (r.multi ? `${r.cap.value}: ` : "") + (r.minDisp != null ? `min ${r.minDisp} L` : "không áp") + (r.maxDisp != null ? ` max ${r.maxDisp} L` : "")).filter((x, i, a) => a.indexOf(x) === i).join("; "),
    quote: c ? cut(c.cell) : "(không có)", v, g, n: ov.n, tags: tags.join(","), stale: stale.length, luot: rs.length });
}
fs.writeFileSync("table.json", JSON.stringify(rows, null, 1));
const cnt = (f) => rows.filter(f).length;
console.log("gói", rows.length, "ĐÚNG", cnt((r) => r.v === "ĐÚNG"), "SAI", cnt((r) => r.v === "SAI"), "KR", cnt((r) => r.v === "KHÔNG RÕ"), "số trần", cnt((r) => r.g === "số trần (L2)"), "stale", cnt((r) => r.stale));
