// node --test suppliers/o-alternator-doc.test.mjs — ô đầu phát "ALTERNATOR: <hãng> <mã>" của tờ dọc chỉ đọc được qua dòng sản phẩm
// (`labelAltLines` trong web/catalog.js; o-alternator-doc, Khoa duyệt 24/11/2026). Dòng lấy nguyên văn từ suppliers/cn.
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
const recs = (s, notes) => C.fromSupplier(s, notes);
const alts = (r) => r.filter((o) => o.kind === "alternator");
const brief = (o) => [o.kind, o.model, o.genset, o.other, o.makes.map((m) => `${m.name}/${m.via}`).join("+")];
// Một tờ giả theo đúng bố cục energy-gruppi: tiêu đề một ô, "NHÃN:" một dòng, giá trị dòng sau; dòng sản phẩm cho động cơ.
const sheet = (rows, alternatorMakes = []) => ({
  id: "t-alt-doc", country: "IT", role: "genset_oem", names: { en: "T" }, sources: [],
  specTables: [{ n: 2001, title: "EY-30P - technical specifications", header: ["TECHNICAL SPECIFICATIONS"], rows }],
  productLines: [{ kind: "genset", series: "EY-30P", fuel: "diesel", power: { min: 30, max: 30, unit: "kVA", rating: "unspecified", src: [2001] }, engineModels: ["Perkins 1103A-33G"], engineMakes: ["Perkins"], alternatorMakes, src: [2001] }],
});
const EG = ["EY-30P", "30 kVA, 24 kW", "CONTINUOUS POWER:", "30 kVA - 24 kW", "ENGINE:", "Perkins 1103A-33G"];

test("energy-gruppi n2001: 'ALTERNATOR:' rồi 'Linz PRO18S C/4' → đầu phát PRO18S C/4, hãng Linz ở chính ô", () => {
  const r = recs(only(cn("energy-gruppi"), 2001));
  const e = r.find((o) => o.kind === "engine"), a = alts(r);
  assert.equal(a.length, 1);
  assert.deepEqual(brief(a[0]), ["alternator", "PRO18S C/4", "EY-30P", "1103A-33G", "Linz Electric/dòng bảng"]);
  assert.equal(a[0].line, "Linz PRO18S C/4");
  assert.deepEqual(a[0].power, e.power);
  // Động cơ (dòng sản phẩm) giữ nguyên, nay ghi đầu phát đi kèm; khoá khớp khoá tiêu đề tờ Linz của PR #1200.
  assert.deepEqual([e.model, e.other, e.fromLine], ["1103A-33G", "PRO18S C/4", true]);
  assert.equal(C.keyOf(a[0].model), "PRO18SC/4");
});

test("energy-gruppi n2008 / n2012: hãng hai chữ 'Mecc Alte' rồi mã có dấu cách / gạch chéo", () => {
  const s = cn("energy-gruppi");
  assert.deepEqual(brief(alts(recs(only(s, 2008)))[0]), ["alternator", "ECO40-2S/4 C", "EY-450P", "2506A-E15TAG1", "Mecc Alte/dòng bảng"]);
  assert.deepEqual(brief(alts(recs(only(s, 2012)))[0]), ["alternator", "ECO43-2S/4", "EY-900P", "4008-TAG1A", "Mecc Alte/dòng bảng"]);
});

test("energy-gruppi n2013: 'ALTERNATOR:' rồi 'Mecc Alte' (không mã) → không đầu phát, động cơ không đổi", () => {
  const r = recs(only(cn("energy-gruppi"), 2013));
  assert.equal(alts(r).length, 0);
  assert.equal(r.find((o) => o.kind === "engine").other, null);
});

test("fudiankang-hunan n2001: một dòng 'Alternator Model: Stamford S6L1D-H41'", () => {
  const r = recs(only(cn("fudiankang-hunan"), 2001));
  assert.deepEqual(brief(alts(r)[0]), ["alternator", "S6L1D-H41", "FDK-CC1500/H1", "KTA50-G8", "Stamford/dòng bảng"]);
  assert.equal(alts(r)[0].line, "Alternator Model: Stamford S6L1D-H41");
});

test("không bịa hãng: hãng chỉ lấy từ ô, không từ dòng sản phẩm hay họ mã", () => {
  // Dòng sản phẩm ghi alternatorMakes Linz nhưng ô ghi Mecc Alte: hãng là Mecc Alte.
  const r = recs(sheet([...EG, "ALTERNATOR:", "Mecc Alte ECO40-2S/4 C"], ["Linz"]));
  assert.deepEqual(alts(r)[0].makes, [{ name: "Mecc Alte", via: "dòng bảng" }]);
  // Ô không mở đầu bằng hãng đã biết ("PRO18S C/4" trơn, hãng lạ): không đọc, kể cả mã giống họ Mecc Alte.
  for (const v of ["PRO18S C/4", "Acme PRO18S C/4", "ECO40-2S/4 C"]) assert.equal(alts(recs(sheet([...EG, "ALTERNATOR:", v]))).length, 0, v);
});

test("điều kiện ô: lựa chọn, hai hãng, hãng dính gạch chéo, không mã → không đọc", () => {
  for (const v of [
    "Stamford/SURIRELLA 274K", // plus-power n2014 ("Alternator Style/Model:"): hãng dính "/", không là hãng rồi mã
    "Linz PRO18S C/4 or equivalent",
    "Stamford UCI274H, Leroy Somer TAL-A44-C",
    "Stamford brushless self-excited, IP23,Class H.", // hosem-power n103
    "Mecc Alte",
  ]) assert.equal(alts(recs(sheet([...EG, "ALTERNATOR:", v]))).length, 0, v);
  // Hai dòng đầu phát trong một tờ: không đọc, có ghi chú.
  const notes = [];
  assert.equal(alts(recs(sheet([...EG, "ALTERNATOR:", "Linz PRO18S C/4", "Alternator Model: Stamford S1L2-N1"]), notes)).length, 0);
  assert.ok(notes.some((x) => x.reason === "bảng dọc: hai dòng đầu phát"));
});

test("nhãn không phải đầu phát / dòng có ống / bảng đã đọc theo cách khác: không đổi", () => {
  // Nhãn thuộc tính của đầu phát ("ALTERNATOR EFFICIENCY:") không là dòng model.
  assert.equal(alts(recs(sheet([...EG, "ALTERNATOR EFFICIENCY:", "Linz 93%"]))).length, 0);
  // Dòng có "|" thuộc bộ đọc bảng nhãn, luật này không đụng (ade-power n2054 "| Alternator | Stamford Stamford UCI22 4F").
  assert.equal(alts(recs(sheet([...EG, "| Alternator | Stamford Stamford UCI22 4F"]))).length, 0);
  // Không có bản ghi dòng sản phẩm (không động cơ): luật không chạy.
  const s = sheet([...EG, "ALTERNATOR:", "Linz PRO18S C/4"]);
  delete s.productLines;
  assert.equal(recs(s).length, 0);
});

test("toàn cn/: luật chỉ thêm đầu phát ở energy-gruppi n2001–2012 và fudiankang-hunan n2001–2004, 2007, 2009", () => {
  const dir = path.join(ROOT, "cn"), got = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const r = C.fromSupplier(s, []);
    // Đầu phát cùng bảng với một động cơ dòng sản phẩm, dòng không có "|".
    for (const o of r) if (o.kind === "alternator" && !String(o.line ?? "|").includes("|") && r.some((x) => x.table === o.table && x.kind === "engine" && x.fromLine)) got.push(`${s.id} ${o.n} ${o.model}`);
  }
  assert.deepEqual(got.sort(), [
    "energy-gruppi 2001 PRO18S C/4", "energy-gruppi 2002 PRO18L G/4", "energy-gruppi 2003 PRO22S D/4", "energy-gruppi 2004 PRO22M F/4",
    "energy-gruppi 2005 PRO28S B/4", "energy-gruppi 2006 PRO28S D/4", "energy-gruppi 2007 PRO28M F/4", "energy-gruppi 2008 ECO40-2S/4 C",
    "energy-gruppi 2009 ECO40-3S/4 C", "energy-gruppi 2010 ECO40-2L/4 C", "energy-gruppi 2011 ECO40-VL/4 C", "energy-gruppi 2012 ECO43-2S/4",
    "fudiankang-hunan 2001 S6L1D-H41", "fudiankang-hunan 2002 S1L2-N1", "fudiankang-hunan 2003 UCI224G", "fudiankang-hunan 2004 UCI274H",
    "fudiankang-hunan 2007 S4L1D-E41", "fudiankang-hunan 2009 S5L1D-H4",
  ].sort());
});
