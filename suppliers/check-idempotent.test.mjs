// `check` + `rankConfigs` chạy lại trên kết quả của chính nó phải ra y nguyên (keepFound, restoreWeb kiểm lại kết quả đã lưu;
// check-luy-dang 22/11/2026: 15/17 lượt thật từng đổi ghi chú và thứ tự check). Mỗi fixture `config*` là một lượt hoặc một cỡ máy.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { check, rankConfigs, NO_CONTROLLER } from "./config-bot.mjs";
import { runsOf, readBundle, tmpDir } from "./fixtures/runs/regress.mjs";

delete process.env.GENBID_NAMED_SELLER; // mặc định BẬT như bot, như regress-config.test.mjs

const clone = (x) => JSON.parse(JSON.stringify(x));
const MK = "cần xác nhận đời (MK) của bộ điều khiển.";
function withRun(r, fn) {
  const b = readBundle(r.input), dir = tmpDir(r.tender);
  try {
    for (const [f, text] of Object.entries(b.sources || {})) { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), text); }
    const run = (result) => { const o = check(clone(result), { hsmtText: b.hsmtText, suppliers: b.suppliers, readWeb: () => null, origin: b.meta.origin, basis: b.meta.basis, sized: !!b.meta.sized, sourcesDir: dir }); rankConfigs(o.result); return { result: clone(o.result), problems: o.problems }; };
    return fn(run, b);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

const runs = runsOf("config");
test("có fixture để kiểm", () => assert.ok(runs.length >= 6));
for (const r of runs) {
  test(`check lần hai không đổi gì: ${r.tender}/${r.name}`, () => withRun(r, (run, b) => {
    const one = run(b.result), two = run(one.result), three = run(two.result);
    assert.deepEqual(two.result, one.result);
    assert.deepEqual(three.result, one.result);
    assert.equal(three.problems.length, two.problems.length);
  }));
}

// IB2600594596 cỡ 400 kVA (không có trong fixture): cấu hình thiếu bộ điều khiển trong gói có Đồng bộ thương hiệu, rankConfigs
// ghi "Bộ điều khiển của cấu hình" lên đầu danh sách, trước check đồng bộ.
test("cấu hình không có bộ điều khiển, gói có đồng bộ thương hiệu: check lần hai không đổi", () => {
  const r = runs.find((x) => x.tender === "IB2600594596" && x.name === "config-1");
  withRun(r, (run, b) => {
    const input = clone(b.result);
    delete input.configs[1].controller; // APM403: cấu hình này còn lại sau khi bỏ bộ điều khiển
    const one = run(input), c = one.result.configs.find((x) => x.checks.some((y) => y.item === NO_CONTROLLER));
    assert.ok(c && c.checks.some((y) => y.item === "Đồng bộ thương hiệu"), "cần cấu hình có cả hai check");
    assert.equal(c.checks[0].item, NO_CONTROLLER);
    assert.deepEqual(run(one.result).result, one.result);
  });
});

test("kết quả đã lưu bị lặp ghi chú được check lại thì sạch", () => {
  let seen = 0;
  for (const r of runs) withRun(r, (run, b) => {
    const clean = run(b.result).result, dirty = clone(clean);
    for (const c of dirty.configs || []) for (const x of c.checks || []) if (String(x.note || "").includes(MK)) { const s = x.note.slice(x.note.indexOf("Nguồn là datasheet")); x.note = `${x.note} ${s}`; seen++; }
    const mark = (dirty.notes || []).find((n) => n.startsWith("Kiểm tra bằng code:"));
    if (mark) dirty.notes.push(mark);
    assert.deepEqual(run(dirty).result, clean);
  });
  assert.ok(seen > 0, "cần ít nhất một check có câu xác nhận đời trong fixture");
});
