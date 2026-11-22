// node --test suppliers/s9-cc-129.test.mjs — S9 cc-129 (Khoa 22/11/2026): các bảng chứa ô dung tích ghi cc chưa thành bản ghi.
// Đọc theo danh sách tường minh `ENGINE_LINES` của web/catalog.js (NCC + n + chữ dòng nguyên văn): endress n129 / n130 / n137,
// gillette n101–n105, victory n123, winco n1001–n1003. Bảng không ghi vai động cơ cho mã ("Model" trơ), bảng không có mã động cơ,
// ô hai mã: KHÔNG ra bản ghi (Khoa 21/11/2026). Ô "23.7 CU. IN. (390 CC)": spec-norm đọc khi hai số cùng một thể tích.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/spec-norm.js";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const sup = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const recs = (id, ns) => C.fromSupplier(sup(id), []).filter((r) => ns.includes(r.n));
const disp = (r) => (r.specs || []).filter((p) => p.key === "disp").map((p) => [p.label, p.value]);

test("endress n129 / n130 / n137: 'Engine Type | Yanmar - X' → bản ghi động cơ X, hãng Yanmar, dung tích ccm → L; không tổ máy, không công suất", () => {
  const got = recs("endress-stromerzeuger", [129, 130, 137]).map((r) => [r.n, r.kind, r.model, r.makes.map((m) => m.name).join(), r.genset, r.power, disp(r)]);
  assert.deepEqual(got, [
    [129, "engine", "3TNV80-FPGE", "Yanmar", null, null, [["Displacement [ccm]", "1267"]]],
    [130, "engine", "3TNM74F", "Yanmar", null, null, [["Displacement [ccm]", "993"]]],
    [137, "engine", "2TNV70-APGE", "Yanmar", null, null, [["Displacement [ccm]", "570"]]],
  ]);
  const r = SN.normalize({ key: "disp", label: "Displacement [ccm]", value: "1267" });
  assert.equal(r.unit, "L"); assert.equal(r.num, 1.267);
});

test("endress: bảng 'Model | <mã>' trơ (không ghi vai động cơ) vẫn không có bản ghi (Khoa 21/11/2026, kingway n117)", () => {
  assert.deepEqual(recs("endress-stromerzeuger", [123, 126, 127, 128, 135, 142, 143, 145, 146]), []);
});

test("gillette n101–n105: bản ghi động cơ GX390 / GX630 / KD440 có hãng ghi trong ô; n102 / n104 chép nguyên văn n101 / n103 nên gộp (mergeRepeats)", () => {
  const all = recs("gillette-generators", [101, 102, 103, 104, 105]);
  const eng = all.filter((r) => r.kind === "engine").map((r) => [r.n, r.model, r.makes.map((m) => m.name).join(), r.power, disp(r), (r.also || []).map((x) => x.n)]);
  assert.deepEqual(eng, [
    [101, "GX390", "Honda", null, [["ENGINE DISPLACEMENT", "23.7 CU. IN. (390 CC)"]], [102]],
    [103, "GX630", "Honda", null, [["ENGINE DISPLACEMENT", "41.97 CU. IN. (688 CC)"]], [104]],
    [105, "KD440", "Kohler", null, [["ENGINE DISPLACEMENT", "26.9 CU. IN. (440 CC)"]], []],
  ]);
  // Bản ghi cũ (vai đầu phát của dòng "GENERATOR MODEL") giữ nguyên: danh sách không đụng.
  assert.deepEqual(all.filter((r) => r.kind === "alternator").map((r) => [r.n, r.model]), [[101, "GPE-75EH"], [102, "GPE-75EH"], [103, "GPE-125EH"], [104, "GPE-125EH"], [105, "GPED-65EK-3"]]);
  const n = (v) => SN.normalize({ key: "disp", label: "ENGINE DISPLACEMENT", value: v });
  assert.equal(n("23.7 CU. IN. (390 CC)").num, 0.39); assert.equal(n("41.97 CU. IN. (688 CC)").num, 0.688); assert.equal(n("26.9 CU. IN. (440 CC)").num, 0.44);
});

test("victory n123 / winco n1002 / n1003: bản ghi động cơ sẵn có nhận dung tích; victory n124 (LT420 ghi 418, chính victory n131 ghi 420) không", () => {
  const v = recs("victory-generator", [123, 124]).filter((r) => r.kind === "engine").map((r) => [r.n, r.model, disp(r)]);
  assert.deepEqual(v, [[123, "LA186FAG", [["Displacement (cc)", "418"]]], [124, "LT420", []]]);
  const w = recs("winco", [1001, 1002, 1003]).filter((r) => r.kind === "engine").map((r) => [r.n, r.model, r.makes.map((m) => m.name).join(), disp(r)]);
  assert.deepEqual(w, [[1002, "GC160", "Honda", [["DISPLACEMENT/TYPE", "160CC"]]], [1003, "VANGUARD 3564", "", [["DISPLACEMENT/TYPE", "570CC"]]], [1001, "GC160", "Honda", [["DISPLACEMENT/TYPE", "160 CC"]]]]);
});

test("bảng không ghi mã / không ghi vai động cơ của mã / ô hai mã: không bản ghi nào", () => {
  for (const [id, ns] of [["bison-zhejiang", [108, 114]], ["byc-power", [101]], ["cameo-power", [122]], ["frs-shenyang", [108]], ["jet-power", [110, 120]],
    ["kena-chongqing", [108]], ["slong-power", [103, 108, 116, 144]], ["zc-power", [104]]]) {
    const r = recs(id, ns).filter((x) => (x.specs || []).some((p) => p.key === "disp"));
    assert.deepEqual(r.map((x) => [x.n, x.model]), [], id);
  }
});

test("chữ dòng đổi (cào lại) → mục danh sách hết hiệu lực, ghi note, không đọc", () => {
  const s = sup("endress-stromerzeuger"), t = s.specTables.find((x) => x.n === 129);
  t.rows = t.rows.map((l) => (l === "| Displacement [ccm] | 1267" ? "| Displacement [ccm] | 1268" : l));
  const notes = [];
  assert.deepEqual(C.fromSupplier(s, notes).filter((r) => r.n === 129), []);
  assert.ok(notes.some((x) => x.n === 129 && x.reason === "dòng động cơ trong danh sách đổi chữ: không đọc"));
});
