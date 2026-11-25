// node --test suppliers/ngoai-le-1006-182.test.mjs — hai ngoại lệ tường minh Khoa quyết 25/11/2026 (không đổi luật chung):
// (1) động cơ 1006TG2A là Lovol (MAKE_EXCEPTIONS); (2) weiman-fujian n111 "18·2 :1" của 1104C-44TAG1 / TAG2 đọc là 18.2 (fixspec).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const sup = (id, n, title, header, rows) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: [{ n, title, header, rows }] });
const eng = (cat, key) => cat.engines.find((e) => e.key === key);

test("1006TG2A: hãng Lovol (ngoại lệ Khoa), mọi nguồn vẫn nằm trong makesAll, có ghi chú ngoại lệ", () => {
  const cat = C.build(["jet-power", "camda-generator", "huadong-yangzhou", "agestar"].map(real));
  const e = eng(cat, "1006TG2A");
  assert.equal(e.make, "Lovol");
  assert.deepEqual([...new Set(e.makes.map((m) => m.name))], ["Lovol"]);
  assert.ok(e.makesAll.some((m) => m.name === "Perkins" && m.supplierId === "camda-generator"), "mất dấu vết camda ghi Perkins");
  assert.equal(e.makeException.khoa, "Khoa 25/11/2026");
  assert.match(e.makeException.why, /ngoại lệ/);
});

test("ngoại lệ hãng chỉ áp cho 1006TG2A: mã khác cùng tình huống 1 NCC ↔ 1 NCC vẫn không có hãng", () => {
  const mk = (id, n, hdr, brand) => sup(id, n, "t", [hdr], [`| G1 | 100 | ${brand} | XYZ9999TG1 | 6`]);
  const cat = C.build([mk("a-power", 1, "| Model | Power | Engine brand | Engine model | Cyl", "Lovol"), mk("b-power", 2, "| Model | Power | Perkins engine | Engine model | Cyl", "Perkins")]);
  const e = eng(cat, "XYZ9999TG1");
  if (e) assert.equal(e.makeException, undefined);
});

test("weiman-fujian n111: 1104C-44TAG1 / TAG2 ra tỉ số nén 18.2, mang dấu đã sửa; ô khác giữ nguyên", () => {
  const s = real("weiman-fujian");
  const rs = C.fromSupplier(s).filter((r) => r.n === 111 && r.kind === "engine" && /^1104C-?44TAG[12]$/.test(r.model));
  assert.ok(rs.length >= 4);
  const bad = rs.filter((r) => String(r.line || "").includes("18·2"));
  assert.equal(bad.length, 2);
  for (const r of bad) {
    const c = r.specs.find((x) => x.key === "compr");
    assert.equal(c.value, "18.2 :1");
    assert.equal(c.fixed.from, "18·2 :1");
  }
  for (const r of rs.filter((r) => !String(r.line || "").includes("18·2"))) {
    const c = r.specs.find((x) => x.key === "compr");
    assert.ok(c && !c.fixed && !String(c.value).includes("·"), `${r.model}: ô khác bị đổi`);
  }
  // không còn ô nào của weiman ghi "·" trong tỉ số nén
  assert.ok(!C.fromSupplier(s).some((r) => (r.specs || []).some((x) => x.key === "compr" && String(x.value).includes("·"))));
});

test("nguồn đổi chữ ô thì ngoại lệ tự hết hiệu lực (không đoán)", () => {
  const s = real("weiman-fujian");
  const t = JSON.parse(JSON.stringify(s));
  for (const tb of t.specTables) tb.rows = tb.rows.map((x) => x.replace("18·2 :1", "18·3 :1"));
  const rs = C.fromSupplier(t).filter((r) => r.n === 111 && r.kind === "engine" && String(r.line || "").includes("18·3"));
  assert.equal(rs.length, 2);
  for (const r of rs) assert.equal(r.specs.find((x) => x.key === "compr")?.fixed, undefined);
});
