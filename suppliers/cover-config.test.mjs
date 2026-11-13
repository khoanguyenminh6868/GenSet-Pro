// node --test suppliers/*.test.mjs — T2: hàm xuất ra của config-bot.mjs chưa có test nào nhắc tới (đếm 13/11/2026: 30 tên):
// ORIGIN, basisOfLine, REQ_VERSION, allDocs, post, MAX_SIZES, sizeText, sizesFor, RATED_KEY, controllerSheetFacts, sheetText,
// sectionsOf, engineLists, powerRead, MAKE_CAP, MAX_CONFIGS, hsmtTextOf, capNote, ratedPower, SYNC_ITEM, sheetChecks, LOSS_RANKS,
// targetText, WEB_KEEP, savedSrc, sizeTag. Không phủ (cần tệp ngoài / tiến trình ngoài, xem nghiệm thu): pdfToText, findPrep,
// specPrep, specPost.
// Mạng được giả bằng globalThis.fetch (không có cuộc gọi thật), thư mục tạm cho kho đọc lại và tệp token; các biến môi trường
// của config-bot được đặt TRƯỚC khi nạp module.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "cover-config-"));
process.env.GENBID_INGEST_TOKEN_FILE = path.join(TMP, "token");
fs.writeFileSync(process.env.GENBID_INGEST_TOKEN_FILE, "tok-test\n");
process.env.GENBID_WEB = "http://stub.invalid";
process.env.GENBID_DOC_CACHE = path.join(TMP, "doc-cache");
process.env.GENBID_CONFIG_WEB = path.join(TMP, "config-web");
const C = await import("./config-bot.mjs");
test.after(() => fs.rmSync(TMP, { recursive: true, force: true }));

// ---------- giả fetch ----------
const realFetch = globalThis.fetch;
function stubFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), opts });
    const r = await handler(String(url), opts, calls.length);
    return { ok: r.ok ?? true, status: r.status ?? 200, json: async () => r.json, text: async () => r.text ?? JSON.stringify(r.json ?? null) };
  };
  return calls;
}
test.afterEach(() => { globalThis.fetch = realFetch; });
const q = (url) => Object.fromEntries(new URL(url).searchParams);

// ---------- hằng số (khoá hành vi: số do Khoa / điều phối chốt, đổi có chủ ý thì sửa ở đây) ----------
test("hằng số: tối đa 4 cỡ máy một gói, 6 cấu hình, trần 10 dòng một hãng động cơ (Khoa 12/11), 3 hạng cho kiểm 'mất ở vòng', giữ 2 trang web", () => {
  assert.equal(C.MAX_SIZES, 4);
  assert.equal(C.MAX_CONFIGS, 6);
  assert.equal(C.MAKE_CAP, 10);
  assert.equal(C.LOSS_RANKS, 3);
  assert.equal(C.WEB_KEEP, 2);
  assert.equal(C.SYNC_ITEM, "Đồng bộ thương hiệu");
  assert.deepEqual(C.RATED_KEY, { prime: "engPrime", standby: "engStandby" });
});
test("REQ_VERSION: số nguyên ≥ 5 (5 = thêm alt_excitation, alt_short_circuit 10/11; thêm mã yêu cầu phải tăng, không bao giờ giảm)", () => {
  assert.ok(Number.isInteger(C.REQ_VERSION) && C.REQ_VERSION >= 5);
});
test("ORIGIN: nhãn xuất xứ tiếng Việt cho mọi điều kiện web chọn và hai nhóm chỉ đọc từ HSMT (G7 hoặc EU, G20 hoặc EU)", () => {
  for (const k of ["cn", "g7", "g20", "other", "all", "g7eu", "g20eu"]) assert.ok(C.ORIGIN[k], k);
  assert.equal(C.ORIGIN.cn, "Trung Quốc");
  assert.match(C.ORIGIN.g20, /trừ Trung Quốc/); // G20 không gồm Trung Quốc
  assert.match(C.ORIGIN.g7eu, /EU/);
  assert.match(C.ORIGIN.g7, /Mỹ.*Anh.*Đức.*Pháp.*Ý.*Nhật.*Canada/); // đủ 7 nước
});

// ---------- basisOfLine ----------
test("basisOfLine: dòng ghi 'Nhà sản xuất/ nhãn hiệu: Nhóm G7, EU' là yêu cầu về HÃNG, không phải xuất xứ của dòng trên", () => {
  const L = ["1 Nước sản xuất: Nêu cụ thể", "2 Nhà sản xuất/ nhãn hiệu: Nhóm các nước khối G7, EU"];
  assert.equal(C.basisOfLine(L, 1), "brand");
});
test("basisOfLine: 'Xuất xứ hàng hoá thuộc các nước G7' là xuất xứ", () => {
  assert.equal(C.basisOfLine(["3 Xuất xứ Hàng hóa thuộc các nước G7"], 0), "origin");
  assert.equal(C.basisOfLine(["Made in G7 countries"], 0), "origin");
  assert.equal(C.basisOfLine(["Lắp ráp tại các nước G7"], 0), "origin");
});
test("basisOfLine: dòng không nói hãng cũng không nói xuất xứ ('1 Động cơ EU, G7 hoặc G20') mặc định xuất xứ", () => {
  assert.equal(C.basisOfLine(["1 Động cơ EU, G7 hoặc G20"], 0), "origin");
  assert.equal(C.basisOfLine([], 5), "origin"); // ngoài mảng
});
test("basisOfLine: nhãn nằm ở dòng trên khi dòng này không bắt đầu một hàng đánh số; hàng đánh số riêng thì không mượn nhãn dòng trên", () => {
  assert.equal(C.basisOfLine(["Nhà sản xuất", "Nhóm các nước G7"], 1), "brand");
  assert.equal(C.basisOfLine(["Nhà sản xuất", "1 Động cơ nhóm G7"], 1), "origin");
});

// ---------- sizeText / sizeTag ----------
test("sizeText: có số lượng thì 'N x cỡ', không thì chỉ cỡ", () => {
  assert.equal(C.sizeText({ qty: 2, label: "400 kVA" }), "2 x 400 kVA");
  assert.equal(C.sizeText({ qty: null, label: "400 kVA" }), "400 kVA");
});
test("sizeTag: tên thư mục theo cỡ — kVA, hoặc kW khi gói ghi kW; không cỡ là 'all'; bỏ ký tự lạ", () => {
  assert.equal(C.sizeTag({ kva: 400 }), "400kVA");
  assert.equal(C.sizeTag({ cap: { value: 320, unit: "kW" } }), "320kW");
  assert.equal(C.sizeTag({ kva: 12.5 }), "12.5kVA");
  assert.equal(C.sizeTag(null), "all");
  assert.equal(C.sizeTag(undefined), "all");
  assert.equal(C.sizeTag({ kva: 400, cap: { value: 320, unit: "kW" } }), "400kVA"); // kVA thắng
  assert.ok(!/[\\/ :*?"<>|]/.test(C.sizeTag({ cap: { value: 1, unit: "k/W" } }))); // dùng làm tên thư mục Windows
});

// ---------- capNote ----------
test("capNote: ghi chú ngắn (≤ 300 ký tự) giữ nguyên; dài thì cắt ở ranh giới từ, thêm '…', không vượt 300", () => {
  assert.equal(C.capNote("ngắn"), "ngắn");
  assert.equal(C.capNote("x".repeat(300)), "x".repeat(300)); // đúng ngưỡng: giữ
  const out = C.capNote("từ ".repeat(200));
  assert.ok(out.length <= 300);
  assert.ok(out.endsWith("…"));
  assert.ok(!/\s…$/.test(out));
  assert.ok(out.endsWith("từ…")); // không cắt giữa chữ
  assert.ok(C.capNote("y".repeat(301)).length <= 300); // một từ dài liền: vẫn cắt được
});

// ---------- targetText ----------
test("targetText: mô tả cấu hình cần tìm NCC: động cơ, đầu phát, bộ điều khiển (kèm hãng), tổ máy tham chiếu", () => {
  const s = C.targetText({ engine: { model: "6BT5.9", make: "Cummins" }, alternator: { model: "UCI274", make: "Stamford" }, controller: { model: "HGM6120N" }, genset: { model: "X1" } });
  assert.equal(s, "động cơ 6BT5.9 (Cummins), đầu phát UCI274 (Stamford), bộ điều khiển HGM6120N, tổ máy tham chiếu X1");
});
test("targetText: bộ phận không có model thì bỏ qua; rỗng thì chuỗi rỗng", () => {
  assert.equal(C.targetText({ engine: { model: "QSB7" }, alternator: { make: "Stamford" } }), "động cơ QSB7");
  assert.equal(C.targetText({}), "");
});

// ---------- sheetText ----------
test("sheetText: gộp tiêu đề + dòng bảng + câu trích của datasheet; không có datasheet thì rỗng", () => {
  const t = C.sheetText({ tables: [{ title: "DHY110KSE", rows: ["Voltage ±1%", "Freq 50Hz"] }], quotes: [{ line: "Hyundai genset" }] });
  for (const w of ["DHY110KSE", "Voltage ±1%", "Freq 50Hz", "Hyundai genset"]) assert.ok(t.includes(w), w);
  assert.equal(C.sheetText(null), "");
  assert.equal(C.sheetText(undefined), "");
});

// ---------- savedSrc ----------
test("savedSrc: nguồn đã ghi chỗ lưu dạng đối tượng → tệp 'catalog:<ncc>/<n>'; dạng chuỗi → 'saved:...'", () => {
  assert.deepEqual(C.savedSrc({ url: "u", saved: { supplierId: "rehlko", n: 2003 } }, [], TMP), { url: "u", saved: { supplierId: "rehlko", n: 2003 }, file: "catalog:rehlko/2003" });
  assert.equal(C.savedSrc({ saved: "k/400kVA/h.txt" }, [], TMP).file, "saved:k/400kVA/h.txt");
});
test("savedSrc: chưa ghi chỗ lưu → tìm trang trong nguồn của hồ sơ NCC (cùng URL không phân biệt http/https, dấu / cuối, hoa thường)", () => {
  const src = path.join(TMP, "sources"); fs.mkdirSync(path.join(src, "rehlko"), { recursive: true });
  fs.writeFileSync(path.join(src, "rehlko", "2003.md"), "URL: https://x\nD440 prime 440 kW");
  const sup = [{ id: "rehlko", sources: [{ n: 2003, url: "https://Rehlko.com/d440.pdf/" }] }];
  const out = C.savedSrc({ url: "http://rehlko.com/d440.pdf", quote: "D440 prime" }, sup, src);
  assert.equal(out.file, "catalog:rehlko/2003");
  assert.deepEqual(out.saved, { supplierId: "rehlko", n: 2003 });
});
test("savedSrc: không có chỗ lưu và không có trang trong hồ sơ → nguồn giữ nguyên, không có 'file'; không sửa đầu vào", () => {
  const input = { url: "https://nowhere.example/x" };
  const out = C.savedSrc(input, [], TMP);
  assert.deepEqual(out, input);
  assert.notEqual(out, input);
  assert.equal(out.file, undefined);
});

// ---------- ratedPower ----------
test("ratedPower: 'Engine Prime Power (kW)' 441 là công suất prime của động cơ", () => {
  const p = C.ratedPower("Engine Prime Power (kW)", "441");
  assert.equal(p.prime, 441);
  assert.equal(p.standby, undefined);
});
test("ratedPower: 'Prime power / Speed (KW/RPM)' 284/1500 → prime 284 kW, tốc độ 1500 vòng/phút (fdk-energy: số thứ hai là tốc độ)", () => {
  const p = C.ratedPower("Prime power / Speed (KW/RPM)", "284/1500");
  assert.equal(p.prime, 284);
  assert.equal(p.rpm, 1500);
});
test("ratedPower: nhãn '(prime/standby)' với giá trị 40/44 → prime 40, standby 44 theo thứ tự của nhãn", () => {
  const p = C.ratedPower("Engine Power(kw) (prime/standby)", "40/44");
  assert.equal(p.prime, 40);
  assert.equal(p.standby, 44);
});
test("ratedPower: nhãn ngược '(standby/prime)' 44/40 → standby 44, prime 40", () => {
  const p = C.ratedPower("Engine Power(kw) (standby/prime)", "44/40");
  assert.equal(p.standby, 44);
  assert.equal(p.prime, 40);
});
test("ratedPower: giá trị ghi rõ kW từng mức: '440 kW prime, 484 kW standby'", () => {
  const p = C.ratedPower("Engine power", "440 kW prime; 484 kW standby");
  assert.deepEqual([p.prime, p.standby], [440, 484]);
});
test("ratedPower: standby ghi trong nhãn, giá trị 484 kW", () => {
  const p = C.ratedPower("Standby power", "484 kW");
  assert.equal(p.standby, 484);
  assert.equal(p.prime, undefined);
});
test("ratedPower: gross / net được ghi nhận", () => {
  assert.equal(C.ratedPower("Prime power gross (kW)", "441").gross, true);
  assert.equal(C.ratedPower("Prime power net (kW)", "430").net, true);
});
test("ratedPower: phủ định — mã lực (HP), không đơn vị kW, không nói prime/standby, rỗng", () => {
  assert.equal(C.ratedPower("Power (HP)", "300"), null);
  assert.equal(C.ratedPower("Prime power (PS)", "300"), null);
  assert.equal(C.ratedPower("Dung tích", "12 L"), null);
  assert.equal(C.ratedPower("Engine power (kW)", "441"), null); // không nêu mức công suất
  assert.equal(C.ratedPower(), null);
});

// ---------- sectionsOf ----------
const DOC = "I Yêu cầu đối với động cơ\nxx\nIII Yêu cầu đối với đầu phát điện\nyy\nIV Bộ điều khiển\nzz";
test("sectionsOf: hàm trả phần của tổ máy tại một vị trí chữ: động cơ, đầu phát, rồi (bộ điều khiển) quay về tổ máy", () => {
  const at = C.sectionsOf(DOC);
  assert.equal(at(0), "engine");
  assert.equal(at(DOC.indexOf("xx")), "engine");
  assert.equal(at(DOC.indexOf("yy")), "alt");
  assert.equal(at(DOC.indexOf("zz")), "genset");
});
test("sectionsOf: trước tiêu đề đầu tiên và văn bản không có tiêu đề là 'genset'", () => {
  assert.equal(C.sectionsOf("abc\ndef")(2), "genset");
  assert.equal(C.sectionsOf("")(0), "genset");
});
test("sectionsOf: một hàng 'Động cơ: 4 thì' không phải tiêu đề phần (sau nhãn có giá trị)", () => {
  assert.equal(C.sectionsOf("Động cơ: 4 thì\nabc")(10), "genset");
});
test("sectionsOf: tiêu đề La Mã tách dòng (số 'III' một dòng, chữ ở dòng dưới) vẫn nhận; tiêu đề tiếng Anh 'Alternator'", () => {
  const t = "III\nYêu cầu đối với đầu phát điện\nabc";
  assert.equal(C.sectionsOf(t)(t.indexOf("abc")), "alt");
  const e = "A. Alternator\nabc";
  assert.equal(C.sectionsOf(e)(e.indexOf("abc")), "alt");
});

// ---------- engineLists ----------
const uniq = (a) => [...new Set(a)];
test("engineLists: dung tích xi lanh tối thiểu và số xi lanh tối thiểu của động cơ", () => {
  const r = C.engineLists("Dung tích xi lanh ≥ 11,05 lít\nSố xi lanh ≥ 6 xi lanh");
  assert.deepEqual(uniq(r.disp), [11.05]); // (khoá hành vi: dòng số xi lanh làm giá trị lặp trong danh sách, engineMins dùng tập nên không ảnh hưởng)
  assert.deepEqual(r.cyl, [6]);
  assert.deepEqual(r.dmax, []);
});
test("engineLists: dung tích tối đa (HSMT viết quanh một động cơ) vào dmax, không vào tối thiểu (Khoa 03/11)", () => {
  const r = C.engineLists("Dung tích xi lanh ≤ 15,2 L");
  assert.deepEqual(r, { disp: [], dmax: [15.2], cyl: [] });
});
test("engineLists: 'Tổng dung tích làm mát ≥ 55 L' là bình làm mát, không phải dung tích xi lanh (rà soát 12/11)", () => {
  assert.deepEqual(C.engineLists("Tổng dung tích làm mát ≥ 55 L").disp, []);
  assert.deepEqual(C.engineLists("Dung tích bình nhiên liệu ≥ 200 lít").disp, []);
});
test("engineLists: dung sai ± hạ mức tối thiểu: '12,9 L (± 3%)' → 12,513 (IB2300087393: 12,78 L phải lọt)", () => {
  assert.deepEqual(C.engineLists("Dung tích xi lanh ≥ 12,9 L (± 3%)").disp, [12.513]);
});
test("engineLists: đơn vị cc / cm3 đổi sang lít: '≥ 4.087 cc' → 4,087", () => {
  assert.deepEqual(uniq(C.engineLists("Dung tích xi lanh ≥ 4.087 cc").disp), [4.087]);
});
test("engineLists: nhãn một dòng, số ở dòng sau (ô bảng) vẫn nhận; số trần của hàng kế tiếp không bị nhận nhầm", () => {
  assert.deepEqual(uniq(C.engineLists("Dung tích xi lanh\n≥ 11.051 L").disp), [11.051]);
  assert.deepEqual(C.engineLists("Số xy lanh: Nêu rõ\n7").cyl, []); // 7 là số thứ tự hàng sau
});
test("engineLists: phần dành cho thiết bị khác (xe nâng) bị bỏ, chỉ lấy phần của máy phát điện", () => {
  const t = "3.2.1. Yêu cầu về kỹ thuật cụ thể cho xe nâng\nSố xi lanh ≥ 4 xi lanh\n3.2.2. Yêu cầu kỹ thuật cho máy phát điện\nSố xi lanh ≥ 6 xi lanh";
  assert.deepEqual(C.engineLists(t).cyl, [6]);
});
test("engineLists: văn bản rỗng / không có thông số", () => {
  assert.deepEqual(C.engineLists(""), { disp: [], dmax: [], cyl: [] });
  assert.deepEqual(C.engineLists(null), { disp: [], dmax: [], cyl: [] });
});

// ---------- powerRead ----------
test("powerRead: 'Công suất liên tục (Prime) ≥ 400 kVA' → mức tối thiểu prime 400 kVA", () => {
  assert.deepEqual(C.powerRead("Công suất liên tục (Prime) ≥ 400 kVA").mins.minPrime, { kVA: 400 });
});
test("powerRead: prime kVA / kW trên một dòng: '125kVA / 100 kW' cho cả hai đơn vị", () => {
  const m = C.powerRead("Công suất liên tục (100% tải) 125kVA / 100 kW").mins.minPrime;
  assert.equal(m.kVA, 125);
  assert.equal(m.kW, 100);
});
test("powerRead: công suất dự phòng (standby) một mình không thành mức prime", () => {
  assert.equal(C.powerRead("Công suất dự phòng ≥ 440 kVA").mins.minPrime, null);
  assert.deepEqual(C.powerRead("Công suất liên tục ≥ 400 kVA\nCông suất dự phòng ≥ 440 kVA").mins.minPrime, { kVA: 400 });
});
test("powerRead: công suất liên tục của ĐỘNG CƠ (trục, kW) không phải của tổ máy", () => {
  assert.equal(C.powerRead("Công suất liên tục của động cơ ≥ 15,5 kW").mins.minPrime, null);
});
test("powerRead: gói nhiều cỡ (100 và 400 kVA, cách nhau > 15%) → không chọn mức nào", () => {
  assert.equal(C.powerRead("Công suất liên tục ≥ 100 kVA\nCông suất liên tục ≥ 400 kVA").mins.minPrime, null);
});
test("powerRead: hai số trong 15% (tổ máy 11,5 và đầu phát 12 kVA) lấy số thấp", () => {
  assert.equal(C.powerRead("Công suất liên tục ≥ 11,5 kVA\nCông suất liên tục ≥ 12 kVA").mins.minPrime.kVA, 11.5);
});
test("powerRead: tiêu hao nhiên liệu tối đa theo mức tải: đầy tải 100% → maxFuel, 75% → maxFuel75, 50% → maxFuel50", () => {
  assert.equal(C.powerRead("Tiêu hao nhiên liệu ở 100% tải ≤ 90 Lít/giờ").mins.maxFuel, 90);
  assert.equal(C.powerRead("Tiêu hao nhiên liệu ở 75% tải ≤ 70 Lít/giờ").mins.maxFuel75, 70);
  assert.equal(C.powerRead("Tiêu hao nhiên liệu ở 50% tải ≤ 48 l/h").mins.maxFuel50, 48);
  assert.equal(C.powerRead("Mức tiêu hao nhiên liệu ở đầy tải ≤ 85 Lít/giờ").mins.maxFuel, 85);
});
test("powerRead: giới hạn nhiên liệu không phải về tiêu hao (dung tích bình) bị bỏ; hai giới hạn khác nhau cùng mức tải → không chọn", () => {
  assert.equal(C.powerRead("Dung tích bình chứa ≤ 90 Lít/giờ").mins.maxFuel, null);
  assert.equal(C.powerRead("Tiêu hao nhiên liệu ở 100% tải ≤ 90 Lít/giờ\nTiêu hao nhiên liệu ở 100% tải ≤ 60 Lít/giờ").mins.maxFuel, null);
});
test("powerRead: văn bản rỗng không ném; trả danh sách rỗng", () => {
  const r = C.powerRead("");
  assert.deepEqual([r.prime, r.fuel], [[], []]);
  assert.equal(r.mins.minPrime, null);
});

// ---------- controllerSheetFacts ----------
test("controllerSheetFacts: datasheet hai model (DSE7310 / DSE7320 MKII): dòng dưới tiêu đề model thuộc model đó; 'Common' / 'Specifications' thuộc cả hai", () => {
  const out = C.controllerSheetFacts({ id: "dse" }, { n: 2, title: "Datasheet: DSE7310 MKII & DSE7320 MKII", rows: ["DSE7310 MKII Automatic Start Controller Key Features", "Auto start", "DSE7320 MKII Automatic Mains Failure Key Features", "AMF", "Common Specifications", "Voltage 8-35V"] });
  const by = (line) => out.filter((x) => x.f.line === line).map((x) => x.model).sort();
  assert.deepEqual(by("Auto start"), ["DSE7310MKII"]);
  assert.deepEqual(by("AMF"), ["DSE7320MKII"]);
  assert.deepEqual(by("Voltage 8-35V"), ["DSE7310MKII", "DSE7320MKII"]);
  assert.ok(out.every((x) => x.f.key === "ctl" && x.f.supplierId === "dse" && x.f.n === 2));
});
test("controllerSheetFacts: mô hình SmartGen 'HGM6120N/6120NC' : mỗi mã sau dấu / là một model", () => {
  const out = C.controllerSheetFacts({ id: "smartgen" }, { n: 1, title: "HGM6120N/6120NC Genset Controller", rows: ["Auto start"] });
  assert.deepEqual([...new Set(out.map((x) => x.model))].sort(), ["HGM6120N", "HGM6120NC"]);
});
test("controllerSheetFacts: tiêu đề không có model bộ điều khiển → không có dữ kiện", () => {
  assert.deepEqual(C.controllerSheetFacts({ id: "x" }, { n: 1, title: "Product overview", rows: ["Auto start"] }), []);
});
test("controllerSheetFacts: dòng của một datasheet khác chỉ nhắc tới bộ điều khiển (tương thích DSE7320) không cho dữ kiện của DSE7320", () => {
  const out = C.controllerSheetFacts({ id: "x" }, { n: 1, title: "DSE7310 MKII Datasheet", rows: ["Compatible with DSE7320 MKII"] });
  assert.ok(out.every((x) => x.model === "DSE7310MKII"));
});

// ---------- sheetChecks ----------
const sheet = { model: "DHY110KSE", supplierId: "hyundai-power", n: 7, quotes: [{ line: "Hyundai DHY110KSE diesel genset", n: 7 }], tables: [] };
const vreg = (extra) => [{ code: "alt_vreg", item: "Điều chỉnh điện áp", requirement: "Điều chỉnh điện áp ≤ ±1%", quote: "q", ...extra }];
const open = (item = "Điều chỉnh điện áp", status = "unclear") => ({ checks: [{ item, status }] });
const fv = (value, label = "Voltage regulation", line = "l") => ({ key: "vreg", label, value, unit: "%", line });

test("sheetChecks alt_vreg: điều chỉnh điện áp của datasheet ≤ ±1% mà HSMT đòi → đạt bằng code, ghi nguồn datasheet và trạng thái cũ", () => {
  const c = C.sheetChecks(open(), vreg(), { sheet, facts: [fv("±1", "Voltage regulation", "Voltage regulation ±1%")] });
  const x = c.checks[0];
  assert.equal(x.status, "met");
  assert.equal(x.was, "unclear");
  assert.equal(x.byCode, true);
  assert.equal(x.part, "alternator");
  assert.equal(x.sheetSrc.supplierId, "hyundai-power");
  assert.equal(x.sheetSrc.n, 7);
  assert.match(x.note, /datasheet tổ máy DHY110KSE/);
});
test("sheetChecks alt_vreg: ranh giới — đúng bằng ngưỡng đạt, vượt ngưỡng (±2% > ±1%) thì không đổi", () => {
  assert.equal(C.sheetChecks(open(), vreg(), { sheet, facts: [fv("±1")] }).checks[0].status, "met");
  assert.equal(C.sheetChecks(open(), vreg(), { sheet, facts: [fv("±2")] }).checks[0].status, "unclear"); // chỉ đạt, không bao giờ tự kết luận không đạt
});
test("sheetChecks alt_vreg: dòng điện áp quá độ (transient / dip) không tính; mọi dòng ổn định đều phải trong ngưỡng", () => {
  assert.equal(C.sheetChecks(open(), vreg(), { sheet, facts: [fv("±1"), fv("±15", "Transient voltage dip")] }).checks[0].status, "met");
  assert.equal(C.sheetChecks(open(), vreg(), { sheet, facts: [fv("±1"), fv("±3", "Voltage regulation (no load)")] }).checks[0].status, "unclear");
});
test("sheetChecks: không đụng dòng đã đạt / không đạt, yêu cầu đã do code ghi, yêu cầu chưa xác minh; không có datasheet thì giữ nguyên", () => {
  assert.equal(C.sheetChecks(open("Điều chỉnh điện áp", "unmet"), vreg(), { sheet, facts: [fv("±0.5")] }).checks[0].status, "unmet");
  assert.equal(C.sheetChecks(open("Điều chỉnh điện áp", "met"), vreg(), { sheet, facts: [fv("±0.5")] }).checks[0].was, undefined);
  assert.equal(C.sheetChecks(open(), vreg({ byCode: true }), { sheet, facts: [fv("±0.5")] }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(open(), vreg({ unverified: true }), { sheet, facts: [fv("±0.5")] }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(open(), vreg(), { sheet: null, facts: [fv("±0.5")] }).checks[0].status, "unclear");
});
test("sheetChecks: cấu hình chưa có dòng kiểm cho yêu cầu → thêm dòng mới 'đạt' (chưa có check)", () => {
  const c = C.sheetChecks({ checks: [] }, vreg(), { sheet, facts: [fv("±0.5")] });
  assert.equal(c.checks.length, 1);
  assert.equal(c.checks[0].status, "met");
});
test("sheetChecks: yêu cầu không có ngưỡng % / không có datasheet fact → không đổi", () => {
  assert.equal(C.sheetChecks(open(), vreg({ requirement: "Có điều chỉnh điện áp tự động" }), { sheet, facts: [fv("±0.5")] }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(open(), vreg(), { sheet, facts: [] }).checks[0].status, "unclear");
});
const altReq = [{ code: "alt_power", item: "Công suất đầu phát", requirement: "Công suất liên tục đầu phát ≥ 100 kVA", quote: "q" }];
const altChk = () => ({ checks: [{ item: "Công suất đầu phát", status: "unclear" }] });
const altFact = (value, label = "Prime power") => ({ key: "altKva", label, value, line: `${label} ${value}`, block: "Alternator" });
test("sheetChecks alt_power: khối đầu phát ghi prime 110 kVA ≥ 100 → đạt; đúng 100 kVA cũng đạt; 90 kVA thì không", () => {
  const c = C.sheetChecks(altChk(), altReq, { sheet, facts: [altFact("110 kVA")] });
  assert.equal(c.checks[0].status, "met");
  assert.match(c.checks[0].offered, /110 kVA/);
  assert.match(c.checks[0].note, /khối "Alternator"/);
  assert.equal(C.sheetChecks(altChk(), altReq, { sheet, facts: [altFact("100 kVA")] }).checks[0].status, "met");
  assert.equal(C.sheetChecks(altChk(), altReq, { sheet, facts: [altFact("90 kVA")] }).checks[0].status, "unclear");
});
test("sheetChecks alt_power: HSMT hỏi prime mà datasheet chỉ có standby (120 kVA) → không đạt bằng code; hai giá trị prime khác nhau → không chọn", () => {
  assert.equal(C.sheetChecks(altChk(), altReq, { sheet, facts: [altFact("120 kVA", "Standby power")] }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(altChk(), altReq, { sheet, facts: [altFact("110 kVA"), altFact("105 kVA")] }).checks[0].status, "unclear");
});
test("sheetChecks alt_power: HSMT hỏi công suất dự phòng thì so với standby của đầu phát", () => {
  const req = [{ ...altReq[0], requirement: "Công suất dự phòng đầu phát ≥ 110 kVA" }];
  assert.equal(C.sheetChecks(altChk(), req, { sheet, facts: [altFact("120 kVA", "Standby power")] }).checks[0].status, "met");
});
const makeReq = [{ code: "genset_make", item: "Hãng sản xuất tổ máy", requirement: "Hyundai", quote: "q" }];
const makeChk = () => ({ checks: [{ item: "Hãng sản xuất tổ máy", status: "unclear" }] });
const maker = { id: "hyundai-power", role: "genset_oem", names: { en: "Hyundai Power Products", brands: ["HYUNDAI"] } };
test("sheetChecks genset_make: cấu hình đúng tổ máy HSMT nêu + NCC của datasheet là nhà sản xuất tổ máy hãng đó + trang ghi hãng → đạt", () => {
  const c = C.sheetChecks(makeChk(), makeReq, { sheet, named: { make: "Hyundai" }, hit: "model", supOf: () => maker });
  assert.equal(c.checks[0].status, "met");
  assert.match(c.checks[0].offered, /Hyundai/);
  assert.equal(c.checks[0].part, "genset");
});
test("sheetChecks genset_make: không hit (cấu hình không phải tổ máy nêu), NCC là nhà phân phối, hoặc trang không ghi hãng → không đổi", () => {
  assert.equal(C.sheetChecks(makeChk(), makeReq, { sheet, named: { make: "Hyundai" }, hit: null, supOf: () => maker }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(makeChk(), makeReq, { sheet, named: { make: "Hyundai" }, hit: "make", supOf: () => ({ ...maker, role: "distributor" }) }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(makeChk(), makeReq, { sheet: { ...sheet, quotes: [{ line: "DHY110KSE diesel genset" }] }, named: { make: "Hyundai" }, hit: "model", supOf: () => maker }).checks[0].status, "unclear");
  assert.equal(C.sheetChecks(makeChk(), makeReq, { sheet, named: null, hit: "model", supOf: () => maker }).checks[0].status, "unclear");
});

// ---------- sizesFor (fetch giả) ----------
const analysis = (cap, bidName = "") => ({ result: { keyInfo: { generatorCapacity: cap, bidName } } });
test("sizesFor: cỡ máy lấy từ phân tích của gói (generatorCapacity), có số lượng", async () => {
  const calls = stubFetch((url) => ({ json: [{ id: "K1", data: analysis("2 x 400 kVA") }] }));
  const s = await C.sizesFor("K1", "");
  assert.deepEqual(s.map((x) => [x.label, x.qty, x.kva]), [["400 kVA", 2, 400]]);
  assert.deepEqual([q(calls[0].url).kind, q(calls[0].url).coll, q(calls[0].url).id], ["docs", "analysis", "K1"]);
  assert.equal(calls[0].opts.headers.Authorization, "Bearer tok-test");
});
test("sizesFor: chưa có phân tích (hoặc API lỗi) → cỡ máy đọc từ tên gói", async () => {
  stubFetch(() => ({ ok: false, status: 500, json: null }));
  assert.deepEqual((await C.sizesFor("K2", "Mua sắm máy phát điện 250kVA")).map((x) => x.label), ["250 kVA"]);
  stubFetch(() => ({ json: [] }));
  assert.deepEqual((await C.sizesFor("K3", "Mua sắm máy phát điện 250kVA")).map((x) => x.label), ["250 kVA"]);
  assert.deepEqual(await C.sizesFor("K4", "Mua sắm vật tư"), []);
});

// ---------- hsmtTextOf (fetch giả) ----------
const docsApi = (store) => (url) => { const p = q(url); const d = store[`${p.coll}/${p.id}`]; return { json: d === undefined ? [] : [{ id: p.id, data: d }] }; };
test("hsmtTextOf: ghép các mảnh văn bản HSMT rồi thông báo mời thầu (chương webform + danh mục hàng hoá) sau dấu phân cách", async () => {
  stubFetch(docsApi({
    "hsmt/K": { textChunks: 2 }, "hsmttext/K_0": { text: "Chương V. Yêu cầu kỹ thuật\n" }, "hsmttext/K_1": { text: "Công suất ≥ 400 kVA" },
    "notice/K": { info: "Thông tin chung", chapters: [{ name: "Chương V", text: "Bảng yêu cầu" }], goods: "Máy phát điện 400kVA" },
  }));
  const r = await C.hsmtTextOf("K");
  assert.deepEqual(r.parts, ["Chương V. Yêu cầu kỹ thuật\n", "Công suất ≥ 400 kVA"]);
  assert.ok(r.text.startsWith("Chương V. Yêu cầu kỹ thuật\nCông suất ≥ 400 kVA"));
  assert.ok(r.text.includes("--- Thông báo mời thầu ---"));
  assert.ok(r.text.includes("### Chương V\nBảng yêu cầu"));
  assert.ok(r.text.includes("### Danh mục hàng hóa (tab Thông tin chung)\nMáy phát điện 400kVA"));
});
test("hsmtTextOf: chỉ có thông báo (không có tệp HSMT) vẫn đọc được; mảnh thiếu coi là rỗng", async () => {
  stubFetch(docsApi({ "notice/K": { info: "Máy phát 100kVA" } }));
  const r = await C.hsmtTextOf("K");
  assert.deepEqual(r.parts, []);
  assert.match(r.text, /Máy phát 100kVA/);
  stubFetch(docsApi({ "hsmt/K": { textChunks: 2 }, "hsmttext/K_1": { text: "đủ" } }));
  assert.deepEqual((await C.hsmtTextOf("K")).parts, ["", "đủ"]);
});
test("hsmtTextOf: không có văn bản nào → lỗi nói cần tải hồ sơ (Lấy lại tệp)", async () => {
  stubFetch(docsApi({}));
  await assert.rejects(() => C.hsmtTextOf("K"), /chưa có văn bản HSMT.*Lấy lại tệp/);
  stubFetch(docsApi({ "hsmt/K": { textChunks: 1 }, "hsmttext/K_0": { text: "   " } }));
  await assert.rejects(() => C.hsmtTextOf("K"), /chưa có văn bản HSMT/);
});

// ---------- allDocs (fetch giả, kho đọc lại trong thư mục tạm) ----------
const cacheFile = (coll) => path.join(process.env.GENBID_DOC_CACHE, `${coll}.json`);
// Máy chủ giả: coll → [{ id, data, updated_at }]
function server(db, { noStamps = false, dropId = null } = {}) {
  return (url) => {
    const p = q(url), rows = db[p.coll] || [];
    if (p.kind === "stamps") return { json: noStamps ? rows.map((r) => ({ id: r.id, data: r.data })) : rows.map((r) => ({ id: r.id, updated_at: r.updated_at })) };
    if (p.ids) return { json: p.ids.split(",").map(decodeURIComponent).filter((id) => id !== dropId).map((id) => rows.find((r) => r.id === id)).filter(Boolean).map((r) => ({ id: r.id, data: r.data })) };
    return { json: rows.map((r) => ({ id: r.id, data: r.data })) };
  };
}
const kinds = (calls) => calls.map((c) => { const p = q(c.url); return p.kind === "stamps" ? "stamps" : p.ids ? `ids:${p.ids}` : "whole"; });

test("allDocs: lần đầu hỏi dấu thời gian rồi đọc đúng các tài liệu chưa có (theo ids), ghi kho đọc lại", async () => {
  const db = { c1: [{ id: "a", data: { v: 1 }, updated_at: "t1" }, { id: "b", data: { v: 2 }, updated_at: "t1" }] };
  const calls = stubFetch(server(db));
  const out = await C.allDocs("c1");
  assert.deepEqual(out, [{ id: "a", data: { v: 1 } }, { id: "b", data: { v: 2 } }]);
  assert.deepEqual(kinds(calls), ["stamps", "ids:a,b"]);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(cacheFile("c1"), "utf8")).docs), ["a", "b"]);
});
test("allDocs: lần hai không đổi gì → chỉ gọi dấu thời gian (tiết kiệm egress Supabase), dữ liệu lấy từ kho", async () => {
  const db = { c2: [{ id: "a", data: { v: 1 }, updated_at: "t1" }] };
  stubFetch(server(db)); await C.allDocs("c2");
  const calls = stubFetch(server(db));
  assert.deepEqual(await C.allDocs("c2"), [{ id: "a", data: { v: 1 } }]);
  assert.deepEqual(kinds(calls), ["stamps"]);
});
test("allDocs: một tài liệu đổi updated_at → chỉ đọc lại tài liệu đó; tài liệu bị xoá khỏi web thì biến khỏi kết quả", async () => {
  const db = { c3: [{ id: "a", data: { v: 1 }, updated_at: "t1" }, { id: "b", data: { v: 2 }, updated_at: "t1" }, { id: "c", data: { v: 3 }, updated_at: "t1" }] };
  stubFetch(server(db)); await C.allDocs("c3");
  db.c3[1] = { id: "b", data: { v: 22 }, updated_at: "t2" };
  db.c3.splice(2, 1);
  const calls = stubFetch(server(db));
  assert.deepEqual(await C.allDocs("c3"), [{ id: "a", data: { v: 1 } }, { id: "b", data: { v: 22 } }]);
  assert.deepEqual(kinds(calls), ["stamps", "ids:b"]);
  assert.deepEqual(Object.keys(JSON.parse(fs.readFileSync(cacheFile("c3"), "utf8")).docs), ["a", "b"]); // kho cũng bỏ tài liệu đã xoá
});
test("allDocs: API cũ trả file thay vì dấu thời gian (không có updated_at) → đọc cả bộ như trước", async () => {
  const db = { c4: [{ id: "a", data: { v: 1 }, updated_at: "t1" }] };
  const calls = stubFetch(server(db, { noStamps: true }));
  assert.deepEqual(await C.allDocs("c4"), [{ id: "a", data: { v: 1 } }]);
  assert.deepEqual(kinds(calls), ["stamps", "whole"]);
  assert.equal(fs.existsSync(cacheFile("c4")), false);
});
test("allDocs: hỏi dấu thời gian lỗi (HTTP 500) hoặc danh sách rỗng → đọc cả bộ", async () => {
  let n = 0;
  const calls = stubFetch((url) => { const p = q(url); if (p.kind === "stamps") return { ok: false, status: 500, json: null }; n++; return { json: [{ id: "a", data: { v: 1 } }] }; });
  assert.deepEqual(await C.allDocs("c5"), [{ id: "a", data: { v: 1 } }]);
  assert.equal(n, 1);
  assert.deepEqual(kinds(calls), ["stamps", "whole"]);
  const c = stubFetch(server({ c6: [] }));
  assert.deepEqual(await C.allDocs("c6"), []);
  assert.deepEqual(kinds(c), ["stamps", "whole"]);
});
test("allDocs: có tài liệu liệt kê mà đọc lại không thấy (xoá giữa chừng) → đọc cả bộ", async () => {
  const db = { c7: [{ id: "a", data: { v: 1 }, updated_at: "t1" }, { id: "b", data: { v: 2 }, updated_at: "t1" }] };
  const calls = stubFetch(server(db, { dropId: "b" }));
  assert.equal((await C.allDocs("c7")).length, 2);
  assert.deepEqual(kinds(calls), ["stamps", "ids:a,b", "whole"]);
});
test("allDocs: hơn 300 tài liệu cần đọc (lần đầu) → một lần đọc cả bộ thay vì nhiều lần nhỏ", async () => {
  const db = { c8: Array.from({ length: 301 }, (_, i) => ({ id: `d${i}`, data: { i }, updated_at: "t" })) };
  const calls = stubFetch(server(db));
  assert.equal((await C.allDocs("c8")).length, 301);
  assert.deepEqual(kinds(calls), ["stamps", "whole"]);
});
test("allDocs: 150 tài liệu cần đọc → chia đợt 100 id", async () => {
  const db = { c9: Array.from({ length: 150 }, (_, i) => ({ id: `d${i}`, data: { i }, updated_at: "t" })) };
  const calls = stubFetch(server(db));
  assert.equal((await C.allDocs("c9")).length, 150);
  assert.equal(calls.length, 3); // stamps + 2 đợt
  assert.equal(q(calls[1].url).ids.split(",").length, 100);
  assert.equal(q(calls[2].url).ids.split(",").length, 50);
});
test("allDocs: kho đọc lại hỏng (không phải JSON) → bỏ qua và đọc lại các tài liệu", async () => {
  fs.mkdirSync(process.env.GENBID_DOC_CACHE, { recursive: true });
  fs.writeFileSync(cacheFile("c10"), "{không phải json");
  const db = { c10: [{ id: "a", data: { v: 1 }, updated_at: "t1" }] };
  stubFetch(server(db));
  assert.deepEqual(await C.allDocs("c10"), [{ id: "a", data: { v: 1 } }]);
});

// ---------- post (fetch giả) ----------
test("post: gửi POST /api/ingest với token và {rows}; trả nội dung trả lời", async () => {
  const calls = stubFetch(() => ({ text: '{"ok":true}' }));
  const rows = [{ coll: "configreq", id: "K", data: { by: "bot" } }];
  assert.equal(await C.post(rows), '{"ok":true}');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://stub.invalid/api/ingest");
  assert.equal(calls[0].opts.method, "POST");
  assert.equal(calls[0].opts.headers.Authorization, "Bearer tok-test");
  assert.deepEqual(JSON.parse(calls[0].opts.body), { rows });
});
test("post: máy chủ trả lỗi → ném 'ingest HTTP <mã>' kèm đầu nội dung, KHÔNG thử lại (lỗi nghiệp vụ không phải lỗi mạng)", async () => {
  const calls = stubFetch(() => ({ ok: false, status: 403, text: "forbidden ".repeat(50) }));
  await assert.rejects(() => C.post([]), (e) => /^Error: ingest HTTP 403: forbidden/.test(String(e)) && e.message.length < 260);
  assert.equal(calls.length, 1);
});
test("post: lỗi mạng được thử lại (29/10: một lần mất mạng từng làm mất cả lượt agent); hết 4 lần thì ném lỗi mạng", async () => {
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (f) => realTimeout(f, 0); // bỏ chờ 2/4/8 giây
  try {
    let n = 0;
    globalThis.fetch = async () => { n++; if (n < 3) throw new Error("fetch failed"); return { ok: true, status: 200, text: async () => "ok" }; };
    assert.equal(await C.post([]), "ok");
    assert.equal(n, 3);
    n = 0;
    globalThis.fetch = async () => { n++; throw new Error("fetch failed"); };
    await assert.rejects(() => C.post([]), /fetch failed/);
    assert.equal(n, 4);
  } finally { globalThis.setTimeout = realTimeout; }
});
