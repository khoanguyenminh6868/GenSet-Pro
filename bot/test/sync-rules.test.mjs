// Rules of genbid-sync.js moved to sync-pure.js: which HSMT files are fetched and read (Khoa 03–04/11, 09/11/2026), which
// tenders are generator sets / services, the automatic Gợi ý cấu hình, the Sync feed merge (amended notices), the feed
// signature, the API key budget book, and the cut checks of a one-call answer. File names are real ones of
// genbid-work\specs\*\files and the comments of the code (TBMT given where known).
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const P = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");
const names = (r) => r.map((f) => f.name);
const pick = (list, web = "") => { const r = P.specsPick(list.map((name) => ({ name })), web); return { pick: names(r.pick), loose: names(r.loose) }; };

// ---------- Lấy tệp: quyết định phê duyệt không tải (Khoa 09/11) ----------
test("tệp quyết định phê duyệt E-HSMT không tải: 'QĐ…', 'Quyết định số…', '…_QDPD_…', số thứ tự đứng trước", () => {
  for (const n of ["QĐ phê duyệt E-HSMT.pdf", "Quyết định số 123-QĐ.pdf", "01. QĐ phê duyệt HSMT.pdf", "HSMT_QDPD_goi 1.pdf", "QuyetDinh_PheDuyet.pdf", "Phê duyệt E-HSMT.pdf", "QĐ_Chương V.pdf"])
    assert.equal(P.isDecisionFile(n), true, n);
});
test("tệp tên Chương V / yêu cầu kỹ thuật vẫn tải dù có chữ 'phê duyệt', 'QĐ' ở giữa (không đứng đầu)", () => {
  for (const n of ["Yêu cầu về kỹ thuật (phê duyệt).doc", "5. Yeu cau ve ky thuat HSMT - sua lai theo QDDT (2).doc", "230622_E-HSMT sua doi GT XD-02_Nha LV co quan_QDPDBVTC_Chuong V.pdf", "Chương V. Yêu cầu kỹ thuật.pdf", "YCKT.pdf"])
    assert.equal(P.isDecisionFile(n), false, n);
});
test("tệp không phải quyết định: E-HSMT, hợp đồng, 'Quy định chung'; tên rỗng", () => {
  for (const n of ["E-HSMT.pdf", "Dự thảo hợp đồng.pdf", "Quy định chung.pdf", "Bản vẽ.dwg", "", null]) assert.equal(P.isDecisionFile(n), false, String(n));
});
test("tên tệp dạng tách dấu (NFD) vẫn nhận ra quyết định", () => assert.equal(P.isDecisionFile("Quyết định phê duyệt.pdf".normalize("NFD")), true));

// ---------- specs: chọn tệp Chương V / YCKT để đọc (Khoa 03–04/11) ----------
test("có tệp Chương V riêng thì không đọc cả bộ E-HSMT", () => {
  assert.deepEqual(pick(["Chương V. Yêu cầu kỹ thuật.pdf", "E-HSMT.pdf", "Hồ sơ mời thầu.pdf"]).pick, ["Chương V. Yêu cầu kỹ thuật.pdf"]);
});
// Fix G2 (13/11): đo trên genbid-work\specs, 102/1.472 gói có tệp tên vừa Chương V/YCKT vừa 'HSMT'; 25 gói đọc thêm HSMT cả
// bộ / Mục 3 / hợp đồng. Sau sửa đúng 25 gói đó đổi lựa chọn, không gói nào khác.
test("tên tệp Chương V có chữ 'HSMT' vẫn là tệp Chương V riêng: không đọc thêm HSMT cả bộ (IB2200008717)", () => {
  assert.deepEqual(pick(["Chương V - TCKT - HSMT MPĐ 12KVA (1).pdf", "Chương V - TCKT - HSMT MPĐ 12KVA.pdf", "HSMT MPĐ 12KVA.pdf"]).pick,
    ["Chương V - TCKT - HSMT MPĐ 12KVA (1).pdf", "Chương V - TCKT - HSMT MPĐ 12KVA.pdf"]);
});
test("tệp Chương V tên 'E-HSMT' không kéo theo Mục 3 / chương VIII / HSMT cả bộ (IB2400558775, IB2300268389, IB2400428063)", () => {
  assert.deepEqual(pick(["BÁO CÁO LẬP E-HSMT MÁY PHÁT ĐIỆN.pdf", "CHƯƠNG V E-HSMT MÁY PHÁT ĐIỆN.pdf", "MỤC 3 CHƯƠNG E E-HSMT MÁY PHÁT ĐIỆN.pdf"]).pick, ["CHƯƠNG V E-HSMT MÁY PHÁT ĐIỆN.pdf"]);
  assert.deepEqual(pick(["E-HSMT_XL_gói 3 - CHUONG V.pdf", "E-HSMT_XL_gói 3 -CHUONG VIII.pdf"]).pick, ["E-HSMT_XL_gói 3 - CHUONG V.pdf"]);
  assert.deepEqual(pick(["E-HSMT Chuong V (1).pdf", "E-HSMT.pdf"]).pick, ["E-HSMT Chuong V (1).pdf"]);
  assert.deepEqual(pick(["HSMT.pdf", "HSMT+phạm vi cung cấp chi tiết + yêu cầu kỹ thuật.rar"]).pick, ["HSMT+phạm vi cung cấp chi tiết + yêu cầu kỹ thuật.rar"]);
});
test("có webform: tệp Chương V tên 'E-HSMT' vẫn đọc, không lấy 'Chuong 3' thay (IB2600588204, IB2600564645)", () => {
  const f = ["14.1 Mẫu số 4A E-HSMT hàng hóa 1 túi -22.10.2026 ( Chuong 3).docx", "14.2 Mẫu số 4A E-HSMT hàng hóa 1 túi -22.10.2026 ( Chuong 5 - Ky Thuat).docx", "E-HSMT hàng hóa 1 túi May phat dien.pdf", "IB2600588204_QuyetDinhPheDuyetHSMT_23_10_2026.pdf"];
  assert.deepEqual(pick(f).pick, [f[1]]);
  assert.deepEqual(pick(f, "web").pick, [f[1]]);
  assert.deepEqual(pick(["20261023_VCB ĐĐN_E-HSMT - Điều kiện cụ thể của hợp đồng.pdf", "20261023_VCB ĐĐN_E-HSMT-Chương V - Yêu cầu kỹ thuật.pdf", "IB2600564645_QuyetDinhPheDuyetHSMT_28_10_2026.pdf"], "web").pick,
    ["20261023_VCB ĐĐN_E-HSMT-Chương V - Yêu cầu kỹ thuật.pdf"]);
});
test("tên chỉ là HSMT cả bộ vẫn là cả bộ: 'Hồ sơ mời thầu', 'HO SO CHCT', 'E-HSMT.pdf' (Khoa 04/11)", () => {
  assert.deepEqual(pick(["E-HSMT.pdf", "Hồ sơ mời thầu.pdf"], "web").pick, []);
  assert.deepEqual(pick(["Chuong V. HSMT_CHCT QM.pdf", "HSMT_CHCT QM.pdf"]).pick, ["Chuong V. HSMT_CHCT QM.pdf"]);
});
test("'Phụ lục bảng giá hợp đồng' không đọc thay Chương V (IB2200029877)", () => {
  assert.deepEqual(pick(["PHỤ LỤC BẢNG GIÁ HỢP ĐỒNG.pdf", "Yeu cau ky thuat 16 (1).pdf", "Yeu cau ky thuat 16.pdf"]).pick, ["Yeu cau ky thuat 16 (1).pdf", "Yeu cau ky thuat 16.pdf"]);
});
test("hợp đồng, phụ lục HĐ, dự thảo HĐ, biểu mẫu, báo cáo lập E-HSMT không được chọn", () => {
  assert.deepEqual(pick(["Chuong 5 HSMT may phat dien 2022.doc", "Hợp đồng HSMT may phat dien 2022.doc", "Phụ lục HĐ HSMT may phat dien 2022.doc", "Biểu mẫu phụ lục hợp đồng.pdf", "Báo cáo lập E-HSMT.pdf"]).pick,
    ["Chuong 5 HSMT may phat dien 2022.doc"]);
});
test("chỉ có HSMT cả bộ thì đọc nó (IB2300030459); đã có Chương V webform thì không đọc HSMT cả bộ", () => {
  const files = ["Hồ sơ mời thầu thuê máy phát (1).pdf", "Hồ sơ mời thầu thuê máy phát (2).pdf", "Hồ sơ mời thầu thuê máy phát.pdf", "E-HỒ SƠ MỜI THẦU (VT-2237-25-CĐ-TTH).pdf"];
  assert.deepEqual(pick(files).pick, files.slice(0, 3), "tối đa 3 tệp");
  assert.deepEqual(pick(files, "--- Tệp: Chương V (webform) ---\n...").pick, []);
});
test("có webform Chương V: vẫn đọc tệp yêu cầu kỹ thuật riêng", () => {
  assert.deepEqual(pick(["03. Yêu cầu về kỹ thuật.rar", "05. Dự thảo hợp đồng.pdf"], "web").pick, ["03. Yêu cầu về kỹ thuật.rar"]);
});
test("tệp 'E-HSMT - … - Yeu cau ve ky thuat' là YCKT riêng: đọc nó, không đọc 'Dieu kien cu the' (IB2200091251)", () => {
  const files = ["E-HSMT - MPD (GD3) - Yeu cau ve ky thuat.pdf", "E-HSMT - MPD (GD3) - Du thao hop dong.pdf", "E-HSMT - MPD (GD3) - Dieu kien cu the.pdf"];
  assert.deepEqual(pick(files).pick, ["E-HSMT - MPD (GD3) - Yeu cau ve ky thuat.pdf"]);
  assert.deepEqual(pick(files, "web").pick, ["E-HSMT - MPD (GD3) - Yeu cau ve ky thuat.pdf"]);
});
test("Chương V sửa đổi được đọc, quyết định sửa đổi thì không (IB2500206907, IB2600309163)", () => {
  assert.deepEqual(pick(["11. Sửa đổi Phần 2 Chương V YÊU CẦU VỀ KỸ THUẬT.pdf", "Quyết định sửa đổi E-HSMT.pdf"]).pick, ["11. Sửa đổi Phần 2 Chương V YÊU CẦU VỀ KỸ THUẬT.pdf"]);
  assert.deepEqual(pick(["Chuong V - Yeu cau ky thuat_Sua doi.pdf", "QĐ sửa đổi.pdf"]).pick, ["Chuong V - Yeu cau ky thuat_Sua doi.pdf"]);
});
test("tên viết tắt / không dấu được nhận (Khoa 04/11): 'Chg 5', 'YEU CAU KT', 'Yeu cau ki thuat', 'Chỉ dẫn kỹ thuật', 'QCKT'", () => {
  for (const n of ["Chg 5.pdf", "3. YEU CAU KT XL-02.pdf", "Yeu cau ki thuat - MPĐ 250kva.docx", "Chỉ dẫn kỹ thuật máy phát điện.pdf", "15. QCKT MF DU PHONG.pdf", "TCKTHUAT VTTB tổ máy.rar"])
    assert.deepEqual(pick([n, "Gói 22.pdf"]).pick, [n], n);
});
test("tên Chương V bắt đầu bằng quyết định thì bỏ ('…' đứng đầu là QĐ)", () => {
  assert.deepEqual(pick(["QĐ phê duyệt Chương V.pdf"]).pick, []);
});
test("chào hàng rút gọn: không có tệp nào khác thì đọc Chương III, không đọc Chương IV hợp đồng hay QĐ (IB2200044785)", () => {
  assert.deepEqual(pick(["Chương III.pdf", "Chương IV.pdf", "QĐ phê duyệt.pdf"]).pick, ["Chương III.pdf"]);
  assert.deepEqual(pick(["Chương III - Tiêu chuẩn đánh giá.pdf"]).pick, [], "Chương III là TCĐG thì không");
});
test("tên tách dấu (NFD) vẫn được chọn", () => {
  const n = "Chương V. Yêu cầu về kỹ thuật.pdf".normalize("NFD");
  assert.deepEqual(pick([n]).pick, [n]);
});
test("không tệp nào nhận ra là yêu cầu kỹ thuật: 4 tệp đầu không phải quyết định, đúng đuôi tài liệu (2026-11-10)", () => {
  const r = pick(["Gói 22.pdf", "QĐ phê duyệt.pdf", "Mẫu 17_0001.pdf", "1196-vtsg-dmtx.pdf", "bang ke.txt", "a.docx", "b.xlsx", "c.zip"]);
  assert.deepEqual(r.pick, []);
  assert.deepEqual(r.loose, ["Gói 22.pdf", "Mẫu 17_0001.pdf", "1196-vtsg-dmtx.pdf", "a.docx"]);
});

// ---------- gói máy phát / gói dịch vụ ----------
test("gói máy phát điện: tên có 'máy phát điện', 'MPĐ', 'genset', 'máy phát … kVA'", () => {
  for (const n of ["Mua sắm máy phát điện dự phòng 500kVA", "Cung cấp MPD cho trạm BTS", "Genset 1000 kVA", "Máy phát 250 KVA cho tòa nhà", "Máy phát diesel dự phòng"])
    assert.equal(P.isGenset({ bidName: n }), true, n);
  assert.equal(P.isGenset({ pname: "Mua máy phát điện" }), true, "pname khi không có bidName");
  assert.equal(P.isGenset({ bidName: ["Mua máy phát điện", "khác"] }), true, "bidName dạng mảng: lấy phần tử đầu");
});
test("tên chỉ nói 'MPĐ' (có dấu) là gói máy phát", () => {
  assert.equal(P.isGenset({ bidName: "Cung cấp MPĐ cho trạm BTS" }), true);
  assert.equal(P.isGenset({ bidName: "Mua sắm MPĐ dự phòng cho trạm BTS" }), true);
});
test("máy phát điện gió / điện mặt trời / tua-bin gió không là gói máy phát, trừ khi tên nói diesel / dự phòng / kVA", () => {
  for (const n of ["Cung cấp máy phát điện gió 5kW", "Hệ thống máy phát điện năng lượng mặt trời", "Bảo dưỡng tua-bin gió", "Phát điện mặt trời áp mái"])
    assert.equal(P.isGenset({ bidName: n }), false, n);
  assert.equal(P.isGenset({ bidName: "Hệ thống điện mặt trời và máy phát điện diesel dự phòng 250kVA" }), true);
});
// Ba nơi giữ cùng luật tên gói: web/bidprice.js (isGensetName), sync-pure.js (isGenset), server/src/muasamcong.ts
// (isGeneratorTender, nới nhất: "phát điện" đứng riêng cũng giữ). Danh sách dưới đây là tên mà cả ba phải cùng đáp.
test("ba nơi (bidprice.js, sync-pure.js, muasamcong.ts) cùng kết luận trên danh sách tên gói", async () => {
  const req = createRequire(import.meta.url);
  const g = globalThis; const keep = g.GenbidBidprice;
  await import("../../web/catalog.js"); await import("../../web/bidprice.js");
  const BP = g.GenbidBidprice; g.GenbidBidprice = keep;
  const src = (await import("node:fs")).readFileSync(new URL("../../server/src/muasamcong.ts", import.meta.url), "utf8");
  const grab = (re) => new RegExp(src.match(re)[1].replace(/\\\\/g, "\\"));
  const MPD = grab(/const MPD_RE = \/(.*)\/;/), RENEW = grab(/const RENEW_RE =\s*\/(.*)\/;/), SET = grab(/const SET_RE = \/(.*)\/;/);
  const terms = [...src.match(/RELEVANCE_TERMS = \[(.*)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const strip = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  const server = (s) => { const n = strip(s); return (terms.some((t) => n.includes(t)) || MPD.test(n)) && (!RENEW.test(n) || SET.test(n)); };
  const list = [
    ["Cung cấp MPĐ 100kVA", true], ["Mua sắm MPĐ dự phòng cho trạm BTS", true], ["Mua sắm máy phát điện dự phòng 500kVA", true],
    ["Cung cấp máy phát điện gió 5kW", false], ["Hệ thống máy phát điện năng lượng mặt trời", false], ["Bảo dưỡng tua-bin gió", false],
    ["Hệ thống điện mặt trời và máy phát điện diesel dự phòng 250kVA", true], ["Mua sắm máy tính văn phòng", false], ["Gói thầu số 30: Hệ thống cung cấp điện và điện năng lượng mặt trời, Máy phát điện; Điều hòa không khí", true], ["Vật tư Offskid cho nâng cấp hệ thống điều khiển máy phát điện Solar TG-A", false], ["Genset 1000 kVA", true],
  ];
  for (const [n, want] of list) {
    assert.equal(BP.isGensetName(n), want, "bidprice.js: " + n);
    assert.equal(P.isGenset({ bidName: n }), want, "sync-pure.js: " + n);
    assert.equal(server(n), want, "muasamcong.ts: " + n);
  }
});
test("không phải gói máy phát: tổ máy của nhà máy điện, tua bin, tên không nói máy phát", () => {
  for (const n of ["Sửa chữa tổ máy số 2 Nhà máy thủy điện Hòa Bình - máy phát điện", "Đại tu tua bin máy phát điện H1", "Giảm phát thải tại Nhà máy Điện", "Mua sắm máy biến áp"])
    assert.equal(P.isGenset({ bidName: n }), false, n);
  assert.equal(P.isGenset({ bidName: "Máy phát điện diesel dự phòng cho nhà máy thủy điện Sơn La" }), true, "nhà máy điện nhưng tên nói diesel dự phòng");
});
test("gói dịch vụ không tự Gợi ý cấu hình (Khoa 12/11): bảo dưỡng, sửa chữa, thuê, di dời, vật tư, nhiên liệu", () => {
  for (const n of ["Bảo dưỡng máy phát điện năm 2025", "Sửa chữa máy phát điện", "Thue may phat dien (không dấu)", "Di dời máy phát điện", "Mua sắm vật tư, phụ tùng máy phát điện", "Cung cấp dầu nhờn cho máy phát điện"])
    assert.equal(P.isServiceTender(n), true, n);
});
test("gói 'Thuê máy phát điện' (có dấu) là gói dịch vụ, không tự Gợi ý cấu hình", () => {
  for (const n of ["Thuê máy phát điện phục vụ sự kiện", "Thuê máy phát điện 2022", "GTSXKD01-2023 – Cung cấp dịch vụ cho thuê máy phát điện dự phòng"]) assert.equal(P.isServiceTender(n), true, n);
  // "căn hộ cho thuê" là loại công trình, không phải thuê máy (IB2500020231, 13/11).
  assert.equal(P.isServiceTender("Gói thầu TB1: Cung cấp và lắp đặt thiết bị công trình: Nhà văn phòng làm việc và căn hộ cho thuê (máy phát điện dự phòng, PCCC, thang máy)"), false);
});
test("gói mua máy kèm dịch vụ vẫn là gói mua máy: 'Mua sắm, lắp đặt máy phát … và bảo dưỡng'", () => {
  for (const n of ["Mua sắm và lắp đặt máy phát điện, bảo dưỡng 2 năm", "Cung cấp và lắp đặt 02 tổ máy phát điện, bảo trì", "Trang bị mới máy phát điện, sửa chữa nhà trạm", "Mua sắm thiết bị, máy phát điện"])
    assert.equal(P.isServiceTender(n), false, n);
  assert.equal(P.isServiceTender("Mua máy phát điện"), false);
});
test("Phân tích ghi 'không mua tổ máy' thì là gói dịch vụ dù tên nói mua máy phát", () => {
  assert.equal(P.isServiceTender("Mua máy phát điện", { keyInfo: { generatorCapacity: "Không mua máy, chỉ bảo dưỡng" } }), true);
});
test("Gợi ý cấu hình tự động: không gửi khi Phân tích không nêu công suất; gửi khi tên gói hoặc tổ máy hoặc thông số có kVA/kW", () => {
  assert.equal(P.autoConfigSkip("Mua máy phát điện", { keyInfo: {}, generatorSets: [], technicalSpecs: [{ item: "Động cơ", requirement: "4 thì" }] }), "power");
  assert.equal(P.autoConfigSkip("Mua máy phát điện 250 kVA", { keyInfo: {} }), "");
  assert.equal(P.autoConfigSkip("Mua máy phát điện", { generatorSets: [{ primeKva: 100 }] }), "");
  assert.equal(P.autoConfigSkip("Mua máy phát điện", { technicalSpecs: [{ item: "Công suất liên tục (kW/kVA)", requirement: "≥ 100/125" }] }), "", "cặp đơn vị kW/kVA trước cặp số");
  assert.equal(P.autoConfigSkip("Mua máy phát điện"), "", "chưa có Phân tích: chỉ xét gói dịch vụ");
  assert.equal(P.autoConfigSkip("Bảo dưỡng máy phát điện 500 kVA", { keyInfo: { generatorCapacity: "500 kVA" } }), "service");
});

// ---------- công suất trong tên / HSMT (lịch sử) ----------
test("đọc công suất: kVA / kW / MVA, dấu nghìn chấm, thập phân phẩy, cặp (kW/kVA) a/b, bỏ số 0", () => {
  assert.deepEqual(P.histPower("Máy phát 500 kVA và 400kW"), [{ v: 500, u: "kVA" }, { v: 400, u: "kW" }]);
  assert.deepEqual(P.histPower("1.250 kVA"), [{ v: 1250, u: "kVA" }]);
  assert.deepEqual(P.histPower("2,5 MVA"), [{ v: 2.5, u: "MVA" }]);
  assert.deepEqual(P.histPower("Công suất liên tục (kW/kVA) ≥ 100/125"), [{ v: 125, u: "kVA" }]);
  assert.deepEqual(P.histPower("0 kVA"), []);
  assert.deepEqual(P.histPower(null), []);
});
test("gói lịch sử cần đọc HSMT khi không phần nào nêu công suất (tên phần, tên gói, dòng hàng)", () => {
  assert.equal(P.histNeedsConfig({ bidName: "Mua máy phát điện", lots: [{ lotName: "", goods: [{ name: "Máy phát điện" }] }] }), true);
  assert.equal(P.histNeedsConfig({ bidName: "Mua máy phát điện 100 kVA", lots: [{ lotName: "" }] }), false, "một phần: tên gói đủ");
  assert.equal(P.histNeedsConfig({ bidName: "Mua máy phát điện 100 kVA", lots: [{ lotName: "Phần 1" }, { lotName: "Phần 2 - 200 kVA" }] }), true, "nhiều phần: mỗi phần phải tự nêu");
  assert.equal(P.histNeedsConfig({ bidName: "x", lots: [{ lotName: "", goods: [{ name: "Tổ máy", code: "C110D5", desc: "100 kVA" }] }] }), false);
  assert.equal(P.histNeedsConfig({ config: { kvas: [{ v: 1, u: "kVA" }], src: "x" }, lots: [{}] }), false, "đã đọc có công suất");
  assert.equal(P.histNeedsConfig({ config: { kvas: [], src: "tệp HSMT" }, lots: [{}] }), false, "đã đọc chữ, không có công suất: không đọc lại");
  assert.equal(P.histNeedsConfig({ bidName: "x", config: { kvas: [], src: "chỉ có bản scan" }, lots: [{ lotName: "" }] }), true, "đọc trước khi có OCR, chỉ có bản scan: đọc lại");
});
test("cấu hình lịch sử giữ dòng quyết định so sánh trước (hãng, xuất xứ, số lượng, công suất) trong giới hạn ký tự (đo 06/11: 803/1.250 gói bị cắt)", () => {
  const filler = Array.from({ length: 60 }, (_, i) => `Điện áp đầu ra dòng phụ số ${i} theo tiêu chuẩn chung`);
  const t = [...filler, "Xuất xứ: G7 hoặc Việt Nam", "Số lượng: 02 tổ máy", "Công suất liên tục 500 kVA"].join("\n");
  const r = P.histConfigOf(t, "tệp");
  assert.ok(r.text.length <= 6000);
  const lines = r.text.split("\n");
  assert.deepEqual(lines.slice(0, 3), ["Xuất xứ: G7 hoặc Việt Nam", "Số lượng: 02 tổ máy", "Công suất liên tục 500 kVA"]);
  assert.deepEqual(r.kvas, [{ v: 500, u: "kVA" }]);
  assert.equal(r.src, "tệp");
  const long = P.configText(Array.from({ length: 300 }, (_, i) => `Model ${i} ${"x".repeat(40)}`), 1000);
  assert.ok(long.length <= 1000 && long.length > 900);
});

// ---------- Sync: gộp kết quả tìm kiếm vào feed/current, bản sửa đổi (Khoa 29/10) ----------
const T = (no, o = {}) => ({ notifyNo: no, notifyVersion: "00", publicDate: "2026-11-01T00:00:00.000Z", bidCloseDate: "2026-11-20T03:00:00.000Z", ...o });
const NOW = Date.parse("2026-11-13T03:00:00Z");
test("Sync: gói có bản sửa đổi (notifyVersion tăng) thì tải lại tệp; gói đổi thông tin khác thì chỉ cập nhật", () => {
  const feed = [T("IB1"), T("IB2"), T("IB3", { bidCloseDate: "2026-11-01T03:00:00.000Z" })];
  const found = { count: 3, present: ["IB1", "IB2", "IB4"], changed: [T("IB1", { notifyVersion: "01", bidCloseDate: "2026-11-25T03:00:00.000Z" }), T("IB2", { estimatedPrice: 5 }), T("IB4")] };
  const r = P.feedMerge(feed, found, { newOnly: false, knownElsewhere: () => false, nowMs: NOW });
  assert.deepEqual(r.amended.map((t) => [t.notifyNo, t.notifyVersion]), [["IB1", "01"]]);
  assert.deepEqual(r.next.map((t) => t.notifyNo), ["IB1", "IB2", "IB4"], "IB3 đã đóng thầu và không còn trong kết quả: bỏ khỏi feed");
  assert.equal(r.next[0].notifyVersion, "01", "feed giữ bản mới");
  assert.deepEqual(r.fresh.map((t) => t.notifyNo), ["IB4"]);
  assert.equal(r.summary, "3 gói đang mở, 1 gói mới (IB4), 2 gói đổi thông tin, 1 gói đã đóng, 1 gói có bản sửa đổi (IB1 bản 01), tải lại tệp, cần Phân tích lại");
});
test("Sync: so số bản sửa đổi theo số, không theo chữ ('10' > '09')", () => {
  const r = P.feedMerge([T("IB1", { notifyVersion: "09" })], { count: 1, present: ["IB1"], changed: [T("IB1", { notifyVersion: "10" })] }, { newOnly: false, knownElsewhere: () => false, nowMs: NOW });
  assert.equal(r.amended.length, 1);
});
test("Sync: gói vắng khỏi kết quả nhưng chưa đóng thầu thì giữ; gói đã biết ở nơi khác (đã xem / xoá) không là gói mới", () => {
  const r = P.feedMerge([T("IB1")], { count: 1, present: [], changed: [T("IB9")] }, { newOnly: false, knownElsewhere: (n) => n === "IB9", nowMs: NOW });
  assert.deepEqual(r.next.map((t) => t.notifyNo), ["IB1", "IB9"]);
  assert.deepEqual(r.fresh, []);
  assert.equal(r.summary, "1 gói đang mở, không có gói mới");
});
test("Sync: không có gì đổi thì không ghi lại feed (next = null)", () => {
  const r = P.feedMerge([T("IB1")], { count: 1, present: ["IB1"], changed: [] }, { newOnly: false, knownElsewhere: () => false, nowMs: NOW });
  assert.equal(r.next, null);
});
test("Sync 'Chỉ lấy gói mới' (+): chỉ gói đăng sau gói mới nhất của feed, không xét sửa đổi hay đóng thầu", () => {
  const feed = [T("IB1", { publicDate: "2026-11-10T00:00:00.000Z" }), T("IB2", { bidCloseDate: "2020-01-01T00:00:00.000Z" })];
  const found = { count: 3, present: [], changed: [T("IB1", { notifyVersion: "05" }), T("IB5", { publicDate: "2026-11-09T00:00:00.000Z" }), T("IB6", { publicDate: "2026-11-12T00:00:00.000Z" })] };
  const r = P.feedMerge(feed, found, { newOnly: true, knownElsewhere: () => false, nowMs: NOW });
  assert.deepEqual(r.fresh.map((t) => t.notifyNo), ["IB6"]);
  assert.deepEqual(r.next.map((t) => t.notifyNo), ["IB1", "IB2", "IB6"]);
  assert.deepEqual(r.amended, []);
  assert.equal(r.summary, "1 gói mới (IB6)");
  assert.equal(P.feedMerge(feed, { ...found, changed: [] }, { newOnly: true, knownElsewhere: () => false, nowMs: NOW }).next, null);
});

// ---------- chữ ký feed: khớp Merge-GenBidFeed.ps1 (PowerShell 5.1) ----------
// Expected values: powershell.exe -File Merge-GenBidFeed.ps1 -Mode Sigs on these tenders (13/11/2026).
test("chữ ký gói khớp Merge-GenBidFeed.ps1: gói thường, gói đã huỷ, gói thiếu trường và giá lẻ", async () => {
  const t1 = { notifyNo: "IB2400268027", bidCloseDate: "2024-10-21T03:00:00.000Z", bidOpenDate: "2024-10-21T03:00:00.000Z", notifyVersion: "00", estimatedPrice: 49381200000, bidName: "Mua sắm máy phát điện dầu 12kVA", investorName: "Tổng công ty Viễn thông MobiFone", procuringEntityName: "Tổng công ty Viễn thông MobiFone", location: "Hà Nội", isInternet: true, status: "open" };
  const t2 = { notifyNo: "IB2200001635", bidCloseDate: "2022-01-20T02:00:00.000Z", bidOpenDate: "2022-01-20T02:30:00.000Z", notifyVersion: "01", estimatedPrice: 16000000000, bidName: "Máy phát điện 100 kVA", investorName: "Bệnh viện", location: "Lâm Đồng, Đắk Nông", isInternet: true, status: "cancelled" };
  const t3 = { notifyNo: "IB9900000001", bidCloseDate: null, bidOpenDate: null, notifyVersion: "00", estimatedPrice: 1234.5, bidName: "Thử: giá lẻ, không có bên mời thầu", investorName: null, location: null, isInternet: false, status: "open" };
  assert.equal(await P.sig(t1), "8956e3cf2c85");
  assert.equal(await P.sig(t2), "73cf8d5ec4cd");
  assert.equal(await P.sig(t3), "76d7f5994218");
  assert.notEqual(await P.sig({ ...t1, notifyVersion: "01" }), "8956e3cf2c85", "bản sửa đổi đổi chữ ký");
  assert.equal(await P.sig({ ...t1, publicDate: "khác", sourceUrl: "khác" }), "8956e3cf2c85", "trường ngoài chữ ký không đổi chữ ký");
});

// ---------- sổ chi API key (Khoa 11–12/11: 100 USD/tháng, làm mới ngày 2, chuyển gói ở ngưỡng) ----------
const book = (...e) => e.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
const at = (s) => new Date(s); // local time, as the bot reads it
test("sổ chi: chỉ tính từ ngày làm mới (2) của tháng; tới ngưỡng mặc định 90 USD thì dùng gói tháng", () => {
  const b = P.apiBudgetOf("", book({ t: "2026-11-01T05:00:00", usd: 60 }, { t: "2026-11-05T05:00:00", usd: 50.004 }, { t: "2026-11-12T05:00:00", usd: 39.99 }), at("2026-11-13T12:00:00"));
  assert.equal(b.since.getDate(), 2);
  assert.equal(b.spent, 89.99);
  assert.equal(b.ok, true);
  const c = P.apiBudgetOf("", book({ t: "2026-11-05T05:00:00", usd: 90 }), at("2026-11-13T12:00:00"));
  assert.equal(c.ok, false, "đúng ngưỡng thì chuyển (spent < switchAtUsd mới còn dùng)");
});
test("sổ chi: ngưỡng Khoa đặt trong .anthropic-api-budget.json (98 USD, có BOM) thay mặc định", () => {
  const b = P.apiBudgetOf("﻿{\"switchAtUsd\": 98}", book({ t: "2026-11-05T05:00:00", usd: 95 }), at("2026-11-13T12:00:00"));
  assert.equal(b.switchAtUsd, 98);
  assert.equal(b.monthlyUsd, 100);
  assert.equal(b.ok, true);
});
test("sổ chi: trước ngày làm mới thì kỳ là từ ngày 2 tháng trước", () => {
  const b = P.apiBudgetOf("", book({ t: "2026-10-15T05:00:00", usd: 10 }, { t: "2026-09-30T05:00:00", usd: 70 }), at("2026-11-01T12:00:00"));
  assert.equal(b.since.getMonth(), 9);
  assert.equal(b.spent, 10);
});
test("sổ chi: API báo hết tiền (exhausted) thì dùng gói tháng tới kỳ sau; dòng hỏng bỏ qua; không có sổ thì 0", () => {
  assert.equal(P.apiBudgetOf("", book({ t: "2026-11-05T05:00:00", usd: 0, exhausted: true }), at("2026-11-13T12:00:00")).ok, false);
  assert.equal(P.apiBudgetOf("", book("{hỏng", { t: "2026-11-05T05:00:00", usd: 1 }, ""), at("2026-11-13T12:00:00")).spent, 1);
  assert.deepEqual([P.apiBudgetOf("", "", at("2026-11-13T12:00:00")).spent, P.apiBudgetOf("{hỏng", "", at("2026-11-13T12:00:00")).switchAtUsd], [0, 90]);
});
test("sổ chi: một dòng JSON không phải object ('null') không làm mất các dòng chi sau nó", () => {
  assert.equal(P.apiBudgetOf("", book({ t: "2026-11-05T05:00:00", usd: 1 }, "null", { t: "2026-11-06T05:00:00", usd: 2 }), at("2026-11-13T12:00:00")).spent, 3);
});

// ---------- Cấu hình hệ thống trên web (settings/ai, Khoa 13/11/2026) ----------
test("cấu hình hệ thống: ngưỡng trên web thắng tệp ngưỡng", () => {
  const b = P.apiBudgetOf("{\"switchAtUsd\": 98}", book({ t: "2026-11-05T05:00:00", usd: 95 }), at("2026-11-13T12:00:00"), "{\"switchAtUsd\": 90}");
  assert.equal(b.switchAtUsd, 90);
  assert.equal(b.ok, false);
});
test("cấu hình hệ thống: số tiền sửa tay thay sổ tới lúc sửa, cộng tiếp phần chi sau đó; exhausted trước lúc sửa bỏ qua", () => {
  const s = JSON.stringify({ spent: { usd: 40, at: "2026-11-10T05:00:00" } });
  const b = P.apiBudgetOf("", book({ t: "2026-11-05T05:00:00", usd: 80 }, { t: "2026-11-06T05:00:00", usd: 0, exhausted: true }, { t: "2026-11-11T05:00:00", usd: 2.5 }), at("2026-11-13T12:00:00"), s);
  assert.equal(b.spent, 42.5);
  assert.equal(b.exhausted, false);
  assert.equal(b.ok, true);
});
test("cấu hình hệ thống: lần gọi đang chạy lúc sửa tay chỉ cộng phần sau lúc sửa; dòng không có t0 cộng cả", () => {
  const s = JSON.stringify({ spent: { usd: 80, at: "2026-11-13T03:00:00Z" } });
  const b = P.apiBudgetOf("", book(
    { t: "2026-11-13T03:10:00Z", t0: "2026-11-13T02:50:00Z", usd: 2 }, // 10/20 phút sau lúc sửa → 1
    { t: "2026-11-13T03:20:00Z", t0: "2026-11-13T03:05:00Z", usd: 3 }, // bắt đầu sau lúc sửa → cả 3
    { t: "2026-11-13T03:30:00Z", usd: 0.5 }), at("2026-11-13T12:00:00"), s);
  assert.equal(b.spent, 84.5);
});
test("cấu hình hệ thống: số sửa tay của kỳ trước không tính sang kỳ mới", () => {
  const s = JSON.stringify({ spent: { usd: 97, at: "2026-10-20T05:00:00" } });
  assert.equal(P.apiBudgetOf("", book({ t: "2026-11-05T05:00:00", usd: 3 }), at("2026-11-13T12:00:00"), s).spent, 3);
});
test("cấu hình hệ thống: việc đặt gói tháng; việc khác, tệp hỏng, không có tệp thì API", () => {
  const s = JSON.stringify({ use: { analysis: "plan", compare: "api" } });
  assert.equal(P.aiUseOf(s, "analysis"), "plan");
  assert.equal(P.aiUseOf(s, P.AI_TASK_OF.tlkt), "api");
  assert.equal(P.aiUseOf(s, ""), "api");
  assert.equal(P.aiUseOf("{hỏng", "analysis"), "api");
  assert.equal(P.aiUseOf("", "analysis"), "api");
  assert.equal(P.AI_TASK_OF.translation, undefined);
});

// ---------- câu trả lời một lần gọi bị cắt ----------
test("câu trả lời Claude bị cắt: dừng ở giới hạn đầu ra, lượt không hoàn tất, subtype lỗi; trọn vẹn thì rỗng", () => {
  assert.equal(P.askCut({ stop_reason: "max_tokens" }), "stop_reason max_tokens");
  assert.equal(P.askCut({ terminal_reason: "max_turns" }), "terminal_reason max_turns");
  assert.equal(P.askCut({ subtype: "error_during_execution" }), "error_during_execution");
  assert.equal(P.askCut({ stop_reason: "end_turn", terminal_reason: "completed", subtype: "success" }), "");
  assert.equal(P.askCut(null), "");
  assert.match(P.askTrace({ num_turns: 2, stop_reason: "end_turn", terminal_reason: "completed" }), /num_turns=2 .* — 2 lượt, kiểm tra$/);
});
