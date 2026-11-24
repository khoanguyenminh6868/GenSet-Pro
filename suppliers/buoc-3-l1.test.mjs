// node --test suppliers/buoc-3-l1.test.mjs — họ L1 "model xoay ngang theo cột" (buoc-3-l1; bảng kiểm kê
// nghiem-thu/buoc-3-bo-cuc-chua-doc.md nhánh dieu-phoi): `columnSheets` tách bảng thành một tờ "nhãn | giá trị" cho mỗi cột rồi đọc
// bằng luật bảng dọc một tổ máy (`verticalSheet`). Dòng lấy nguyên văn từ suppliers/cn (bảng giả chỉ dựng lại từ dòng nguyên văn).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (s, n) => ({ ...s, specTables: s.specTables.filter((t) => t.n === n) });
const recs = (id, n, notes) => C.fromSupplier(only(cn(id), n), notes).filter((o) => o.n === n);
const col = (o) => o.column != null;
const fake = (tables) => ({ id: "x", country: "CN", sources: [], specTables: tables.map(([header, rows], i) => ({ n: 1, title: "X " + i, header, rows })) });

test("koten n156: hai ô mỗi máy (kW | kVA), tiêu đề phần ở ô đầu, mỗi cột một động cơ và một tần số", () => {
  const r = recs("koten-power", 156).filter(col);
  assert.deepEqual(r.map((o) => [o.column, o.kind, o.genset, o.model, o.freq]), [[0, "engine", "KDY-150/S", "LR6B3L-D", 50], [1, "engine", "KDY-160/S", "LR4M3L-D", 60]]);
  // "| Prime Power | 120kW | 150kVA | 128kW | 160kVA" / "| Standby Power | 132kW | 165kVA | 141kW | 176kVA"
  assert.deepEqual(r[0].power, { prime: { kW: 120, kVA: 150 }, standby: { kW: 132, kVA: 165 } });
  assert.deepEqual(r[1].power, { prime: { kW: 128, kVA: 160 }, standby: { kW: 141, kVA: 176 } });
  // "| Prime Power | 120kW | 140kW" dưới "Engine Specification" là của động cơ, không là công suất tổ máy.
  assert.ok(!JSON.stringify(r.map((o) => o.power)).includes("140"));
  assert.equal(r[0].sheet, "bảng dọc");
  assert.ok(r[0].lines.rows.includes("| Prime Power | 120kW | 150kVA | 128kW | 160kVA"), "lines là dòng nguyên văn của bảng");
});

test("columnSheets: '| Engine Specification | Engine Brand | YTO' (một giá trị cho hai cột) chỉ để lại tiêu đề phần", () => {
  const cols = C.columnSheets(["| Genset Specification | Genset Model | KDY-150/S | KDY-160/S", "| Engine Specification | Engine Brand | YTO", "| Model | LR6B3L-D | LR4M3L-D"]);
  assert.deepEqual(cols, [["| Genset Specification", "| Genset Model | KDY-150/S", "| Engine Specification", "| Model | LR6B3L-D"], ["| Genset Specification", "| Genset Model | KDY-160/S", "| Engine Specification", "| Model | LR4M3L-D"]]);
});

test("koten n102: bảng động cơ liền sau cùng nguồn ('| Engine Model | …') ghép theo cột khi tốc độ khớp tần số", () => {
  const all = recs("koten-power", 102), r = all.filter(col);
  assert.deepEqual(r.map((o) => [o.genset, o.model, o.freq]), [["KW38D5", "WP2.3D40E200", 50], ["KW45D6", "WP2.3D47E201", 60]]);
  // "| Prime Power | 30kW/38kVA | 36kW/45kVA", "| Standby Power | 33kW/41kVA | 37kW/46kVA"
  assert.deepEqual(r[1].power, { prime: { kW: 36, kVA: 45 }, standby: { kW: 37, kVA: 46 } });
  assert.ok(r[0].lines.rows.includes("| Engine speed | 1500rpm | 1800rpm"), "lines có cả dòng của bảng động cơ");
  // Bản ghi cũ của bảng động cơ giữ nguyên.
  assert.deepEqual(all.filter((o) => !col(o)).map((o) => [o.table, o.model, JSON.stringify(o.power)]), [[1, "WP2.3D40E200", '{"rated":{"kW":39}}'], [1, "WP2.3D47E201", '{"rated":{"kW":43}}']]);
  assert.ok(r.every((o) => o.table === 0));
});

test("bảng động cơ liền sau mà tốc độ không khớp tần số từng cột: không ghép, ghi chú", () => {
  const notes = [];
  const s = fake([[[], ["| Model | KW38D5 | KW45D6", "| Frequency | 50Hz | 60Hz", "| Prime Power | 30kW/38kVA | 36kW/45kVA"]],
    [["| Engine Model | WP2.3D40E200 | WP2.3D47E201"], ["| Engine speed | 1800rpm | 1500rpm"]]]);
  assert.equal(C.fromSupplier(s, notes).filter(col).length, 0);
  assert.ok(notes.some((x) => /không khớp tần số \/ tốc độ từng cột/.test(x.reason)));
});

test("koten n138: bảng tổ máy không có mã động cơ, bảng sau không có dòng Engine Model: không ra gì", () => {
  const notes = [];
  assert.equal(recs("koten-power", 138, notes).filter(col).length, 0);
  assert.ok(notes.some((x) => x.reason === "bảng cột (cột 1): không có mã động cơ"));
});

test("koten n211: 'Model' thứ hai không có tiêu đề động cơ là hai model (luật bảng dọc): không đọc", () => {
  const notes = [];
  assert.equal(recs("koten-power", 211, notes).filter(col).length, 0);
  assert.ok(notes.some((x) => x.reason === "bảng cột (cột 1): bảng ghi từ hai model tổ máy trở lên" && x.detail === "KF30D5, 4DW92-39D"));
});

test("kanpor n115: ô trống sau nhãn model, ô đơn vị 'KW/KVA', '动力型号' là động cơ; '额定功率' không là mức", () => {
  const r = recs("kanpor-fuan", 115).filter(col);
  assert.deepEqual(r.map((o) => [o.genset, o.model]), [["KPFD40", "F4L912"], ["KPFD50", "F4L912T"], ["KPFD55", "F6L912"], ["KPFD66", "F6L912T"]]);
  // "| 备用功率 | KW/KVA | 32/40 | 40/50 | 44/55 | 53/66"; "| 额定功率 | KW/KVA | 30/38 | …" không đọc (rated không là prime).
  assert.deepEqual(r.map((o) => o.power), [{ standby: { kW: 32, kVA: 40 } }, { standby: { kW: 40, kVA: 50 } }, { standby: { kW: 44, kVA: 55 } }, { standby: { kW: 53, kVA: 66 } }]);
  assert.equal(r[0].specs.find((x) => x.key === "disp").value, "4.086");
});

test("pulita n101: 'Gas Engine Model' là dòng động cơ", () => {
  const r = recs("pulita-energy", 101).filter(col);
  assert.deepEqual(r.map((o) => [o.genset, o.model, JSON.stringify(o.power)]), [["PLC-20GF", "PC4L-NG", '{"standby":{"kW":22,"kVA":27.5}}'], ["PLR-30GF", "PR4102-NG", '{"standby":{"kW":22,"kVA":27.5}}']]);
});

test("superwatt n107: cột ghi hai động cơ ('… or …') không ra gì, cột kia đọc", () => {
  const notes = [];
  const r = recs("superwatt-swt", 107, notes).filter(col);
  assert.deepEqual(r.map((o) => [o.column, o.genset, o.model, o.freq]), [[1, "SW413X", "WP13D385E201", 60]]);
  assert.ok(notes.some((x) => x.reason === "bảng cột (cột 1): không có mã động cơ"));
});

test("một giá trị ở cột đầu, các cột sau trống (ô gộp): dòng không đọc cho cột nào", () => {
  const cols = C.columnSheets(["| Model | KW38D5 | KW45D6", "| Prime Power | 30kW/38kVA | ", "| Frequency | 50Hz | 60Hz"]);
  assert.deepEqual(cols, [["| Model | KW38D5", "| Frequency | 50Hz"], ["| Model | KW45D6", "| Frequency | 60Hz"]]);
});

test("không có dòng Model ≥ 2 mã ở 8 dòng đầu, hoặc mã trùng nhau: không là bảng cột", () => {
  assert.equal(C.columnSheets(["| Frequency | 50Hz | 60Hz", "| Prime Power | 32kW | 40kVA | 36kW | 45kVA"]), null);
  // powerlink n2003: "| Engine Model | 1206A-E70TTAG3 | 1206A-E70TTAG3 | …" (một động cơ, bốn điện áp) không là dòng Model tổ máy.
  assert.equal(C.columnSheets(["| Engine Model | 1206A-E70TTAG3 | 1206A-E70TTAG3", "| Voltage | 380V | 400V"]), null);
  assert.equal(C.columnSheets(["| Model | KW38D5 | KW38D5", "| Frequency | 50Hz | 60Hz"]), null);
});
