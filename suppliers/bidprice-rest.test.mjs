// node --test suppliers/bidprice-rest.test.mjs — các hàm thuần của web/bidprice.js (globalThis.GenbidBidprice) mà trước đây
// không tệp test nào nhắc tới (đợt phủ test 13/11/2026, việc T1): cfgKva, cfgPower, readTerms, quoteStale, compRows,
// lockStats, nbBucket, wonTokens, wonSetRow, vnMadeSet, placeOf, taxKey, bdPrice, compareCfg, engineGroup, engineWords,
// costHints, capPick. Số mong đợi tính tay từ quy tắc nghiệp vụ / chú thích trong mã (kW ÷ 0,8 = kVA; 1 MVA = 1000 kVA;
// ngày tháng kiểu Việt dd/mm/yyyy; hàng thuộc nhóm "giá lẻ" không phải tổ máy…), không chép từ đầu ra của code.
// Ca `todo`: lỗi / khoảng trống đã đo trên genbid-work\doc-cache\bidhist.json (1.556 gói, 13/11), CHƯA sửa; hỏng không
// làm đỏ CI, khi sửa xong thì bỏ `todo`. Danh sách: genbid-work\dieu-phoi\nghiem-thu\test-t1.md.
import test from "node:test";
import assert from "node:assert/strict";
import "./config-bot.mjs"; // nạp web/catalog.js và web/bidprice.js vào globalThis

const BP = globalThis.GenbidBidprice;

// ---------- Công suất đọc từ HSMT đã phân tích ----------
test("cfgKva: kW chia 0,8 ra kVA, MVA nhân 1000, kVA giữ nguyên; một lô lấy cỡ lớn nhất", () => {
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "kW", v: 400 }] } }), 500); // 400 kW / 0,8
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "MVA", v: 1.25 }] } }), 1250);
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "kVA", v: 250 }, { u: "kVA", v: 500 }] } }), 500);
});

test("cfgKva: nhiều lô chỉ nhận khi HSMT ghi đúng một cỡ (không biết cỡ nào của lô nào)", () => {
  const two = { config: { kvas: [{ u: "kVA", v: 250 }, { u: "kVA", v: 500 }] } };
  assert.equal(BP.cfgKva(two, true), null);
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "kVA", v: 500 }, { u: "kVA", v: 500 }] } }, true), 500); // cùng một cỡ ghi hai lần
  // 400 kW và 500 kVA là cùng một cỡ sau khi quy đổi.
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "kW", v: 400 }, { u: "kVA", v: 500 }] } }, true), 500);
});

test("cfgKva: số rác (< 1), thiếu config, config rỗng → null", () => {
  assert.equal(BP.cfgKva({ config: { kvas: [{ u: "kVA", v: 0.5 }, { u: "kVA", v: 0 }] } }), null);
  assert.equal(BP.cfgKva({ config: {} }), null);
  assert.equal(BP.cfgKva({}), null);
  assert.equal(BP.cfgKva(undefined), null);
});

test("cfgPower: tổ máy ghi kW thì quy ra kVA; chỉ có dự phòng thì hạng là standby", () => {
  assert.deepEqual(BP.cfgPower({ config: { sets: [{ primeKw: 200 }] } }), { kva: 250, rating: "prime" });
  assert.deepEqual(BP.cfgPower({ config: { sets: [{ standbyKva: 275 }] } }), { kva: 275, rating: "standby" });
  // Có cả hai: công suất liên tục thắng.
  assert.deepEqual(BP.cfgPower({ config: { sets: [{ primeKva: 250, standbyKva: 275 }] } }), { kva: 250, rating: "prime" });
});

test("cfgPower: văn bản chỉ nói công suất dự phòng → standby; dòng của riêng động cơ không tính cho tổ máy", () => {
  assert.deepEqual(BP.cfgPower({ config: { text: "Máy phát điện công suất dự phòng 275 kVA" } }), { kva: 275, rating: "standby" });
  // "Động cơ: công suất liên tục ≥ 320 kW" là của động cơ (kW trục), không phải công suất tổ máy.
  assert.equal(BP.cfgPower({ config: { text: "Động cơ: công suất liên tục ≥ 320 kW" } }), null);
});

test("cfgPower: nhiều lô có hai cỡ khác nhau trong sets → không đoán; không dữ liệu → null", () => {
  assert.equal(BP.cfgPower({ config: { sets: [{ primeKva: 250 }, { primeKva: 500 }] } }, true), null);
  assert.deepEqual(BP.cfgPower({ config: { sets: [{ primeKva: 250 }, { primeKva: 500 }] } }, false), { kva: 500, rating: "prime" });
  assert.equal(BP.cfgPower({}), null);
  assert.equal(BP.cfgPower(null), null);
});

test("capPick: bỏ số của máy biến áp / UPS, lấy số sau chữ \"máy phát\" (tên gói thật có cả hai)", () => {
  const pick = (t) => { const m = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*kva/gi)]; const p = BP.capPick(t, m); return p ? Number(p[1]) : null; };
  assert.equal(pick("Trạm biến áp 400kVA; máy phát điện 350kVA"), 350);
  assert.equal(pick("UPS 10KVA và máy phát điện 5KVA"), 5);
  assert.equal(pick("Máy biến áp 400kVA"), null); // mọi số đều của thiết bị khác
  assert.equal(pick("Mua sắm máy phát điện 500kVA"), 500);
});

// ---------- Mã số thuế, giá dự thầu ----------
test("taxKey: lấy chữ số của mã số thuế (bỏ dấu cách, dấu chấm); không có MST thì dùng tên viết hoa", () => {
  assert.equal(taxOf({ taxCode: "0101 234.567" }), "0101234567");
  assert.equal(taxOf({ taxCode: "0101234567", name: "Công ty A" }), "0101234567");
  assert.equal(taxOf({ taxCode: "", name: "  Công ty abc " }), "CÔNG TY ABC");
  assert.equal(taxOf({ taxCode: "N/A", name: "Liên danh X" }), "LIÊN DANH X"); // MST rác không có chữ số
  assert.equal(taxOf({}), "");
});
// taxKey không xuất ra; đo qua compRows (win / taxes dùng nó).
function taxOf(b) {
  const docs = { IB2600000001: { bidName: "Mua sắm máy phát điện 500kVA", final: true, lots: [{ price: 1e9, bidders: [{ ...b, won: true, winPrice: 9e8 }] }] } };
  return BP.compRows(docs)[0].win;
}

test("bdPrice: giá sau giảm (finalPrice) thắng giá nộp; thiếu thì dùng giá nộp", () => {
  const price = (b) => { const d = { IB2600000002: { bidName: "Mua sắm máy phát điện 500kVA", final: true, lots: [{ price: 1000, bidders: [{ taxCode: "1", won: true, ...b }] }] } }; return BP.compRows(d)[0].ratio; };
  // Không có winPrice: giá trúng lấy theo bdPrice → 900/1000 = 0,9 (finalPrice) chứ không phải 950/1000.
  assert.equal(price({ bidPrice: 950, finalPrice: 900 }), 0.9);
  assert.equal(price({ bidPrice: 950 }), 0.95);
  assert.equal(price({ bidPrice: 950, finalPrice: null }), 0.95);
});

// ---------- Hàng trúng thầu: tổ máy hay phụ kiện ----------
test("wonSetRow: hàng là tổ máy phát điện (kể cả máy nổ, genset, mã hàng)", () => {
  for (const name of ["Máy phát điện 100 kVA đồng bộ theo tiêu chuẩn của nhà sản xuất", "Tổ máy phát điện Cummins 500kVA", "Genset 250 kVA", "Máy nổ 5 kVA", "Máy phát điện kèm lọc nhiên liệu"]) assert.equal(BP.wonSetRow({ name }), true, name);
  assert.equal(BP.wonSetRow({ name: "Thiết bị", code: "Generator set 500kVA" }), true); // tên chung, mã nói là tổ máy
});

test("wonSetRow: phụ tùng / thiết bị đi kèm nhắc tới máy phát phía sau không phải tổ máy", () => {
  for (const name of ["Lọc dầu máy phát điện", "Ắc quy cho máy phát", "Bộ điều khiển máy phát điện", "Vỏ cách âm máy phát", "Cáp nối máy phát điện", "Bảo dưỡng máy phát điện", "UPS 10KVA", "Tủ ATS 400A"]) assert.equal(BP.wonSetRow({ name }), false, name);
  assert.equal(BP.wonSetRow({}), false);
});

test("vnMadeSet: tổ máy hãng / xuất xứ Việt Nam trong hàng trúng (Khoa 11/11: gói đó không dùng để định giá)", () => {
  const vn = { name: "Máy phát điện 750 kVA", maker: "Việt Nhật", origin: "Việt Nam" };
  assert.equal(BP.vnMadeSet([vn]), true);
  assert.equal(BP.vnMadeSet([{ name: "Máy phát điện 750 kVA", maker: "Cummins", origin: "Viet Nam" }]), true); // không dấu
  assert.equal(BP.vnMadeSet([{ name: "Máy phát điện 750 kVA", label: "Hữu Toàn", origin: "VIỆT NAM" }]), true); // hãng nằm ở label, chữ hoa
  assert.equal(BP.vnMadeSet([{ name: "Máy phát điện 750 kVA", maker: "Cummins", origin: "Anh" }, vn]), true); // một trong nhiều hàng
});

test("vnMadeSet: phụ kiện Việt Nam (tủ ắc quy, vật tư) không làm cả gói thành hàng Việt Nam; hàng ngoại và rỗng → false", () => {
  assert.equal(BP.vnMadeSet([{ name: "Máy phát điện 750 kVA", maker: "Cummins", origin: "Anh" }, { name: "Vật tư phụ, nhân công lắp đặt", origin: "Việt Nam" }]), false);
  assert.equal(BP.vnMadeSet([{ name: "Máy biến áp 400kVA", origin: "Việt Nam" }]), false);
  assert.equal(BP.vnMadeSet([]), false);
  assert.equal(BP.vnMadeSet(null), false);
});

// ---------- Nơi sản xuất ----------
test("placeOf: Trung Quốc (kể cả nhà máy Trung Quốc của hãng ngoài) → cn; nước ngoài khác → foreign; không nói → null", () => {
  for (const s of ["Trung Quốc", "TRUNG QUỐC", "China", "CHINA", "Made in China", "Lắp ráp tại Trung Quốc", "DCEC Cummins", "Perkins Wuxi", "MTU Yuchai", "CATERPILLAR/ Trung Quốc"]) assert.equal(BP.placeOf(s), "cn", s);
  for (const s of ["Nhật Bản", "Pháp", "Hàn Quốc", "Thụy Điển", "Ấn Độ", "Italy", "Germany", "USA", "UK", "G7", "Châu Âu/Bồ Đào Nha", "Anh Quốc (UK)"]) assert.equal(BP.placeOf(s), "foreign", s);
  for (const s of ["Việt Nam", "Sea Power - Việt Nam", "", null, undefined, "Theo HSDT", "Đồng bộ theo máy phát điện"]) assert.equal(BP.placeOf(s), null, String(s));
});

test("placeOf: chữ Trung Quốc kèm model / hãng (dữ liệu hàng trúng thật) vẫn là cn", () => {
  assert.equal(BP.placeOf("Trung Quốc, THG 9.5BTS, KYOpower"), "cn");
  assert.equal(BP.placeOf("Ký mã hiệu: EPS-BD22KVA/ Hãng sản xuất: Excel Power/ Xuất xứ: China"), "cn");
});

test("placeOf: Trung Quốc và nước ngoài trong cùng câu → cn thắng (khoá hành vi: kiểm Trung Quốc trước)", () => {
  assert.equal(BP.placeOf("Động cơ Mỹ (USA), đầu phát Trung Quốc"), "cn");
});

test("placeOf: chữ có dấu viết ở dạng NFD (tách dấu) vẫn nhận ra", { todo: "placeOf không NFC: 'Trung Quốc' dạng NFD → null; bidhist 13/11: 29/1.247 hàng tổ máy có xuất xứ NFD, 7 dòng đổi kết quả khi NFC" }, () => {
  assert.equal(BP.placeOf("Trung Quốc".normalize("NFD")), "cn");
  assert.equal(BP.placeOf("Nhật Bản".normalize("NFD")), "foreign");
});

test("placeOf: Mỹ, Đức viết một mình là nước ngoài", { todo: "regex \\bmỹ\\b / \\bđức\\b không khớp vì \\b không coi ỹ, đ là chữ: 'Mỹ' 6 hàng, 'Đức' 2 hàng trong bidhist 13/11 ra null" }, () => {
  assert.equal(BP.placeOf("Mỹ"), "foreign");
  assert.equal(BP.placeOf("Đức"), "foreign");
});

test("placeOf: Anh, Ý, Hoa Kỳ, Bồ Đào Nha (xuất xứ ghi tên ngắn) là nước ngoài", { todo: "bảng nước thiếu: bidhist 13/11 hàng tổ máy có xuất xứ 'Anh' 5, 'Ý' 7, 'Anh Quốc' 4, 'Hoa Kỳ' 1, 'BỒ ĐÀO NHA' 2 → null" }, () => {
  for (const s of ["Anh", "Ý", "Hoa Kỳ", "Bồ Đào Nha", "Anh Quốc"]) assert.equal(BP.placeOf(s), "foreign", s);
});

// ---------- Nhóm xuất xứ động cơ ----------
test("engineGroup: hãng Trung Quốc → cn, hãng ngoài → foreign, hãng ngoài chế tạo ở Trung Quốc → cnmade", () => {
  assert.equal(BP.engineGroup({ make: "Weichai" }), "cn");
  assert.equal(BP.engineGroup({ make: "Yuchai" }), "cn");
  assert.equal(BP.engineGroup({ make: "Cummins" }), "foreign");
  assert.equal(BP.engineGroup({ make: "Perkins" }), "foreign");
  assert.equal(BP.engineGroup({ make: "Cummins" }, "cn"), "cnmade"); // nhà cung cấp ở Trung Quốc
  assert.equal(BP.engineGroup({ make: "Cummins", model: "DCEC 6CTA" }), "cnmade"); // DCEC = nhà máy Cummins ở Đông Phong
  assert.equal(BP.engineGroup({ make: "Weichai" }, "cn"), "cn"); // hãng Trung Quốc vẫn là cn
});

test("engineGroup: không nhận ra hãng hoặc thiếu động cơ → null (không đoán)", () => {
  assert.equal(BP.engineGroup({ make: "Xyz Hãng Lạ" }), null);
  assert.equal(BP.engineGroup({}), null);
  assert.equal(BP.engineGroup(null), null);
  assert.equal(BP.engineGroup(undefined, "cn"), null);
});

test("engineWords: chỉ lấy đoạn nói về động cơ của hàng là tổ máy, bỏ câu 'tương đương', bỏ hàng phụ kiện", () => {
  const goods = [
    { name: "Máy phát điện 500 kVA", desc: "Động cơ: Cummins 6CTA8.3-G2, 4 kỳ. Đầu phát: Stamford" },
    { name: "UPS 10KVA", desc: "Động cơ quạt làm mát" }, // không phải tổ máy
    { name: "Lọc dầu máy phát điện", desc: "Engine filter" }, // phụ tùng
  ];
  const w = BP.engineWords(goods);
  assert.match(w, /Cummins 6CTA8\.3-G2/);
  assert.doesNotMatch(w, /quạt|filter/i);
  // Câu có "tương đương" là hàng chào thay thế, không phải hãng thật.
  assert.doesNotMatch(BP.engineWords([{ name: "Máy phát điện 100 kVA", desc: "Động cơ Perkins hoặc tương đương" }]), /Perkins/);
});

test("engineWords: nhiều lần nhắc động cơ nối bằng ' | '; mỗi đoạn tối đa 70 ký tự; rỗng → chuỗi rỗng", () => {
  const long = "Động cơ " + "x".repeat(200);
  assert.equal(BP.engineWords([{ name: "Máy phát điện 500 kVA", desc: long }]).length, 70);
  assert.equal(BP.engineWords([{ name: "Máy phát điện 500 kVA", desc: "Động cơ: A; Engine: B" }]).split(" | ").length, 2);
  assert.equal(BP.engineWords([]), "");
  assert.equal(BP.engineWords(null), "");
});

// ---------- Từ khoá nhà cung cấp trong hàng trúng ----------
const sup = (id, over = {}) => ({ id, role: "manufacturer", names: { brands: [], en: "" }, ...over });

test("wonTokens: thương hiệu của nhà cung cấp là từ khoá (chữ thường) trỏ về nhà cung cấp đó", () => {
  const tok = BP.wonTokens([sup("s1", { names: { brands: ["Kachai"] } })]);
  assert.deepEqual(tok.get("kachai"), ["s1"]);
  assert.equal(tok.size, 1);
});

test("wonTokens: đại lý không sở hữu thương hiệu hãng họ bán", () => {
  const tok = BP.wonTokens([sup("d1", { role: "distributor", names: { brands: ["Cummins"] } })]);
  assert.equal(tok.has("cummins"), false);
});

test("wonTokens: không có thương hiệu thì lấy từ đặc trưng đầu tiên của tên tiếng Anh, bỏ tỉnh và từ chung", () => {
  // "Zhejiang" là tỉnh, "Generator", "Co", "Ltd" là từ chung → "Kachai".
  const tok = BP.wonTokens([sup("s1", { names: { en: "Zhejiang Kachai Generator Co., Ltd" } })]);
  assert.deepEqual([...tok.keys()], ["kachai"]);
  assert.deepEqual(tok.get("kachai"), ["s1"]);
});

test("wonTokens: từ của tên tiếng Anh nhường cho nhà cung cấp đã có từ đó làm thương hiệu", () => {
  const tok = BP.wonTokens([sup("s1", { names: { brands: ["Kachai"] } }), sup("s2", { names: { en: "Kachai Power Co" } })]);
  assert.deepEqual(tok.get("kachai"), ["s1"]); // s2 không được nhận từ này (tránh gán nhầm gói trúng)
});

test("wonTokens: hai nhà cung cấp cùng thương hiệu đều được nhận; từ chung, tỉnh, quá ngắn, trong ngoặc bị loại", () => {
  const tok = BP.wonTokens([
    sup("a", { names: { brands: ["Kohler"] } }), sup("b", { names: { brands: ["KOHLER"] } }),
    sup("c", { names: { brands: ["Power", "Shanghai", "AB", "(China)"] } }),
  ]);
  assert.deepEqual(tok.get("kohler"), ["a", "b"]);
  for (const w of ["power", "shanghai", "ab", "china"]) assert.equal(tok.has(w), false, w);
});

test("wonTokens: tên tiếng Anh chỉ lấy từ ≥ 4 ký tự (MTU 3 ký tự bị bỏ, lấy từ kế tiếp) — khoá hành vi", () => {
  const tok = BP.wonTokens([sup("m", { names: { en: "MTU Friedrichshafen GmbH" } })]);
  assert.deepEqual([...tok.keys()], ["friedrichshafen"]);
  assert.equal(BP.wonTokens([]).size, 0);
});

// ---------- Báo giá cũ ----------
const NOW = Date.UTC(2026, 10, 13); // 13/11/2026

test("quoteStale: báo giá không ghi ngày hoặc ngày rác → nodate", () => {
  assert.deepEqual(BP.quoteStale({ unitPrice: 1 }, NOW), { why: "nodate", days: null });
  assert.deepEqual(BP.quoteStale({ date: "" }, NOW), { why: "nodate", days: null });
  assert.deepEqual(BP.quoteStale({ date: "mới đây" }, NOW), { why: "nodate", days: null });
  assert.deepEqual(BP.quoteStale(undefined, NOW), { why: "nodate", days: null });
});

test("quoteStale: ranh giới 180 ngày — đúng 180 còn dùng được, 181 là cũ", () => {
  // 15/05/2026 + 180 ngày = 11/11/2026.
  const item = { date: "15/05/2026" };
  assert.equal(BP.quoteStale(item, Date.UTC(2026, 10, 11)), null);
  assert.deepEqual(BP.quoteStale(item, Date.UTC(2026, 10, 12)), { why: "old", days: 181 });
  assert.equal(BP.STALE_DAYS, 180);
});

test("quoteStale: ngày kiểu Việt dd/mm/yyyy (05/11/2026 là mùng 5 tháng 11, không phải 11 tháng 5)", () => {
  assert.equal(BP.quoteStale({ date: "05/11/2026" }, NOW), null); // 8 ngày trước
  assert.equal(BP.quoteStale({ date: "5-11-2026" }, NOW), null);
  assert.equal(BP.quoteStale({ date: "05.11.2026" }, NOW), null);
  assert.equal(BP.quoteStale({ date: "2026-11-05" }, NOW), null); // ISO
  assert.deepEqual(BP.quoteStale({ date: "01/01/2026" }, NOW), { why: "old", days: 316 });
});

test("quoteStale: báo giá ghi ngày tương lai không bị coi là cũ", () => {
  assert.equal(BP.quoteStale({ date: "30/12/2026" }, NOW), null);
});

// ---------- Điều khoản hợp đồng ----------
const T = (term, requirement, quote = "") => ({ term, requirement, quote });

test("readTerms: đọc đủ tạm ứng, hạn thanh toán, bảo đảm, giữ lại, bảo hành, phạt, thời gian giao", () => {
  const r = BP.readTerms([
    T("Tạm ứng", "Tạm ứng 20% giá trị hợp đồng"),
    T("Thanh toán", "Thanh toán trong vòng 30 ngày kể từ khi nhận hồ sơ"),
    T("Bảo đảm thực hiện hợp đồng", "3% giá hợp đồng"),
    T("Giữ lại bảo hành", "5%"),
    T("Bảo hành", "24 tháng"),
    T("Phạt chậm", "0,05%/ngày, tối đa 10%"),
    T("Thời gian giao hàng", "90 ngày"),
  ]);
  assert.equal(r.advance.pct, 20);
  assert.equal(r.pay.days, 30);
  assert.equal(r.security.pct, 3);
  assert.equal(r.retention.pct, 5);
  assert.equal(r.warranty.months, 24);
  assert.equal(r.penalty.perDay, 0.05);
  assert.equal(r.penaltyMax.pct, 10);
  assert.equal(r.daysHint, 90);
  assert.deepEqual(r.manual, []);
});

test("readTerms: không có điều khoản → chỉ có manual rỗng; null cũng không lỗi", () => {
  assert.deepEqual(BP.readTerms([]), { manual: [] });
  assert.deepEqual(BP.readTerms(null), { manual: [] });
});

test("readTerms: 'Không tạm ứng' là 0%, còn tạm ứng không nêu tỷ lệ thì để người đọc (manual), không đoán", () => {
  assert.equal(BP.readTerms([T("Tạm ứng", "Không tạm ứng")]).advance.pct, 0);
  const r = BP.readTerms([T("Tạm ứng", "Theo thoả thuận trong hợp đồng")]);
  assert.equal(r.advance, undefined);
  assert.equal(r.manual.length, 1);
  assert.match(r.manual[0].why, /tạm ứng/);
});

test("readTerms: thanh toán nhiều đợt không quy ra một số ngày → manual", () => {
  const r = BP.readTerms([T("Thanh toán", "Thanh toán 02 đợt: đợt 1 sau 30 ngày, đợt 2 sau 60 ngày")]);
  assert.equal(r.pay, undefined);
  assert.match(r.manual[0].why, /2 đợt/);
  // Ba chữ "hai/ba/bốn" cũng nhận.
  assert.match(BP.readTerms([T("Thanh toán", "Thanh toán làm ba đợt")]).manual[0].why, /3 đợt/);
});

test("readTerms: 'hồ sơ / chứng từ thanh toán' không phải hạn thanh toán; 'hiệu lực / hoàn trả bảo đảm' không phải % bảo đảm", () => {
  const r = BP.readTerms([T("Hồ sơ thanh toán", "Trong vòng 15 ngày"), T("Chứng từ thanh toán", "Hoá đơn, biên bản"), T("Hiệu lực bảo đảm thực hiện hợp đồng", "Đến khi nghiệm thu, 5%"), T("Hoàn trả bảo đảm thực hiện hợp đồng", "Trong 7 ngày, 10%")]);
  assert.equal(r.pay, undefined);
  assert.equal(r.security, undefined);
  assert.deepEqual(r.manual, []);
});

test("readTerms: bảo hành tính ra tháng từ ngày / năm; số thập phân kiểu Việt", () => {
  assert.equal(BP.readTerms([T("Bảo hành", "730 ngày")]).warranty.months, 24); // 730 / 30,4 ≈ 24
  assert.equal(BP.readTerms([T("Thời gian bảo hành", "02 năm kể từ ngày nghiệm thu")]).warranty.months, 24);
  assert.equal(BP.readTerms([T("Bảo hành", "tối thiểu 12 tháng")]).warranty.months, 12);
  assert.equal(BP.readTerms([T("Bảo hành", "", "Thời hạn bảo hành 18 tháng")]).warranty.months, 18); // số nằm ở câu trích
});

test("readTerms: phạt theo tuần chia 7 ra %/ngày; phạt không nêu mức → manual", () => {
  const w = BP.readTerms([T("Phạt vi phạm", "0,7% mỗi tuần chậm giao")]).penalty;
  assert.equal(w.unit, "tuần");
  assert.ok(Math.abs(w.perDay - 0.1) < 1e-12);
  assert.equal(w.raw, 0.7);
  const m = BP.readTerms([T("Phạt chậm giao", "Theo quy định của pháp luật")]);
  assert.equal(m.penalty, undefined);
  assert.match(m.manual[0].why, /phạt/);
});

test("readTerms: mức phạt tối đa ở điều khoản riêng; thời gian thực hiện hợp đồng làm gợi ý số ngày", () => {
  const r = BP.readTerms([T("Mức phạt tối đa", "Tổng mức phạt không quá 12% giá trị hợp đồng"), T("Thời hạn thực hiện hợp đồng", "Không quá 120 ngày")]);
  assert.equal(r.penaltyMax.pct, 12);
  assert.equal(r.daysHint, 120);
});

// ---------- Hàng của mọi gói: compRows, lockStats, nbBucket ----------
test("nbBucket: 1 / 2–3 / 4–5 / từ 6 nhà thầu (nhãn đi kèm đúng thứ tự)", () => {
  const got = [0, 1, 2, 3, 4, 5, 6, 7, 40].map(BP.nbBucket);
  assert.deepEqual(got, [0, 0, 1, 1, 2, 2, 3, 3, 3]);
  assert.deepEqual(BP.NB_LABELS, ["1 nhà thầu", "2–3 nhà thầu", "4–5 nhà thầu", "từ 6 nhà thầu"]);
});

const bidder = (tax, won, winPrice) => ({ name: `NT ${tax}`, taxCode: String(tax), bidPrice: winPrice ?? 1e9, won: !!won, ...(won ? { winPrice } : {}) });
const doc = (over = {}) => ({ bidName: "Mua sắm máy phát điện 500kVA", investorName: "Sở Y tế A", location: "Tỉnh Nghệ An", final: true, bidCloseDate: "2026-03-01T00:00:00Z", lots: [{ lotNo: "1", price: 1e9, bidders: [bidder(1, true, 8e8), bidder(2, false)] }], ...over });

test("compRows: không phải đối tượng / không có phần → mảng rỗng; gói không lô hoặc lô không nhà thầu bị bỏ", () => {
  assert.deepEqual(BP.compRows(null), []);
  assert.deepEqual(BP.compRows(undefined), []);
  assert.deepEqual(BP.compRows("x"), []);
  assert.deepEqual(BP.compRows({}), []);
  assert.deepEqual(BP.compRows({ A: { bidName: "x", lots: [] }, B: { bidName: "y", lots: [{ price: 1, bidders: [] }] } }), []);
});

test("compRows: mỗi phần một dòng — số nhà thầu, nhóm, người trúng, giá trúng / giá gói", () => {
  const [r] = BP.compRows({ IB2600000010: doc() });
  assert.equal(r.key, "IB2600000010");
  assert.equal(r.nb, 2);
  assert.equal(r.b, 1); // 2 nhà thầu → nhóm "2–3"
  assert.equal(r.win, "1");
  assert.equal(r.winName, "NT 1");
  assert.deepEqual(r.taxes, ["1", "2"]);
  assert.equal(r.ratio, 0.8); // 8e8 / 1e9
  assert.equal(r.prov, "nghe an"); // bỏ "Tỉnh", bỏ dấu
  assert.equal(r.inv, "so y te a");
  assert.equal(r.final, true);
  assert.equal(r.at, Date.UTC(2026, 2, 1));
});

test("compRows: tỉ lệ giá trúng chỉ tính cho gói MUA SẮM máy phát; sửa chữa, không phải máy phát, ngoài 30–102% là null", () => {
  const r = (over) => BP.compRows({ IB2600000011: doc(over) })[0].ratio;
  assert.equal(r({}), 0.8);
  assert.equal(r({ bidName: "Sửa chữa máy phát điện 500kVA" }), null); // không phải mua sắm
  assert.equal(r({ bidName: "Mua sắm bàn ghế văn phòng" }), null); // không phải máy phát
  const lot = (wp) => [{ price: 1e9, bidders: [bidder(1, true, wp), bidder(2, false)] }];
  assert.equal(r({ lots: lot(2.9e8) }), null); // < 30%: số rác (đơn vị sai)
  assert.equal(r({ lots: lot(3e8) }), 0.3); // ranh giới dưới giữ lại
  assert.equal(r({ lots: lot(1.02e9) }), 1.02); // ranh giới trên giữ lại
  assert.equal(r({ lots: lot(1.03e9) }), null); // trên giá gói quá 2%
});

test("compRows: gói nhiều lô — lô không ghi giá riêng thì không có tỉ lệ; gói một lô lấy giá dự toán của gói", () => {
  const multi = doc({ estimatedPrice: 5e9, lots: [{ lotNo: "1", bidders: [bidder(1, true, 8e8), bidder(2, false)] }, { lotNo: "2", price: 1e9, bidders: [bidder(3, true, 9e8), bidder(4, false)] }] });
  const rows = BP.compRows({ IB2600000012: multi });
  assert.equal(rows.length, 2);
  assert.equal(rows.find((x) => x.lotNo === "1").ratio, null);
  assert.equal(rows.find((x) => x.lotNo === "2").ratio, 0.9);
  const one = doc({ estimatedPrice: 1e9, lots: [{ lotNo: "", bidders: [bidder(1, true, 7e8), bidder(2, false)] }] });
  assert.equal(BP.compRows({ IB2600000013: one })[0].ratio, 0.7);
});

test("compRows: giá trúng lấy winPrice, thiếu thì giá sau giảm / giá nộp của người trúng; không ai trúng thì win rỗng", () => {
  const lots = [{ price: 1e9, bidders: [{ taxCode: "1", won: true, bidPrice: 9e8, finalPrice: 8.5e8 }, bidder(2, false)] }];
  assert.equal(BP.compRows({ IB2600000014: doc({ lots }) })[0].ratio, 0.85);
  const none = BP.compRows({ IB2600000015: doc({ lots: [{ price: 1e9, bidders: [bidder(1, false), bidder(2, false)] }] }) })[0];
  assert.equal(none.win, "");
  assert.equal(none.ratio, null);
});

test("compRows: sắp theo thời điểm đóng thầu; thiếu ngày thì lấy ngày mở / công bố, rồi năm trong mã IB; gói không ngày → 0", () => {
  const rows = BP.compRows({
    C: doc({ bidCloseDate: "2026-05-01T00:00:00Z" }),
    A: doc({ bidCloseDate: undefined, openedAt: "2026-01-10T00:00:00Z" }),
    B: doc({ bidCloseDate: undefined, publicDate: "2026-03-15T00:00:00Z" }),
    IB2300099999: doc({ bidCloseDate: undefined }),
    Z: doc({ bidCloseDate: undefined }),
  });
  assert.deepEqual(rows.map((x) => x.key), ["Z", "IB2300099999", "A", "B", "C"]);
  assert.equal(rows[0].at, 0);
  assert.equal(rows[1].at, Date.UTC(2023, 0, 1)); // IB23… → 1/1/2023
});

test("compRows: kết quả nhớ theo đối tượng docs (cùng đối tượng → cùng mảng)", () => {
  const docs = { A: doc() };
  assert.equal(BP.compRows(docs), BP.compRows(docs));
});

// Một chủ đầu tư, bốn gói lần lượt: người 1 trúng cả bốn, ba gói đầu chỉ một nhà thầu.
const solo = (n, close, win = 1, others = []) => doc({ investorName: "Ban QLDA Z", bidCloseDate: close, lots: [{ price: 1e9, bidders: [bidder(win, true, 9e8), ...others.map((o) => bidder(o, false))] }] });

test("lockStats: dấu hiệu 'quen' (một nhà thầu trúng ≥ 2 gói và ≥ nửa số gói trước) và 'single' đếm đúng, mỗi phần chỉ nhìn các phần trước nó", () => {
  const st = BP.lockStats({
    G1: solo(1, "2026-01-01T00:00:00Z"),
    G2: solo(2, "2026-02-01T00:00:00Z"),
    G3: solo(3, "2026-03-01T00:00:00Z"),
    G4: solo(4, "2026-04-01T00:00:00Z", 1, [2, 3]),
  });
  // G1: chưa có gói trước. G2: trước có 1 gói → chưa đủ ≥ 2. G3: trước 2 gói, người 1 trúng 2/2, cả hai chỉ 1 nhà thầu → quen + single.
  // G4: trước 3 gói, người 1 trúng 3/3 → quen + single; G4 có 3 nhà thầu và người 1 trúng lại.
  assert.deepEqual(st.all, { n: 4, one: 3, again: 3 }); // G2 và G3 và G4 đều có top = người 1 và người 1 trúng lại
  assert.deepEqual(st.quen, { n: 2, one: 1, again: 2 });
  assert.deepEqual(st.single, { n: 2, one: 1, again: 2 });
  assert.deepEqual(st.none, { n: 0, one: 0, again: 0 });
});

test("lockStats: chủ đầu tư có ≥ 2 gói trước mà thắng đều thay người, nhiều nhà thầu → nhóm 'none'", () => {
  const multi = (win, close) => solo(win, close, win, [7, 8].filter((x) => x !== win));
  const st = BP.lockStats({
    H1: multi(1, "2026-01-01T00:00:00Z"),
    H2: multi(2, "2026-02-01T00:00:00Z"),
    H3: multi(3, "2026-03-01T00:00:00Z"),
  });
  // H3 trước nó 2 gói, mỗi người trúng 1 → không "quen"; số gói 1 nhà thầu = 0 → không "single".
  assert.deepEqual(st.none.n, 1);
  assert.equal(st.none.one, 0);
  assert.equal(st.none.again, 0); // người trúng H3 (3) không phải người đứng đầu trước đó
  assert.equal(st.quen.n, 0);
  assert.equal(st.single.n, 0);
});

test("lockStats: gói chưa chốt (final=false) không vào thống kê nhưng vẫn là lịch sử của gói sau; gói không chủ đầu tư không có lịch sử", () => {
  const st = BP.lockStats({
    K1: { ...solo(1, "2026-01-01T00:00:00Z"), final: false },
    K2: solo(1, "2026-02-01T00:00:00Z"),
    N1: { ...solo(9, "2026-03-01T00:00:00Z"), investorName: "" },
  });
  assert.equal(st.all.n, 2); // K2 và N1; K1 chưa chốt
  assert.equal(st.all.again, 1); // chỉ K2: top trước đó (K1) = người 1, người 1 trúng lại
  assert.equal(st.quen.n + st.single.n + st.none.n, 0);
});

test("lockStats: dữ liệu rỗng / không phải đối tượng; kết quả nhớ theo docs", () => {
  assert.equal(BP.lockStats(null), null);
  assert.deepEqual(BP.lockStats({}).all, { n: 0, one: 0, again: 0 });
  const docs = { A: solo(1, "2026-01-01T00:00:00Z") };
  assert.equal(BP.lockStats(docs), BP.lockStats(docs));
});

// ---------- So sánh cấu hình ----------
test("compareCfg: giống nhau hoàn toàn → sim 1; có chỗ khác thì nửa điểm cho mỗi thẻ chỉ một bên có", () => {
  const same = BP.compareCfg({ tags: ["ATS", "cách âm"] }, { tags: ["ATS", "cách âm"] });
  assert.equal(same.sim, 1);
  assert.deepEqual(same.diff, []);
  // Chung 1 (ATS), mỗi bên một thẻ riêng: 1 / (1 + 0,5 × 2) = 0,5.
  const part = BP.compareCfg({ tags: ["ATS", "bồn dầu"] }, { tags: ["ATS", "cách âm"] });
  assert.equal(part.sim, 0.5);
  assert.deepEqual(part.same, ["ATS"]);
  assert.deepEqual(part.diff, ["chỉ gói này: bồn dầu", "chỉ gói kia: cách âm"]);
});

test("compareCfg: không thẻ chung → 0; cả hai không nêu gì → null (không biết, không phải khác)", () => {
  assert.equal(BP.compareCfg({ tags: ["ATS"] }, { tags: ["cách âm"] }).sim, 0);
  assert.equal(BP.compareCfg({ tags: [] }, { tags: ["ATS"] }).sim, 0);
  assert.equal(BP.compareCfg({ tags: [] }, { tags: [] }).sim, null);
});

// ---------- Khoản chi có thể phát sinh đọc từ Phân tích ----------
const analysis = (specs = [], extra = {}) => ({ result: { technicalSpecs: specs, ...extra } });
const spec = (item, requirement = "") => ({ item, requirement });
const ids = (hints) => hints.map((h) => h.id).sort();

test("costHints: nhận ATS, vỏ cách âm, bồn dầu ngoài, cáp lực, thử tải giả từ thông số kỹ thuật; mỗi khoản một dòng kèm câu trích", () => {
  const h = BP.costHints(analysis([
    spec("Tủ ATS", "Tủ chuyển nguồn tự động 3 pha, 400A"),
    spec("Vỏ", "Có vỏ cách âm, độ ồn ≤ 75 dB(A)"),
    spec("Bồn nhiên liệu", "Bồn dầu ngoài dung tích 2000 lít"),
    spec("Cáp", "Cáp lực CXV 4x185 mm2 từ máy phát tới tủ"),
    spec("Thử nghiệm", "Thử tải giả (load bank) 100% tại hiện trường"),
  ]));
  assert.deepEqual(ids(h), ["ats", "cable", "canopy", "loadtest", "tank"]);
  assert.match(h.find((x) => x.id === "ats").quote, /chuyển nguồn tự động/);
  assert.equal(h.find((x) => x.id === "ats").from, "Thông số kỹ thuật");
});

test("costHints: câu phủ định ('ATS: Không có…', 'không yêu cầu vỏ cách âm') không thành khoản chi", () => {
  assert.deepEqual(BP.costHints(analysis([spec("ATS", "Không có trong tài liệu được cung cấp"), spec("Vỏ cách âm", "không yêu cầu")])), []);
  assert.deepEqual(BP.costHints(analysis([spec("Phụ kiện", "không yêu cầu cáp lực")])), []);
});

test("costHints: biên bản thử tải xuất xưởng là của hãng, không phải thử tải giả tại công trình", () => {
  assert.deepEqual(BP.costHints(analysis([spec("Hồ sơ", "Biên bản thử tải xuất xưởng của nhà sản xuất")])), []);
});

test("costHints: lắp đặt / ống xả chỉ tính khi HSMT làm thành hạng mục riêng (đầu mục thông số), không phải dòng phạm vi", () => {
  // "Phạm vi công việc: … lắp đặt" đi kèm hầu hết gói → không phát sinh.
  assert.deepEqual(BP.costHints(analysis([spec("Phạm vi công việc", "Cung cấp, lắp đặt, vận hành thử")])), []);
  assert.deepEqual(ids(BP.costHints(analysis([spec("Lắp đặt, xây móng bệ máy", "Nhà thầu tự xây móng bê tông")]))), ["install"]);
});

test("costHints: bảo hành dài hơn 12 tháng thành khoản %; đúng 12 tháng thì không; thời hạn sửa chữa không phải thời gian bảo hành", () => {
  const w = BP.costHints(analysis([], { contractTerms: [{ term: "Bảo hành", requirement: "24 tháng kể từ ngày nghiệm thu" }] })).find((x) => x.id === "warranty");
  assert.equal(w.months, 24);
  assert.equal(w.kind, "pct");
  assert.equal(BP.costHints(analysis([], { contractTerms: [{ term: "Bảo hành", requirement: "12 tháng" }] })).some((x) => x.id === "warranty"), false);
  assert.equal(BP.costHints(analysis([], { contractTerms: [{ term: "Thời hạn sửa chữa trong bảo hành", requirement: "36 giờ" }] })).some((x) => x.id === "warranty"), false);
});

test("costHints: địa điểm trên đảo / vùng xa → vận chuyển xa; đã có khoản cùng tên trong chi phí thì have=true", () => {
  const h = BP.costHints(analysis([spec("ATS", "Có tủ ATS")]), [{ label: "ATS", value: 1 }], { location: "Huyện đảo Phú Quý, tỉnh Bình Thuận" });
  assert.equal(h.find((x) => x.id === "remote").from, "Địa điểm");
  assert.equal(h.find((x) => x.id === "remote").have, false);
  assert.equal(h.find((x) => x.id === "ats").have, true);
  assert.deepEqual(BP.costHints(null), []);
  assert.deepEqual(BP.costHints(undefined), []);
});
