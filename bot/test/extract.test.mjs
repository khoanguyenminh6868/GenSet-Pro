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

// ---------- Rà soát lệch dòng / cột 17/11/2026: ca lấy từ dòng thô của trang thật (dumpH.cjs, 81 gói) ----------
const hist = async (kq) => (await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }), tables: [table(GOODS_HEADS)] }));
const fv = (contractorCode, Table) => ({ formCode: "X", lotNo: "BP1", contractorCode, formValue: { lotContent: { Table, amount: 1 } } });

test("lịch sử, mẫu hàng nhập khẩu (IB2300296794): trường unitPrice là thành tiền, đơn giá là priceIncludeTax", async () => {
  const r296794 = { name: "Máy phát điện công suất ≥ 20 KVA", quantity: 100, unit: "Bộ", unitPrice: 60899000000, amount: 60899000000, amountBeforeTax: 60899000000, priceIncludeTax: 608990000, priceExcludeTax: 608990000 };
  const r371415 = { name: "Tổ máy phát điện, 1 pha, 230V, 50Hz, 5kW", quantity: 10, unit: "Bộ", unitPrice: 4360000000, amount: 4708800000, amountBeforeTax: 4360000000, priceIncludeTax: 436000000, priceExcludeTax: 436000000 };
  const kq = { lotResultDTO: [{ lotNo: "BP1", lotPrice: 66100000000, goodsList: JSON.stringify([fv("vn1", [r296794, r371415])]), contractorList: [c("vn1", "A", 60899000000, { bidResult: 1, bidWiningPrice: 60899000000 })] }] };
  const g = (await hist(kq)).lots[0].goods;
  assert.deepEqual(g.map((x) => [x.qty, x.unitPrice]), [[100, 608990000], [10, 436000000]], "trước đây 100 máy × 60,9 tỷ");
});

test("lịch sử: unitPrice trơ bằng thành tiền của dòng nhiều chiếc thì không là đơn giá; một chiếc hoặc không có thành tiền thì giữ", async () => {
  const rows = [
    { name: "A", quantity: 2, unitPrice: 4196880000, amount: 4196880000 },
    { name: "B", quantity: 1, unitPrice: 500, amount: 500 },
    { name: "C", quantity: 3, unitPrice: 700 },
    { name: "D", quantity: 20, bidPrice: 119880000, amount: 2397600000 },
  ];
  const kq = { lotResultDTO: [{ lotNo: "BP1", lotPrice: 1, goodsList: JSON.stringify([fv("vn1", rows)]), contractorList: [c("vn1", "A", 1, { bidResult: 1 })] }] };
  assert.deepEqual((await hist(kq)).lots[0].goods.map((x) => x.unitPrice), [null, 500, 700, 119880000]);
});

test("lịch sử, mẫu cũ lặp cả danh sách bảng (IB2200053768): bảng y hệt của cùng nhà thầu lấy một lần; dòng y hệt trong một bảng thì giữ", async () => {
  const tab = [{ name: "Máy phát điện 1 pha, công suất 12,5KVA", quantity: 20, bidPrice: 119880000, amount: 2397600000 }, { name: "Tủ ATS 65A", quantity: 20, bidPrice: 3300000, amount: 66000000 }];
  const other = [{ name: "Máy phát điện 1 pha, công suất 12,5KVA", quantity: 20, bidPrice: 117720000 }];
  const kq = { lotResultDTO: [{ lotNo: "BP1", lotPrice: 2662000000, goodsList: JSON.stringify([fv("vn1", tab), fv("vn2", other), fv("vn1", tab), fv("vn2", other)]),
    contractorList: [c("vn1", "A", 2463600000, { bidResult: 1, bidWiningPrice: 2463600000 }), c("vn2", "B", 2505600000)] }] };
  const g = (await hist(kq)).lots[0].goods;
  assert.deepEqual(g.map((x) => [x.name, x.qty, x.unitPrice]), [["Máy phát điện 1 pha, công suất 12,5KVA", 20, 119880000], ["Tủ ATS 65A", 20, 3300000]], "trước đây 4 dòng, Σ gấp đôi giá trúng");
  // IB2200100465: cùng một món cho nhiều nơi nhận là dòng thật.
  const same = { name: "Máy vi tính", quantity: 3, bidPrice: 14990000, amount: 44970000 };
  const kq2 = { lotResultDTO: [{ lotNo: "BP1", lotPrice: 1, goodsList: JSON.stringify([fv("vn1", [same, same, same])]), contractorList: [c("vn1", "A", 1, { bidResult: 1 })] }] };
  assert.equal((await hist(kq2)).lots[0].goods.length, 3);
});

test("lịch sử: bảng hàng hoá hơn 100 dòng không còn bị cắt (IB2300203745: 279 dòng)", async () => {
  const rows = Array.from({ length: 279 }, (_, i) => ({ name: "Ắc quy " + i, quantity: 5, bidPrice: 2200000, amount: 11000000 }));
  const kq = { lotResultDTO: [{ lotNo: "BP1", lotPrice: 1, goodsList: JSON.stringify([fv("vn1", rows)]), contractorList: [c("vn1", "A", 1, { bidResult: 1 })] }] };
  const r = await hist(kq);
  assert.equal(r.lots[0].goods.length, 279);
  assert.equal(r.audit, undefined);
});

test("lịch sử, mẫu mảng dòng nhiều phần lô (IB2600064877): dòng của mọi phần nằm ở phần đầu, mỗi phần chỉ lấy dòng mang lotNo của nó", async () => {
  const goods = [
    { lotNo: "PP2600065830", contractorCode: KB, name: "Máy phát điện dầu 30kVA", unit: "Tổ máy", quantity: 312, origin: "Việt Nam", code: 8502, priceUnit: 116640000 },
    { lotNo: "PP2600065831", contractorCode: VN, name: "Máy phát điện dầu 20kVA", unit: "Tổ máy", quantity: 1263, origin: "Trung Quốc", code: 8502, priceUnit: 93639251 },
  ];
  const kq = { lotResultDTO: [
    { lotNo: "PP2600065830", lotPrice: 43804800000, goodsList: JSON.stringify(goods), contractorList: [c(VN, "VN", 39328086096), c(KB, "KB", 36391680000, { bidResult: 1, bidWiningPrice: 36391680000 })] },
    { lotNo: "PP2600065831", lotPrice: 131245200720, goodsList: "[]", contractorList: [c(VN, "VN", 118266374013, { bidResult: 1, bidWiningPrice: 118266374013 }), c(KB, "KB", 122763600000)] },
  ] };
  const r = await hist(kq);
  assert.deepEqual(r.lots.map((l) => l.goods.map((x) => [x.name, x.qty, x.unitPrice])), [[["Máy phát điện dầu 30kVA", 312, 116640000]], [["Máy phát điện dầu 20kVA", 1263, 93639251]]],
    "trước đây phần 1 nhận cả hai dòng (Σ gấp 4,25 lần giá trúng), phần 2 không có dòng nào");
  assert.equal(312 * 116640000, 36391680000);
  assert.equal(1263 * 93639251, 118266374013);
  assert.equal(r.audit, undefined);
});

test("lịch sử: mảng dòng không mang lotNo (gói một phần, IB2600041928) đọc như cũ", async () => {
  const goods = [{ id: "x", name: "Màn hình giám sát điều khiển HMI", quantity: 2, unit: "Bộ", origin: "Đức", priceUnit: 29352240 }];
  const kq = { lotResultDTO: [{ lotNo: "BP2500854425", lotPrice: 1, goodsList: JSON.stringify(goods), contractorList: [c("vn1", "A", 1, { bidResult: 1 })] }] };
  assert.deepEqual((await hist(kq)).lots[0].goods.map((x) => [x.qty, x.unitPrice]), [[2, 29352240]]);
});

test("lịch sử: nhà thầu lặp trong danh sách của một phần, chỉ khác id (IB2200019427: trúng ba lần) chỉ lấy một", async () => {
  const w = (id) => ({ id, ...c("vn0100684716", "A", 2462400000, { bidResult: 1, bidWiningPrice: 2462400000 }) });
  const kq = { lotResultDTO: [{ lotNo: "BP2200166592", lotPrice: 2165000000, goodsList: "[]", contractorList: [{ id: "0", ...c("vn0400562719", "B", 2165000000) }, w("1"), w("2"), w("3")] }] };
  const r = await hist(kq);
  assert.deepEqual(r.lots[0].bidders.map((b) => [b.taxCode, b.won]), [["0400562719", false], ["0100684716", true]]);
  const b = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }) });
  assert.equal(b.list.length, 2);
});

test("lịch sử, kiểm mẫu bảng (Khoa 07/11): trường lạ có giá trị, khoá lạ của dsHhKq, cột lạ được báo; trường lạ rỗng thì không", async () => {
  const k = kq268027();
  const list = JSON.parse(k.lotResultDTO[0].goodsList);
  list.dsHhKq[0].dsHH[1].reqCountry = "G7"; // an invented unknown field (reqLabel is now a known field, see the next test)
  list.dsHhKq[0].dsHH[1].reqOther = ""; // empty: not reported
  list.dsHhKq[0].lotAmount = 5; // an unknown key of the wrapper
  k.lotResultDTO[0].goodsList = JSON.stringify(list);
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: k } }), tables: [table([...GOODS_HEADS, "Cột mới"])] });
  assert.deepEqual(r.audit.map((a) => [a.kind, a.what, a.sample]), [["shape", "dsHhKq.lotAmount", "5"], ["field", "reqCountry", "G7"], ["header", "Cột mới", [...GOODS_HEADS, "Cột mới"].join(" | ")]]);
  assert.deepEqual(r.lots[0].goods, [STORED_GOODS(387)], "kiểm mẫu không làm mất dòng hàng");
});

test("lịch sử: reqLabel = yêu cầu xuất xứ của E-HSMT (IB2400166974: reqLabel G7, origin G7; IB2400440445: reqLabel dài, origin 'Lắp ráp tại Việt Nam') đọc vào reqOrigin, không báo kiểm mẫu, không đổi origin", async () => {
  const long = "Máy phát điện công suất:  15KVA/16,5KVA, 3 pha và có vỏ chống ồn, lắp giáp tại Việt Nam ( động cơ Mitsubish  và đầu phát Leroy Somer - Xuất xứ Ấn độ )";
  const rows = [
    { name: "Piston", uom: "cái", qty: 12, description: "Theo quy định tại Chương V.", reqLabel: "G7", origin: "G7", manufacturer: "Cummins", bidPrice: 10780000, amount: 129360000 },
    { name: "Máy phát điện 15KVA", uom: "Tổ máy", qty: 1, reqLabel: long, origin: "Lắp ráp tại Việt Nam", bidPrice: 5, amount: 5 },
    { name: "Bộ lọc", uom: "cái", qty: 2, reqLabel: null, origin: "Việt Nam", bidPrice: 3, amount: 6 },
    { name: "Dây", uom: "m", qty: 2, reqLabel: "   ", origin: "Việt Nam", bidPrice: 3, amount: 6 },
    { name: "Lõi", uom: "cái", qty: 2, reqLabel: "X".repeat(900), origin: "", bidPrice: 3, amount: 6 },
  ];
  const kq = { lotResultDTO: [{ lotNo: "PP1", lotPrice: 1, goodsList: JSON.stringify({ dsHhKq: [{ lotNo: "PP1", contractorCode: "vn1", dsHH: rows, dsDvlq: [] }], dsDvlqKq: [] }), contractorList: [c("vn1", "A", 1, { bidResult: 1 })] }] };
  const r = await runSnippet("history-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }), tables: [table(GOODS_HEADS)] });
  assert.equal(r.audit, undefined, "reqLabel không còn là trường lạ");
  assert.deepEqual(r.lots[0].goods.map((g) => [g.name, g.origin, g.reqOrigin]), [
    ["Piston", "G7", "G7"],
    ["Máy phát điện 15KVA", "Lắp ráp tại Việt Nam", long.replace(/\s+/g, " ")],
    ["Bộ lọc", "Việt Nam", undefined],
    ["Dây", "Việt Nam", undefined],
    ["Lõi", "", "X".repeat(500)],
  ]);
  assert.ok(!("reqOrigin" in r.lots[0].goods[2]), "không có yêu cầu thì không thêm khoá");
  const b = await runSnippet("bidders-extract.js", { root: vueRoot({ dtlKqlcnt: { bideContractorInputResultDTO: kq } }), search: "?notifyNo=IB1&step=kqlcnt" });
  assert.equal(b.audit, undefined);
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

test("nhà thầu, mẫu BD.CG.02.0192 nhiều phần lô: ghi chú 'Hàng chào' của nhà thầu trúng", async () => {
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
