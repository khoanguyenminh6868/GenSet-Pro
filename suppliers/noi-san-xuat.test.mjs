// node --test suppliers/*.test.mjs — thương hiệu ≠ nơi sản xuất (Khoa, 2026-11-16/17): catalog.js madeIn / madeAt nơi sản
// xuất của từng dòng nguồn, partOriginOfHsmt HSMT đòi thương hiệu hay nơi sản xuất cho TỪNG bộ phận, candidates và
// madeChecks (engine_origin / alt_origin / ctl_origin). Dòng nguồn và dòng HSMT lấy nguyên văn từ dữ liệu thật.
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, partOriginOfHsmt, madeChecks, madeBasisOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const at = (kind, makes, text, model) => C.madeIn(kind, makes, text, model).at;

test("madeIn động cơ: nhà máy TQ / hàng nhập / nước ghi cạnh hãng / không ghi / ghi cả hai (dòng thật)", () => {
  // aosif: tiêu đề trang "CCEC Series(50HZ)" và "Imported Cummins Series(60HZ)".
  const row = "| AC1375-II | 1250/1000 | 1375/1100 | KTA50-G3 | 254 | 16V | 50.3 |";
  assert.equal(at("engine", ["Cummins"], [row, "", "CCEC Series(50HZ)-Xiamen Aosif Engineering Ltd."], "KTA50-G3"), "CN");
  assert.equal(at("engine", ["Cummins"], [row, "", "Imported Cummins Series(60HZ)-Xiamen Aosif Engineering Ltd."], "KTA50-G3"), "US");
  // bdadl-shanghai: cột hãng ghi 日本三菱; trang khác ghi 上海菱重 (Shanghai MHI).
  assert.equal(at("engine", ["Mitsubishi"], "| BDA-SL1760 | 1600/1760 | 日本三菱 | S16R-PTAA2 | 16 | 170 | 180 | 16 | 65.37 | ≤19"), "JP");
  assert.equal(at("engine", ["Mitsubishi"], "| BDA-SL1000 | 上海菱重 | S12R-PTA-C |"), "CN");
  assert.equal(at("engine", ["Baudouin", "Weichai"], "| BDA-W700 | 700/875 | 潍柴博杜安 | 12M26D748E200 | 12 | 31.8 | 113 | ≤205 | 4600*220"), "CN");
  assert.equal(at("engine", ["Perkins"], "| GB-30 | 1103A-33G | PERKINS UK |"), "GB");
  // fdk-energy: dòng ghi "Cummins (USA)" / "Cummins (India)" thắng tiêu đề trang (gần hơn).
  assert.equal(at("engine", ["Cummins"], ["| NTACT | 250KVA/ 200KW | 225KVA/ 180KW | QSL9-G2 | Cummins (USA) | Stamford UCDI274J |", "", "CCEC / Cummins India"], "QSL9-G2"), "US");
  assert.equal(at("engine", ["Cummins"], "| TACT | 550KVA/ 440KW | 500KVA/ 400KW | KTA19-G4 | Cummins (India) | Stamford S5L1D-C41 |"), "IN");
  // sanq-power: tiêu đề trang ghi cả nhập lẫn liên doanh → không rõ.
  const sanq = C.madeIn("engine", ["Cummins"], ["| SQC550 | KTA19-G3 |", "", "韩国斗山柴油发电机组 -进口康明斯系列_帕金斯系列_斗山系列_菱重系列_合资康明斯系列-广州盛康动力设备有限公司"], "KTA19-G3");
  assert.equal(sanq.at, "?"); assert.match(sanq.why, /nhiều nơi/);
  // mamo-power: "China Perkins Series … factory and manufacturers" là trang người bán ở TQ, không phải nhà máy.
  assert.equal(at("engine", ["Perkins"], ["| MP-30 | 1103A-33G |", "", "China Perkins Series Diesel Generator factory and manufacturers | Mamo Power"]), "?");
  // fdk-energy: "Perkins China" trong cột hãng.
  assert.equal(at("engine", ["Perkins"], "| 1103A-33G | Perkins China |"), "CN");
  // Không ghi: hãng ngoại → không rõ; hãng TQ → TQ.
  assert.equal(at("engine", ["Cummins"], "| GF-500 | 500 | KTA19-G3 | Stamford |"), "?");
  assert.equal(at("engine", ["Weichai"], "| WP10D238E200 |"), "CN");
  // Không gán được hãng (mâu thuẫn): chỉ nhà máy TQ (tự nêu hãng) cho biết.
  assert.equal(at("engine", [], "| QSK19-G31 | CCEC |"), "CN");
});

test("madeIn đầu phát / bộ điều khiển: nước mặc định Khoa chốt 16/11, nhà máy TQ thắng mặc định", () => {
  assert.equal(at("alternator", ["Stamford"], "| S4L1D-D41 |"), "GB");
  // shanhua: "| Manufacturer | WUXI STAMFORD".
  assert.equal(at("alternator", ["Stamford"], "| Manufacturer | WUXI STAMFORD"), "CN");
  assert.equal(at("alternator", ["Leroy-Somer"], "| TAL044F |"), "FR");
  assert.equal(at("alternator", ["Marathon"], "| MP-500 |"), "?");
  assert.equal(at("alternator", ["Engga"], "| EG280 |"), "CN");
  assert.equal(at("controller", ["Deep Sea"], "| DSE7320 |"), "GB");
  assert.equal(at("controller", ["SmartGen"], "| HGM6120 |"), "CN");
  assert.equal(at("controller", ["Woodward"], "easYgen-3000XT", "easYgen-3000XT"), "PL");
  assert.equal(at("controller", ["Woodward"], "easYgen-800", "easYgen-800"), "?");
});

test("madeAt / madeOf trên bản ghi danh mục: dòng, tiêu đề cột, tên bảng", () => {
  const s = (id, title, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows }] });
  const cat = C.build([s("a", "CCEC Series(50HZ)-Xiamen Aosif Engineering Ltd.", ["| AC1 | 750 | 600 | KTA38-G2 | Stamford S5L1D-H41 |"]),
    s("b", "Imported Cummins Series(60HZ)-Xiamen Aosif Engineering Ltd.", ["| AC2 | 750 | 600 | KTA38-G2 | S5L1D-H41 |"]), s("c", "Gensets", ["| AC3 | 750 | 600 | KTA38-G2 | S5L1D-H41 |"])]);
  const e = cat.engines.find((x) => x.key === C.keyOf("KTA38-G2"));
  assert.deepEqual(e.uses.map((u) => [u.supplierId, C.madeAt(e, u).at]).sort(), [["a", "CN"], ["b", "US"], ["c", "?"]]);
  assert.deepEqual(C.madeOf(e).sort(), ["?", "CN", "US"]);
});

test("partOriginOfHsmt: thương hiệu hay nơi sản xuất cho từng bộ phận (dòng HSMT thật)", () => {
  const P = (t) => Object.fromEntries(Object.entries(partOriginOfHsmt(t)).map(([k, v]) => [k, v?.basis || null]));
  // IB2400362458: "Xuất xứ: EU – G7" cho cả ba bộ phận → nơi sản xuất.
  assert.deepEqual(P("Động cơ: Xuất xứ: EU – G7\nĐầu phát điện: Xuất xứ: EU – G7\nHệ thống điều khiển: Xuất xứ: EU – G7"), { engine: "origin", alternator: "origin", controller: "origin" });
  // IB2400470242: chỉ thương hiệu.
  assert.deepEqual(P("Động cơ: Thương hiệu: Thương hiệu thuộc các nhóm nước G7\nBộ điều khiển: Thương hiệu: Thương hiệu thuộc các nhóm nước G7"), { engine: "brand", alternator: null, controller: "brand" });
  // IB2400265303: nhãn "Xuất xứ và thương hiệu", nhưng G7 nằm ở mệnh đề thương hiệu.
  assert.equal(P("Động cơ: Xuất xứ và thương hiệu: Xuất xứ nhà thầu đề xuất; thương hiệu thuộc các nước G7 hoặc EU, có giấy chứng nhận CE").engine, "brand");
  // IB2500084609: thương hiệu G7, xuất xứ ASEAN (có "ưu tiên" ở mệnh đề khác).
  assert.equal(P("Phần I - Máy 15kVA/16.5kVA 3 pha: Động cơ - hãng, thương hiệu, xuất xứ: Chọn hãng động cơ phù hợp công suất, ưu tiên Kubota, Yanmar, Perkin…; thương hiệu G7; xuất xứ khối các nước ASEAN").engine, "brand");
  // IB2600219527: thương hiệu G7 + xuất xứ G20 → nơi sản xuất.
  assert.equal(P("Hạng mục 1 - Đầu phát: Thương hiệu, xuất xứ: Thương hiệu thuộc nhóm nước G7; xuất xứ nhóm nước OECD/G20").alternator, "origin");
  // IB2600465110: "thương hiệu xuất xứ" là nước của thương hiệu.
  assert.equal(P("Máy 12,5 kVA: Động cơ - Xuất xứ: Có thương hiệu xuất xứ thuộc nhóm các nước G7").engine, "brand");
  // IB2600337362: "Xuất xứ hãng sản xuất" là nước của hãng.
  assert.equal(P("Động cơ diesel: Xuất xứ hãng sản xuất: Châu Âu/ G7").engine, "brand");
  // IB2500533266: "Sản xuất tại chính quốc gia…".
  assert.equal(P("Máy 100 kVA: Động cơ - Nước sản xuất: Sản xuất tại chính quốc gia có nhà sản xuất động cơ thuộc khối các nước G20, EU, G7.").engine, "origin");
  // Dòng không nêu bộ phận (của tổ máy), dòng ATS, tiêu chuẩn / tham khảo: không phải luật của bộ phận.
  assert.deepEqual(P("Máy 12,5 kVA: Xuất xứ: Xuất xứ thuộc nhóm các nước G7 hoặc Việt Nam"), { engine: null, alternator: null, controller: null });
  assert.deepEqual(P("Tủ chuyển nguồn tự động ATS 250A: Quy cách, xuất xứ: Lắp ráp tại Việt Nam; bộ điều khiển ATS và ATS đồng bộ nhà sản xuất; xuất xứ G7"), { engine: null, alternator: null, controller: null });
  assert.equal(P("Động cơ: Xuất xứ: Nhập khẩu trực tiếp chính hãng, không nhập khẩu qua nước thứ 3; sản xuất từ 2023 trở về sau. Nhà thầu tham khảo thông số kỹ thuật các thiết bị có nguồn gốc tại nhóm các nước G7").engine, null);
});

// Ứng viên: ba nhà cung cấp ở TQ chào cùng động cơ, một trang ghi CCEC, một ghi nhập khẩu, một không ghi.
const H = "| Model | Prime kVA | Prime kW | Engine | Stamford Alternator |";
const sup = (id, title, rows) => ({ id, country: "CN", confidence: "high", specTables: [{ n: 101, title, header: [H], rows }] });
const list = [sup("ccec", "CCEC Series(50HZ)-Xiamen Aosif Engineering Ltd.", ["| AC1 | 750 | 600 | KTA38-G2 | S5L1D-H41 |"]),
  sup("imp", "Imported Cummins Series(50HZ)-Xiamen Aosif Engineering Ltd.", ["| AC2 | 750 | 600 | KTA38-G2 | S5L1D-H41 |"]),
  sup("bare", "Gensets", ["| AC3 | 750 | 600 | KTA38-G2 | S5L1D-H41 |"])];
const hints = (t) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${t}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const run = (t, origin) => candidates(C.build(list), { value: 700, unit: "kVA" }, hints(t), { suppliers: list, origin, cn: new Set(list.map((s) => s.id)) });

test("candidates: HSMT đòi NƠI SẢN XUẤT động cơ G7 → dòng ghi nhà máy TQ bị loại, hàng nhập đạt, không ghi thì cần xác nhận", () => {
  const r = run("Động cơ: Xuất xứ: EU – G7\n50 Hz", "g7eu");
  assert.deepEqual(r.dropped.map((d) => [d.u.supplierId, d.ruled]), [["ccec", ["made"]]]);
  const by = Object.fromEntries(r.top.map((x) => [x.u.supplierId, x]));
  assert.deepEqual(Object.keys(by).sort(), ["bare", "imp"]);
  assert.equal(by.imp.made.engine, "US"); assert.ok(by.imp.why.some((w) => /động cơ sản xuất tại Mỹ/.test(w)));
  assert.equal(by.bare.made.engine, "?"); assert.ok(by.bare.why.includes("cần xác nhận nơi sản xuất động cơ"));
  // Đầu phát Stamford: mặc định Anh (Khoa chốt) → không bị trừ điểm khi HSMT đòi nơi sản xuất đầu phát.
  const r2 = run("Đầu phát điện: Xuất xứ: EU – G7\n50 Hz", "g7eu");
  assert.equal(r2.dropped.length, 0);
  assert.ok(r2.top.every((x) => x.made.alternator === "GB"));
});

test("candidates: HSMT chỉ đòi THƯƠNG HIỆU G7 → không xét nơi sản xuất (như trước)", () => {
  const r = run("Động cơ: Thương hiệu: EU/G7\n50 Hz", "g7eu");
  assert.equal(r.dropped.length, 0);
  assert.deepEqual(r.top.map((x) => x.u.supplierId).sort(), ["bare", "ccec", "imp"]);
  assert.ok(r.top.every((x) => !x.made));
});

test("candidates Xuất xứ Trung Quốc: Cummins dòng ghi CCEC được cộng như động cơ hãng TQ", () => {
  const r = run("50 Hz", "cn");
  const by = Object.fromEntries(r.top.map((x) => [x.u.supplierId, x]));
  assert.ok(by.ccec.why.some((w) => /hãng ngoại sản xuất tại Trung Quốc/.test(w)));
  assert.ok(by.ccec.score >= by.bare.score + 250 - 1);
  assert.ok(!by.imp.why.some((w) => /sản xuất tại Trung Quốc/.test(w)));
});

test("madeBasisOf: căn cứ của câu yêu cầu", () => {
  assert.equal(madeBasisOf("Xuất xứ: EU – G7"), "origin");
  assert.equal(madeBasisOf("Thương hiệu: Thương hiệu thuộc các nhóm nước G7"), "brand");
  assert.equal(madeBasisOf("Xuất xứ nhà thầu đề xuất; thương hiệu thuộc các nước G7 hoặc EU"), "brand");
  assert.equal(madeBasisOf("G7"), null);
});

test("madeChecks (engine_origin / alt_origin / ctl_origin): TQ không đạt, G7 đạt, không ghi cần chứng từ; thương hiệu để agent", () => {
  const built = C.build(list);
  const req = (code, item, quote) => ({ code, item, requirement: quote, quote, part: { engine_origin: "engine", alt_origin: "alternator", ctl_origin: "controller" }[code], level: "core" });
  const reqs = [req("engine_origin", "Xuất xứ động cơ", "Động cơ: Xuất xứ: EU – G7"), req("alt_origin", "Xuất xứ đầu phát", "Đầu phát điện: Xuất xứ: EU – G7"),
    req("ctl_origin", "Xuất xứ bộ điều khiển", "Hệ thống điều khiển: Xuất xứ: EU – G7")];
  const cfg = (sid, extra = {}) => ({ engine: { model: "KTA38-G2", make: "Cummins", src: { kind: "catalog", supplierId: sid } }, alternator: { model: "S5L1D-H41", make: "Stamford" },
    controller: { model: "HGM9320", make: "SmartGen" }, checks: [{ item: "Xuất xứ động cơ", status: "met", offered: "Cummins (Mỹ)" }], ...extra });
  const rowOf = (sid) => built.engines.find((e) => e.key === C.keyOf("KTA38-G2")).uses.find((u) => u.supplierId === sid);
  const st = (c) => Object.fromEntries(c.checks.map((x) => [x.item, x.status]));
  // Agent ghi "đạt" theo hãng Cummins; dòng ghi CCEC → không đạt.
  // Đầu phát Stamford S5 NCC chào, HSMT đòi nơi sản xuất: chưa rõ, cần CO (Khoa 21/11/2026), không lấy mặc định Anh.
  assert.deepEqual(st(madeChecks(cfg("ccec"), reqs, rowOf("ccec"), built)), { "Xuất xứ động cơ": "not_met", "Xuất xứ đầu phát": "confirm", "Xuất xứ bộ điều khiển": "not_met" });
  const altReq = [reqs[1]], altOf = (model, check) => madeChecks(cfg("bare", { alternator: { model, make: "Stamford" }, checks: check ? [{ item: "Xuất xứ đầu phát", ...check }] : [] }), altReq, null, built).checks[0];
  const conf = altOf("Stamford S7L1D-K4");
  assert.equal(conf.status, "confirm"); assert.equal(conf.confirm, "document"); assert.match(conf.note, /không lấy nơi mặc định của hãng \(Khoa 21\/11\/2026\)/);
  assert.equal(conf.sourceQuote, undefined);
  // Dải ngoài S4–S7 giữ nơi mặc định; agent ghi "đạt" chỉ nhờ tên hãng thì vẫn về CO; câu nguồn ghi rõ nơi thì giữ.
  assert.equal(altOf("UCI274F").status, "met");
  assert.equal(altOf("S4L1D-D41", { status: "met", offered: "Stamford (Anh)", sourceQuote: "| S4L1D-D41 | Stamford |" }).status, "confirm");
  assert.equal(altOf("S5L1D-H41", { status: "not_met", offered: "Vô Tích", sourceQuote: "| Manufacturer | WUXI STAMFORD" }).status, "not_met");
  // Thương hiệu: không qua luật này.
  const brandAlt = madeChecks(cfg("bare", { checks: [{ item: "Xuất xứ đầu phát", status: "met", offered: "Stamford (Anh)" }] }), [req("alt_origin", "Xuất xứ đầu phát", "Đầu phát điện: Thương hiệu: EU/G7")], null, built);
  assert.equal(st(brandAlt)["Xuất xứ đầu phát"], "met");
  assert.equal(st(madeChecks(cfg("imp"), reqs, rowOf("imp"), built))["Xuất xứ động cơ"], "met");
  const bare = madeChecks(cfg("bare"), reqs, rowOf("bare"), built), x = bare.checks.find((y) => y.item === "Xuất xứ động cơ");
  assert.equal(x.status, "confirm"); assert.equal(x.confirm, "document"); assert.match(x.note, /Cần xác nhận nơi sản xuất động cơ \(CO\)/);
  // Thương hiệu: giữ nguyên check của agent.
  const brand = madeChecks(cfg("ccec"), [req("engine_origin", "Xuất xứ động cơ", "Động cơ: Thương hiệu: EU/G7")], rowOf("ccec"), built);
  assert.equal(st(brand)["Xuất xứ động cơ"], "met");
  // Nhóm G: thương hiệu, check chưa rõ. Hãng nguồn ghi thuộc nhóm → đạt + ghi cần CO; dòng ghi CCEC hoặc HSMT đòi nơi SX thì không.
  const brandReq = [req("engine_origin", "Xuất xứ động cơ", "Động cơ: Nhà sản xuất / nhãn hiệu: G7, EU")];
  const open = (sid) => cfg(sid, { checks: [{ item: "Xuất xứ động cơ", status: "unclear" }] });
  const okB = madeChecks(open("imp"), brandReq, rowOf("imp"), built).checks[0];
  assert.equal(okB.status, "met"); assert.equal(okB.rule, "thuong-hieu"); assert.match(okB.note, /nơi sản xuất cần CO/);
  assert.equal(madeChecks(open("ccec"), brandReq, rowOf("ccec"), built).checks[0].status, "unclear");
  const noMake = madeChecks(cfg("bare", { engine: { model: "KHONG-CO-MA", make: "Cummins" }, checks: [{ item: "Xuất xứ động cơ", status: "unclear" }] }), brandReq, null, built).checks[0];
  assert.equal(noMake.status, "unclear");
  const again = madeChecks(open("imp"), brandReq, rowOf("imp"), built);
  assert.equal(JSON.stringify(madeChecks(JSON.parse(JSON.stringify(again)), brandReq, rowOf("imp"), built)), JSON.stringify(again));
});
