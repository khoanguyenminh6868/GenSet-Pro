// node --test suppliers/*.test.mjs — nhóm E / C / D (Khoa 21/11/2026): AVR, tiêu chuẩn đầu phát, tốc độ, nhiên liệu, tần số đọc từ
// tờ hãng thật của Baudouin 6M31G825/5 [1021] và Leroy-Somer LSA 49.3 [1012].
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { altDocChecks, engineSheetChecks, engineSheetsOf, confirmChecks } from "./config-bot.mjs";
import { lsStandards, stdCodes } from "./ratings.mjs";

const C = globalThis.GenbidCatalog;
const baudouin = JSON.parse(fs.readFileSync(new URL("./cn/baudouin.json", import.meta.url), "utf8"));
const lsText = fs.readFileSync(new URL("./sources/leroy-somer-fuzhou/1012.md", import.meta.url), "utf8");
const std = lsStandards(lsText).map((a) => ({ ...a, model: "LSA 49.3 M8", supplierId: "leroy-somer-fuzhou", n: 1012 }));
const avr = { key: "avr", value: ["R220", "D350"], lines: ["| AVR type | R220 | D350"], model: "LSA 49.3 M8", supplierId: "leroy-somer-fuzhou", n: 1012 };
const req = (code, item, requirement, part) => ({ code, item, requirement, part, level: "core" });
const chk = (r, status = "unclear") => ({ item: r.item, status, part: r.part });
const sheet = engineSheetsOf(C.build([baudouin]), [baudouin]).get(C.keyOf("6M31G825/5"));
const eng = (r, rating = [{ hz: 50, rpm: 1500, supplierId: "ls", n: 1012, lines: ["Ratings 50 Hz - 1 500 R.P.M."] }], row = null) => {
  const c = { engine: { model: "6M31G825/5" }, alternator: { model: "LSA 49.3 M8" }, checks: [chk(r)] };
  engineSheetChecks(c, [r], sheet, rating, row); return c.checks[0];
};

test("mã tiêu chuẩn: phần là mã riêng, cách viết về một dạng", () => {
  assert.deepEqual(stdCodes("ISO 8528/3, IEC 60034, NEMA MG 1.32-33, BS 5514/1, BS 5000 Part 99"), ["ISO 8528-3", "IEC 60034", "NEMA MG 1.32-33", "BS 5514-1", "BS 5000-99"]);
  assert.ok(!stdCodes("IEC 60034").includes("IEC 60034-1"));
});

test("tiêu chuẩn: đủ mã thì đạt; thiếu BS 5514/1 thì vẫn cần chứng từ và nêu đúng mã thiếu", () => {
  const all = req("alt_standard", "Tiêu chuẩn đầu phát", "IEC 60034, NEMA MG 1.32-33, ISO 8528-3", "alternator"), c1 = { checks: [{ ...chk(all, "confirm"), confirm: "document" }] };
  altDocChecks(c1, [all], std);
  assert.equal(c1.checks[0].status, "met");
  assert.equal(c1.checks[0].confirm, undefined);
  const some = req("alt_standard", "Tiêu chuẩn đầu phát", "ISO 8528-3, IEC 60034, NEMA MG 1.32-33, BS 5514/1", "alternator"), c2 = { checks: [{ ...chk(some, "confirm"), confirm: "document" }] };
  altDocChecks(c2, [some], std);
  assert.equal(c2.checks[0].status, "confirm");
  assert.match(c2.checks[0].note, /không ghi BS 5514-1/);
});

test("AVR: yêu cầu chỉ đòi có AVR thì đạt; nêu model khác thì giữ", () => {
  for (const t of ["Có AVR", "AVR tự động", "Tự động ổn định điện áp bằng AVR"]) {
    const r = req("alt_avr", "Điều chỉnh điện áp (AVR)", t, "alternator"), c = { checks: [{ ...chk(r, "confirm"), confirm: "order" }] };
    altDocChecks(c, [r], [avr]);
    assert.equal(c.checks[0].status, "met", t);
  }
  const r = req("alt_avr", "Điều chỉnh điện áp (AVR)", "AVR MX341", "alternator"), c = { checks: [{ ...chk(r, "confirm"), confirm: "order" }] };
  altDocChecks(c, [r], [avr]);
  assert.equal(c.checks[0].status, "confirm");
});

test("tốc độ từ tờ hãng động cơ: ≤ 1500 đạt, ≤ 1450 giữ chưa rõ", () => {
  assert.deepEqual([...new Set(sheet.speeds.map((x) => x.v))], [1500]);
  assert.equal(eng(req("speed", "Tốc độ quay", "≤ 1.500 vòng/phút", "engine")).status, "met");
  assert.equal(eng(req("speed", "Tốc độ quay", "1500 v/p", "engine")).status, "met");
  assert.equal(eng(req("speed", "Tốc độ quay", "≤ 1450 vòng/phút", "engine")).status, "unclear");
});

test("nhiên liệu: Diesel từ tờ động cơ, ghi rõ nguồn; HSMT đòi khí thì không", () => {
  const x = eng(req("fuel", "Nhiên liệu", "Dầu diesel", "genset"));
  assert.equal(x.status, "met");
  assert.match(x.offered, /động cơ/);
  assert.equal(eng(req("fuel", "Nhiên liệu", "Khí thiên nhiên", "genset")).status, "unclear");
});

test("tần số: cần cả động cơ đúng v/p và đầu phát có định mức đó", () => {
  const r = req("frequency", "Tần số", "50 Hz", "genset");
  assert.equal(eng(r).status, "met");
  assert.equal(eng(r, []).status, "unclear");
  assert.equal(eng(req("frequency", "Tần số", "60 Hz", "genset"), [{ hz: 60, rpm: 1800, supplierId: "ls", n: 1012, lines: ["x"] }]).status, "unclear");
});

test("dòng tổ máy tự ghi 1800 v/p / 60 Hz: tờ động cơ 1500 không chấm đạt tốc độ, tần số", () => {
  const sp = req("speed", "Tốc độ quay", "≤ 1500 vòng/phút", "engine"), hz = req("frequency", "Tần số", "50 Hz", "genset");
  const rows = [{ header: ["| Model | Speed (rpm) | Prime kW | Engine |"], line: "| WPG660 | 1800 | 480 | 6M31G660/6 |", title: "Gensets" }, { header: ["| Model | kW |"], line: "| X | 480 | 1800 rpm |", title: "" }, { header: ["| Model | kW |"], line: "| X | 480 |", title: "Gensets 60Hz" }];
  for (const row of rows) assert.equal(eng(sp, undefined, row).status, "unclear", row.line);
  for (const row of rows.slice(0, 2)) assert.equal(eng(hz, undefined, row).status, "unclear", row.line);
  assert.equal(eng(sp, undefined, { header: ["| Model | Speed (rpm) | kW |"], line: "| X | 1500 | 600 |", title: "" }).status, "met");
});

test("tờ động cơ ghi cả 1500 và 1800: không tự chọn tốc độ", () => {
  const two = { speeds: [{ v: 1500, line: "| 1500 | 680", supplierId: "m", n: 1 }, { v: 1800, line: "| 1800 | 700", supplierId: "m", n: 1 }], fuels: [] };
  for (const r of [req("speed", "Tốc độ quay", "≤ 1500 vòng/phút", "engine"), req("frequency", "Tần số", "50 Hz", "genset")]) {
    const c = { engine: { model: "E" }, alternator: { model: "A" }, checks: [chk(r)] };
    engineSheetChecks(c, [r], two, [{ hz: 50, rpm: 1500, supplierId: "ls", n: 1, lines: ["x"] }], null);
    assert.equal(c.checks[0].status, "unclear", r.code);
  }
});

test("chạy lại confirmChecks + altDocChecks giữ nguyên kết quả", () => {
  const r = req("alt_avr", "Điều chỉnh điện áp (AVR)", "Có AVR", "alternator"), c = { checks: [chk(r)] };
  altDocChecks(c, [r], [avr]);
  const first = JSON.stringify(c);
  confirmChecks(c, [r]); altDocChecks(c, [r], [avr]);
  assert.equal(JSON.stringify(c), first);
});
