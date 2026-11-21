// node --test suppliers/tad1341-9-36.test.mjs — nhánh đo tad1341-9-36 (Khoa 20/11/2026 "đo trước khi làm"): dung tích 9.36 L (của TAD940GE / TAD941GE) ghi cho TAD1341GE /
// TAD1342GE / TAD1351GE (Volvo D13, 12,8 L) ở 6 NCC chép chung một bảng: bỏ riêng dung tích. Dòng kế bên và TAD941GE của zhengdian không đổi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;
const eng = (id, n) => C.fromSupplier(real(id), []).filter((r) => r.kind === "engine" && r.n === n);
// liangzi n142 / n143 chép nguyên văn n115 / n116: `mergeRepeats` gộp thành một bản ghi (nên cả hai bảng đều phải có ngoại lệ, không thì số quay lại).
const D13 = /^TAD13(41|42)GE$|^TAD1351GE/;

test("9.36 L của TAD1341 / 1342 / 1351GE bỏ ở mọi dòng của 6 NCC, giữ số xi lanh", () => {
  const cases = [["bdadl-shanghai", 118, 3], ["fukangsi-yangzhou", 2005, 2], ["huatai-yangzhou", 103, 1], ["liangzi-yangzhou", 115, 1], ["liangzi-yangzhou", 116, 3],
    ["pengpai-yangzhou", 117, 3], ["pengpai-yangzhou", 126, 2]];
  let total = 0;
  for (const [id, n, want] of cases) {
    const rows = eng(id, n).filter((r) => D13.test(r.model) && /9\.36/.test(r.line || ""));
    assert.equal(rows.length > 0 && rows.length <= want, true, `${id} n${n}`);
    for (const r of rows) { assert.equal(spec(r, "disp"), undefined, `${id} n${n} ${r.model}`); total++; }
  }
  assert.equal(total >= 13, true, `đã khớp ${total} dòng`);
});

test("dòng kế bên giữ: fukangsi TAD1343GE 12.78", () => {
  const f = eng("fukangsi-yangzhou", 2005).find((r) => r.model === "TAD1343GE");
  assert.equal(spec(f, "disp"), "12.78");
});
