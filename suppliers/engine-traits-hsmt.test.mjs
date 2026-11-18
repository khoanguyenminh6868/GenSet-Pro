// node --test suppliers/engine-traits-hsmt.test.mjs — Đặc thù hãng động cơ, chặng 2 (Khoa 18/11/2026): which terms of
// engine-traits.json filter the engine make (rule 1) or name the controller (rule 5), read from HSMT lines. Lines marked
// "thật" are copied from genbid-work\specs\<TBMT>\text.txt (spaces of the table layout shortened) or from the analysis.
import test from "node:test";
import assert from "node:assert/strict";
import { load, filtersEngine, isControllerTrait, traitsIn, filterOf, wordsOf, MAKE_NAME } from "./engine-traits.mjs";

const J = load();

test("Khoa 18/11/2026: 16 terms filter the engine make, 6 name a controller", () => {
  const eng = J.traits.filter(filtersEngine).map((t) => `${t.make}|${t.term}`).sort();
  assert.deepEqual(eng, [
    "caterpillar|ACERT", "caterpillar|HEUI", "caterpillar|MEUI",
    "cummins|HPI", "cummins|MCRS", "cummins|PT fuel system", "cummins|XPI",
    "deutz|DCR", "deutz|DVERT",
    "fpt|HI-eSCR", "fpt|exhaust flap điện tử (patented)",
    "john-deere|PowerTech Plus",
    "kubota|E-TVCS", "kubota|TVCR",
    "mitsubishi|MHIET",
    "yuchai|ECW (điện tử điều khiển van xả tăng áp)",
  ].sort());
  const ctl = J.traits.filter(isControllerTrait).map((t) => t.term).sort();
  assert.deepEqual(ctl, ["ADEM", "AmpSentry", "EMCP", "EVC 2.0", "KODIA", "PowerCommand"].sort());
  for (const t of J.traits.filter((x) => filtersEngine(x) || isControllerTrait(x))) assert.ok(MAKE_NAME[t.make], `${t.make} không có tên hãng của catalog.js`);
});

test("Holset, Lombardini, KOHLER Flex stay in the table (exclusive is the truth) but do not filter", () => {
  for (const term of ["Holset", "Lombardini", "KOHLER Flex"]) {
    const t = J.traits.find((x) => x.term === term);
    assert.ok(t, term);
    assert.equal(t.exclusive, true, term);
    assert.equal(t.part, "engine", term);
    assert.equal(t.filter, false, term);
    assert.match(t.filterWhy, /Khoa 18\/11\/2026/, term);
    assert.equal(filtersEngine(t), false, term);
  }
});

const ETVCS_TEXT = [ // thật: IB2500416364, Chương V
  "II    Yêu cầu đối với động cơ",
  "                            Nhãn hiệu và xuất xứ từ các nước công",
  "1.    Xuất xứ/Nhãn hiệu                                                     Đạt     Không đạt",
  "                            nghiệp phát triển G7",
  "2.    Năm sản xuất          2024 trở lại đây                                Đạt     Không đạt",
  "3.    Loại động cơ          4 kỳ làm mát bằng nước                          Đạt     Không đạt",
  "                            Xoáy ba hướng (E-TVCS) giúp hòa trộn",
  "4.    Kiểu buồng đốt        nhiên liệu với không khí tốt hơn, cải thiện     Đạt     Không đạt",
  "                            hiệu suất đốt cháy.",
  "5.    Kiểu phun nhiên liệu Gián tiếp (IDI)                                  Đạt     Không đạt",
].join("\n");

test("rule 1, E-TVCS in the engine requirements: Kubota only (IB2500416364, thật)", () => {
  const f = filterOf(ETVCS_TEXT);
  assert.equal(f.engineMake, "Kubota");
  assert.deepEqual(f.engineTerms.map((x) => x.term), ["E-TVCS"]);
  assert.deepEqual(f.controllers, []);
});

test("rule 1 on OCR text with broken Vietnamese words (IB2500189935, thật)", () => {
  const t = [
    "II    Yê cầ đối với động cơ",
    " 3    L ạ động c             4 kỳ làm mát bằng n ớc                    Đạt     Không đạt",
    "                             X áy b h ớng (E-TVCS) g úp hò",
    " 4    K ểu buồng đốt         trộn nh ên l ệu vớ không khí tốt h n,     Đạt     Không đạt",
  ].join("\n");
  assert.equal(filterOf(t).engineMake, "Kubota");
});

test("rule 1 on the analysis row (IB2600612866, thật: technicalSpecs item + quote)", () => {
  const t = "Động cơ - kiểu buồng đốt | Xoáy ba hướng (E-TVCS) giúp hòa trộn nhiên liệu với không khí tốt hơn, cải thiện hiệu suất đốt cháy.";
  assert.equal(filterOf(t).engineMake, "Kubota");
});

test("rule 5, a controller term: that controller, no engine make filtered", () => {
  // thật: IB2400100405 (controller block)
  const amp = filterOf("- Chức năng chung:\n+ Tích hợp phần mềm AmpSentry bảo vệ đầu phát (không chấp nhận sử dụng máy cắt đầu cực để bảo vệ).");
  assert.equal(amp.engineMake, null);
  assert.deepEqual(amp.controllers.map((c) => c.term), ["AmpSentry"]);
  // thật: IB2300230061 "Power Command" in the controller row
  const pc = filterOf('                           thuật số "Power Command ". Hệ thống điều\n4.1   Bộ điều khiển        khiển , kiểm soát, bảo vệ máy phát được ứng');
  assert.equal(pc.engineMake, null);
  assert.deepEqual(pc.controllers.map((c) => c.term), ["PowerCommand"]);
  // thật: IB2300023194 — ADEM is the engine's ECU but Khoa keeps it with the controllers: no Caterpillar filter.
  const adem = filterOf("                        - Bộ điều khiển điện tử đơn (ECM) sản xuất bởi Caterpillar, loại\n                          ADEM 4-E2");
  assert.equal(adem.engineMake, null);
  assert.deepEqual(adem.controllers.map((c) => c.term), ["ADEM"]);
  // thật: IB2400073077
  assert.deepEqual(filterOf("Màn hình điều khiển EMCP 4.2B").controllers.map((c) => c.term), ["EMCP"]);
});

test("PCC is not PowerCommand (thật: IB2300270603, IB2600547578, IB2500450615)", () => {
  assert.ok(!wordsOf(J.traits.find((t) => t.term === "PowerCommand")).includes("PCC"));
  for (const l of ["phải giảm thiểu thêm tại UPS để đáp ứng các yêu cầu của Công ty cấp điện tại PCC (Điểm nối chung).",
    "PCC                  Particular conditions of contract", "- Cdn cir Quy6t dinh s6 5855/QD-PCC ngay 2411012025 ve viQc phO duyQt E-"]) assert.deepEqual(traitsIn(l), []);
});

test("not filtered: Holset, a line name, an engine term outside the engine requirements, 'tương đương', two makes (tự viết)", () => {
  const eng = "II Yêu cầu đối với động cơ\n";
  assert.equal(filterOf(`${eng}Turbo tăng áp: Holset`).engineMake, null);
  assert.equal(filterOf(`${eng}Model động cơ: QSK60-G3`).engineMake, null);
  const eq = filterOf(`${eng}Kiểu buồng đốt: E-TVCS hoặc tương đương`);
  assert.equal(eq.engineMake, null);
  assert.equal(eq.unused[0].equivalent, true);
  const two = filterOf(`${eng}Kiểu buồng đốt: E-TVCS\nHệ thống phun: Cummins XPI`);
  assert.equal(two.engineMake, null);
  assert.deepEqual(two.engineConflict.sort(), ["Cummins", "Kubota"]);
  // A spare part of an existing set in an ATS section is no engine requirement.
  const ats = filterOf("III Yêu cầu đối với tủ ATS\nTài liệu tham khảo: buồng đốt E-TVCS của máy hiện hữu");
  assert.equal(ats.engineMake, "Kubota", "nhãn hàng 'buồng đốt' thắng tiêu đề (ghi nhận giới hạn: xem thiết kế)");
});

test("acronyms are matched case-sensitively, words with letters around them are not hits (tự viết)", () => {
  assert.deepEqual(traitsIn("Động cơ: hpi rail"), []);
  assert.deepEqual(traitsIn("Kiểu buồng đốt: XE-TVCSX"), []);
  assert.equal(traitsIn("Kiểu buồng đốt: E TVCS")[0]?.term, "E-TVCS");
});
