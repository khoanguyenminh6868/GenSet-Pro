// node --test suppliers/*.test.mjs — T2 (phủ test 13/11/2026): hàm xuất ra của named-genset.mjs chưa có test nào nhắc tới:
// makesIn, specsAsReqs, makerOf, sellerAllowed, namedHit, brandLicensedSeller, BRAND_ASK, brandLicensedChecks, sellerSrc, namedRank.
// Quy tắc Khoa 13/11 (bộ nhớ config-suggest.md): tổ máy lắp ráp chỉ dùng ĐỘNG CƠ của hãng đó = "tương đương";
// NCC chỉ mang thương hiệu cấp phép (Hyundai của GRV Power Products) → dòng hãng tổ máy "cần xác nhận", vẫn là named.
import test from "node:test";
import assert from "node:assert/strict";
import "./config-bot.mjs"; // nạp globalThis.GenbidCatalog như các test khác
import { makesIn, specsAsReqs, makerOf, sellerAllowed, namedHit, brandLicensedSeller, brandLicensedChecks, BRAND_ASK, sellerSrc, namedRank } from "./named-genset.mjs";

const NAMED = { make: "Hyundai", models: ["DHY110K SE"], model: "DHY110K SE" };
const hyundaiMaker = (extra = {}) => ({ id: "hyundai-power", role: "genset_oem", names: { en: "Hyundai Power Products", brands: ["HYUNDAI"] }, ...extra });
const grv = (extra = {}) => ({ id: "grv", role: "genset_oem", names: { en: "GRV POWER PRODUCTS, S.L.", brands: ["HYUNDAI"] }, ...extra });
const assembler = { id: "zj-assembler", role: "genset_oem", names: { en: "Zhejiang Assembly Power Co", brands: [] } };
const dist = { id: "dist1", role: "distributor", names: { en: "Hyundai Distributor", brands: ["HYUNDAI"] } };
const supMap = (...rs) => (id) => rs.find((r) => r.id === id) || null;

// ---------- makesIn ----------
test("makesIn: lấy mọi hãng trong văn bản theo thứ tự, mỗi hãng một lần, kèm chữ HSMT viết", () => {
  const r = makesIn("Tổ máy Huyndai DHY110K SE, động cơ Cumins, đầu phát Stamford; Huyndai lần hai");
  assert.deepEqual(r.map((x) => x.make).slice(0, 2), ["Hyundai", "Cummins"]);
  assert.equal(r[0].word, "Huyndai"); // chữ gốc giữ nguyên, không sửa lại
  assert.equal(r.filter((x) => x.make === "Hyundai").length, 1);
});
test("makesIn: hãng hai từ viết rời hoặc dính (FG Wilson, Atlas Copco)", () => {
  assert.ok(makesIn("máy phát FG Wilson P110").some((x) => x.make === "FG Wilson"));
  assert.ok(makesIn("FGWilson 110kVA").some((x) => x.make === "FG Wilson"));
  assert.ok(makesIn("Atlas Copco QAS").some((x) => x.make === "Atlas Copco"));
});
test("makesIn: không hãng thì mảng rỗng; từ ngắn < 3 chữ và giá trị rỗng không khớp", () => {
  for (const s of ["Nêu cụ thể", "Trung Quốc hoặc tương đương", "", null, undefined, "AB CD"]) assert.deepEqual(makesIn(s), [], String(s));
});
test("makesIn: lỗi chính tả 1 chữ chỉ được dung từ 6 chữ cái trở lên", () => {
  assert.ok(makesIn("Perkin").some((x) => x.make === "Perkins")); // có trong bảng ALIAS
  assert.ok(makesIn("Mitsubisi").some((x) => x.make === "Mitsubishi"));
  assert.ok(!makesIn("Visaa").some((x) => x.make === "Visa")); // 5 chữ cái: không dung sai
});
test("makesIn: bỏ dấu tiếng Việt và hoa thường", () => {
  assert.equal(makesIn("HYUNDAI")[0].make, "Hyundai");
  assert.equal(makesIn("hyundai")[0].make, "Hyundai");
});

// ---------- specsAsReqs ----------
test("specsAsReqs: dòng hãng / model của TỔ MÁY, có trích dẫn, đổi thành yêu cầu genset_make / genset_model", () => {
  const out = specsAsReqs([
    { item: "Tổ máy phát điện - Nhà sản xuất", requirement: "Huyndai", quote: "Nhà sản xuất Huyndai" },
    { item: "Tổ máy phát điện - Mã hiệu", requirement: "DHY110K SE", quote: "Mã hiệu DHY110K SE" },
  ]);
  assert.deepEqual(out.map((x) => x.code), ["genset_make", "genset_model"]);
  assert.equal(out[0].quote, "Nhà sản xuất Huyndai");
});
test("specsAsReqs: bỏ dòng của động cơ / đầu phát / xuất xứ, dòng không có trích dẫn, dòng không phải tổ máy", () => {
  const out = specsAsReqs([
    { item: "Động cơ - Nhà sản xuất", requirement: "Cummins", quote: "q" },
    { item: "Đầu phát điện - Nhà sản xuất", requirement: "Stamford", quote: "q" },
    { item: "Tổ máy phát điện - Nước sản xuất", requirement: "TQ", quote: "q" },
    { item: "Tổ máy phát điện - Nhà sản xuất", requirement: "Huyndai" }, // không quote
    { item: "Bộ điều khiển - Nhà sản xuất", requirement: "x", quote: "q" },
  ]);
  assert.deepEqual(out, []);
});
test("specsAsReqs: đầu vào rỗng / null / dòng lỗi không ném", () => {
  assert.deepEqual(specsAsReqs(), []);
  assert.deepEqual(specsAsReqs(null), []);
  assert.deepEqual(specsAsReqs([null, {}, { item: 5 }]), []);
});

// ---------- makerOf ----------
test("makerOf: hãng sản xuất tổ máy của hãng, đọc từ tên, thương hiệu hoặc id (GRV có thương hiệu HYUNDAI)", () => {
  assert.ok(makerOf(hyundaiMaker(), "Hyundai"));
  assert.ok(makerOf(grv(), "Hyundai"));
  assert.ok(makerOf({ id: "hyundai", role: "genset_oem", names: { en: "X Ltd", brands: [] } }, "Hyundai")); // theo id
});
test("makerOf: phủ định — nhà phân phối, hãng khác, không có hãng, bản ghi rỗng", () => {
  assert.ok(!makerOf(dist, "Hyundai")); // role distributor không phải nhà sản xuất
  assert.ok(!makerOf(assembler, "Hyundai"));
  assert.ok(!makerOf(hyundaiMaker(), null));
  assert.ok(!makerOf(null, "Hyundai"));
  assert.ok(!makerOf(hyundaiMaker(), "Cummins"));
});

// ---------- sellerAllowed ----------
test("sellerAllowed: chỉ bật khi GENBID_NAMED_SELLER = '1' (Khoa chưa quyết, mặc định tắt)", () => {
  const old = process.env.GENBID_NAMED_SELLER;
  try {
    delete process.env.GENBID_NAMED_SELLER;
    assert.equal(sellerAllowed(), false);
    process.env.GENBID_NAMED_SELLER = "1";
    assert.equal(sellerAllowed(), true);
    for (const v of ["0", "true", "", "yes"]) { process.env.GENBID_NAMED_SELLER = v; assert.equal(sellerAllowed(), false, v); }
  } finally { if (old === undefined) delete process.env.GENBID_NAMED_SELLER; else process.env.GENBID_NAMED_SELLER = old; }
});

// ---------- namedHit ----------
test("namedHit: không nêu đích danh hoặc không có cấu hình thì null", () => {
  assert.equal(namedHit({ genset: { make: "Hyundai" } }, null), null);
  assert.equal(namedHit(null, NAMED), null);
});
test("namedHit: dòng tổ máy ghi đúng model (không dấu cách / dấu gạch) → 'model'", () => {
  assert.equal(namedHit({ genset: { model: "DHY110KSE", make: "Hyundai" } }, NAMED), "model");
  assert.equal(namedHit({ genset: { model: "dhy-110k-se" } }, NAMED), "model");
});
test("namedHit: model dài hơn (DHY110KSE3) không phải model HSMT nêu → rơi xuống kiểm hãng", () => {
  assert.equal(namedHit({ genset: { model: "DHY110KSE3", make: "Hyundai" } }, NAMED), "make");
  assert.equal(namedHit({ genset: { model: "DHY110KSE3", make: "Doosan" } }, NAMED), null);
});
test("namedHit: bảng catalog của động cơ nêu model tổ máy trong tiêu đề → 'model' qua srcText", () => {
  const c = { genset: { make: "Hyundai" }, engine: { src: { kind: "catalog", line: "Hyundai D6DB engine" } } };
  const out = namedHit(c, NAMED, { srcText: () => "DHY110KSE Diesel engine" });
  assert.equal(out, "model");
});
test("namedHit: hãng ghi trên dòng tổ máy (có lỗi chính tả) → 'make'", () => {
  assert.equal(namedHit({ genset: { make: "Huyndai", model: "DHY200" } }, NAMED), "make");
  assert.equal(namedHit({ genset: { model: "X", src: { line: "Tổ máy HYUNDAI 200kVA" } } }, NAMED), "make");
});
test("quy tắc Khoa 13/11: lắp ráp chỉ dùng ĐỘNG CƠ cùng hãng → không phải named (là tương đương)", () => {
  // Tổ máy hãng Trung Quốc lắp ráp, động cơ Hyundai: hãng của động cơ không làm cấu hình thành 'make'.
  const c = { genset: { make: "Zhejiang Assembly", model: "ZJ110" }, engine: { make: "Hyundai", model: "D6DB", src: { kind: "catalog", line: "Hyundai D6DB 4 stroke" } }, suppliers: [{ supplierId: "zj-assembler" }] };
  assert.equal(namedHit(c, NAMED, { supOf: supMap(assembler) }), null);
});
test("namedHit: hãng thể hiện qua NCC là nhà sản xuất tổ máy của hãng → 'make'; nhà phân phối thì không", () => {
  const c = { genset: { make: "?" }, suppliers: [{ supplierId: "hyundai-power" }] };
  assert.equal(namedHit(c, NAMED, { supOf: supMap(hyundaiMaker()) }), "make");
  assert.equal(namedHit({ genset: {}, suppliers: [{ supplierId: "dist1" }] }, NAMED, { supOf: supMap(dist) }), null);
});
test("namedHit: HSMT chỉ nêu model, không nêu hãng → không hit nếu model không khớp", () => {
  assert.equal(namedHit({ genset: { make: "Hyundai", model: "OTHER" } }, { models: ["DHY110K SE"] }), null);
});

// ---------- brandLicensedSeller ----------
test("brandLicensedSeller: mọi NCC của hãng đều chỉ mang thương hiệu cấp phép → trả về bản ghi NCC đó", () => {
  const c = { genset: { src: { supplierId: "grv" } }, suppliers: [{ supplierId: "grv" }] };
  const r = brandLicensedSeller(c, NAMED, supMap(grv({ brandLicensed: true })));
  assert.equal(r.id, "grv");
});
test("brandLicensedSeller: còn một nhà sản xuất thật (không cấp phép) cùng hãng → null", () => {
  const c = { genset: { src: { supplierId: "grv" } }, suppliers: [{ supplierId: "grv" }, { supplierId: "hyundai-power" }] };
  assert.equal(brandLicensedSeller(c, NAMED, supMap(grv({ brandLicensed: true }), hyundaiMaker())), null);
});
test("brandLicensedSeller: không cờ, không hãng nêu, không cấu hình, NCC hãng khác → null", () => {
  const c = { suppliers: [{ supplierId: "grv" }] };
  assert.equal(brandLicensedSeller(c, NAMED, supMap(grv())), null);
  assert.equal(brandLicensedSeller(c, {}, supMap(grv({ brandLicensed: true }))), null);
  assert.equal(brandLicensedSeller(null, NAMED), null);
  assert.equal(brandLicensedSeller({ suppliers: [{ supplierId: "zj-assembler" }] }, NAMED, supMap({ ...assembler, brandLicensed: true })), null);
});

// ---------- brandLicensedChecks / BRAND_ASK ----------
const reqs = [{ code: "genset_make", item: "Hãng sản xuất tổ máy" }];
const cfg = (status = "met", extra = {}) => ({ genset: { src: { supplierId: "grv" } }, suppliers: [{ supplierId: "grv" }], checks: [{ item: "Hãng sản xuất tổ máy", status, note: "Hyundai", ...extra }] });
const lic = supMap(grv({ brandLicensed: true }));

test("BRAND_ASK nêu hãng và giấy tờ cần gửi (CO, CQ, thư uỷ quyền)", () => {
  const s = BRAND_ASK("Hyundai");
  assert.match(s, /Hyundai/);
  for (const w of ["CO", "CQ", "uỷ quyền"]) assert.ok(s.includes(w), w);
});
test("brandLicensedChecks: dòng hãng đạt → 'cần xác nhận' bằng giấy tờ, ghi trạng thái cũ, vẫn giữ named", () => {
  const c = cfg("met");
  const out = brandLicensedChecks(c, reqs, NAMED, "make", lic);
  const x = out.checks[0];
  assert.equal(x.status, "confirm");
  assert.equal(x.was, "met");
  assert.equal(x.confirm, "document");
  assert.equal(x.licensed, true);
  assert.equal(x.ask, BRAND_ASK("Hyundai"));
  assert.match(x.note, /GRV POWER PRODUCTS/);
});
test("brandLicensedChecks: 'chưa rõ' cũng thành 'cần xác nhận'", () => {
  assert.equal(brandLicensedChecks(cfg("unclear"), reqs, NAMED, "model", lic).checks[0].status, "confirm");
});
test("brandLicensedChecks: gọi hai lần không lặp câu ghi chú của code (tên pháp nhân không có dấu chấm)", () => {
  const c = cfg("met");
  const noDot = supMap(grv({ brandLicensed: true, names: { en: "GRV POWER PRODUCTS", brands: ["HYUNDAI"] } }));
  brandLicensedChecks(c, reqs, NAMED, "make", noDot);
  c.checks[0].status = "met";
  brandLicensedChecks(c, reqs, NAMED, "make", noDot);
  assert.equal((c.checks[0].note.match(/Code ghi:/g) || []).length, 1);
});
// Đã sửa: regex gỡ câu cũ từng dùng [^.]* nên dừng ở dấu chấm trong "S.L." → câu ghi chú lặp khi chạy lại trên cùng cấu hình.
test("brandLicensedChecks: gọi hai lần với 'GRV POWER PRODUCTS, S.L.' không lặp câu ghi chú", () => {
  const c = cfg("met");
  brandLicensedChecks(c, reqs, NAMED, "make", lic);
  c.checks[0].status = "met";
  brandLicensedChecks(c, reqs, NAMED, "make", lic);
  assert.equal((c.checks[0].note.match(/Code ghi:/g) || []).length, 1);
});
test("brandLicensedChecks: không đụng khi không hit, dòng không đạt, có mâu thuẫn, thiếu yêu cầu genset_make, NCC không cấp phép", () => {
  assert.equal(brandLicensedChecks(cfg("met"), reqs, NAMED, null, lic).checks[0].status, "met");
  assert.equal(brandLicensedChecks(cfg("unmet"), reqs, NAMED, "make", lic).checks[0].status, "unmet");
  assert.equal(brandLicensedChecks(cfg("met", { conflict: true }), reqs, NAMED, "make", lic).checks[0].status, "met");
  assert.equal(brandLicensedChecks(cfg("met"), [], NAMED, "make", lic).checks[0].status, "met");
  assert.equal(brandLicensedChecks(cfg("met"), reqs, NAMED, "make", supMap(grv())).checks[0].status, "met");
});

// ---------- sellerSrc ----------
test("sellerSrc: nguồn internet hạng C (trang bên bán) là bên bán", () => {
  assert.ok(sellerSrc({ genset: { src: { kind: "internet", tier: "C", url: "https://shop.example.com" } } }));
  assert.ok(sellerSrc({ engine: { src: { kind: "internet", tier: "c" } } })); // hạng viết thường
});
test("sellerSrc: hạng A/B không phải bên bán; nguồn catalog / datasheet không phải bên bán", () => {
  assert.ok(!sellerSrc({ genset: { src: { kind: "internet", tier: "A", url: "https://x.com" } } }));
  assert.ok(!sellerSrc({ genset: { src: { kind: "catalog" } }, engine: { src: { kind: "datasheet" } } }));
  assert.ok(!sellerSrc({}));
});
test("sellerSrc: không ghi hạng → trang trên host mang tên hãng là của hãng, host khác là bên bán", () => {
  const own = { genset: { src: { kind: "internet", url: "https://www.hyundaipower-de.com/x" } } };
  assert.ok(!sellerSrc(own, "Hyundai"));
  assert.ok(sellerSrc({ genset: { src: { kind: "internet", url: "https://shop.example.com/x" } } }, "Hyundai"));
  assert.ok(sellerSrc(own)); // không biết hãng → coi là bên bán
  assert.ok(sellerSrc({ genset: { src: { kind: "internet", url: "not a url" } } }, "Hyundai")); // URL hỏng
});

// ---------- namedRank ----------
test("namedRank: đúng model 0, đúng hãng 1, tương đương / không đánh dấu 2", () => {
  assert.equal(namedRank({ named: "model" }), 0);
  assert.equal(namedRank({ named: "make" }), 1);
  assert.equal(namedRank({ equivalent: {} }), 2);
  assert.equal(namedRank({}), 2);
  assert.deepEqual([{ id: "e" }, { named: "make", id: "k" }, { named: "model", id: "m" }].sort((a, b) => namedRank(a) - namedRank(b)).map((x) => x.id), ["m", "k", "e"]);
});
