// node --test suppliers/s6-tecnogen-cyl.test.mjs — S6-1 (điều phối 21/11/2026): tecnogen n2001–n2010 có cột "Cylinder" mà dòng tiêu đề
// đầu thiếu một ô trống cuối nên không dòng tiêu đề nào khớp số ô của dòng; COLUMN_SPECS (danh sách tường minh) đọc ô 7 thành `cyl`.
// Mọi ca là dòng thật trong suppliers/cn/tecnogen.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const H = ["| MODEL | kVA LTP | kVA PRP | kVA LTP | kVA PRP | | Regulator | Cylinder | cm3 | kWm 1500 rpm | kWm 1800 rpm | (l/h) 1500 rpm | (l/h) 1800 rpm | Aspiration | Standard panel | Automatic panel | dB(A) (•) 7 m | | | | |",
  "| | 50 Hz | | 60 Hz | | Engine | | | | | | Cons. 70% | Cons. 70% | | | | | Tank l | L | W | H | Kg"];
const sup = (id, tables) => ({ id, country: "IT", confidence: "high", role: "genset_oem", specTables: tables });
const cylOf = (r) => r.specs.find((x) => x.key === "cyl")?.value;

test("tecnogen n2001: PK14MSX 403A-15G1 → cyl 3 (nhãn Cylinder), khối lượng vẫn đọc", () => {
  const s = sup("tecnogen", [{ n: 2001, title: "Tecnogen Enermax (Perkins)", header: H,
    rows: ["| PK14MSX | 14,3 | 13 | -- | -- | 403A-15G1 | M | 3 | 1496 | 12 | -- | 2,6 | -- | N | AUS7310-17 | ACP7320 | 65 | 75 | 150 | 80 | 125 | 580"] }]);
  const r = C.fromSupplier(s, []).filter((x) => x.kind === "engine");
  assert.equal(r.length, 1);
  assert.equal(r[0].model, "403A-15G1");
  assert.deepEqual(r[0].specs.find((x) => x.key === "cyl"), { key: "cyl", label: "Cylinder", value: "3" });
  assert.equal(r[0].specs.find((x) => x.key === "weight")?.value, "580");
});

test("tecnogen n2004: Scania DC16 '8V' đọc nguyên văn; dòng '2 x DC13…' vẫn không có bản ghi động cơ", () => {
  const s = sup("tecnogen", [{ n: 2004, title: "Tecnogen Enermax (Scania)", header: H,
    rows: ["| SA600TSX | 600 | 550 | 610 | 550 | DC16 093A 02 52 | E | 8V | 16400 | 473 | 468 | 73,9 | 78,0 | T | AUS7310 | ACP 7320 | 69 | 1000 | 485 | 200 | 230 | 5900",
      "| SA1100TSX-D20 1 | 1100 | 1000 | 1100 | 1000 | 2 x DC13 072A 02 14 | E | 8V | 12700 | 428 | 428 | 129.4 | 133.2 | T | SCP8610 | ACP 7320 | 69 | 2000 | 20' CONTAINER | | | 12100"] }]);
  const r = C.fromSupplier(s, []).filter((x) => x.kind === "engine");
  assert.deepEqual(r.map((x) => [x.model, cylOf(x)]), [["DC16 093A 02 52", "8V"]]);
});

test("không áp: NCC khác, n khác, hoặc tiêu đề đổi chữ (ghi note)", () => {
  const row = "| PK14MSX | 14,3 | 13 | -- | -- | 403A-15G1 | M | 3 | 1496 | 12 | -- | 2,6 | -- | N | AUS7310-17 | ACP7320 | 65 | 75 | 150 | 80 | 125 | 580";
  for (const s of [sup("x-power", [{ n: 2001, title: "t", header: H, rows: [row] }]), sup("tecnogen", [{ n: 2011, title: "t", header: H, rows: [row] }])])
    assert.ok(C.fromSupplier(s, []).every((x) => cylOf(x) === undefined));
  const notes = [];
  const moved = sup("tecnogen", [{ n: 2001, title: "t", header: [H[0].replace("Cylinder", "Cyl."), H[1]], rows: [row] }]);
  assert.ok(C.fromSupplier(moved, notes).every((x) => cylOf(x) === undefined));
  assert.ok(notes.some((n) => /đổi tiêu đề/.test(n.reason)));
});

test("hồ sơ thật: 10 bảng / 229 dòng có cột Cylinder, 224 bản ghi động cơ đều có cyl = ô 7 của dòng", () => {
  const s = JSON.parse(fs.readFileSync(new URL("./cn/tecnogen.json", import.meta.url), "utf8"));
  const tables = s.specTables.filter((t) => /\| Cylinder \|/.test(t.header?.[0] || ""));
  assert.deepEqual(tables.map((t) => t.n), [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010]);
  assert.equal(tables.reduce((a, t) => a + t.rows.length, 0), 229);
  const r = C.fromSupplier(s, []).filter((x) => x.kind === "engine" && x.n >= 2001 && x.n <= 2010);
  assert.equal(r.length, 224);
  for (const x of r) assert.equal(cylOf(x), x.line.split("|")[8].trim(), x.line);
});

test("S6-6: hai cột kWm 1500 / 1800 rpm là hai engPower khác nhãn; ô '--' không cho số; Aspiration / Cons. 70% không đọc", () => {
  const s = sup("tecnogen", [{ n: 2001, title: "Tecnogen Enermax (Perkins)", header: H,
    rows: ["| PK17MSX | 16,5 | 15 | 20 | 18 | 403A-15G2 | M | 3 | 1496 | 13 | 16 | 2,9 | 3,5 | N | AUS7310-17 | ACP7320 | 65 | 75 | 150 | 80 | 125 | 590",
      "| PK14MSX | 14,3 | 13 | -- | -- | 403A-15G1 | M | 3 | 1496 | 12 | -- | 2,6 | -- | N | AUS7310-17 | ACP7320 | 65 | 75 | 150 | 80 | 125 | 580"] }]);
  const [a, b] = C.fromSupplier(s, []).filter((x) => x.kind === "engine");
  const ep = (r) => r.specs.filter((x) => x.key === "engPower").map((x) => [x.label, x.value]);
  assert.deepEqual(ep(a), [["kWm 1500 rpm", "13"], ["kWm 1800 rpm", "16"]]);
  assert.deepEqual(ep(b), [["kWm 1500 rpm", "12"]]);
  for (const r of [a, b]) assert.ok(!r.specs.some((x) => ["asp", "fuel", "fuel75", "fuel50"].includes(x.key)));
});

test("S8-2: cột 'cm3' → disp nhãn 'cm3' y ô; spec-norm đổi sang L (l_from_cc); ô '--' không cho số", async () => {
  await import("../web/conversions.js");
  await import("../web/spec-norm.js");
  const SN = globalThis.GenbidSpecNorm;
  const s = sup("tecnogen", [{ n: 2009, title: "Tecnogen (Perkins 4000)", header: H,
    rows: ["| PK901TV | 880 | 800 | 940 | 845 | 4006-23TAG3A | E | 6 | 22921 | 679 | 715 | 119 | 128 | T | AUS 7310 | -- | ACP 7320 | 950 | 380 | 171 | 238 | 6000",
      "| PK14MSX | 14,3 | 13 | -- | -- | 403A-15G1 | M | 3 | -- | 12 | -- | 2,6 | -- | N | AUS7310-17 | ACP7320 | 65 | 75 | 150 | 80 | 125 | 580"] }]);
  const [a, b] = C.fromSupplier(s, []).filter((x) => x.kind === "engine");
  assert.deepEqual(a.specs.filter((x) => x.key === "disp"), [{ key: "disp", label: "cm3", value: "22921" }]);
  const r = SN.normalize(a.specs.find((x) => x.key === "disp"), { title: "t", header: H, rows: [] });
  assert.equal(r.unit, "L"); assert.equal(r.num, 22.921); assert.equal(r.conv.formula, "l_from_cc");
  assert.ok(!b.specs.some((x) => x.key === "disp"));
});

test("S8-2 hồ sơ thật: 224 bản ghi động cơ, mỗi bản ghi đúng một disp = ô 8 của dòng, nhãn 'cm3'; trừ QSL9G3 / QSL9G7 (dropspec)", () => {
  const s = JSON.parse(fs.readFileSync(new URL("./cn/tecnogen.json", import.meta.url), "utf8"));
  const r = C.fromSupplier(s, []).filter((x) => x.kind === "engine" && x.n >= 2001 && x.n <= 2010);
  assert.equal(r.length, 224);
  // điều phối 22/11/2026: n2002 CU275TSX** QSL9G3 / CU331TSX** QSL9G7 "8800" bỏ riêng dung tích (ROW_EXCEPTIONS); QSL9G5 "8900" giữ.
  const dropped = new Set(["CU275TSX**|QSL9G3", "CU331TSX**|QSL9G7"]);
  for (const x of r) {
    const d = x.specs.filter((q) => q.key === "disp");
    if (x.n === 2002 && dropped.has(`${x.genset}|${x.model}`)) assert.deepEqual(d, [], x.line);
    else assert.deepEqual(d, [{ key: "disp", label: "cm3", value: x.line.split("|")[9].trim() }], x.line);
  }
  assert.equal(r.filter((x) => x.specs.some((q) => q.key === "disp")).length, 222);
  assert.equal(r.find((x) => x.model === "QSL9G5").specs.find((q) => q.key === "disp").value, "8900");
});
