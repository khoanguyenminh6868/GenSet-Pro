// node --test suppliers/*.test.mjs — rà soát chuyên môn máy phát điện (2026-11-13): các ca "sổ tay kỹ sư" mà bộ test cũ
// chưa có. Mỗi con số mong đợi ở đây tính tay từ công thức / số công bố của hãng, không chép từ đầu ra của code:
//   A. web/conversions.js — cả 15 công thức với số thật (trước đây 9/15 công thức không có ca nào), đường lỗi, dung sai.
//   B. Công suất trong tên gói / HSMT: kVA, kW, MVA, dấu nghìn, máy biến áp / UPS cùng dòng, liên tục ↔ dự phòng.
//   C. Tên gói: mua tổ máy / dịch vụ / di dời; tổ máy của nhà máy điện.
//   D. Xuất xứ động cơ theo nhóm G7 / G20 / EU (bảng hãng) và câu xuất xứ trong HSMT.
//   E. Ngưỡng HSMT: công suất liên tục, tiêu hao theo mức tải, dung tích, số xi lanh; dải ứng viên; ngưỡng phi lý.
//   F. Bộ mã yêu cầu: cách HSMT thật viết (đo trên 48.580 dòng technicalSpecs của 1.287 phân tích, 13/11).
// Ca có `todo` là lỗi / khoảng trống đã xác nhận bằng số đo nhưng CHƯA sửa: test vẫn chạy, hỏng không làm đỏ CI; khi sửa
// xong thì bỏ `todo`. Danh sách và số đo: genbid-work\dieu-phoi\nghiem-thu\test-review.md.
import test from "node:test";
import assert from "node:assert/strict";
import { capacity, sizesOf, powerMins, engineMins, litres, bandOf, plausible, originOfHsmt, NEAR_LOW, SMALL_KVA } from "./config-bot.mjs";
import { REQ_CODES, KINDS, codeOf, kindOf } from "./reqcodes.mjs";

const CV = globalThis.GenbidConversions, BP = globalThis.GenbidBidprice, CAT = globalThis.GenbidCatalog;
const calc = (formula, inputs) => CV.compute({ formula, inputs: Object.entries(inputs).map(([name, value]) => (value === "std" ? { name, from: "standard" } : { name, value })) });
const near = (got, want, tol, msg) => assert.ok(Math.abs(got - want) <= tol, `${msg || ""} ${got} ≠ ${want} (±${tol})`);

// ---------- A. Công thức quy đổi ----------
test("quy đổi điện: kW ↔ kVA ↔ cosφ ↔ dòng điện 3 pha (tổ máy 500 kVA / 400 kW, 400 V)", () => {
  near(calc("kva_from_kw", { P_kW: 400, pf: 0.8 }).value, 500, 1e-9);
  near(calc("kw_from_kva", { S_kVA: 1250, pf: 0.8 }).value, 1000, 1e-9);
  near(calc("pf_from_kw_kva", { P_kW: 400, S_kVA: 500 }).value, 0.8, 1e-12);
  // I = S / (√3 · U): 500 kVA ở 400 V là 721,7 A; 2000 kVA là 2886,8 A (cỡ ACB 3200 A).
  near(calc("current_3ph", { S_kVA: 500, U_V: 400 }).value, 721.69, 0.01);
  near(calc("current_3ph", { S_kVA: 2000, U_V: 400 }).value, 2886.75, 0.01);
  // Cùng công suất ở 380 V dòng lớn hơn 400 V đúng tỉ lệ 400/380.
  near(calc("current_3ph", { S_kVA: 500, U_V: 380 }).value / calc("current_3ph", { S_kVA: 500, U_V: 400 }).value, 400 / 380, 1e-12);
  // Hai chiều là nghịch đảo của nhau.
  near(calc("kva_from_current_3ph", { U_V: 400, I_A: calc("current_3ph", { S_kVA: 500, U_V: 400 }).value }).value, 500, 1e-9);
});

test("tốc độ đồng bộ n = 120 f / p: 4 cực 50 Hz = 1500 v/p, 60 Hz = 1800 v/p; 2 cực 3000; 6 cực 1000", () => {
  for (const [f, p, n] of [[50, 4, 1500], [60, 4, 1800], [50, 2, 3000], [50, 6, 1000], [60, 2, 3600]]) assert.equal(calc("rpm_from_poles", { f_Hz: f, poles: p }).value, n);
});

test("dung tích xi lanh từ đường kính × hành trình và từ in³ khớp số hãng công bố", () => {
  // Cummins QSX15: 137 × 169 mm, 6 xi lanh, hãng ghi 15 L (912 in³). Cummins 6BT5.9: 102 × 120 mm, 5,9 L.
  near(calc("displacement_l", { bore_mm: 137, stroke_mm: 169, cylinders: 6 }).value, 14.95, 0.01);
  near(calc("displacement_l", { bore_mm: 102, stroke_mm: 120, cylinders: 6 }).value, 5.88, 0.01);
  near(calc("l_from_cuin", { V_in3: 912 }).value, 14.945, 0.001);
  // Hai đường tính độc lập ra cùng một động cơ (lệch < 0,1%).
  near(calc("displacement_l", { bore_mm: 137, stroke_mm: 169, cylinders: 6 }).value / calc("l_from_cuin", { V_in3: 912 }).value, 1, 0.001);
});

test("mã lực cơ (hp) khác mã lực mét (PS): 600 hp = 447,4 kW; 100 PS = 73,55 kW", () => {
  near(calc("kw_from_hp", { P_hp: 600 }).value, 447.42, 0.005);
  near(calc("kw_from_ps", { P_PS: 100 }).value, 73.55, 0.005);
  // Catalog Trung Quốc ghi "马力" là PS: đọc nhầm thành hp thì lệch 1,4%.
  near(calc("kw_from_hp", { P_hp: 100 }).value / calc("kw_from_ps", { P_PS: 100 }).value, 1.0139, 0.0001);
});

test("tiêu hao nhiên liệu g/kWh ↔ L/h dùng KHOẢNG khối lượng riêng EN 590 (820–845 g/L)", () => {
  assert.deepEqual([CV.DIESEL.min, CV.DIESEL.max], [820, 845]);
  // 200 g/kWh ở 400 kW: 80 kg/h → 94,7 L/h (dầu nặng 845) đến 97,6 L/h (dầu nhẹ 820).
  const lph = calc("lph_from_gkwh", { b_gkWh: 200, P_kW: 400, rho_gL: "std" }).value;
  near(lph[0], 94.67, 0.01); near(lph[1], 97.56, 0.01);
  // 100 L/h ở 400 kW: 205–211,25 g/kWh. Chiều ngược của mỗi đầu khoảng trả về đúng 100 L/h.
  const g = calc("gkwh_from_lph", { Q_Lh: 100, P_kW: 400, rho_gL: "std" }).value;
  assert.deepEqual(g, [205, 211.25]);
  near(calc("lph_from_gkwh", { b_gkWh: g[0], P_kW: 400, rho_gL: 820 }).value, 100, 1e-9);
  // Khối lượng riêng do nguồn ghi (không dùng chuẩn) cho một số, không phải khoảng.
  near(calc("lph_from_gkwh", { b_gkWh: 200, P_kW: 400, rho_gL: 840 }).value, 95.24, 0.01);
});

test("cân bằng công suất: kWe = kWm × η; BMEP 4 kỳ; °F → °C", () => {
  // Động cơ 440 kWm với đầu phát hiệu suất 94,5% cho 415,8 kWe: đủ cho tổ máy 400 kWe (500 kVA), không đủ 440 kWe (550 kVA).
  const kwe = calc("kwe_from_kwm", { P_kWm: 440, eff_pct: 94.5 }).value;
  near(kwe, 415.8, 1e-9);
  assert.ok(kwe >= 400 && kwe < 440);
  // 440 kW, 15 L, 1500 v/p: BMEP 23,5 bar (động cơ tăng áp làm mát khí nạp hiện đại: 18–28 bar).
  near(calc("bmep_4s", { P_kW: 440, V_L: 15, n_rpm: 1500 }).value, 23.47, 0.01);
  // Cùng công suất, 1800 v/p (60 Hz) thì BMEP thấp hơn đúng tỉ lệ 1500/1800.
  near(calc("bmep_4s", { P_kW: 440, V_L: 15, n_rpm: 1800 }).value / calc("bmep_4s", { P_kW: 440, V_L: 15, n_rpm: 1500 }).value, 1500 / 1800, 1e-12);
  assert.equal(calc("c_from_f", { t_F: 104 }).value, 40);
  assert.equal(calc("c_from_f", { t_F: 122 }).value, 50);
});

test("compute từ chối: công thức lạ, thiếu đầu vào, số không dương, đòi 'chuẩn' cho đại lượng không có chuẩn", () => {
  assert.match(calc("kva_from_hp", { P_hp: 100 }).error, /không có trong danh sách/);
  assert.match(calc("kva_from_kw", { P_kW: 400 }).error, /thiếu đầu vào pf/);
  assert.match(calc("kva_from_kw", { P_kW: 400, pf: 0 }).error, /không phải số dương/);
  assert.match(calc("kva_from_kw", { P_kW: -400, pf: 0.8 }).error, /không phải số dương/);
  assert.match(calc("kva_from_kw", { P_kW: "bốn trăm", pf: 0.8 }).error, /không phải số dương/);
  assert.match(calc("kva_from_kw", { P_kW: 400, pf: "std" }).error, /không có giá trị chuẩn/);
  assert.match(CV.compute(null).error, /không có trong danh sách/);
  // Mọi công thức đều có nhãn, căn cứ, đơn vị và danh sách đầu vào mà calc dùng.
  for (const [name, f] of Object.entries(CV.FORMULAS)) {
    assert.ok(f.label && f.basis && typeof f.unit === "string" && f.inputs.length && typeof f.calc === "function", name);
    const v = f.calc(Object.fromEntries(f.inputs.map((n) => [n, 100])));
    assert.ok(Number.isFinite(v), `${name}: mọi đầu vào khai báo đều được dùng`);
  }
});

test("matches: số trong câu trả lời là kết quả làm tròn (0,5%), không phải một số gần đó", () => {
  assert.equal(CV.matches(722, 721.69), true);
  assert.equal(CV.matches(725, 721.69), true); // 0,46%
  assert.equal(CV.matches(726, 721.69), false); // 0,6%
  assert.equal(CV.matches(95, [94.67, 97.56]), true);
  assert.equal(CV.matches(96, [94.67, 97.56]), false); // giữa khoảng nhưng không phải đầu nào: agent phải ghi hai đầu
});

test("matches: đại lượng nhỏ không đơn vị (cosφ) không được khớp nhờ sàn tuyệt đối 0,05", { todo: "sàn 0,05 làm cosφ 0,80 'khớp' kết quả 0,85" }, () => {
  assert.equal(CV.matches(0.8, 0.85), false);
});

test("compute chặn đầu vào vô lý về vật lý: cosφ > 1, hiệu suất > 100%, số cực lẻ; nhận nhiệt độ ≤ 0 °F", { todo: "compute chỉ kiểm số dương" }, () => {
  assert.ok(calc("kva_from_kw", { P_kW: 400, pf: 1.2 }).error, "cosφ 1,2");
  assert.ok(calc("kwe_from_kwm", { P_kWm: 440, eff_pct: 105 }).error, "hiệu suất 105%");
  assert.ok(calc("rpm_from_poles", { f_Hz: 50, poles: 3 }).error, "3 cực");
  near(calc("c_from_f", { t_F: -4 }).value, -20, 1e-9, "-4 °F");
});

// ---------- B. Công suất ----------
test("capacity / kvaOf: kVA, kW (đổi ở cosφ 0,8), dấu nghìn kiểu Việt, số lẻ", () => {
  assert.deepEqual(capacity(["Máy phát điện 500kVA"]), { value: 500, unit: "kVA" });
  assert.deepEqual(capacity(["Máy phát điện 1.250 kVA"]), { value: 1250, unit: "kVA" });
  assert.deepEqual(capacity(["Máy phát điện 1,250 kVA"]), { value: 1250, unit: "kVA" });
  assert.deepEqual(capacity(["Máy phát 12,5 kVA"]), { value: 12.5, unit: "kVA" });
  assert.deepEqual(capacity(["Máy phát điện 400 kW"]), { value: 400, unit: "kW" });
  assert.deepEqual(capacity(["Máy phát điện 2 MVA"]), { value: 2000, unit: "kVA" });
  assert.deepEqual(capacity(["Máy phát điện 100 ekW"]), { value: 100, unit: "kW" });
  assert.equal(capacity(["Bù công suất phản kháng 30 kVAr"]), null); // kVAr là công suất phản kháng
  assert.equal(capacity(["Máy phát điện dự phòng"]), null);
  assert.deepEqual(capacity(["không có số", "Máy phát điện 250kVA"]), { value: 250, unit: "kVA" }); // chữ đầu tiên có số
  assert.equal(BP.kvaOf("Máy phát điện 1.250 kVA"), 1250);
  assert.equal(BP.kvaOf("Máy phát 12,5 kVA"), 12.5);
  assert.equal(BP.kvaOf("Máy phát điện 400 kW"), 500);
  assert.equal(BP.kvaOf("Máy phát điện 0 kVA"), null);
  // Tên ghi cả hai: lấy kVA đứng trước, không đổi kW lần nữa.
  assert.equal(BP.kvaOf("Tổ máy phát điện 1250kVA/1000kW"), 1250);
});

test("công suất của tổ máy, không phải của máy biến áp / UPS / điện áp trung thế cùng dòng", () => {
  assert.equal(BP.kvaOf("Trạm biến áp 630kVA và máy phát điện 500kVA"), 500);
  assert.equal(BP.kvaOf("MBA 1000kVA; MPĐ 800kVA"), 800);
  assert.equal(BP.kvaOf("UPS 10KVA và máy phát điện 5KVA"), 5);
  assert.equal(BP.kvaOf("Máy phát điện 22kV 2000kVA"), 2000); // 22 kV là điện áp
  assert.equal(BP.kvaOf("Máy phát điện 3 pha 400V 250kVA"), 250);
  assert.equal(BP.kvaOf("Trạm biến áp 560kVA"), null); // mọi con số đều của thiết bị khác
  assert.deepEqual(capacity(["Trạm biến áp 630kVA và máy phát điện 500kVA"]), { value: 500, unit: "kVA" });
});

test("kvaOf đọc dấu nghìn kiểu Anh và MVA như capacity", { todo: "kvaOf('1,250 kVA') = 1,25; kvaOf('2 MVA') = null (0 tên gói thật mắc phải, 13/11)" }, () => {
  assert.equal(BP.kvaOf("Máy phát điện 1,250 kVA"), 1250);
  assert.equal(BP.kvaOf("Máy phát điện 2 MVA"), 2000);
});

test("chế độ định mức: liên tục (PRP) và dự phòng (ESP) cách nhau 10% là MỘT tổ máy", () => {
  assert.equal(BP.STANDBY_FACTOR, 1.1);
  assert.deepEqual(BP.kvaRated("Máy phát điện 500 KVA dự phòng"), { kva: 500, rating: "standby" });
  assert.deepEqual(BP.kvaRated("Máy phát điện 550kVA (Standby)"), { kva: 550, rating: "standby" });
  assert.deepEqual(BP.kvaRated("Máy phát điện công suất liên tục 500 kVA, dự phòng 550 kVA"), { kva: 500, rating: "prime" });
  assert.deepEqual(BP.kvaRated("Máy phát điện 500kVA"), { kva: 500, rating: null });
  const T = BP.POWER_TOL;
  assert.equal(BP.powerMatch(400, "prime", 440, "standby", T), true); // 400 PRP = 440 ESP
  assert.equal(BP.powerMatch(500, "prime", 550, "standby", 0), true); // đúng cặp chuẩn, không cần dung sai
  assert.equal(BP.powerMatch(400, "prime", 400, "standby", T), false); // 400 ESP chỉ là 364 PRP: nhỏ hơn
  assert.equal(BP.powerMatch(400, "standby", 364, "prime", T), true);
  assert.equal(BP.powerMatch(400, "prime", 440, null, T), true); // gói kia không ghi chế độ: có thể là số dự phòng
  assert.equal(BP.powerMatch(400, null, 440, null, T), false); // hai tên gói không ghi: 400 và 440 là hai cỡ
  assert.equal(BP.powerMatch(0, null, 400, null, T), false);
  // sizesOf: "500 liên tục; 550 dự phòng" là một cỡ; 400 và 450 (12,5%) là hai cỡ; 250 kVA / 200 kW là một máy.
  assert.deepEqual(sizesOf(["500 kVA liên tục; 550 kVA dự phòng"]).map((s) => s.kva), [500]);
  assert.deepEqual(sizesOf(["400 kVA và 450 kVA"]).map((s) => s.kva), [400, 450]);
  assert.deepEqual(sizesOf(["250 kVA / 200 kW"]).map((s) => s.kva), [250]);
  assert.deepEqual(sizesOf(["01 máy 1000kVA + 02 máy 500 kVA"]).map((s) => [s.qty, s.kva]), [[2, 500], [1, 1000]]);
  assert.deepEqual(sizesOf(["3 x 2000 kVA (N+1)"]).map((s) => [s.qty, s.kva]), [[3, 2000]]);
  assert.deepEqual(sizesOf(["Trạm biến áp 630kVA, máy phát điện 400kVA"]).map((s) => s.kva), [400]);
  assert.deepEqual(sizesOf(["2 MVA"]).map((s) => s.kva), [2000]);
});

test("số lượng tổ máy: hàng trúng thầu trước, rồi tên gói; phụ kiện không tính", () => {
  assert.equal(BP.unitsOf("Mua 20 bộ máy phát điện"), 20);
  assert.equal(BP.unitsOf("2 x 250 kVA"), 2);
  assert.equal(BP.unitsOf("Máy phát điện 3 pha 500kVA"), 1); // "3 pha" không phải 3 máy
  assert.equal(BP.unitsOf("Mua máy phát điện", [{ name: "Máy phát điện 100kVA", qty: 3 }, { name: "Tủ ATS", qty: 9 }]), 3);
});

// ---------- C. Tên gói ----------
test("isGensetName / bidKind: mua tổ máy, dịch vụ, di dời, tổ máy của nhà máy điện", () => {
  const cases = [
    ["Mua sắm máy phát điện dự phòng 500kVA", true, "supply"],
    ["Tổ máy phát điện diesel", true, "supply"],
    ["Mua máy phát 15KVA", true, "supply"],
    ["Cung cấp genset 100 kVA", true, "supply"],
    ["Bảo dưỡng máy phát điện", true, "svc"],
    ["Thuê máy phát điện 250kVA", true, "svc"],
    ["Cung cấp phụ tùng máy phát điện Cummins", true, "svc"],
    ["Di dời máy phát điện 500kVA", true, "move"],
    ["Mua sắm và điều chuyển máy phát điện", true, "supply"], // có mua thì là cung cấp
    ["Sửa chữa tổ máy H1 nhà máy thủy điện Hòa Bình", false, "svc"], // tổ máy thủy điện không phải genset
    ["Máy phát điện dự phòng nhà máy thủy điện", true, "supply"], // nhưng máy dự phòng của nhà máy thì có
    ["Máy phát hàn", false, "supply"],
    ["Máy phát xung", false, "supply"],
  ];
  for (const [name, genset, kind] of cases) { assert.equal(BP.isGensetName(name), genset, name); assert.equal(BP.bidKind(name), kind, name); }
});

test("isGensetName nhận chữ viết tắt MPĐ", { todo: "\\b sau chữ Đ không khớp: 'Cung cấp MPĐ 100kVA' bị coi không phải máy phát (web/bidprice.js và genbid-sync.js)" }, () => {
  assert.equal(BP.isGensetName("Cung cấp MPĐ 100kVA"), true);
  assert.equal(BP.isGensetName("Mua sắm MPĐ dự phòng cho trạm BTS"), true);
});

test("isGensetName không nhận máy phát điện gió / điện mặt trời (không phải tổ máy diesel)", { todo: "tên có 'máy phát điện' là nhận" }, () => {
  assert.equal(BP.isGensetName("Cung cấp máy phát điện gió 5kW"), false);
  assert.equal(BP.isGensetName("Hệ thống máy phát điện năng lượng mặt trời"), false);
});

test("movesOldSet: dòng HSMT về máy cũ cần di dời; máy mới có bánh xe để di chuyển thì không", () => {
  assert.equal(BP.movesOldSet("Máy phát điện 500 KVA do Bệnh viện chuyển giao, cần di dời, cải tạo, lắp đặt"), true);
  assert.equal(BP.movesOldSet("Tháo dỡ máy phát điện hiện hữu 250kVA và lắp đặt lại tại vị trí mới"), true);
  assert.equal(BP.movesOldSet("Tổ máy có bánh xe để di chuyển, đang sử dụng"), false);
  assert.equal(BP.movesOldSet("Cung cấp máy phát điện mới 500kVA"), false);
  assert.equal(BP.movesOldSet("Di dời tủ điện hiện hữu"), false); // không nói về máy
});

// ---------- D. Xuất xứ ----------
test("nhóm xuất xứ của hãng động cơ: G7, G20 (không Trung Quốc), +EU; Deutz không thuộc nhóm nào (Khoa 11/11)", () => {
  const e = (make, model) => ({ makes: make ? [{ name: make }] : [], model });
  // [hãng, model, originOf, g7, g20, g7eu, g20eu]
  const table = [
    ["Cummins", "QSX15-G8", "other", 1, 1, 1, 1], ["Perkins", "2506C-E15TAG2", "other", 1, 1, 1, 1], ["Caterpillar", "C18", "other", 1, 1, 1, 1],
    ["MTU", "16V4000G63", "other", 1, 1, 1, 1], ["MAN", "D2862", "other", 1, 1, 1, 1], ["FPT", "NEF67TE8P", "other", 1, 1, 1, 1],
    ["Baudouin", "6M33G715/5", "other", 1, 1, 1, 1], ["Mitsubishi", "S12R-PTA", "other", 1, 1, 1, 1], ["Kubota", "V3300", "other", 1, 1, 1, 1],
    ["Yanmar", "4TNV98", "other", 1, 1, 1, 1], ["Isuzu", "6BG1", "other", 1, 1, 1, 1], ["John Deere", "6068HF", "other", 1, 1, 1, 1], ["Kohler", "KD27V12", "other", 1, 1, 1, 1],
    // Hàn Quốc: G20, không phải G7.
    ["Doosan", "DP180LB", "other", 0, 1, 0, 1], ["Hyundai", "DP222LC", "other", 0, 1, 0, 1],
    // Thụy Điển: không G7, không G20; chỉ vào khi HSMT cho phép EU.
    ["Volvo Penta", "TAD1641GE", "other", 0, 0, 1, 1], ["Scania", "DC13", "other", 0, 0, 1, 1],
    ["Deutz", "BF6M1015", "other", 0, 0, 0, 0],
    ["Weichai", "WP13D405E200", "cn", 0, 0, 0, 0], ["Yuchai", "YC6T600L-D20", "cn", 0, 0, 0, 0], ["SDEC", "SC27G755D2", "cn", 0, 0, 0, 0],
    // Nguồn không ghi hãng: đọc theo mã model.
    ["", "KTA50-G3", "other", 1, 1, 1, 1], ["", "4BTA3.9-G2", "other", 1, 1, 1, 1], ["", "1106A-70TAG4", "other", 1, 1, 1, 1],
    ["", "TWD1744GE", "other", 0, 0, 1, 1], ["", "WP10D320E200", "cn", 0, 0, 0, 0], ["", "", null, 0, 0, 0, 0],
  ];
  for (const [make, model, origin, ...groups] of table) {
    assert.equal(CAT.originOf(e(make, model)), origin, `${make} ${model}`);
    ["g7", "g20", "g7eu", "g20eu"].forEach((g, i) => assert.equal(CAT.groupOf(e(make, model), g), !!groups[i], `${make} ${model} ${g}`));
  }
  // Động cơ thiết kế Baudouin do Weichai sản xuất (nguồn ghi cả hai hãng): không thuộc G7.
  assert.equal(CAT.groupOf({ makes: [{ name: "Baudouin" }, { name: "Weichai" }], model: "6M33D670E200" }, "g7"), false);
});

test("originOfHsmt: nhóm, phạm vi (cả tổ máy / chỉ bộ phận), EU đi kèm; câu phủ định và nước đơn lẻ không tính", () => {
  const o = (t) => { const r = originOfHsmt(t); return r && [r.origin, r.scope]; };
  assert.deepEqual(o("Xuất xứ: các nước G7"), ["g7", "genset"]);
  assert.deepEqual(o("Hàng hóa có xuất xứ từ các nước G-7"), ["g7", "genset"]);
  assert.deepEqual(o("Xuất xứ: G20"), ["g20", "genset"]);
  assert.deepEqual(o("Động cơ: xuất xứ G7"), ["g7", "parts"]);
  assert.deepEqual(o("Tổ máy phát điện xuất xứ từ các nước thuộc nhóm G7 hoặc EU"), ["g7eu", "genset"]);
  assert.deepEqual(o("Xuất xứ: Châu Âu/G7/Nhật Bản"), ["g7eu", "genset"]);
  assert.equal(o("Không yêu cầu xuất xứ G7"), null);
  assert.equal(o("Xuất xứ: Châu Âu"), null); // chỉ EU: không mở nhóm (Khoa 04/11)
  assert.equal(o("Xuất xứ: Nhật Bản"), null);
  assert.equal(o("Xuất xứ: Trung Quốc hoặc tương đương"), null);
  assert.equal(o("Máy phát G7000 diesel"), null); // mã hàng, không phải nhóm nước
});

// ---------- E. Ngưỡng HSMT ----------
test("powerMins: ngưỡng là công suất LIÊN TỤC của tổ máy; dự phòng, định mức không nhãn và công suất trục động cơ thì không", () => {
  const mp = (t) => powerMins(t).minPrime;
  assert.deepEqual({ ...mp("Công suất liên tục (Prime) ≥ 400 kVA / 320 kW\nCông suất dự phòng ≥ 440 kVA") }, { kVA: 400, kW: 320 });
  assert.deepEqual({ ...mp("Công suất liên tục: 1.250 kVA") }, { kVA: 1250 });
  assert.deepEqual({ ...mp("Prime power: 500kVA; Standby power: 550kVA") }, { kVA: 500 });
  assert.equal(mp("Công suất dự phòng (ESP) ≥ 550 kVA"), null);
  assert.equal(mp("Công suất định mức ≥ 500 kVA"), null); // không nói liên tục hay dự phòng: không đoán
  assert.equal(mp("Động cơ: công suất liên tục ≥ 440 kW"), null); // kWm của động cơ
  // Dung sai: "≥ 12 ± 0,5 kVA" là tối thiểu 11,5; "± 5%" không phải 5 kVA.
  assert.deepEqual({ ...mp("Công suất liên tục ≥ 12 ± 0,5 kVA") }, { kVA: 11.5 });
  assert.deepEqual({ ...mp("Công suất liên tục ≥ 400 kVA ± 5%") }, { kVA: 400 });
});

test("powerMins: mức tiêu hao tối đa theo đúng mức tải HSMT nêu (100 / 75 / 50%)", () => {
  const m = powerMins("Công suất liên tục ≥ 500 kVA ở cosφ 0,8\nTiêu hao nhiên liệu ở 100% tải ≤ 105 lít/giờ\nTiêu hao nhiên liệu ở 75% tải ≤ 80 l/h\nTiêu hao nhiên liệu ở 50% tải ≤ 56 L/h");
  assert.deepEqual([m.maxFuel, m.maxFuel75, m.maxFuel50], [105, 80, 56]);
  // Chỉ nêu 75%: không được coi là mức đầy tải.
  const p = powerMins("Tiêu hao nhiên liệu ở 75% tải ≤ 80 l/h");
  assert.deepEqual([p.maxFuel, p.maxFuel75], [null, 80]);
});

test("engineMins / litres: dung tích xi lanh theo L, cc, cm³; bình dầu, nhớt, nước làm mát không phải dung tích xi lanh", () => {
  assert.equal(engineMins("Dung tích xi lanh ≥ 15 lít").minDisp, 15);
  assert.equal(engineMins("Dung tích xy lanh: ≥ 14.900 cc").minDisp, 14.9);
  assert.equal(engineMins("Dung tích xi lanh ≥ 15.000 cm3").minDisp, 15);
  assert.equal(engineMins("Dung tích xi lanh ≥ 9.726L").minDisp, 9.726);
  assert.equal(engineMins("Dung tích xi lanh ≤ 16 lít").maxDisp, 16);
  assert.equal(engineMins("Số xi lanh: ≥ 6, thẳng hàng").minCyl, 6);
  assert.equal(engineMins("Số xi lanh: 12 chữ V").minCyl, 12);
  const none = engineMins("Dung tích bình nhiên liệu ≥ 800 lít\nDung tích nhớt bôi trơn ≥ 40 lít\nDung tích nước làm mát ≥ 60 lít");
  assert.deepEqual([none.minDisp, none.maxDisp], [null, null]);
  for (const [text, l] of [["15L", 15], ["9.726L", 9.726], ["14.900 cc", 14.9], ["14900cc", 14.9], ["15,2 lít", 15.2], ["2.2L", 2.2], ["37800 ml", 37.8], ["0.499L", 0.499], ["37.8", 37.8], ["105,56 L", 105.56]]) assert.equal(litres(text), l, text);
  assert.equal(litres("110"), null); // không đơn vị, giữa 100 và 130: có thể là L hoặc cc
  assert.equal(litres(""), null);
});

test("litres không đọc in³ (datasheet Mỹ) thành cc", { todo: "litres('912 in3') = 0,912 L thay vì 14,9 L hoặc null (danh mục hiện chưa có dòng in³)" }, () => {
  assert.notEqual(litres("912 in3"), 0.912);
});

test("dải công suất ứng viên: 100–120% cỡ HSMT; máy nhỏ ≤ 30 kVA (24 kW) tới 140% (Khoa 12/11)", () => {
  assert.equal(NEAR_LOW, 0.995); assert.equal(SMALL_KVA, 30);
  assert.equal(bandOf({ value: 30, unit: "kVA" }).high, 1.4);
  assert.equal(bandOf({ value: 30.1, unit: "kVA" }).high, 1.2);
  assert.equal(bandOf({ value: 24, unit: "kW" }).high, 1.4); // 24 kW = 30 kVA ở 0,8
  assert.equal(bandOf({ value: 24.1, unit: "kW" }).high, 1.2);
  assert.equal(bandOf({ value: 500, unit: "kVA" }).high, 1.2);
  assert.equal(bandOf(null).high, 1.2);
});

test("plausible: giữ ngưỡng hợp cỡ máy, bỏ ngưỡng của máy khác trong cùng HSMT", () => {
  // 500 kVA: ~105 L/h đầy tải (0,21 L/h mỗi kVA), 15 L, 6 xi lanh là bình thường.
  const ok = { maxFuel: 105, maxFuel75: 80, maxFuel50: 55, minDisp: 15, maxDisp: 16, minCyl: 6, minPrime: { kVA: 500 } };
  assert.deepEqual(plausible(ok, { value: 500, unit: "kVA" }), ok);
  assert.deepEqual(plausible(ok, { value: 400, unit: "kW" }), ok); // cỡ ghi theo kW: cùng máy
  // 8,5 kVA: 450 L/h, 150 L, 6 xi lanh, liên tục 107 kVA đều là số của máy khác / lỗi OCR.
  assert.deepEqual(plausible({ maxFuel: 450, maxFuel75: 10, maxFuel50: 9, minDisp: 150, minCyl: 6, minPrime: { kVA: 107 } }, { value: 8.5, unit: "kVA" }),
    { maxFuel: null, maxFuel75: null, maxFuel50: null, minDisp: null, minCyl: null, minPrime: null });
  // Dung tích tối đa nhỏ hơn dung tích tối thiểu: của máy khác.
  assert.equal(plausible({ minDisp: 15, maxDisp: 7 }, { value: 500, unit: "kVA" }).maxDisp, null);
  // Không biết cỡ máy thì không lọc.
  assert.deepEqual(plausible({ maxFuel: 450 }, null), { maxFuel: 450 });
});

// ---------- F. Bộ mã yêu cầu ----------
test("mã yêu cầu: mỗi mã có đủ thuộc tính, loại (kind) hợp lệ, không trùng", () => {
  const kinds = new Set(Array.isArray(KINDS) ? KINDS : Object.keys(KINDS));
  for (const c of REQ_CODES) {
    assert.ok(["genset", "engine", "alternator", "controller"].includes(c.part), `${c.code} part`);
    assert.ok(["core", "option"].includes(c.level), `${c.code} level`);
    assert.ok(kinds.has(kindOf(c.code)), `${c.code} kind ${kindOf(c.code)}`);
    assert.equal(c.words.global, false, `${c.code}: regex có cờ g sẽ nhớ lastIndex giữa các lần test`);
  }
});

test("mã yêu cầu: cách HSMT thật gọi từng chỉ tiêu", () => {
  const cases = [
    // tổ máy
    ["Công suất liên tục (PRP)", "", "power_prime"], ["Công suất dự phòng (ESP)", "", "power_standby"], ["Standby power", "", "power_standby"],
    ["Điện áp định mức", "400/230 V", "voltage"], ["Tần số", "50 Hz", "frequency"], ["Hệ số công suất", "cosφ 0,8", "power_factor"], ["Số pha, số dây", "3 pha 4 dây", "phases"],
    ["Khả năng quá tải", "110% trong 1 giờ mỗi 12 giờ", "overload"], ["Khả năng nhận tải một bước", "≥ 60%", "load_step"], ["Cấp vận hành", "G3 theo ISO 8528-5", "iso8528_class"],
    ["Độ ồn", "≤ 75 dB(A) tại 7 m", "noise"], ["Bồn dầu", "đủ chạy 8 giờ đầy tải", "fuel_tank"], ["Vỏ chống ồn", "", "canopy"], ["Ắc quy", "2 × 12 V - 150 Ah", "battery"],
    ["Nhiệt độ môi trường", "đến 45 °C", "ambient"], ["Độ cao lắp đặt", "≤ 1000 m", "ambient"], ["Tiêu hao nhiên liệu 75% tải", "≤ 80 L/h", "fuel_consumption_75"],
    // động cơ
    ["Số xi lanh", "6, thẳng hàng", "cylinders"], ["Dung tích xi lanh", "≥ 15 lít", "displacement"], ["Tỷ số nén", "16:1", "compression"], ["Kiểu nạp khí", "tăng áp, làm mát khí nạp", "aspiration"],
    ["Điều tốc", "điện tử", "governor"], ["Tốc độ quay", "1500 vòng/phút", "speed"], ["Tiêu chuẩn khí thải", "EU Stage II", "emission"], ["Hệ thống khởi động", "đề điện 24 VDC", "starting"],
    ["Hệ thống làm mát", "két nước, quạt gió", "cooling"],
    // đầu phát
    ["Cấp cách điện", "H", "alt_insulation"], ["Cấp bảo vệ", "IP23", "alt_ip"], ["Độ ổn định điện áp", "± 0,5%", "alt_vreg"], ["Độ méo sóng hài THD", "≤ 3%", "alt_thd"],
    ["Kiểu đầu phát", "không chổi than, tự kích từ", "alt_type"], ["Dòng ngắn mạch duy trì", "≥ 300% trong 10 giây", "alt_short_circuit"], ["Biến thiên tần số", "± 0,25%", "freq_regulation"],
    // bộ điều khiển
    ["Chức năng bảo vệ", "quá tốc, áp suất nhớt thấp, nhiệt độ nước cao", "ctl_protection"], ["Hòa đồng bộ", "", "ctl_parallel"], ["Truyền thông", "RS485 Modbus", "ctl_comm"],
    // thương mại: không có mã
    ["Bảo hành", "24 tháng", "other"], ["Năm sản xuất", "2025 trở về sau", "other"],
  ];
  for (const [item, requirement, code] of cases) assert.equal(codeOf({ item, requirement }), code, `${item}: ${requirement}`);
});

test("mã yêu cầu: tên chuẩn của mỗi mã phải đọc ngược lại ra chính mã đó", { todo: "4 mã trượt: fuel_system → other, alt_avr → voltage, alt_standard → other, ctl_display_lang → ctl_measure (check hiếm khi mang code nên bị tra lại theo tên)" }, () => {
  const bad = REQ_CODES.filter((c) => !c.byCode && codeOf({ item: c.item }) !== c.code).map((c) => `${c.code} → ${codeOf({ item: c.item })}`);
  assert.deepEqual(bad, []);
});

test("mã yêu cầu: AVR là bộ điều chỉnh điện áp của đầu phát, không phải điện áp định mức của tổ máy", { todo: "352/355 dòng 'điều chỉnh điện áp' của phân tích thật ra mã voltage → bị gộp chung với yêu cầu 400/230 V" }, () => {
  assert.equal(codeOf({ item: "Điều chỉnh điện áp tự động (AVR)", requirement: "Có" }), "alt_avr");
  assert.equal(codeOf({ item: "Bộ điều chỉnh điện áp", requirement: "AVR" }), "alt_avr");
  assert.equal(codeOf({ item: "Độ điều chỉnh điện áp", requirement: "± 1%" }), "alt_vreg");
});

test("mã yêu cầu: 'cấp cách nhiệt', 'cấp nhiệt độ giới hạn' là cấp cách điện của đầu phát", { todo: "34+ dòng 'đầu phát: cấp cách nhiệt' ra mã other" }, () => {
  assert.equal(codeOf({ item: "Cấp cách nhiệt", requirement: "H", part: "alternator" }), "alt_insulation");
  assert.equal(codeOf({ item: "Cấp tăng nhiệt", requirement: "F", part: "alternator" }), "alt_insulation");
});

test("mã yêu cầu: dòng ngắn mạch đầu phát chịu được (300% / 10 s) không phải chức năng bảo vệ của bộ điều khiển", { todo: "55/80 dòng 'ngắn mạch' ra ctl_protection, gồm 'Khả năng chịu dòng ngắn mạch ≥ 300% trong 10 giây' của đầu phát" }, () => {
  assert.equal(codeOf({ item: "Khả năng chịu dòng ngắn mạch", requirement: "≥ 300% trong vòng 10 giây", part: "alternator" }), "alt_short_circuit");
  assert.equal(codeOf({ item: "Dòng duy trì ngắn mạch", requirement: "3859A duy trì trong vòng 10 giây", part: "alternator" }), "alt_short_circuit");
  // Bảo vệ ngắn mạch của bộ điều khiển vẫn là ctl_protection.
  assert.equal(codeOf({ item: "Bảo vệ ngắn mạch", requirement: "Có", part: "controller" }), "ctl_protection");
});
