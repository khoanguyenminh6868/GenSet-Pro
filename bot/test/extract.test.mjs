// The browser snippets of the bot (history-extract.js, bidders-extract.js, search-extract.js) on the page data muasamcong
// loads (Vue $data), faked in Node (snippet.mjs). The page data is rebuilt from real tenders: the expected rows are the
// ones the bot stored from the real page (doc-cache bidhist/IB2400268027 of 09/11/2026, history-goods-audit.tsv), the
// feed signatures are those of Merge-GenBidFeed.ps1 run with Windows PowerShell 5.1 (the bot's) on the same tenders.
import test from "node:test";
import assert from "node:assert/strict";
import { runSnippet, vueRoot, table } from "./snippet.mjs";

// ---------- IB2400268027 (Codien, 3 phần lô; mẫu bảng nhiều phần lô dsHhKq[].dsHH, Khoa 2026-11-09) ----------
const VN = "vn0104265868", KB = "vn0305259631", TL = "vn0101396301", YS = "vn0106390078", TH = "vn0100369062", MK = "vn0105146253";
const row = (qty) => ({ // one row of the goods table, template BD.CG.02.0192 (fields named as the page names them)
  name: "Máy phát điện dầu 12kVA", codeGood: "EPS-FA12KVA", lableGood: "Excel Power", manufacturer: "Excel Power", origin: "China",
  yearGood: "Từ 1 năm trước thời điểm mở thầu trở về sau", qty, uom: "Tổ máy", bidPrice: 89560244,
  feature: "Chi tiết tại Hồ sơ kỹ thuật đính kèm E-HSDT", description: "Theo quy định tại Chương V.", maHS: "8502", amount: 89560244 * qty,
});
// The group heading row of the table: 0 in every cell.
const heading = { name: 0, codeGood: 0, lableGood: 0, manufacturer: 0, origin: 0, qty: 0, uom: 0, bidPrice: 0 };
const dsHhKq = [
  { lotNo: "PP2400048687", lotName: "Phần 1", contractorCode: VN, contractorName: "CÔNG TY CỔ PHẦN ĐẦU TƯ SẢN XUẤT VIỆT NHẬT", dsHH: [heading, row(387)], dsDvlq: [] },
  { lotNo: "PP2400048688", lotName: "Phần 2", contractorCode: VN, contractorName: "CÔNG TY CỔ PHẦN ĐẦU TƯ SẢN XUẤT VIỆT NHẬT", dsHH: [row(135)], dsDvlq: [] },
  // the table of a bidder that did not win the lot: not the goods of the result
  { lotNo: "PP2400048687", lotName: "Phần 1", contractorCode: KB, contractorName: "CÔNG TY CỔ PHẦN CÔNG NGHIỆP KIM BÌNH", dsHH: [{ ...row(387), codeGood: "KB-12", manufacturer: "Khác" }], dsDvlq: [] },
];
const c = (orgCode, orgFullname, price, o = {}) => ({ orgCode, orgFullname, lotOpenPrice: price, lotFinalPrice: price, bidResult: 0, ...o });
const kq268027 = () => ({
  bidPrice: 66607200000, decisionNo: "123/QĐ-MOBIFONE", decisionDate: "2024-12-10",
  lotResultDTO: [
    { lotNo: "PP2400048687", lotName: "Phần 1: Máy phát điện dầu 12kVA\n giao tại kho Khu vực 1", lotPrice: 49381200000, goodsList: JSON.stringify({ dsHhKq }),
      contractorList: [
        c(KB, "CÔNG TY CỔ PHẦN CÔNG NGHIỆP KIM BÌNH", 39164400000, { reason: "Xếp hạng 2" }),
        c(VN, "CÔNG TY CỔ PHẦN ĐẦU TƯ SẢN XUẤT VIỆT NHẬT", 34659814428, { ventureName: "LIÊN DANH VN", bidResult: 1, bidWiningPrice: 34659814428 }),
        c(TL, "CÔNG TY CỔ PHẦN XÂY LẮP VÀ THƯƠNG MẠI TRƯỜNG LỘC ", 45657448848, { ventureName: "LIÊN DANH TRƯỜNG LỘC - THIÊN HÒA AN", reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
        c(YS, "CÔNG TY TNHH YOOSUNG KN VIỆT NAM", 34446870000, { ventureName: "Liên danh Yoosung-HIDT", reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
      ] },
    // Phần 2 and 3 carry no list of their own (IB2400268027): the list of phần 1 is used, its rows of this lot taken.
    { lotNo: "PP2400048688", lotName: "Phần 2: Máy phát điện dầu 12kVA giao tại kho Khu vực 2", lotPrice: 17226000000, goodsList: "",
      contractorList: [
        c(KB, "CÔNG TY CỔ PHẦN CÔNG NGHIỆP KIM BÌNH", 13662000000, { reason: "Xếp hạng 2" }),
        c(VN, "CÔNG TY CỔ PHẦN ĐẦU TƯ SẢN XUẤT VIỆT NHẬT", 12090632940, { ventureName: "LIÊN DANH VN", bidResult: 1, bidWiningPrice: 12090632940 }),
        c(TH, "CÔNG TY TNHH THIÊN HOÀ AN", 16585158240, { reason: "Không đáp ứng yêu cầu về năng lực kinh nghiệm" }),
        c(MK, "CÔNG TY TNHH THIẾT BỊ CÔNG NGHỆ MAKAWA", 13506075000, { reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
        c(YS, "CÔNG TY TNHH YOOSUNG KN VIỆT NAM", 12016350000, { ventureName: "Liên danh Yoosung-HIDT", reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
      ] },
  ],
});
const GOODS_HEADS = ["STT", "Danh mục hàng hóa", "Ký mã hiệu", "Nhãn hiệu", "Năm sản xuất", "Xuất xứ", "Hãng sản xuất", "Cấu hình, tính năng kỹ thuật cơ bản", "Đơn vị tính", "Khối lượng mời thầu", "Mã HS", "Đơn giá dự thầu", "Thành tiền"];
// The goods row as the bot stored it from the real page (doc-cache bidhist/IB2400268027).
const STORED_GOODS = (qty) => ({ qty, code: "EPS-FA12KVA", desc: "Chi tiết tại Hồ sơ kỹ thuật đính kèm E-HSDT | Theo quy định tại Chương V.", name: "Máy phát điện dầu 12kVA",
  unit: "Tổ máy", year: "Từ 1 năm trước thời điểm mở thầu trở về sau", label: "Excel Power", maker: "Excel Power", origin: "China", unitPrice: 89560244 });
const bidder = (name, taxCode, price, o = {}) => ({ name, taxCode, venture: "", bidPrice: price, discount: "", finalPrice: price, won: false, winPrice: null, reason: "", rank: null, ...o });

test("lịch sử, mẫu nhiều phần lô (IB2400268027): mỗi phần lấy đúng dòng hàng của phần đó và của nhà thầu trúng, giá và nhà thầu như bản đã lưu", async () => {
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq268027() } }), tables: [table(GOODS_HEADS)] });
  assert.equal(r.final, true);
  assert.equal(r.source, "kqlcnt");
  assert.equal(r.lots.length, 2);
  const [l1, l2] = r.lots;
  assert.equal(l1.lotNo, "PP2400048687");
  assert.equal(l1.lotName, "Phần 1: Máy phát điện dầu 12kVA giao tại kho Khu vực 1", "khoảng trắng / xuống dòng trong tên phần gộp lại");
  assert.equal(l1.price, 49381200000);
  assert.deepEqual(l1.goods, [STORED_GOODS(387)], "dòng tiêu đề nhóm (toàn 0) và bảng của nhà thầu không trúng bị bỏ");
  assert.deepEqual(l2.goods, [STORED_GOODS(135)], "phần 2 không có danh sách riêng: dùng danh sách chung, lọc theo lotNo");
  assert.deepEqual(l1.bidders, [
    bidder("CÔNG TY CỔ PHẦN CÔNG NGHIỆP KIM BÌNH", "0305259631", 39164400000, { reason: "Xếp hạng 2" }),
    bidder("CÔNG TY CỔ PHẦN ĐẦU TƯ SẢN XUẤT VIỆT NHẬT", "0104265868", 34659814428, { venture: "LIÊN DANH VN", won: true, winPrice: 34659814428 }),
    bidder("CÔNG TY CỔ PHẦN XÂY LẮP VÀ THƯƠNG MẠI TRƯỜNG LỘC ", "0101396301", 45657448848, { venture: "LIÊN DANH TRƯỜNG LỘC - THIÊN HÒA AN", reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
    bidder("CÔNG TY TNHH YOOSUNG KN VIỆT NAM", "0106390078", 34446870000, { venture: "Liên danh Yoosung-HIDT", reason: "Không đáp ứng yêu cầu về kỹ thuật" }),
  ]);
  assert.equal(l2.bidders.length, 5);
  assert.equal(r.packagePrice, 66607200000);
  assert.equal(r.decisionNo, "123/QĐ-MOBIFONE");
  assert.equal(r.audit, undefined, "mẫu bảng đã biết (kể cả cột Mã HS, trường maHS, amount): không báo kiểm mẫu");
});

test("lịch sử, mẫu cũ formValue.lotContent.Table: chỉ bảng của nhà thầu trúng; nhãn hiệu là mã HS (8502) thì bỏ", async () => {
  const goods = [
    { contractorCode: "vn0101", formValue: { lotContent: { Table: [{ name: "Máy phát điện 100 kVA", codeGood: "C110D5", label: "8502", labelGood: "", manufacturer: "Cummins", origin: "Ấn Độ", quantity: "2", unit: "Bộ", priceUnit: "694800000", description: "Động cơ Cummins 6BTAA5.9-G2" }] } } },
    { contractorCode: "vn0202", formValue: { lotContent: { Table: [{ name: "Máy phát điện 100 kVA", codeGood: "X", manufacturer: "Khác" }] } } },
  ];
  const kq = { bidPrice: 1, lotResultDTO: [{ lotNo: "", lotName: "", lotPrice: 1400000000, goodsList: JSON.stringify(goods),
    contractorList: [c("vn0101", "A", 1389600000, { bidResult: 1, bidWiningPrice: 1389600000 }), c("vn0202", "B", 1300000000)] }] };
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }), tables: [table(GOODS_HEADS)] });
  assert.deepEqual(r.lots[0].goods, [{ name: "Máy phát điện 100 kVA", code: "C110D5", label: "", maker: "Cummins", origin: "Ấn Độ", year: "", qty: 2, unit: "Bộ", unitPrice: 694800000, desc: "Động cơ Cummins 6BTAA5.9-G2" }]);
});

test("lịch sử, kiểm mẫu bảng (Khoa 07/11): trường lạ có giá trị, khoá lạ của dsHhKq, cột lạ được báo; trường lạ rỗng thì không", async () => {
  const k = kq268027();
  const list = JSON.parse(k.lotResultDTO[0].goodsList);
  list.dsHhKq[0].dsHH[1].reqLabel = "G7"; // seen on IB2400166974 (genbid-bot-logs\history-goods-audit.tsv, 09/11)
  list.dsHhKq[0].dsHH[1].reqOrigin = ""; // empty: not reported
  list.dsHhKq[0].lotAmount = 5; // an unknown key of the wrapper
  k.lotResultDTO[0].goodsList = JSON.stringify(list);
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: k } }), tables: [table([...GOODS_HEADS, "Cột mới"])] });
  assert.deepEqual(r.audit.map((a) => [a.kind, a.what, a.sample]), [["shape", "dsHhKq.lotAmount", "5"], ["field", "reqLabel", "G7"], ["header", "Cột mới", [...GOODS_HEADS, "Cột mới"].join(" | ")]]);
  assert.deepEqual(r.lots[0].goods, [STORED_GOODS(387)], "kiểm mẫu không làm mất dòng hàng");
});

test("lịch sử, gói dịch vụ (goodsList object listTG/listDG): không có dòng hàng, không báo kiểm mẫu", async () => {
  const kq = { lotResultDTO: [{ lotNo: "", lotPrice: 5, goodsList: JSON.stringify({ listTG: [{ name: "Bảo dưỡng 500 giờ" }], listDG: [] }), contractorList: [c("vn1", "A", 5, { bidResult: 1 })] }] };
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }) });
  assert.deepEqual(r.lots[0].goods, []);
  assert.equal(r.audit, undefined);
});

test("lịch sử, biên bản mở thầu (chưa có kết quả): theo phần, final=false, không ai trúng", async () => {
  const mt = { bidSubmissionDTOList: [
    { contractorName: "A", contractorCode: "vn0101", lotNoValueDTOList: [{ lotNo: "L1", lotName: "Phần 1", lotPrice: 100, lotFinalPrice: 95, saleNumber: 5 }, { lotNo: "L2", lotName: "Phần 2", lotPrice: 200, lotFinalPrice: 200 }] },
    { contractorName: "B", contractorCode: "0202", bidPrice: 90, bidFinalPrice: 90, lotNoValueDTOList: [] },
  ] };
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlRoundMngRes: { bidSubmissionByContractorViewResponse: mt } }) });
  assert.equal(r.final, false);
  assert.deepEqual(r.lots.map((l) => [l.lotNo, l.bidders.map((b) => [b.taxCode, b.bidPrice, b.discount, b.finalPrice, b.won])]), [
    ["L1", [["0101", 100, "5%", 95, false]]], ["L2", [["0101", 200, "", 200, false]]], ["", [["0202", 90, "", 90, false]]]]);
});

test("lịch sử: chào giá rút gọn chỉ tải KQLCNT khi bấm tab 'Kết quả lựa chọn nhà thầu' (bấm ở lần chờ thứ 5)", async () => {
  const data = { dtlKqlcnt: {}, isLoadedKqlcnt: false };
  let clicks = 0;
  const a = { textContent: " Kết quả lựa chọn nhà thầu ", click() { clicks++; data.dtlKqlcnt = { bideContractorInputResultDTO: kq268027() }; } };
  const r = await runSnippet("history-extract.js", { root: vueRoot(data), anchors: [a], search: "?notifyNo=IB1&step=kqlcnt", tables: [table(GOODS_HEADS)] });
  assert.equal(clicks, 1);
  assert.equal(r.final, true);
});

test("lịch sử: trang chưa có dữ liệu (CAPTCHA, chưa mở thầu) thì trả lỗi, không trả danh sách rỗng", async () => {
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: null }) });
  assert.match(r.error, /chưa có biên bản mở thầu hoặc kết quả/);
});

// ---------- bidders-extract.js (Nhà thầu tham dự) ----------
test("nhà thầu: nhà thầu trúng đứng đầu rồi theo giá sau giảm, mã số thuế bỏ 'vn', ghi chú phần lô / giá trúng / lý do", async () => {
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq268027() } }), search: "?notifyNo=IB2400268027&step=kqlcnt" });
  assert.equal(r.notifyNo, "IB2400268027");
  assert.equal(r.final, true);
  const p1 = r.list.filter((x) => x.note.startsWith("Phần 1"));
  assert.equal(r.list[0].won, true);
  assert.equal(r.list[1].won, true, "hai phần, hai lần trúng");
  assert.deepEqual(r.list.slice(2).map((x) => x.priceAfterDiscount), [...r.list.slice(2).map((x) => x.priceAfterDiscount)].sort((a, b) => a - b));
  assert.deepEqual(r.list.map((x) => x.rank), r.list.map((_, i) => i + 1));
  const won1 = p1.find((x) => x.won);
  assert.equal(won1.taxCode, "0104265868");
  assert.match(won1.note, /^Phần 1: Máy phát điện dầu 12kVA\n giao tại kho Khu vực 1 · Trúng thầu, giá trúng 34\.659\.814\.428/);
  assert.equal(p1.find((x) => x.taxCode === "0101396301").note.split(" · ")[1], "Không được chọn: Không đáp ứng yêu cầu về kỹ thuật");
});

test("nhà thầu, mẫu cũ: hàng chào chỉ của nhà thầu trúng (hãng, model, xuất xứ; tối đa 4 dòng)", async () => {
  const goods = [{ contractorCode: "vn0101", formValue: { lotContent: { Table: [{ labelGood: "Cummins", codeGood: "C110D5", origin: "Ấn Độ" }] } } },
    { contractorCode: "vn0202", formValue: { lotContent: { Table: [{ labelGood: "Khác", codeGood: "X" }] } } }];
  const kq = { lotResultDTO: [{ lotName: "x", goodsList: JSON.stringify(goods), contractorList: [c("vn0202", "B", 90), c("vn0101", "A", 100, { bidResult: 1, bidWiningPrice: 100 })] }] };
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }) });
  assert.deepEqual(r.list.map((x) => [x.taxCode, x.won, x.note]), [["0101", true, "Trúng thầu, giá trúng 100 · Hàng chào: Cummins C110D5 (Ấn Độ)"], ["0202", false, ""]]);
});

test("nhà thầu, mẫu BD.CG.02.0192 nhiều phần lô: ghi chú 'Hàng chào' của nhà thầu trúng", { todo: "bidders-extract.js chỉ đọc formValue.lotContent.Table + labelGood; mẫu dsHhKq[].dsHH (lableGood) của history-extract.js không được đọc nên nhà thầu trúng không có hàng chào" }, async () => {
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq268027() } }) });
  assert.match(r.list.find((x) => x.won).note, /Hàng chào: Excel Power EPS-FA12KVA \(China\)/);
});

test("nhà thầu: tệp Báo cáo đánh giá E-HSDT lấy từ reportFileId và evalReportFileInfo của component con, chỉ mã UUID, không trùng", async () => {
  const id1 = "0f33c4a7-af4a-4b51-bb14-636598d98270", id2 = "A7EDB1BF-B208-403E-8858-4928D929D60E";
  const child = { $data: { evalReportFileInfo: [{ fileId: id2, fileName: "BCĐG.pdf" }, { fileId: id1, name: "lặp" }, { fileId: "123", fileName: "không phải UUID" }] }, $children: [] };
  const kq = { ...kq268027(), reportFileId: id1, reportFileName: "Báo cáo đánh giá.pdf" };
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }, [child]) });
  assert.deepEqual(r.reportFiles, [{ id: id1, name: "Báo cáo đánh giá.pdf" }, { id: id2, name: "BCĐG.pdf" }]);
});

test("nhà thầu, biên bản mở thầu: một dòng mỗi phần khi nộp nhiều phần, chưa ai trúng, final=false", async () => {
  const mt = { bidSubmissionDTOList: [
    { contractorName: "A", contractorCode: "vn0101", bidPrice: 300, saleNumber: 0, lotNoValueDTOList: [{ lotName: "P1", lotPrice: 100, lotFinalPrice: 100 }, { lotName: "P2", lotPrice: 200, lotFinalPrice: 190, saleNumber: 5 }] },
    { contractorName: "B", contractorCode: "vn0202", bidPrice: 150, bidFinalPrice: 150, saleNumber: 2, lotNoValueDTOList: [{ lotName: "P1" }] },
  ] };
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlRoundMngRes: { bidSubmissionByContractorViewResponse: mt } }) });
  assert.equal(r.final, false);
  assert.deepEqual(r.list.map((x) => [x.taxCode, x.note, x.bidPrice, x.discount, x.priceAfterDiscount]), [["0101", "P1", 100, "", 100], ["0202", "", 150, "2", 150], ["0101", "P2", 200, "5", 190]]);
});

test("nhà thầu: trang chưa có kết quả thì trả lỗi kèm số TBMT", async () => {
  const r = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlRoundMngRes: {} }), search: "?notifyNo=IB2500000001" });
  assert.equal(r.notifyNo, "IB2500000001");
  assert.match(r.error, /chưa có biên bản mở thầu/);
});

// ---------- search-extract.js (Sync: tìm gói mới / đổi) ----------
// Two rows of muasamcong's search (listResultSearch) as the feed knows them; signatures from Merge-GenBidFeed.ps1 -Mode Sigs
// (PowerShell 5.1) on the same tenders in feed shape (genbid-test\t5-run\sig-current.json).
const ROW_268027 = { id: "0f33c4a7-af4a-4b51-bb14-636598d98270", notifyNo: "IB2400268027", notifyVersion: "00", planNo: "PL2400083420", bidForm: "DTRR", bidMode: "1_MTHS", processApply: "LDT",
  bidName: ["Mua sắm máy phát điện  dầu 12kVA"], bidCloseDate: "2024-10-21T10:00:00", bidOpenDate: "2024-10-21T10:00:00", publicDate: "2024-10-01T08:00:00", bidPrice: [49381200000],
  investorName: "Tổng công ty Viễn thông MobiFone", procuringEntityName: "Tổng công ty Viễn thông MobiFone", locations: [{ provName: "Hà Nội" }], isInternet: 1, statusForNotify: "DDT", investField: ["HH"] };
const ROW_CANCELLED = { id: "x", notifyNo: "IB2200001635", notifyVersion: "01", bidName: "Máy phát điện 100 kVA", bidCloseDate: "2022-01-20T09:00:00", bidOpenDate: "2022-01-20T09:30:00",
  bidPrice: [16000000000], investorName: "Bệnh viện", locations: [{ provName: "Lâm Đồng" }, { provName: "Đắk Nông" }], isInternet: true, statusForNotify: "DHTBMT" };
const PS_SIG = { IB2400268027: "8956e3cf2c85", IB2200001635: "73cf8d5ec4cd" };
const searchPage = (list) => { const child = { $data: { listResultSearch: list }, $children: [] }; return { all: [{ __vue__: { $root: { $data: {}, $children: [child] } } }] }; };

test("tìm thầu: gói đã có trong feed với chữ ký trùng PowerShell (Merge-GenBidFeed.ps1) thì không tính là đổi", async () => {
  const r = await runSnippet("search-extract.js", searchPage([ROW_268027, ROW_CANCELLED]), { __KNOWN__: JSON.stringify(PS_SIG) });
  assert.equal(r.count, 2);
  assert.deepEqual(r.present, ["IB2400268027", "IB2200001635"]);
  assert.deepEqual(r.changed, [], "chữ ký của search-extract.js khớp Merge-GenBidFeed.ps1 (giờ VN đổi ra UTC, tên gộp khoảng trắng, gói huỷ)");
});

test("tìm thầu: gói mới / chữ ký khác thì đủ trường feed; giờ VN sang UTC; Đã hủy TBMT (DHTBMT) thành cancelled; link bước TBMT", async () => {
  const r = await runSnippet("search-extract.js", searchPage([ROW_268027, ROW_CANCELLED]), { __KNOWN__: JSON.stringify({ IB2400268027: "cu" }) });
  assert.equal(r.changed.length, 2);
  const [a, b] = r.changed;
  assert.equal(a.bidName, "Mua sắm máy phát điện dầu 12kVA");
  assert.equal(a.bidCloseDate, "2024-10-21T03:00:00.000Z");
  assert.equal(a.estimatedPrice, 49381200000);
  assert.equal(a.location, "Hà Nội");
  assert.equal(a.field, "HH");
  assert.equal(a.status, "open");
  assert.equal(a.isInternet, true);
  const u = new URL(a.sourceUrl);
  assert.equal(u.hostname, "muasamcong.mof.gov.vn");
  assert.equal(u.searchParams.get("stepCode"), "notify-contractor-step-1-tbmt");
  assert.equal(u.searchParams.get("notifyNo"), "IB2400268027");
  assert.equal(u.searchParams.get("inputResultId"), "undefined");
  assert.equal(b.status, "cancelled");
  assert.equal(b.location, "Lâm Đồng, Đắk Nông");
  assert.equal(b.procuringEntityName, undefined, "không có bên mời thầu thì không có trường (chữ ký coi như rỗng)");
});

test("tìm thầu: trang chưa có kết quả (CAPTCHA) thì trả lỗi", async () => {
  const r = await runSnippet("search-extract.js", { all: [] }, { __KNOWN__: "{}" });
  assert.match(r.error, /Không thấy kết quả tìm kiếm/);
});
