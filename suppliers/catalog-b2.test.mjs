// node --test suppliers/catalog-b2.test.mjs — ngoại lệ theo dòng kiểu `dropspec` (catalog-b2): bỏ RIÊNG một thông số sai của
// nguồn, giữ phần còn lại của dòng. Mỗi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;
const recs = (s, notes = []) => C.fromSupplier(s, notes);
const hits = (notes) => notes.filter((x) => x.reason === "ngoại lệ theo dòng");

test("LZ1750 (bdadl n104, fukangsi n2009, pengpai n103 + n131): khối lượng 1440 kg bỏ, phần còn lại của dòng giữ", () => {
  for (const [id, g] of [["bdadl-shanghai", "BDA-LZ1750"], ["fukangsi-yangzhou", "FKS-LZ1750"], ["pengpai-yangzhou", "PPDL-LZ1750"]]) {
    // bdadl n129 ghi cùng model ở dòng khác chữ ("14400"): không thuộc ngoại lệ, không xét ở đây
    const notes = [], e = recs(real(id), notes).filter((r) => r.genset === g && !(id === "bdadl-shanghai" && r.n === 129));
    assert.ok(e.length >= 1, id);
    for (const r of e) {
      assert.equal(spec(r, "weight"), undefined, `${id} ${r.kind} weight`);
      if (r.kind === "engine") { assert.equal(r.model, "S16R-PTAA2-C"); assert.equal(spec(r, "cyl"), "16"); assert.equal(spec(r, "disp"), "65.4"); }
    }
    assert.ok(hits(notes).length >= 1, id);
  }
  // dòng khác của cùng bảng (n129 bdadl ghi 14400 kg ở dòng chữ khác) không bị đụng
  const b = recs(real("bdadl-shanghai")).filter((r) => r.n === 129 && r.genset === "BDA-LZ1750" && r.kind === "engine");
  assert.ok(b.length && b.every((r) => spec(r, "weight") === "14400"));
});

test("C20 (fukangsi n2001, pengpai n125): 5500 kg bỏ; dòng 4B3.9-G2 kế bên (600 kg) và dòng C200 không đổi", () => {
  for (const [id, g] of [["fukangsi-yangzhou", "FKS-C20"], ["pengpai-yangzhou", "PPDL-C20"]]) {
    const e = recs(real(id)).filter((r) => r.kind === "engine" && r.genset === g);
    const g1 = e.find((r) => r.model === "4B3.9-G1"), g2 = e.find((r) => r.model === "4B3.9-G2");
    assert.equal(spec(g1, "weight"), undefined, id);
    assert.equal(spec(g1, "cyl"), "4"); assert.equal(spec(g1, "disp"), "3.92");
    assert.equal(spec(g2, "weight"), "600", id);
  }
});

test("dropspec tự hết hiệu lực khi chữ dòng nguồn đổi", () => {
  const s = real("fukangsi-yangzhou");
  for (const t of s.specTables) t.rows = t.rows.map((r) => r.includes("FKS-C20 | 20/25 | 东风康明斯 | 4B3.9-G1") ? r.replace("| 9 |", "| 10 |") : r);
  const r = recs(s).find((x) => x.kind === "engine" && x.n === 2001 && x.model === "4B3.9-G1");
  assert.equal(spec(r, "weight"), "5500");
});
