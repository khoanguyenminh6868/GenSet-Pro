// node --test suppliers/*.test.mjs — longkai-maxpower (điều phối 25/11/2026).
// "Max power(with fan) | Kw | 575" (longkai-power n1101 / 1145 / 1149 / 1159; bảng hai cột xen kẽ alternator / động cơ) là công suất tối đa
// của ĐỘNG CƠ kèm quạt (575 so với standby tổ máy 572 kW ở đầu tờ): không được đọc thành standby của tổ máy, mà ghi vào spec engPower.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const load = (id) => JSON.parse(fs.readFileSync(path.join(ROOT, "cn", id + ".json"), "utf8"));
const CASES = [[1101, "LG460C", "575", 572], [1145, "LG550WP", "610", 594], [1149, "LG900WP", "1007", 990], [1159, "LG1800WP", "1989", 1980]];

test("longkai-power: nguồn có đúng dòng 'Max power(with fan)' với số đó", () => {
  for (const [n, , v] of CASES) {
    const src = fs.readFileSync(path.join(ROOT, "sources", "longkai-power", `${n}.md`), "utf8");
    assert.ok(src.includes(`| Max power(with fan) | Kw | ${v}`), String(n));
  }
});

test("longkai-power: 'Max power(with fan)' không thành standby tổ máy; thành engPower; prime / rated giữ", () => {
  const rs = C.fromSupplier(load("longkai-power"));
  for (const [n, g, v] of CASES) {
    const mine = rs.filter((r) => r.n === n);
    assert.equal(mine.length, 2, String(n));
    for (const r of mine) {
      assert.equal(r.genset, g);
      assert.equal(r.power.standby, undefined, `${n} ${r.kind}`);
      assert.ok(r.power.prime && r.power.rated, `${n} prime / rated còn`);
      assert.deepEqual(r.specs.filter((s) => s.key === "engPower").map((s) => s.value), [v], `${n} ${r.kind}`);
    }
  }
});

test("không NCC nào khác có chữ 'with fan' làm đổi công suất tổ máy: mọi bản ghi có standby = 'Max power(with fan)' đều không còn", () => {
  const dir = path.join(ROOT, "cn");
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    for (const r of C.fromSupplier(s)) {
      const w = (r.specs || []).find((x) => x.key === "engPower" && /with\s*fan/i.test(x.label));
      if (w) assert.ok(!r.power?.standby || r.power.standby.kW !== +w.value, `${f} n${r.n}`);
    }
  }
});
