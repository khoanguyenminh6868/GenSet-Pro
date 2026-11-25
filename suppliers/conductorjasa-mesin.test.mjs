// node --test suppliers/conductorjasa-mesin.test.mjs — cột tiếng Indonesia của conductorjasa (conductorjasa-mesin, 25/11/2026).
// "Mesin" = động cơ, "BBM 75%" = tiêu hao nhiên liệu ở 75 % tải, "L/jam" = L/h, "Prime kVA" / "Standby kVA".
// Trước: ô model là TÊN dài ("PJPS-13 WP 403A-15G1", "MJPS-2000 S16R-PTAA2 2000 kVA prime", không là mã) nên mã ở cột Mesin bị
// đọc là tổ máy, bảng không cho bản ghi động cơ hoặc ra bản ghi đầu phát sai ("237 L/jam"); công suất đứng SAU cột động cơ nên
// bị bỏ. Thêm tiêu đề dính dòng nhãn cho khối dòng máy vốn là bảng không tiêu đề (n101-115).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tablesOf } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "conversions.js")).href);
await import(pathToFileURL(path.join(ROOT, "..", "web", "spec-norm.js")).href);
const C = globalThis.GenbidCatalog, SN = globalThis.GenbidSpecNorm;
const sup = (tables) => ({ id: "conductorjasa", country: "ID", confidence: "high", role: "genset_oem", specTables: tables });
const H6 = "| Model | Mesin | Prime kVA | Standby kVA | BBM 75% | Dimensi open", H4 = "| Model | Mesin | Prime kVA | Standby kVA";
const recs = (header, rows) => C.fromSupplier(sup([{ n: 101, title: "Genset 2000 kVA", header: [header], rows }]), []);
const fuel = (r, k = "fuel75") => (r.specs || []).find((s) => s.key === k);

test("tên model dài + mã ở cột Mesin: tổ máy là tên, động cơ là mã, prime / standby kVA đọc sau cột động cơ, BBM 75% = fuel75", () => {
  const r = recs(H6, ["| MJPS-2000 S16R-PTAA2 2000 kVA prime | S16R-PTAA2 | 2000 | 2200 | 305 L/jam | –"]);
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, "engine");
  assert.equal(r[0].genset, "MJPS-2000 S16R-PTAA2 2000 kVA prime");
  assert.equal(r[0].model, "S16R-PTAA2");
  assert.deepEqual(r[0].power, { prime: { kVA: 2000 }, standby: { kVA: 2200 } });
  // mức tải 75 %: KHÔNG là tiêu hao 100 %
  assert.deepEqual((r[0].specs || []).map((s) => [s.key, s.value]), [["fuel75", "305 L/jam"]]);
  assert.equal(fuel(r[0], "fuel"), undefined);
});

test("không còn bản ghi đầu phát từ ô '237 L/jam' (n102)", () => {
  const r = recs(H6, ["| MJPS-1500-C S12R-PTAA2-C 1500 kVA prime | S12R-PTAA2-C | 1500 | 1650 | 237 L/jam | –", "| MJPS-1500-C-leroy S12R-PTAA2-C 1500 kVA prime | S12R-PTAA2-C | 1500 | 1650 | 237 L/jam | –"]);
  assert.deepEqual(r.map((x) => x.kind), ["engine", "engine"]);
  assert.deepEqual(r.map((x) => x.model), ["S12R-PTAA2-C", "S12R-PTAA2-C"]);
});

test("bảng 4 cột của n116 và dòng mà tên là mã có một dấu cách ('PJPS-1800-WP 4016TAG1A')", () => {
  const r = recs(H4, ["| PJPS-13 WP 403A-15G1 | 403A-15G1 | 13 | 14,3", "| PJPS-1800-WP 4016TAG1A | 4016TAG1A | 1800 | 1980"]);
  assert.deepEqual(r.map((x) => [x.genset, x.model, x.power]), [
    ["PJPS-13 WP 403A-15G1", "403A-15G1", { prime: { kVA: 13 }, standby: { kVA: 14.3 } }],
    ["PJPS-1800-WP 4016TAG1A", "4016TAG1A", { prime: { kVA: 1800 }, standby: { kVA: 1980 } }]]);
  assert.deepEqual(r.map((x) => x.specs), [[], []]);
});

// Từ #1235 (bước 3 họ P2, `DEUTZ_CODE`) mã Deutz viết có dấu cách "BF8M 1015 CP" là mã động cơ: dòng đó ra bản ghi, mã đúng chữ ô nguồn.
test("mã Deutz có dấu cách ('BF8M 1015 CP') đọc đúng chữ ô; mã không có chữ ('2011') không ra bản ghi, không đoán", () => {
  const r = recs(H6, ["| DJPS-500 WP BF8M 1015 CP 500 kVA prime | BF8M 1015 CP | 500 | 550 | 84,9 L/jam | 3000 × 1500 × 2050 mm", "| DJPS-20 OP1 2011 20 kVA prime | 2011 | 20 | 22 | 4,2 L/jam | 1300 × 700 × 1070 mm"]);
  assert.deepEqual(r.map((x) => [x.kind, x.genset, x.model, x.power.prime.kVA, x.power.standby.kVA]), [["engine", "DJPS-500 WP BF8M 1015 CP 500 kVA prime", "BF8M 1015 CP", 500, 550]]);
});

test("cột kích thước ('Dimensi open') đọc như kích thước; mức tải khác 75 % của BBM không thành fuel75", () => {
  const r = recs(H6, ["| CJPS C-500 WP QSZ13-G10 500 kVA prime | QSZ13-G10 | 500 | 550 | 74 L/jam | 3600 × 1450 × 2100 mm"]);
  assert.deepEqual((r[0].specs || []).map((s) => [s.key, s.value]), [["fuel75", "74 L/jam"], ["dims", "3600 × 1450 × 2100 mm"]]);
  const r2 = recs("| Model | Mesin | Prime kVA | Standby kVA | BBM 100% | BBM 50%", ["| CJPS C-500 WP QSZ13-G10 500 kVA prime | QSZ13-G10 | 500 | 550 | 98 L/jam | 51 L/jam"]);
  assert.deepEqual((r2[0].specs || []).map((s) => [s.key, s.value]), [["fuel", "98 L/jam"], ["fuel50", "51 L/jam"]]);
  // "BBM" không ghi mức tải: không biết là mức nào, không đọc
  const r3 = recs("| Model | Mesin | Prime kVA | Standby kVA | BBM", ["| CJPS C-500 WP QSZ13-G10 500 kVA prime | QSZ13-G10 | 500 | 550 | 98 L/jam"]);
  assert.deepEqual(r3[0].specs, []);
});

test("n124 (tên là mã, ô động cơ ghi hãng + mã, tiêu đề có ô đầu trống) vẫn đọc như trước", () => {
  const r = C.fromSupplier(sup([{ n: 124, title: "Genset Besar", header: ["| | Model | Mesin | Prime (kVA) | Standby (kVA) | Tipe"], rows: ["| PJPS-750 WP2 | Perkins 4006-23TAG2A | 750 | 825 | Open Type · opsi silent, container"] }]), []);
  assert.deepEqual(r.map((x) => [x.kind, x.genset, x.model]), [["engine", "PJPS-750 WP2", "4006-23TAG2A"]]);
});

test("'L/jam' là L/h khi chuẩn hoá; 'l/hr' và 'L/h' không đổi", () => {
  const n = (v) => SN.normalize({ key: "fuel75", label: "BBM 75%", value: v }, {});
  assert.equal(n("305 L/jam").unit, "L/h");
  assert.equal(n("84,9 L/jam").unit, "L/h");
  assert.equal(SN.normalize({ key: "fuel", label: "Fuel Consumption", value: "31l/hr" }, {}).unit, "L/h");
  assert.equal(SN.normalize({ key: "fuel", label: "Fuel Consumption", value: "31 L/h" }, {}).unit, "L/h");
});

test("tablesOf: khối dòng máy nằm ngay dưới dòng nhãn + tiêu đề dính nhau có tiêu đề (n101-115); khối đã có tiêu đề không đổi", () => {
  const rows = ["| MJPS-2000 S16R-PTAA2 2000 kVA prime | S16R-PTAA2 | 2000 | 2200 | 305 L/jam | –", "| MJPS-2000 WP S16R-PTAA2-C 2000 kVA prime | S16R-PTAA2-C | 2000 | 2200 | 315 L/jam | –"];
  const t = tablesOf(["Mesin Mitsubishi", "BBM 75% (prime): 305–315 L/jam 3 model | | Model | Mesin | Prime kVA | Standby kVA | BBM 75% | Dimensi open", ...rows, "hết"].join("\n"));
  assert.deepEqual(t, [{ header: ["| Model | Mesin | Prime kVA | Standby kVA | BBM 75% | Dimensi open"], rows }]);
  // dòng trên không đủ ô chữ / không nêu công suất: giữ nguyên như trước (không tiêu đề)
  const t2 = tablesOf(["Mesin Mitsubishi", "BBM 75% | 3 model | | Model | Mesin | 2000 | 2200", ...rows, "hết"].join("\n"));
  assert.deepEqual(t2, [{ header: [], rows }]);
});

test("tệp nguồn thật: mọi dòng '|' của n101-n116 đứng dưới tiêu đề Mesin; mỗi dòng có tên model, mã động cơ, prime, standby khớp ô nguồn", () => {
  let rowsAll = 0;
  for (const n of [101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 116]) {
    const raw = fs.readFileSync(path.join(ROOT, "sources", "conductorjasa", `${n}.md`), "utf8");
    const ts = tablesOf(raw.split("\n").slice(3).join("\n"));
    for (const t of ts) {
      assert.match(t.header.join(" "), /Model \| Mesin \| Prime kVA \| Standby kVA/, `n${n} có bảng không tiêu đề`);
      const w = t.header[0].split("|").length - 1;
      for (const row of t.rows) assert.equal(row.split("|").length - 1, w, `n${n}: ${row}`);
      const r = C.fromSupplier(sup([{ n, title: "x", header: t.header, rows: t.rows }]), []);
      for (const x of r) {
        const cells = x.line.split("|").slice(1).map((c) => c.trim());
        assert.equal(x.genset, cells[0], x.line);
        assert.equal(x.model, cells[1], x.line);
        assert.equal(x.power.prime.kVA, +cells[2].replace(",", "."), x.line);
        assert.equal(x.power.standby.kVA, +cells[3].replace(",", "."), x.line);
        if (cells[4] && /\d/.test(cells[4])) assert.equal(fuel(x).value, cells[4], x.line); else assert.equal(fuel(x), undefined, x.line);
      }
      rowsAll += r.length;
    }
  }
  assert.equal(rowsAll, 143);   // 138 + 5 dòng Deutz "BF8M 1015 CP" ×2, "BF8M 1015 C", "BF6M 1015 C", "BF6M 1013 FC" (#1235); từng dòng đã so ô nguồn ở vòng trên
});
