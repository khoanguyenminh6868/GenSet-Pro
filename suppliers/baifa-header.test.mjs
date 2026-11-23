// node --test suppliers/*.test.mjs — dòng máy bị bộ thu thập (crawl-specs.mjs tablesOf) lưu vào `header` (baifa-power, 23/11/2026).
// Dòng rộng, phần lớn ô là chữ ("| BF-C1540Q-T2 | 1540 | 1400 | QSK50-G3 | | S6L1D-H4 | TIER 2/ CHINA STAGE3 | UK/ CCEC") không đủ
// 40 % ô số nên trước đây mọi dòng đứng trước dòng "đủ số" đầu tiên thành tiêu đề: baifa n101 b1 có 31 dòng máy trong
// tiêu đề, lẫn dòng "TBA" / dòng thiếu ô đầu nên catalog.js (`headerRows`) để nguyên cả bảng, 31 dòng không ra bản ghi nào.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tablesOf, isMachineRow, headerEnd } from "./crawl-specs.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));

// Dòng thật của sources/baifa-power/101.md (khối bắt đầu ở dòng 235 của tệp).
const H0 = "| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY";
const H1 = "| Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD";
const IN_HEADER = [
  "| BF-V770-T2 | 770 | 700 | VOLVO | TWD1645GE | EMS2 / ECU | S5L1D-G4 | STAGE II /TIER 2 | SWEDEN",
  "| TBA | 836 | 760 | VOLVO | TWD1744GE | ECM4 | S5L1D-H41 | STAGE II /TIER 2 | SWEDEN",
  "| TBA | | 750 | 5006AC-E23TAG1 | | TBA | TIER 2 | TBA",
  "| | 800 | 5006AC-E23TAG2 | | TIER 2 | TBA",
  "| BF-C1540Q-T2 | 1540 | 1400 | QSK50-G3 | | S6L1D-H4 | TIER 2/ CHINA STAGE3 | UK/ CCEC",
];
const FIRST_DATA = "| BF-C3763Q-T2 | 3763 | 3363 | QSK95-G10 | | LSA 53.2M12 | TIER 2 | USA";
const UK_CCEC = ["QSK50-G3", "QSK50-G4", "QSK50-G7", "QSK50-G13", "QSK60-G23"];

test("isMachineRow: dòng máy (mã + hai ô số trơn) khác dòng tiêu đề", () => {
  assert.equal(isMachineRow(IN_HEADER[0]), true);
  assert.equal(isMachineRow(IN_HEADER[4]), true);
  for (const l of [H0, H1, "| Model | 50Hz | 60Hz | 1500rpm", "| | POWERED BY VOLVO | 1800RPM TIER 3", "| MODEL | kVA | kVA | | | |",
    "| | Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD | FUEL CONSUMPTION 75% L/H | Emission"]) assert.equal(isMachineRow(l), false, l);
  // dòng "TBA" / thiếu ô đầu không tự là mốc, nhưng đứng SAU dòng máy đầu tiên nên vẫn theo sang dòng
  assert.equal(isMachineRow(IN_HEADER[1]), false);
  assert.equal(headerEnd([H0, H1, ...IN_HEADER]), 2);
  assert.equal(headerEnd([H0, H1]), 2);
  // dòng đầu của khối luôn là tiêu đề
  assert.equal(headerEnd([IN_HEADER[0], IN_HEADER[4]]), 1);
});

test("tablesOf: tiêu đề dừng ở dòng máy đầu tiên; mọi dòng sau đó là dòng, đúng thứ tự trang, không thêm không mất", () => {
  const block = [H0, H1, ...IN_HEADER, FIRST_DATA, "| BF-M880-T2 | 880 | 800 | MTU | 12V2000G26F | | S6L1D-C4"];
  const t = tablesOf(block.join("\n"));
  assert.equal(t.length, 1);
  assert.deepEqual(t[0].header, [H0, H1]);
  assert.deepEqual(t[0].rows, block.slice(2));
  // bảng không có dòng máy trước dòng số đầu tiên: y như trước
  const plain = ["| Model | Prime kVA | Standby kVA | Engine", "| A-20 | 20 | 22 | 4B3.9-G1", "| A-30 | 30 | 33 | 4BT3.9-G2"];
  assert.deepEqual(tablesOf(plain.join("\n")), [{ header: [plain[0]], rows: plain.slice(1) }]);
});

test("tệp nguồn baifa n101–n106: tablesOf ra đúng bảng đã lưu trong specs/, không bảng nào còn dòng máy trong tiêu đề", () => {
  const specs = read("specs", "baifa-power.json");
  for (const n of [...new Set(specs.map((t) => t.n))]) {
    const got = tablesOf(fs.readFileSync(path.join(ROOT, "sources", "baifa-power", `${n}.md`), "utf8"));
    const saved = specs.filter((t) => t.n === n).map((t) => ({ header: t.header, rows: t.rows }));
    assert.deepEqual(got.map((t) => ({ header: t.header, rows: t.rows })), saved, `n${n}`);
    for (const t of got) assert.equal(headerEnd(t.header), t.header.length, `n${n}: ${t.header[headerEnd(t.header)]}`);
  }
});

test("hồ sơ baifa: 31 dòng của n101 b1 nằm ở dòng (trước đây trong tiêu đề) và ra bản ghi; 5 dòng 'UK/ CCEC' đủ", () => {
  const s = read("cn", "baifa-power.json");
  for (const [i, t] of s.specTables.entries()) assert.equal(headerEnd(t.header), t.header.length, `bảng ${i}`);
  const t1 = s.specTables.find((t) => t.rows.includes(IN_HEADER[4]));
  assert.deepEqual(t1.header, [H0, H1]);
  // đúng thứ tự trang: 31 dòng từng nằm trong tiêu đề đứng trước dòng "đủ số" đầu tiên
  assert.equal(t1.rows.indexOf(IN_HEADER[0]), 0);
  assert.equal(t1.rows.indexOf(FIRST_DATA), 31);
  const notes = [], recs = C.fromSupplier(s, notes);
  assert.deepEqual(notes.filter((x) => x.reason === "dòng máy lẫn với dòng tiêu đề"), []);
  const eng = recs.filter((r) => r.kind === "engine" && s.specTables[r.table] === t1);
  for (const l of t1.rows.slice(0, 31)) assert.equal(eng.filter((r) => r.line === l).length, 1, l);
  const uk = eng.filter((r) => /\| UK\/ CCEC$/.test(r.line));
  assert.deepEqual(uk.map((r) => r.model), UK_CCEC);
  assert.deepEqual(uk[0].power, { standby: { kVA: 1540 }, prime: { kVA: 1400 } });
  assert.equal(uk[0].genset, "BF-C1540Q-T2");
  assert.equal(uk[0].other, "S6L1D-H4");
  // dòng không ghi hãng (ô hãng gộp ô trên trang): không lấy hãng từ dòng khác
  assert.deepEqual((uk[0].makes || []).map((m) => m.name), []);
});

// Bảng của NCC KHÁC đang có dòng máy trong tiêu đề theo luật mới (quét đủ 10.083 bảng của cn/, 23/11/2026). Dữ liệu của họ
// KHÔNG sửa ở đây (catalog.js đã đọc penlucky / welland qua `headerRows`; visa lẫn dòng "undefined", để nguyên); cào lại thì
// bộ thu thập mới tự tách. Bảng mới xuất hiện ngoài danh sách = bộ thu thập lại lưu dòng máy vào tiêu đề.
const KNOWN = new Set(["penlucky|108", "visa-gensets|101", "visa-gensets|102", "visa-gensets|105", "welland-power|104"]);
test("mọi hồ sơ cn/: không bảng nào ngoài danh sách đã biết còn dòng máy trong tiêu đề", () => {
  const bad = [];
  for (const f of fs.readdirSync(path.join(ROOT, "cn")).filter((f) => f.endsWith(".json"))) {
    const s = read("cn", f);
    for (const t of s.specTables || []) if (headerEnd(t.header || []) < (t.header || []).length && !KNOWN.has(`${s.id}|${t.n}`)) bad.push(`${s.id} n${t.n}: ${t.header[headerEnd(t.header)]}`);
  }
  assert.deepEqual(bad, []);
});
