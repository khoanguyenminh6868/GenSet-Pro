// node --test suppliers/*.test.mjs — Tỉ số nén HSMT ghi trơ là số chính xác (Khoa 20/11/2026, IB2600603983: "sửa luật
// để kiểm tra tỉ số nén nếu hsmt ghi trơ"). Đọc ngưỡng (comprLines / comprOf / hintsOf), chấm (comprChecks,
// makerSheetChecks), và các luật phải giữ: nguồn mâu thuẫn / không ghi → chưa rõ; có ≥ / ≤ như cũ; khác độ làm tròn không tính.
import test from "node:test";
import assert from "node:assert/strict";
import { comprLines, comprOf, comprFig, sameCompr, comprExactOf, comprChecks, makerSheetChecks, hintsOf } from "./config-bot.mjs";

const kinds = (t) => comprLines(t).map((c) => `${c.kind}:${c.x}`);

test("comprLines: the bare ratio is exact; signs, bands, references and 'nêu cụ thể' are not (lines from real HSMT)", () => {
  assert.deepEqual(kinds("14    Tỉ số nén                                     14 : 01"), ["exact:14"]);
  assert.deepEqual(kinds("Tỷ số nén | 17.3:1"), ["exact:17.3"]);
  assert.deepEqual(kinds("| Tỉ số nén là 16:1"), ["exact:16"]);
  assert.deepEqual(kinds("Tỷ số nén : 17,0:1"), ["exact:17"]);
  assert.deepEqual(kinds("| - Tỷ số nén: 16,1"), ["exact:16.1"]);
  assert.deepEqual(kinds("Tỉ số nén\n17.2:1"), ["exact:17.2"]);
  assert.deepEqual(kinds("11 | Tỉ số nén | ≥ 20:1."), ["min:20"]);
  assert.deepEqual(kinds("| Tỷ số nén (C) | ≥16,0:1"), ["min:16"]);
  assert.deepEqual(kinds("Tỉ số nén\n≥ 15.5:1"), ["min:15.5"]);
  assert.deepEqual(kinds("| - Tỷ số nén: ≥ (13.1:1)"), ["min:13.1"]);
  assert.deepEqual(kinds("| Tỉ số nén | 17,1:1 hoặc tốt hơn"), ["min:17.1"]);
  assert.deepEqual(kinds("6. | Ty số nén: 9.3:1 hoặc tốt hơn | dete"), ["min:9.3"]);
  assert.deepEqual(kinds("| 7 | Tỉ số nén | ≤ 19"), ["max:19"]);
  assert.deepEqual(kinds("Tỷ số nén: ≥\n17:1"), ["min:17"]);
  assert.deepEqual(kinds("2.4 | Tỷ số nén | ≥ 13:1 và ≤ 18:1 | X"), ["band:13"]);
  // The figure after the next label of the line is not the ratio's sign.
  assert.deepEqual(kinds("| Tỷ số nén: 16.8; Dung tích xilanh (L): > 10.34."), ["exact:16.8"]);
  // The engine of goods for reference.
  assert.deepEqual(kinds("- Động cơ: hãng Cummins (hoặc tương | đương) có các thông số kỹ thuật ( tham khảo) như sau: | Số xi lanh: 6 L; Tỉ số nén: 16.0:1"), ["ref:16"]);
  // No figure: nothing.
  assert.deepEqual(kinds("13 | Tỉ số nén | Nêu cụ thể"), []);
  assert.deepEqual(kinds("Tỷ số nén\nTheo tiêu chuẩn nhà sản xuất"), []);
  // The next row's number alone ("| Tỷ số nén của | yêu cầu" / "5") is not a ratio; nor an OCR "175:1".
  assert.deepEqual(kinds("| Tỷ số nén của | yêu cầu | Tham chiếu tài\n5"), []);
  assert.deepEqual(kinds("6. | Tỷ số nén >175:1"), []);
});

test("comprOf / hintsOf: exact only when every line gives one figure bare", () => {
  assert.deepEqual(comprOf("Tỉ số nén | 14 : 01"), { compr: 14, comprExact: true });
  assert.deepEqual(comprOf("- Tỉ số nén: 14,5 : 1\n- Tỉ số nén: 14,5 : 1"), { compr: 14.5, comprExact: true });
  assert.deepEqual(comprOf("Tỷ số nén | ≥ 17:1"), { compr: 17, comprExact: false });
  assert.deepEqual(comprOf("| - Tỉ số nén: 17,5:1\n- Tỉ số nén: 17,3:1"), { compr: null, comprExact: false });
  assert.deepEqual(comprOf("5 | Tỷ số nén | ≥ 14:1 | CTCB\n| + Đạt: Tỷ số nén ≥ 14:1"), { compr: 14, comprExact: false });
  assert.deepEqual(comprOf("Không nói gì"), { compr: null, comprExact: false });
  const h = hintsOf("II. Yêu cầu đối với động cơ\n14 Tỉ số nén   14 : 01\n15 Số xi lanh   6 xy lanh, bố trí thẳng hàng");
  assert.deepEqual([h.compr, h.comprExact], [14, true]);
});

test("comprFig / sameCompr: the ratio x; only rounding counts as the same (roundCompat)", () => {
  assert.deepEqual(["16.0:1", "16,5 : 1", "14 : 01", "17", "13.6", "18.2–18.3:1", "nguồn không ghi"].map(comprFig), [16, 16.5, 14, 17, 13.6, null, null]);
  assert.equal(sameCompr(14, 14), true);
  assert.equal(sameCompr(14, 14.1), true); // 14.1 rounds to 14, within 1 %
  assert.equal(sameCompr(14.1, 14), true);
  assert.equal(sameCompr(14, 13.9), true);
  assert.equal(sameCompr(14, 13.6), false);
  assert.equal(sameCompr(14, 14.5), false);
  assert.equal(sameCompr(17, 17.3), false); // 17.3 rounds to 17 but is 1.8 % off
  assert.equal(sameCompr(14, 16), false);
});

const H = { compr: 14, comprExact: true };
const CR = { code: "compression", item: "Tỷ số nén", requirement: "14:1", quote: "14    Tỉ số nén                                     14 : 01", part: "engine", level: "core" };
const F = (value, supplierId, sheet = false, n = 101) => ({ key: "compr", value, supplierId, n, line: `| Compression ratio | ${value}`, ...(sheet ? { sheet: true } : {}) });
const cfg = (checks = []) => ({ rank: 1, engine: { model: "4006-23TAG2A" }, alternator: { model: "S5L1D-H41" }, checks });
const UN = (offered = "") => ({ item: CR.item, part: "engine", status: "unclear", offered });

test("comprExactOf: needs a bare requirement AND the code's reading of the HSMT, of the same figure", () => {
  assert.equal(comprExactOf(CR, H), 14);
  assert.equal(comprExactOf({ ...CR, requirement: "14,0:1" }, H), 14);
  assert.equal(comprExactOf(CR, { compr: 14, comprExact: false }), null);
  assert.equal(comprExactOf(CR, null), null);
  assert.equal(comprExactOf({ ...CR, requirement: "≥ 14:1" }, H), null);
  assert.equal(comprExactOf({ ...CR, requirement: "Nêu cụ thể", quote: "13 Tỉ số nén Nêu cụ thể" }, H), null);
  assert.equal(comprExactOf({ ...CR, requirement: "16:1", quote: "Tỉ số nén 16:1" }, H), null);
  assert.equal(comprExactOf({ ...CR, code: "bore_stroke" }, H), null);
});

test("comprChecks: every source another ratio → not met (IB2600603983: Perkins 13,6, Cummins 16 against 14:1)", () => {
  const c = comprChecks(cfg([UN("13,6:1")]), [CR], [F("13.6:1", "fdk-energy"), F("13.6:1", "gb-power", false, 103)], { hsmtCompr: H });
  const x = c.checks[0];
  assert.deepEqual([x.status, x.byCode, x.rule, x.was, x.part, x.offered], ["not_met", true, "ti-so-nen", "unclear", "engine", "13.6:1"]);
  assert.deepEqual(x.factSrc, { supplierId: "fdk-energy", n: 101, line: "| Compression ratio | 13.6:1" });
  assert.match(x.note, /14:1 không kèm ≥ \/ ≤ \/ khoảng nên là số chính xác \(Khoa 20\/11\/2026\)/);
  // No check yet: one is written.
  assert.equal(comprChecks(cfg(), [CR], [F("16.0:1", "fdk-energy")], { hsmtCompr: H }).checks[0].status, "not_met");
  // Sources that agree up to rounding (16 / 16.0) but not with 14: not met.
  assert.equal(comprChecks(cfg(), [CR], [F("16.0:1", "a"), F("16:1", "b")], { hsmtCompr: H }).checks[0].status, "not_met");
});

test("comprChecks keeps: sources disagree, none / unreadable, same up to rounding, a sign, a check already decided", () => {
  const st = (facts, checks = [UN()], hsmtCompr = H, reqs = [CR]) => comprChecks(cfg(checks), reqs, facts, { hsmtCompr }).checks[0]?.status ?? "none";
  // Sources disagree (13.6 / 16): never the majority, stays unclear.
  assert.equal(st([F("13.6:1", "a"), F("16:1", "b")]), "unclear");
  assert.equal(st([F("13.6:1", "a"), F("13.6:1", "b"), F("16:1", "c")]), "unclear");
  // No source gives it; one the code cannot read.
  assert.equal(st([]), "unclear");
  assert.equal(st([F("13.6:1", "a"), F("18.2–18.3:1", "b")]), "unclear");
  // The HSMT's figure, up to rounding (S6R2-PTAA: 14:1 / 14,1:1).
  assert.equal(st([F("14:1", "a"), F("14.1:1", "b")]), "unclear");
  assert.equal(st([F("14.0:1", "a")]), "unclear");
  // The HSMT's reading not exact, or the requirement with a sign: as before.
  assert.equal(st([F("16:1", "a")], [UN()], { compr: 14, comprExact: false }), "unclear");
  assert.equal(st([F("16:1", "a")], [UN()], H, [{ ...CR, requirement: "≥ 14:1", quote: "Tỉ số nén ≥ 14:1" }]), "unclear");
  // A check met / not met, or one of the code's, stays.
  assert.equal(st([F("16:1", "a")], [{ ...UN(), status: "met" }]), "met");
  assert.equal(st([F("16:1", "a")], [{ ...UN(), byCode: true, rule: "to-hang" }]), "unclear");
  // A configuration with no engine model.
  assert.equal(comprChecks({ rank: 1, checks: [UN()] }, [CR], [F("16:1", "a")], { hsmtCompr: H }).checks[0].status, "unclear");
});

test("makerSheetChecks: sources disagree, exactly one maker sheet → the sheet's figure decides against the exact ratio", () => {
  const facts = (sheet) => ({ engine: [F(sheet, "perkins", true, 1001), F("13.6:1", "fdk-energy")] });
  const mk = (sheet) => makerSheetChecks(cfg([UN()]), [CR], facts(sheet), { hsmtCompr: H }).checks[0];
  // The maker's 16:1 against 14:1: not met; its 14,0:1: met.
  assert.deepEqual([mk("16:1").status, mk("16:1").rule], ["not_met", "to-hang"]);
  assert.match(mk("16:1").note, /số chính xác \(Khoa 20\/11\/2026\)/);
  assert.equal(mk("14.0:1").status, "met");
  // Without the HSMT's exact reading: a bare design figure is not compared (as before).
  assert.equal(makerSheetChecks(cfg([UN()]), [CR], facts("16:1")).checks[0].status, "unclear");
});
