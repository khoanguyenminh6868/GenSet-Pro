// node --test suppliers/baifa-ukccec.test.mjs
// catalog-3-loi, lỗi 2: baifa n101 / n103 có 5 dòng "… | UK/ CCEC" (QSK50-G3/G4/G7/G13, QSK60-G23) từng nằm trong `header`.
// Đo trên origin/main 24/11/2026: hồ sơ `cn/baifa-power.json` KHÔNG còn bảng nào để dòng máy trong header (tablesOf đã tách ở
// #1105 / #1110 / #1111) nên `headerRows` không có việc; test này giữ cho khỏi tái phát ở cả hai chỗ.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", "baifa-power.json"), "utf8"));

test("baifa: không bảng nào có dòng máy (mã + số) trong header từ dòng thứ 2", () => {
  for (const [i, t] of sup.specTables.entries()) {
    t.header.forEach((l, j) => {
      const c = C.cellsOf(l);
      assert.ok(j < 1 || !(c.length >= 3 && C.isCode(c[0]) && c.slice(1).some((x) => /\d/.test(x))), `bảng ${i} n${t.n} dòng tiêu đề ${j}: ${l.slice(0, 80)}`);
    });
  }
});

test("baifa: 5 dòng UK/ CCEC ra bản ghi động cơ Cummins QSK, mỗi dòng một bản ghi", () => {
  const recs = C.fromSupplier(sup, []);
  for (const [g, m] of [["BF-C1540Q-T2", "QSK50-G3"], ["BF-C1700Q-T2", "QSK50-G4"], ["BF-C1825Q-T2", "QSK50-G7"], ["BF-C1875Q-T2", "QSK50-G13"], ["BF-C2750Q-T2", "QSK60-G23"]])
    assert.ok(recs.some((r) => r.kind === "engine" && r.genset === g && r.model === m), g);
});

test("headerRows qua tidyTable: dòng máy trong header chuyển xuống dòng, dòng tiêu đề con ở lại (bảng tổng hợp)", () => {
  const t = { n: 1, header: ["| BAIFA MODEL | POWER | DIESEL ENGINE", "| Standby KVA | Prime KVA | Brand | Model", "| BF-C1540Q-T2 | 1540 | 1400 | QSK50-G3 | | S6L1D-H4 | UK/ CCEC", "| BF-C1700Q-T2 | 1700 | 1540 | QSK50-G4 | | S7L1D-C4 | UK/ CCEC"], rows: ["| BF-C3763Q-T2 | 3763 | 3363 | QSK95-G10 | | LSA 53.2M12 | USA"] };
  const s = { id: "x", names: ["x"], specTables: [t] };
  const recs = C.fromSupplier(s, []).filter((r) => r.kind === "engine");
  assert.deepEqual(recs.map((r) => r.model).sort(), ["QSK50-G3", "QSK50-G4", "QSK95-G10"]);
});
