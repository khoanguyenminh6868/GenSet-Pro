// node --test suppliers/bang-doc-ma-hang.test.mjs — bảng dọc: `verticalCode` (web/catalog.js) chỉ bóc chữ đứng trước mã tới
// tên hãng cuối cùng (điều phối 21/11/2026, Q2 của PR #1054). Trước đó mọi từ toàn chữ đều bị bóc: "Kohler KDI 2504M"
// (ô động cơ nguyên văn của hgi-generators n2001) thành "2504M". Không có tên hãng trong dãy chữ thì bóc như cũ.
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
const V = (o) => o.sheet === "bảng dọc";
// Bảng giả dạng V1 (dòng Model) để ô động cơ đi qua verticalCode; chỉ ô động cơ thay đổi giữa các ca.
const sheet = (engineCell) => ({ id: "x", country: "CN", sources: [], specTables: [{ n: 1, title: "X", header: [], rows: ["| Model | AB-100", "| Prime Power | 100kVA/80kW", `| Engine Brand / Model | ${engineCell}`] }] });
const engineOf = (cell) => { const r = C.fromSupplier(sheet(cell)).filter(V); return r.length ? [r[0].model, r[0].makes.map((m) => m.name).join(",")] : null; };

test("hgi n2001: ô nguyên văn 'Kohler KDI 2504M' (dòng Engine của bảng) → mã KDI 2504M, hãng Kohler", () => {
  const t = cn("hgi-generators").specTables.find((x) => x.n === 2001);
  assert.ok(t.rows.includes("| Engine | Kohler KDI 2504M"), "dòng nguồn còn nguyên văn");
  assert.deepEqual(engineOf("Kohler KDI 2504M"), ["KDI 2504M", "Kohler"]);
});

test("ca đang đúng giữ nguyên: CCEC Cummins, PERKINS , mã, Volvo Penta, Yuchai", () => {
  assert.deepEqual(engineOf("CCEC Cummins NTA855-G2A"), ["NTA855-G2A", "Cummins"]);
  assert.deepEqual(engineOf("PERKINS , 1106A－70TAG4"), ["1106A-70TAG4", "Perkins"]);
  assert.deepEqual(engineOf("Volvo Penta TAD1641GE"), ["TAD1641GE", "Volvo Penta"]);
  assert.deepEqual(engineOf("Yuchai YC16VC3300-D31"), ["YC16VC3300-D31", "Yuchai"]);
  assert.deepEqual(engineOf("Y4110ZLD"), ["Y4110ZLD", ""]);
});

test("sau tên hãng vẫn bóc từ chung / chữ thường / không chữ; chỉ giữ từ TOÀN HOA trước mã bắt đầu bằng số", () => {
  // không đổi so với cách cũ (điều phối kiểm #1058: bản trước làm các ca này lùi)
  assert.deepEqual(engineOf("Cummins Engine NTA855-G2A"), ["NTA855-G2A", "Cummins"]);
  assert.deepEqual(engineOf("Cummins Model NTA855-G2A"), ["NTA855-G2A", "Cummins"]);
  assert.deepEqual(engineOf("SDEC Shanghai SC9D340D2"), ["SC9D340D2", "SDEC"]);
  assert.deepEqual(engineOf("Mitsubishi Heavy Industries S6R2-PTA"), ["S6R2-PTA", "Mitsubishi"]);
  assert.deepEqual(engineOf("Perkins Engine Model 404D-22G"), ["404D-22G", "Perkins"]);
  // ô thật trong cn/: từ toàn hoa trước mã bắt đầu bằng CHỮ là tên dòng / công ty, bóc
  assert.deepEqual(engineOf("FPT NEF N67TM4"), ["N67TM4", "FPT"]); // cgm-italia n101
  assert.deepEqual(engineOf("Mitsubishi SME S6R2-PTAA-C"), ["S6R2-PTAA-C", "Mitsubishi"]); // fudiankang-hunan n2009
  assert.deepEqual(engineOf("HYUNDAI INFRACORE DM01VP"), ["DM01VP", "Hyundai"]); // cgm-italia n101
  assert.deepEqual(engineOf("Yanmar - 3TNV80-FPGE"), ["3TNV80-FPGE", "Yanmar"]); // endress n129
  // giữ: từ toàn hoa ngay trước mã bắt đầu bằng số là phần của mã
  assert.deepEqual(engineOf("Kubota V 2203"), ["V 2203", "Kubota"]);
  assert.deepEqual(engineOf("KOHLER KDW 702"), ["KDW 702", "Kohler"]); // bruno n101
  assert.deepEqual(engineOf("KOHLER LDW 702"), ["LDW 702", "Kohler"]); // bruno n103
  assert.deepEqual(engineOf("Volvo TAD 1342GE-B"), ["TAD 1342GE-B", "Volvo Penta"]); // energy-gruppi n2007
  assert.deepEqual(engineOf("Weichai WP10D238E200"), ["WP10D238E200", "Weichai"]);
});

test("danh sách đóng (điều phối 21/11/2026): tên nhà máy / hãng khác, mã nước, pháp nhân sau tên hãng bị bóc", () => {
  assert.deepEqual(engineOf("Cummins CCEC 6BT5.9-G2"), ["6BT5.9-G2", "Cummins"]);
  assert.deepEqual(engineOf("Cummins DCEC 6BTA5.9-G2"), ["6BTA5.9-G2", "Cummins"]);
  assert.deepEqual(engineOf("Cummins USA 6BT5.9-G2"), ["6BT5.9-G2", "Cummins"]);
  assert.deepEqual(engineOf("John Deere USA 4045HF158"), ["4045HF158", "John Deere"]);
  assert.deepEqual(engineOf("Yanmar JAPAN 3TNV88"), ["3TNV88", "Yanmar"]);
  assert.deepEqual(engineOf("Perkins UK 1106A-70TAG4"), ["1106A-70TAG4", "Perkins"]);
  assert.deepEqual(engineOf("Perkins UK Ltd 1106A-70TAG4"), ["1106A-70TAG4", "Perkins"]);
  assert.deepEqual(engineOf("Perkins EU 1104A-44TG1"), ["1104A-44TG1", "Perkins"]);
  assert.deepEqual(engineOf("Cummins SDEC SC9D340D2")?.[0], "SC9D340D2"); // từ tự là tên hãng (brandIn) đứng sau hãng khác
  assert.deepEqual(engineOf("Mitsubishi MHI S6R2-PTA"), ["S6R2-PTA", "Mitsubishi"]);
});

test("đầu phát: Leroy Somer LSA 46.3, Stamford HCI 444D giữ tiền tố dòng", () => {
  const alt = (cell) => { const s = sheet("Cummins NTA855-G2A"); s.specTables[0].rows.push(`| Alternator Brand / Model | ${cell}`); const r = C.fromSupplier(s).filter(V); return r.find((o) => o.kind === "engine")?.other; };
  assert.equal(alt("Leroy Somer LSA 46.3"), "LSA 46.3");
  assert.equal(alt("Stamford HCI 444D"), "HCI 444D");
});

test("không có tên hãng trong dãy chữ: bóc như cũ ('SGC 420' của westinpower không thành mã)", () => {
  assert.equal(engineOf("SGC 420"), null);
});

test("bảng thật: sunkings n116 và westinpower n1117 cho đúng bản ghi như trước", () => {
  const a = C.fromSupplier(only(cn("sunkings"), 116)).filter(V);
  assert.deepEqual(a.map((o) => [o.model, o.genset]), [["NTA855-G2A", "SHX-350"]]);
  const b = C.fromSupplier(only(cn("westinpower"), 1117)).filter(V);
  assert.deepEqual(b.map((o) => [o.model, o.genset]), [["1106A-70TAG4", "TP220T"]]);
});
