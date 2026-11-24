// node --test suppliers/bo-o-lech-4.test.mjs — bo-o-lech-4 (Khoa 24/11/2026): 4 ca loại 4 dung tích sai hình học (kangwo S175M / S180M,
// zhengchi 12M33D1450E310, taihai 6135AD-3) → `dropspec` ô disp theo dòng. Bản ghi mất đúng ô dung tích, giữ cyl / bore; ca khác không đổi.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/conversions.js";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const real = (id) => JSON.parse(fs.readFileSync(new URL(`./cn/${id}.json`, import.meta.url), "utf8"));
const norm = (s) => String(s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const CASES = [
  ["kangwo-guangdong", 110, "S175M", "| GKW-3GF | 3 | 3.75 | 5.4 | S175M | 1 | 75/80 | 1.2 | 210 | 1000*480*800 | 300"],
  ["kangwo-guangdong", 110, "S180M", "| GKW-5GF | 5 | 6.25 | 9 | S180M | 1 | 80/80 | 1.2 | 210 | 1100*600*800 | 300"],
  ["zhengchi-power", 162, "12M33D1450E310", "| ZCDL-W1320 | 1200 | 1320 | 2376A | 12M33D1450E310 | 12 | 159*159 | 50L | g/kw.h | 5900*2270*2500 | 12000kg | 220/380 | 50Hz | 三相四线 | 详细参数"],
  ["taihai-taizhou", 108, "6135AD-3", "| TH-100GF | 100 | 125 | 180 | 6135AD-3 | 6 | 135*150 | 8.6 | 28 | 226 | 2600*900*1600 | 2200"],
];
const lineOf = (r, line) => [r.line, ...(r.lines?.header || []), ...(r.lines?.rows || [])].some((x) => x != null && String(x).trim() === line.trim());

test("4 ca: dòng nguồn có thật, bản ghi mất disp, giữ cyl / bore", () => {
  for (const [id, n, model, line] of CASES) {
    const src = real(id).specTables.filter((t) => t.n === n);
    assert.ok(src.some((t) => [...(t.header || []), ...(t.rows || [])].some((x) => String(x).trim() === line.trim())), `${id} n${n}: dòng nguồn không còn`);
    const rs = C.fromSupplier(real(id)).filter((r) => r.n === n && r.kind === "engine" && norm(r.model) === norm(model) && lineOf(r, line));
    assert.ok(rs.length, `${id} n${n} ${model}: không có bản ghi`);
    for (const r of rs) {
      const ks = (r.specs || []).map((s) => s.key);
      assert.ok(!ks.includes("disp"), `${id} ${model}: còn disp`);
      assert.ok(ks.includes("cyl") && ks.includes("bore"), `${id} ${model}: mất cyl / bore`);
    }
  }
});
