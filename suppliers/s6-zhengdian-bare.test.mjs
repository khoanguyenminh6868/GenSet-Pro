// node --test suppliers/s6-zhengdian-bare.test.mjs — S6-4 (điều phối 21/11/2026): zhengdian-zhengzhou n107 ghi mã động cơ là số trơ
// ("195", "1100", "1110", "2100", "395", "4100") dưới "柴油机型号"; isCode bỏ qua ô đó nên đầu phát "STC-5-4" kế bên bị đọc thành động cơ
// (đảo vai). BARE_ENGINE_CELLS (danh sách tường minh): số trơ là model động cơ y như ghi, KHÔNG hãng, không suy ra mã (Khoa: ZS195 / 195
// để trống hãng); STC-x-4 là đầu phát. Dòng thật trong suppliers/cn/zhengdian-zhengzhou.json.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const s = JSON.parse(fs.readFileSync(new URL("./cn/zhengdian-zhengzhou.json", import.meta.url), "utf8"));
const recs = C.fromSupplier(s, []).filter((x) => x.n === 107);
const roles = (genset) => recs.filter((x) => x.genset === genset).map((x) => [x.kind, x.model, x.makes.length]);

test("CCFJ5-xx '| 195 | STC-5-4': động cơ 195 không hãng, đầu phát STC-5-4", () => {
  assert.deepEqual(roles("CCFJ5-xx"), [["engine", "195", 0], ["alternator", "STC-5-4", 0]]);
});

test("năm dòng số trơ còn lại cùng dạng; dòng 2135Ca (mã có chữ) không đổi", () => {
  for (const [g, e, a] of [["CCFJ8-xx", "1100", "STC-8-4"], ["CCFJ10-xx", "1110", "STC-10-4"], ["CCFJ12-xx", "2100", "STC-12-4"], ["CCFJ15-xx", "395", "STC-15-4"], ["CCFJ30-xx", "4100", "STC-30-4"]])
    assert.deepEqual(roles(g), [["engine", e, 0], ["alternator", a, 0]], g);
  assert.deepEqual(recs.filter((x) => x.genset === "CCFJ20-xx").map((x) => [x.kind, x.model]), [["engine", "2135Ca"], ["alternator", "STC-20-4"]]);
});

test("không bản ghi động cơ STC-… nào ở zhengdian; CCFJ30-xx không còn đọc 4100 làm dòng điện", () => {
  assert.ok(!C.fromSupplier(s, []).some((x) => x.kind === "engine" && /^STC/i.test(x.model)));
  const r = recs.find((x) => x.genset === "CCFJ30-xx" && x.kind === "engine");
  assert.equal(r.specs.find((x) => x.key === "current")?.value, "54");
});

test("không áp ở NCC khác: cùng bảng dưới id khác vẫn đọc như cũ", () => {
  const t = s.specTables.find((x) => x.n === 107);
  const other = C.fromSupplier({ ...s, id: "x-power", specTables: [t] }, []);
  assert.ok(!other.some((x) => x.kind === "engine" && x.model === "195"));
});
