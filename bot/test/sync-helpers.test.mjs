// Helpers of sync-pure.js used by the history round and the result checks: a search row as a bidhist tender (histTender,
// histUrl), the sets of an analysis (setsOf), capacity texts of two Chương V parts (capCompare), and the check of a
// Gợi ý nhà cung cấp answer (checkSupplier: only suppliers given, figures only from cited sources).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

const ROW = { id: "0f33c4a7-af4a-4b51-bb14-636598d98270", notifyId: "", notifyNo: "IB2400268027", planNo: "PL2400083420", bidForm: "DTRR", bidMode: "1_MTHS", processApply: "LDT", isInternet: 1,
  bidName: ["Mua sắm máy phát điện\n dầu 12kVA"], investorName: "MobiFone", investorCode: "vn0100686209", locations: [{ provName: "Hà Nội" }, { provName: "Hà Nội" }, { provName: "Đà Nẵng" }],
  publicDate: "2024-10-01T08:00:00", bidCloseDate: "2024-10-21T10:00:00+07:00", bidRealityOpenDate: "2024-10-21T10:05:00", publicDateKqlcnt: null,
  bidPrice: [49381200000, "17226000000"], winningContractorName: ["LIÊN DANH VN"], winningCode: ["vn0104265868"], bidWinningPrice: [34659814428, 12090632940],
  inputResultId: "a7edb1bf-b208-403e-8858-4928d929d60e", bidOpenId: "1af82967-82d8-4775-8ca5-2f94125dc59b", statusForNotify: "CNTTT" };
test("dòng tìm kiếm thành gói lịch sử: giờ VN sang UTC, tổng giá các phần, mã số thuế bỏ 'vn', tỉnh không lặp", () => {
  const t = P.histTender(ROW);
  assert.equal(t.bidName, "Mua sắm máy phát điện dầu 12kVA");
  assert.equal(t.investorCode, "0100686209");
  assert.equal(t.location, "Hà Nội, Đà Nẵng");
  assert.equal(t.publicDate, "2024-10-01T01:00:00.000Z");
  assert.equal(t.bidCloseDate, "2024-10-21T03:00:00.000Z", "giờ đã có múi giờ thì giữ");
  assert.equal(t.resultAt, null);
  assert.equal(t.estimatedPrice, 66607200000);
  assert.equal(t.winningPrice, 46750447368);
  assert.deepEqual(t.winnerTax, ["0104265868"]);
  assert.equal(t.isInternet, true);
});
test("trang lịch sử: có kết quả (inputResultId) thì bước KQLCNT, chưa có thì biên bản mở thầu; trang TBMT của gói", () => {
  const kq = new URL(P.histUrl(ROW)).searchParams;
  assert.deepEqual([kq.get("stepCode"), kq.get("step"), kq.get("notifyId"), kq.get("isInternet")], ["notify-contractor-step-4-kqlcnt", "kqlcnt", ROW.id, "1"]);
  const mt = new URL(P.histUrl({ ...ROW, inputResultId: "undefined" })).searchParams;
  assert.deepEqual([mt.get("stepCode"), mt.get("step"), mt.get("inputResultId")], ["notify-contractor-step-2-kqmt", "kqmt", "undefined"]);
  const tb = new URL(P.histTbmtUrl(P.histUrl(ROW))).searchParams;
  assert.deepEqual([tb.get("stepCode"), tb.get("step"), tb.get("inputResultId"), tb.get("bidOpenId"), tb.get("notifyNo")], ["notify-contractor-step-1-tbmt", "tbmt", "undefined", "undefined", "IB2400268027"]);
  assert.equal(P.has("undefined"), false);
});
test("tổ máy của Phân tích: chỉ object, số dương, số pha 1 / 3, trích tối đa 300 ký tự, tối đa 8 tổ", () => {
  const s = P.setsOf([null, "x", { qty: "2", primeKva: "500", standbyKva: 0, phases: 2, quote: "q".repeat(400) }, ...Array.from({ length: 10 }, () => ({ primeKw: 1 }))]);
  assert.equal(s.length, 8);
  assert.deepEqual({ ...s[0], quote: s[0].quote.length }, { qty: 2, primeKva: 500, standbyKva: null, primeKw: null, standbyKw: null, phases: null, quote: 300 });
  assert.deepEqual(P.setsOf("không phải mảng"), []);
});
test("công suất hai phần Chương V: cùng số thì giữ câu đầy đủ; khác số cùng đơn vị là chưa rõ; khoảng 'a – b' bao số ở giữa", () => {
  assert.deepEqual(P.capCompare("500 kVA", "500 kVA liên tục (prime)"), { fuller: "500 kVA liên tục (prime)", partial: false });
  assert.deepEqual(P.capCompare("500 kVA", "600 kVA"), { clash: true });
  assert.equal(P.capCompare("100 – 200 kVA", "150 kVA").clash, undefined);
  assert.deepEqual(P.capCompare("1.250 kVA", "1250 kVA"), { fuller: "1.250 kVA", partial: false }, "dấu nghìn");
  assert.deepEqual(P.capCompare("500 kVA dự phòng", "500 kVA liên tục"), { clash: true }, "cùng số nhưng khác loại công suất");
});

test("Gợi ý NCC: bỏ hãng không có trong danh sách đã đưa; nhận định có số không có trong nguồn dẫn thì đánh dấu ⚠; model phải là dòng bảng thông số", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "t5-sup-"));
  try {
    fs.writeFileSync(path.join(dir, "suppliers.json"), JSON.stringify([{ id: "cummins-x", names: { en: "Cummins X" }, sources: [{ n: 1, quote: "Prime power 500 kVA at 50 Hz" }],
      specTables: [{ n: 2, header: ["Model", "kVA"], rows: ["| C550D5 | 500 |"] }] }]));
    fs.writeFileSync(path.join(dir, "src-req.txt"), "Máy phát điện công suất liên tục 500 kVA, bảo hành 24 tháng. ".repeat(10));
    const result = { top: [{ supplierId: "bia-dat", rank: 1 }, { supplierId: "cummins-x", rank: 2, model: "C550D5", modelRow: "| C550D5 | 500 |", vietnamDistributor: "x",
      reasons: [{ text: "Công suất 500 kVA đáp ứng", supplierSrc: [1], requirementQuote: "công suất liên tục 500 kVA" }, { text: "Bảo hành 36 tháng", supplierSrc: [9] }] },
    { supplierId: "cummins-x", rank: 3, model: "C999", modelRow: "| C999 | 999 |", reasons: [] }] };
    assert.deepEqual(P.checkSupplier(result, dir), []);
    assert.deepEqual(result.top.map((x) => [x.supplierId, x.rank, x.model]), [["cummins-x", 1, "C550D5"], ["cummins-x", 2, null]]);
    assert.equal(result.top[0].vietnamDistributor, undefined);
    const [ok, bad] = result.top[0].reasons;
    assert.equal(ok.unverified, undefined);
    assert.equal(ok.requirementQuote, "công suất liên tục 500 kVA");
    assert.equal(bad.unverified, true);
    assert.deepEqual(bad.supplierSrc, []);
    assert.match(result.notes.join("\n"), /bỏ 1 gợi ý không có trong danh sách nhà cung cấp: bia-dat/);
    assert.match(result.notes.join("\n"), /"Bảo hành 36 tháng" – số nguồn không có trong hồ sơ nhà cung cấp; số 36 không có trong nguồn dẫn; không dẫn nguồn của nhà cung cấp\./);
    assert.match(result.notes.join("\n"), /model "C999" không khớp dòng nào/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
