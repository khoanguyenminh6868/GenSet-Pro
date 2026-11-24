// node --test suppliers/dp222cc-code.test.mjs
// Mã Doosan "DP222CC" / "DP086CC" / "DP054CC" (catalog-3-loi, lỗi 1): `isCode` coi "<số>CC" là dung tích ("2500cc"),
// nên ở bảng ngang ô động cơ "DP222CC" không là mã: 38 ô trong dữ liệu NCC chỉ ra 3 bản ghi động cơ, mã đầu phát kế bên
// (MA5114G, TAL-A49-D) bị đọc thành động cơ. Ngoại lệ hẹp `DOOSAN_DP` = ^DP\d{3}CC$ (hai chữ + ba số + CC).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(path.join(ROOT, "..", "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const sup = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", `${id}.json`), "utf8"));

test("isCode: mã Doosan DPnnnCC là mã; dung tích '2500cc' vẫn không", () => {
  for (const c of ["DP222CC", "DP086CC", "DP054CC", "DP158CC", "dp222cc"]) assert.equal(C.isCode(c), true, c);
  for (const c of ["2500cc", "2500 cc", "6700CC", "12.5cc", "222CC", "D222CC", "DP2222CC"]) assert.equal(C.isCode(c), false, c);
});

test("walter-yangzhou n102: ô 'Engine Model' DP222CC thành bản ghi động cơ Doosan", () => {
  const recs = C.fromSupplier(sup("walter-yangzhou"), []);
  const e = recs.filter((r) => r.kind === "engine" && r.n === 102 && /^DP222CC$/.test(r.model));
  assert.equal(e.length, 2);
});

test("aj-power n104: DP222CC là động cơ, MA5114G là đầu phát (không đảo vai)", () => {
  const recs = C.fromSupplier(sup("aj-power"), []).filter((r) => r.n === 104 && /AJ825|AJ1010/.test(r.genset || ""));
  assert.ok(recs.some((r) => r.kind === "engine" && r.model === "DP222CC"));
  assert.ok(recs.some((r) => r.kind === "alternator" && r.model === "MA5114G"));
  assert.ok(!recs.some((r) => r.kind === "engine" && r.model === "MA5114G"));
});

test("build(): DP222CC có ≥ 40 dòng (trước: 3); MA5114G không còn là khoá động cơ", () => {
  const dir = path.join(ROOT, "cn");
  const all = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => sup(f.replace(/\.json$/, "")));
  const b = C.build(all);
  const dp = b.engines.find((e) => (e.key || e.model) === "DP222CC");
  assert.ok(dp.uses.length >= 40, String(dp.uses.length));
  assert.ok(!b.engines.some((e) => ["MA5114G", "WHI6D", "MA4114B", "MA4114D"].includes(e.key || e.model)));
});
