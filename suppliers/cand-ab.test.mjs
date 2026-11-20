// node --test suppliers/*.test.mjs — hai luật điểm ở bước chọn ứng viên (Khoa duyệt 20/11/2026 "làm cả A và B").
// A: +40 cho dòng mà động cơ có datasheet của chính hãng động cơ (engineMakerSheets). B: chỗ của một hãng động cơ chia cho
// các model khác nhau trước, rồi mới tới dòng thứ hai của cùng model, cả trong 12 chỗ hãng TQ. Khoa 20/11/2026: B mặc định bật
// (GENBID_CAND_B=0 tắt), A mặc định TẮT (chưa duyệt bật; GENBID_CAND_A=1 để đo).
import test from "node:test";
import assert from "node:assert/strict";
import { candidates, hintsOf, engineMakerSheets, modelFacts } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const H = "| Model | Prime kVA | Prime kW | Engine |";
const set = (id, mk, rows, conf = "low") => ({ id, country: "CN", confidence: conf, specTables: [{ n: 101, title: `${mk} gensets 50Hz`, header: [H], rows }] });
const free = () => ({ ...hintsOf("Chương V. Yêu cầu kỹ thuật\n50 Hz"), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
const cap = { value: 400, unit: "kVA" };
const run = (list, o = {}, hints = free()) => candidates(C.build(list), cap, hints, { suppliers: list, patches: false, ...o });
const withEnv = (env, fn) => {
  const old = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(env)) if (v === undefined) delete process.env[k]; else process.env[k] = v;
  try { return fn(); } finally { for (const [k, v] of Object.entries(old)) if (v === undefined) delete process.env[k]; else process.env[k] = v; }
};
// A datasheet table of one engine model (no header: modelFacts reads it as the model's facts).
const sheet = (id, extra, title = "KTA19-G3 engine datasheet") => ({ id, country: "CN", confidence: "low", ...extra, specTables: [{ n: 1001, title, header: [], rows: ["| Displacement | 18.9 L |", "| Cylinders | 6 |", "| Bore x Stroke | 159 x 159 mm |"] }] });
const cumMaker = (title) => sheet("dcec-x", { role: "engine_maker", names: { en: "Dongfeng Cummins Engine", brands: ["Cummins"] } }, title);
const assembler = set("asm1", "Cummins", ["| A-400 | 420 | 336 | KTA19-G3 |"]);
const rowOf = (r) => r.all.find((x) => x.u.supplierId === "asm1" && x.e.model === "KTA19-G3");

test("A: an engine with its own maker's datasheet (engine_maker of that make, table titled with its exact code) gets 40 points", () => {
  const base = rowOf(run([assembler, cumMaker()]));
  const on = withEnv({ GENBID_CAND_A: "1" }, () => rowOf(run([assembler, cumMaker()])));
  assert.equal(on.score - base.score, 40);
  assert.ok(on.why.includes("động cơ có datasheet hãng"), on.why.join("; "));
  assert.ok(!base.why.includes("động cơ có datasheet hãng"));
});

test("A is off by default (Khoa 20/11/2026: not approved to switch on); GENBID_CAND_A=0 is off too", () => {
  for (const env of [{}, { GENBID_CAND_A: "0" }, { GENBID_CAND_A: "" }]) {
    const r = withEnv({ GENBID_CAND_A: undefined, ...env }, () => rowOf(run([assembler, cumMaker()])));
    assert.ok(!r.why.includes("động cơ có datasheet hãng"), JSON.stringify(env));
  }
});

test("A: the same figures from an assembler's page (\"Datasheet: …\" of a genset maker) do not count", () => {
  const copy = sheet("asm2", { names: { en: "Some Genset Co" } }, "Datasheet: KTA19-G3");
  const r = withEnv({ GENBID_CAND_A: "1" }, () => rowOf(run([assembler, copy])));
  assert.ok(!r.why.includes("động cơ có datasheet hãng"), r.why.join("; "));
  // ... though its figures are facts of the engine (they still score as figures, as before).
  const ef = modelFacts(C.build([assembler, copy]), [assembler, copy]).get(`engine:${C.keyOf("KTA19-G3")}`) || [];
  assert.ok(ef.some((f) => f.supplierId === "asm2"));
});

test("A: an engine maker's sheet of another make's engine, or of an engine of no make, does not count", () => {
  const other = sheet("yc-x", { role: "engine_maker", names: { en: "Guangxi Yuchai Machinery", brands: ["Yuchai"] } });
  assert.ok(!withEnv({ GENBID_CAND_A: "1" }, () => rowOf(run([assembler, other]))).why.includes("động cơ có datasheet hãng"));
  const e = { make: null, model: "KTA19-G3" }, sup = new Map([["dcec-x", cumMaker()]]);
  assert.deepEqual(engineMakerSheets(e, [{ key: "disp", supplierId: "dcec-x", sheet: true }], sup), []);
  assert.deepEqual(engineMakerSheets({ make: "Cummins" }, [{ key: "disp", supplierId: "dcec-x", sheet: true }], sup), ["dcec-x"]);
  // A fact of the engine maker that is not from its own sheet of exactly that model (a frame's sheet: no `sheet`) does not count.
  assert.deepEqual(engineMakerSheets({ make: "Cummins" }, [{ key: "disp", supplierId: "dcec-x" }], sup), []);
});

test("A: a maker's sheet naming two models in its title gives neither", () => {
  const r = withEnv({ GENBID_CAND_A: "1" }, () => rowOf(run([assembler, cumMaker("KTA19-G3 / KTA19-G4 engine datasheet")])));
  assert.ok(!r.why.includes("động cơ có datasheet hãng"));
});

// The B tests below pass `pinTop: 0` (no rows of the old top 5 held): their few places would all be ranks 1-5. The test of
// the held top 5 is "B keeps the top 5 …".
// B. Make X (Cummins): engine KTA19-G3 offered by three suppliers with high confidence, engine NTA855-G2A by one with
// low; make Y (Yuchai) fills the rest.
const B = () => [
  set("c1", "Cummins", ["| C1 | 420 | 336 | KTA19-G3 |"], "high"),
  set("c2", "Cummins", ["| C2 | 420 | 336 | KTA19-G3 |"], "high"),
  set("c3", "Cummins", ["| C3 | 420 | 336 | KTA19-G3 |"], "high"),
  set("c4", "Cummins", ["| C4 | 420 | 336 | NTA855-G2A |"], "low"),
  set("y1", "Yuchai", ["| Y1 | 420 | 336 | YC6K520-D30 |", "| Y2 | 420 | 336 | YC6MJ500L-D21 |"], "medium"),
];
const models = (top, mk) => top.filter((r) => (r.e.make || "").startsWith(mk)).map((r) => r.e.model);

test("B: a make's places go to its different models first, then to a second row of the same model", () => {
  const off = withEnv({ GENBID_CAND_B: "0" }, () => run(B(), { max: 4, makeCap: 2, pinTop: 0 }).top);
  assert.deepEqual(models(off, "Cummins"), ["KTA19-G3", "KTA19-G3"]);
  const on = run(B(), { max: 4, makeCap: 2, pinTop: 0 }).top;
  assert.deepEqual(models(on, "Cummins").sort(), ["KTA19-G3", "NTA855-G2A"]);
  assert.equal(models(on, "Yuchai").length, 2);
  // Once every model has a row, a second row of a model comes in.
  const more = run(B(), { max: 5, makeCap: 3, pinTop: 0 }).top;
  assert.deepEqual(models(more, "Cummins").sort(), ["KTA19-G3", "KTA19-G3", "NTA855-G2A"]);
});

test("B: not when the HSMT names an engine make (no places per make: the order of the scores as before)", () => {
  const h = { ...free(), engineMakes: ["Cummins"] };
  const on = run(B(), { max: 3, makeCap: 2 }, h).top, off = withEnv({ GENBID_CAND_B: "0" }, () => run(B(), { max: 3, makeCap: 2 }, h).top);
  assert.deepEqual(on.map((r) => r.u.supplierId), off.map((r) => r.u.supplierId));
  assert.deepEqual(models(on, "Cummins"), ["KTA19-G3", "KTA19-G3", "KTA19-G3"]);
});

test("B only reorders: with room for every row, the same rows are chosen as without it (no place left empty)", () => {
  const ids = (top) => top.map((r) => `${r.u.supplierId}|${r.e.key}`).sort();
  const on = run(B(), { max: 30, makeCap: 3 }).top, off = withEnv({ GENBID_CAND_B: "0" }, () => run(B(), { max: 30, makeCap: 3 }).top);
  assert.equal(on.length, 6);
  assert.deepEqual(ids(on), ids(off));
});

test("B: with G7 / EU asked, a make with fewer models than MAKE_ROWS fills its places with second rows (B off: one row an engine)", () => {
  const list = [
    set("p1", "Perkins", ["| P1 | 420 | 336 | 2206C-E13TAG2 |", "| P2 | 420 | 336 | 2206C-E13TAG3 |", "| P3 | 420 | 336 | 2506C-E15TAG1 |"], "low"),
    set("c1", "Cummins", ["| C1 | 420 | 336 | KTA19-G3 |"], "high"), set("c2", "Cummins", ["| C2 | 420 | 336 | KTA19-G3 |"], "high"), set("c3", "Cummins", ["| C3 | 420 | 336 | KTA19-G3 |"], "high"),
  ];
  const o = { max: 4, makeCap: 0, patches: true, origin: "g7eu", pinTop: 0 };
  const on = run(list, o).top, off = withEnv({ GENBID_CAND_B: "0" }, () => run(list, o).top);
  assert.equal(models(on, "Cummins").length, 3);
  assert.equal(models(off, "Cummins").length, 1);
});

test("B keeps the top 5 of the old ranking (B off) at ranks 1-5 (Khoa 20/11/2026 \"Sửa luật B rồi chạy lại\")", () => {
  const ids = (top) => top.slice(0, 5).map((r) => `${r.u.supplierId}|${r.e.key}`);
  const cases = [
    [B(), { max: 4, makeCap: 2 }], [B(), { max: 5, makeCap: 3 }],
    [[...B(), set("w1", "Weichai", ["| W1 | 420 | 336 | WP13D405E200 |"], "high"), set("w4", "Weichai", ["| W4 | 420 | 336 | WP13D385E200 |"], "low")], { max: 6, makeCap: 0, patches: true, origin: "all" }],
  ];
  for (const [list, o] of cases) {
    const off = withEnv({ GENBID_CAND_B: "0" }, () => run(list, o).top), on = run(list, o).top;
    assert.deepEqual(ids(on), ids(off), JSON.stringify(o));
  }
});

test("B in the 12 places of Chinese makes (CN_ROWS, Khoa 20/11/2026 \"áp luôn cho các hãng trung quốc\"): a Chinese make's models first", () => {
  const list = [
    set("w1", "Weichai", ["| W1 | 420 | 336 | WP13D405E200 |"], "high"), set("w2", "Weichai", ["| W2 | 420 | 336 | WP13D405E200 |"], "high"),
    set("w3", "Weichai", ["| W3 | 420 | 336 | WP13D405E200 |"], "high"), set("w4", "Weichai", ["| W4 | 420 | 336 | WP13D385E200 |"], "low"),
  ];
  const o = { max: 2, makeCap: 0, patches: true, origin: "all", pinTop: 0 };
  const on = run(list, o).top, off = withEnv({ GENBID_CAND_B: "0" }, () => run(list, o).top);
  assert.deepEqual(models(off, "Weichai"), ["WP13D405E200", "WP13D405E200"]);
  assert.deepEqual(models(on, "Weichai").sort(), ["WP13D385E200", "WP13D405E200"]);
});
