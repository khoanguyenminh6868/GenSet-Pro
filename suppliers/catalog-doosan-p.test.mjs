// node --test suppliers/catalog-doosan-p.test.mjs — catalog-doosan-p (điều phối 20/11/2026): mã động cơ Doosan "P086TI / P126TI / P158LE…" ở bảng
// có cột động cơ nhưng KHÔNG có cột đầu phát (40 bảng, 288 dòng) đọc là động cơ. Mọi ca là dòng thật trong suppliers/cn.
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const engines = (s, notes = []) => C.fromSupplier(s, notes).filter((r) => r.kind === "engine");

test("aoke n130: 柴油机型号 = P126TI-11 dưới 斗山, bảng không có cột đầu phát → một bản ghi động cơ", () => {
  const s = sup("aoke-yangzhou", [{ n: 130, title: "斗山柴油发电机组", header: ["| 机组型号 | 主用功率(KW) | 备用功率(KW) | 发动机品牌 | 柴油机型号 | 缸数 | 排量(L) | 机油容量(L) | 燃油消(g/kw/h) | 外形尺寸 (L×W×H mm×mm×mm) | 机组重量(KG) | 技术咨询"],
    rows: ["| AOKE-D260 | 240KW | 260KW | 斗山 | P126TI-11 | 6 | 11.051 | 25 | 195 | 2800 x 1050 x 1550 | 2400 | | 详细参数"] }]);
  const r = engines(s);
  assert.equal(r.length, 1);
  assert.equal(r[0].model, "P126TI-11");
  assert.equal(r[0].genset, "AOKE-D260");
  assert.equal(r[0].power.standby.kW, 260);
});

test("huatai n108: 柴油机型号 ENGINEMODEL = P126TI / P126TI-2 / P158LE-1 ở dòng chỉ có một mức công suất", () => {
  const s = sup("huatai-yangzhou", [{ n: 108, title: "斗山", header: ["| 型号GENSET MODEL | 功率POWER(kw) | 柴油机型号ENGINEMODEL | 缸数CYL.NO | 缸径/行程BORE/STROKE(mm) | 排量DISP (L) | 机油容量CAPACITY OF ENGINE OIL(L) | 重量WEIGHT(kg) | 长×宽×高 L X B X H(mm)"],
    rows: ["| 220GF | 220 | P126TI | 6L | 123/155 | 11.051 | 25 | 2400 | 2800*1050*1550", "| 250GF | 250 | P126TI-2 | 6L | 123/155 | 11.051 | 25 | 2500 | 2900*1200*1600", "| 300GF | 300 | P158LE-1 | 8L | 128/142 | 14.618 | 24 | 2800 | 3000*1400*1800"] }]);
  assert.deepEqual(engines(s).map((x) => x.model), ["P126TI", "P126TI-2", "P158LE-1"]);
});

test("kaihua n126 (tiêu đề phụ KVA | KW làm lệch chỉ số cột): vẫn là động cơ", () => {
  const s = sup("kaihua-genset", [{ n: 126, title: "t", header: ["| Model | Standby Power | Prime Power | Engine Model | Dimension | Weight | Detail Data", "| | KVA | KW | KVA | KW | | | KG"],
    rows: ["| KH-300GF2 | 413 | 330 | 375 | 300 | P158LE | 3300x1390x1780 | 2885"] }]);
  assert.deepEqual(engines(s).map((x) => x.model), ["P158LE"]);
});

test("không đổi: bảng KHÔNG có tiêu đề động cơ, hoặc dòng có hai mã dạng đầu phát, thì P126TI không thành động cơ", () => {
  const noEngineTitle = sup("x-power", [{ n: 1, title: "t", header: ["| Model | Power | Alternator Frame"], rows: ["| X-220 | 220 | P126TI"] }]);
  assert.ok(!engines(noEngineTitle).some((x) => x.model === "P126TI"));
  const two = sup("x-power", [{ n: 2, title: "t", header: ["| Model | Power | Engine Model | Fuel"], rows: ["| X-220 | 220 | P126TI | UCI274G | 40"] }]);
  assert.ok(!engines(two).some((x) => x.model === "P126TI"), "hai mã dạng đầu phát trên dòng: không đoán");
});
