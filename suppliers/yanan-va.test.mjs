// node --test suppliers/yanan-va.test.mjs
// catalog-doc-4, nhóm 3: yanan-power n101 / n107 "| YN388C | 388VA | 310kW | 350kVA | 280kW | QSNT-G2 | 6 | YN388C" (tiêu đề "Standby power | Prime power").
// "388VA" là kVA dự phòng gõ thiếu chữ k (cùng trang, dòng anh em ghi "388kVA"; 310 / 388 = 0,8 như 280 / 350 của cặp prime): trước đây bị đọc
// thành mã động cơ "388VA" và mã thật QSNT-G2 mất.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = JSON.parse(fs.readFileSync(path.join(ROOT, "cn", "yanan-power.json"), "utf8"));

test("yanan-power: '388VA' / '413VA' / '358VA' là kVA dự phòng, động cơ là mã thật của dòng", () => {
  const r = C.fromSupplier(sup, []);
  for (const [n, g, m, sb, pr] of [[101, "YN388C", "QSNT-G2", [388, 310], [350, 280]], [101, "YN413C", "QSM11-G6", [413, 330], [375, 300]], [107, "YN358V", "TAD843GE", [358, 286], [325, 260]]]) {
    const e = r.find((x) => x.n === n && x.kind === "engine" && x.genset === g && x.model === m);
    assert.ok(e, `${g} ${m}`);
    assert.deepEqual(e.power, { standby: { kVA: sb[0], kW: sb[1] }, prime: { kVA: pr[0], kW: pr[1] } });
  }
  assert.ok(!r.some((x) => /^\d+VA$/i.test(x.model || "")), "không còn model dạng NNNVA");
});

test("ô NNNVA không có kW = 0,8 × số cùng dòng thì giữ nguyên chữ nguồn (không đổi thành kVA)", () => {
  const t = { n: 1, header: ["| Genset Model | Standby power | Prime power | Engine Model | NO. of Cylinder", "| | kVA | kW | | "], rows: ["| YN100C | 100VA | 50kW | QSB5.9-G2 | 6", "| YN200C | 200 | 160 | QSB5.9-G3 | 6"] };
  const r = C.fromSupplier({ id: "x", names: ["x"], specTables: [t] }, []).filter((x) => x.genset === "YN100C");
  assert.ok(!r.some((x) => x.power?.standby?.kVA === 100));
});
