// node --test suppliers/buoc-3-p2.test.mjs — họ P2 "ô động cơ viết lạ" (buoc-3-p2; kiểm kê nghiem-thu/buoc-3-bo-cuc-chua-doc.md nhánh
// dieu-phoi). Dòng lấy nguyên văn từ suppliers/cn; mỗi ca kiểm bản ghi động cơ ra đúng chữ ô nguồn, và ca mơ hồ KHÔNG ra bản ghi
// mà có ghi chú.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const cn = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const only = (id, n, ti) => { const s = cn(id); return { ...s, specTables: s.specTables.map((t, i) => (+t.n === n && (ti == null || i === ti) ? t : { ...t, rows: [] })) }; };
const engines = (id, n, ti) => { const notes = []; const r = C.fromSupplier(only(id, n, ti), notes).filter((o) => o.n === n && o.kind === "engine"); return { r, notes }; };
const modelOfRow = (r, line) => r.filter((o) => o.line === line).map((o) => o.model);
const lineWith = (id, n, ti, text) => cn(id).specTables.filter((t, i) => +t.n === n && (ti == null || i === ti)).flatMap((t) => t.rows).find((l) => l.includes(text));

test("isCode: DP222 CC (cgm-italia, một dấu cách) và 'QSK38- G26 *' là mã; hai mã trong một ô thì không", () => {
  assert.equal(C.isCode("DP222 CC"), true);
  assert.equal(C.isCode("DP222CC"), true);
  assert.equal(C.isCode("2500 cc"), false);
  assert.equal(C.isCode("QSK38- G26 *"), true);
  assert.equal(C.isCode("1104C-44TAG1/ 1104D-E44TAG 1 ★"), false);
  assert.equal(C.isCode("BF6M 1013 FC G2"), true);
  assert.equal(C.isCode("TCD 2013 L06 4V"), true);
  assert.equal(C.isCode("DC12 59A 10-32A"), true);
  // "DC13 507A 300": con số sau mã không ghi đơn vị, không biết là mức công suất hay một phần mã: không là mã.
  assert.equal(C.isCode("DC13 507A 300"), false);
});

test("kaihua n104: P086T1-1 / P086T1 / P126T1 dưới 'Engine Model' là động cơ, đúng chữ ô", () => {
  const { r } = engines("kaihua-genset", 104, 14);
  for (const [text, model] of [["KH-100GF |", "P086T1-1"], ["KH-150GF |", "P086T1"], ["KH-200GF |", "P126T1"]]) assert.deepEqual(modelOfRow(r, lineWith("kaihua-genset", 104, 14, text)), [model]);
});

test("xingguang n107: P086TA / P158FE; zhengdian n108: P126T1-II (chữ ô nguồn)", () => {
  const x = engines("xingguang-jiangsu", 107, 7).r;
  assert.deepEqual(modelOfRow(x, lineWith("xingguang-jiangsu", 107, 7, "XG-132GF")), ["P086TA"]);
  assert.deepEqual(modelOfRow(x, lineWith("xingguang-jiangsu", 107, 7, "XG-400GF")), ["P158FE"]);
  const z = engines("zhengdian-zhengzhou", 108, 7).r;
  assert.deepEqual(modelOfRow(z, lineWith("zhengdian-zhengzhou", 108, 7, "264GF1")), ["P126T1-II"]);
});

test("aosif n112 / walter n102: gạch － toàn chiều rộng đọc như '-', phần còn lại nguyên văn", () => {
  const a = engines("aosif", 112, 11).r;
  assert.deepEqual(modelOfRow(a, lineWith("aosif", 112, 11, "AGY1000")), ["YC12VTD1350N-D30"]);
  const w = engines("walter-yangzhou", 102).r.map((o) => o.model);
  assert.ok(w.includes("YC12VTD2000-D30"));
});

test("nenjo n103: ghi chú sau mã (（QC50/60E) ngoặc lệch, '欧二 Tier 2') bỏ; mã còn lại đúng chữ nguồn", () => {
  const { r } = engines("nenjo-generator", 103, 3);
  assert.deepEqual(modelOfRow(r, lineWith("nenjo-generator", 103, 3, "HJ54C")), ["4BTA3.9-G2"]);
  assert.deepEqual(modelOfRow(r, lineWith("nenjo-generator", 103, 3, "HJ397C")), ["QSZ13-G5"]);
});

test("'4BTA3.9-G2（M)' (xingguang n123): '(M)' Khoa để riêng, không bỏ", () => {
  const { r } = engines("xingguang-jiangsu", 123, 24);
  assert.deepEqual(modelOfRow(r, lineWith("xingguang-jiangsu", 123, 24, "XG85S3-6")), []);
});

test("cgm-italia n1001: động cơ Deutz viết có dấu cách ('BF4M 2011 C', 'BF6M 1013 FC G2') và 'DP222 CC'", () => {
  const t16 = engines("cgm-italia", 1001, 16).r.map((o) => o.model);
  for (const m of ["BF4M 2011 C", "BF6M 1013 FC G2", "TCD 2013 L06 4V"]) assert.ok(t16.includes(m), m);
  assert.ok(engines("cgm-italia", 1001, 15).r.some((o) => o.model === "DP222 CC"));
});

test("huadong n106: 'DC12 59A 10-32A' (Scania); agg-fuzhou / voltgent 'DC13 507A 300' KHÔNG đọc, có ghi chú", () => {
  assert.ok(engines("huadong-yangzhou", 106, 5).r.some((o) => o.model === "DC12 59A 10-32A"));
  const { r, notes } = engines("voltgent", 107, 11);
  assert.ok(!r.some((o) => /^DC13 507A/.test(o.model)));
  assert.ok(notes.some((x) => /không dựng được bản ghi/.test(x.reason) && /DC13 507A 300/.test(x.detail)));
});

test("ettes n146: ô hai mã '1104C-44TAG1/ 1104D-E44TAG 1 ★' không thành bản ghi, có ghi chú; jianghao 'Weichai Steyr P10' cũng vậy", () => {
  const e = engines("ettes-power", 146, 51);
  assert.ok(!e.r.some((o) => /1104C-44TAG1\//.test(o.model)));
  assert.ok(e.notes.some((x) => /không dựng được bản ghi/.test(x.reason) && /1104C-44TAG1\//.test(x.detail)));
  const j = engines("jianghao-genset", 104, 4);
  assert.ok(!j.r.some((o) => /P10/.test(o.model)));
  assert.ok(j.notes.some((x) => /không dựng được bản ghi/.test(x.reason) && /Weichai Steyr P10/.test(x.detail)));
});

test("fengmao n109: 'U I224D' (mất chữ, không đoán thành UCI224D): dòng không ra bản ghi đầu phát, có ghi chú", () => {
  const { r, notes } = engines("fengmao-weifang", 109, 3);
  assert.ok(!r.some((o) => /I224D/.test(o.model + (o.other || ""))));
  assert.ok(notes.some((x) => /không dựng được bản ghi/.test(x.reason) && /U I224D/.test(x.detail)));
});

test("dòng bị bỏ im lặng: mọi dòng máy của bảng đã có bản ghi mà không ra bản ghi đều có ghi chú (kaihua, mecca, conductorjasa)", () => {
  for (const [id, n] of [["conductorjasa", 124], ["mecca-power", 5001], ["kaihua-genset", 126]]) {
    const s = only(id, n), notes = [], recs = C.fromSupplier(s, notes);
    const lines = new Set(recs.map((o) => o.line));
    for (const [ti, t] of s.specTables.entries()) {
      if (!recs.some((o) => o.table === ti)) continue;
      t.rows.forEach((line, ri) => {
        const c = C.cellsOf(line);
        if (c.length < 3 || lines.has(line) || !c.some((x) => C.isCode(x)) || c.filter((x) => /^\d+([.,]\d+)?$/.test(x)).length < 2) return;
        assert.ok(notes.some((x) => x.table === ti && x.row === ri), `${id} n${n} bảng ${ti} dòng ${ri} bỏ im lặng: ${line}`);
      });
    }
  }
});
