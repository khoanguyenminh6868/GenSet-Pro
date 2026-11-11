// node --test suppliers/*.test.mjs — Gợi ý lại keeps what Tìm NCC added (keepFound, config-bot.mjs; Khoa 2026-11-12).
import test from "node:test";
import assert from "node:assert/strict";
import { check, keepFound, rankConfigs } from "./config-bot.mjs";

const hsmt = "Chương V. Yêu cầu kỹ thuật\nCông suất liên tục (Prime): ≥ 450 kVA\nĐầu phát: Stamford hoặc tương đương\nTần số 50Hz";
const L1 = "| SQP500 | 400/500 | 360/450 | 2506C-E15TAG1 | HCI544C | UK", L2 = "| SQP600 | 480/600 | 440/550 | 2806C-E18TAG1 | HCI634 | UK";
const HEAD = ["| Model | Standby kW/kVA | Prime kW/kVA | Engine | Alternator"];
const table = (n, ...rows) => ({ n, title: "Perkins gensets", header: HEAD, rows });
const S = (id, country, ...rows) => ({ id, country, specTables: [table(101, ...rows)] });
const suppliers = () => [S("uk", "GB", L1), S("uk2", "GB", L1), S("uk3", "GB", L2), S("cn1", "CN", L1)];
const src = (id, line, n = 101) => ({ kind: "catalog", supplierId: id, n, line });
const cfg = (rank, line, model, alt, mk, sid, extra = {}) => ({ rank, engine: { model, make: mk, src: src(sid, line) }, alternator: { model: alt, src: src(sid, line) }, genset: { model: "SQP", src: src(sid, line) },
  checks: [{ item: "Công suất", hsmtQuote: "Công suất liên tục (Prime): ≥ 450 kVA", offered: "450 kVA prime", sourceQuote: "360/450", part: "genset", status: "met" }],
  suppliers: [{ supplierId: sid, n: 101, line }], ...extra });
const reqs = () => [{ item: "Công suất", requirement: "≥ 450 kVA prime", quote: "Công suất liên tục (Prime): ≥ 450 kVA" }];
const ent = (id, line) => ({ supplierId: id, n: 101, line, fromFind: true, why: "Nhà cung cấp mới tìm được (Tìm NCC)." });
const opts = (over = {}) => ({ suppliers: suppliers(), origin: "g7", hsmtText: hsmt, readWeb: () => null, ...over });
// The run's own result, checked like checkDir does.
const fresh = (list = suppliers()) => check({ requirements: reqs(), configs: [cfg(1, L1, "2506C-E15TAG1", "HCI544C", "Perkins", "uk")] }, { hsmtText: hsmt, suppliers: list, readWeb: () => null, origin: "g7" }).result;
// The last result: the same configuration with a supplier found under it, and a configuration found (2806C-E18TAG1, uk3).
const last = () => {
  const c1 = cfg(1, L1, "2506C-E15TAG1", "HCI544C", "Perkins", "uk"); c1.suppliers.push(ent("uk2", L1));
  const c2 = cfg(2, L2, "2806C-E18TAG1", "HCI634", "Perkins", "uk3", { fromFind: true }); c2.suppliers = [ent("uk3", L2)];
  const r = check({ requirements: reqs(), configs: [c1, c2] }, { hsmtText: hsmt, suppliers: suppliers(), readWeb: () => null, origin: "g7" }).result;
  r.configs.find((c) => c.rank === 2).fromFind = true; r.configs[0].suppliers.find((s) => s.supplierId === "uk2").fromFind = true;
  return r;
};

test("a configuration found comes back, checked again with the run's rules; a supplier found joins the same configuration", () => {
  const r = fresh(), prev = last(), before = r.configs.length;
  assert.equal(before, 1);
  const k = keepFound(r, prev, opts());
  assert.deepEqual([k.configs, k.suppliers], [1, 1]);
  assert.equal(r.configs.length, 2);
  const kept = r.configs.find((c) => c.engine.model === "2806C-E18TAG1");
  assert.ok(kept.fromFind && kept.keptFind);
  assert.deepEqual(kept.suppliers.map((s) => [s.supplierId, s.fromFind]), [["uk3", true]]);
  // Checked again: the power check is the code's own, read from the row (550 kVA prime ≥ 450).
  assert.equal(kept.checks.find((x) => /công suất/i.test(x.item)).status, "met");
  const own = r.configs.find((c) => c.engine.model === "2506C-E15TAG1");
  assert.deepEqual(own.suppliers.map((s) => s.supplierId).sort(), ["uk", "uk2"]);
  assert.match(r.notes.at(-1), /Giữ lại từ Tìm NCC lần trước.*1 cấu hình \(2806C-E18TAG1\).*1 nhà cung cấp \(uk2 vào 2506C-E15TAG1\)/);
  assert.ok(r.configs.every((c, i) => c.rank === i + 1));
});

test("a second run adds nothing twice", () => {
  const r = fresh(), prev = last();
  keepFound(r, prev, opts());
  const snap = JSON.stringify(r);
  const k = keepFound(r, prev, opts());
  assert.deepEqual([k.configs, k.suppliers], [0, 0]);
  assert.equal(JSON.stringify(r), snap);
  // The result of that run is the next last result: the same again, nothing doubled.
  const again = fresh();
  keepFound(again, JSON.parse(snap), opts());
  assert.equal(again.configs.length, 2);
  assert.equal(again.configs.flatMap((c) => c.suppliers).length, 3);
});

test("nothing found by Tìm NCC: the result is left as it was", () => {
  const prev = last();
  for (const c of prev.configs) { delete c.fromFind; for (const s of c.suppliers) delete s.fromFind; }
  const r = fresh(), snap = JSON.stringify(r);
  const k = keepFound(r, prev, opts());
  assert.deepEqual([k.configs, k.suppliers], [0, 0]);
  assert.equal(JSON.stringify(r), snap);
  assert.equal(JSON.stringify(keepFound(fresh(), null, opts())), JSON.stringify({ configs: 0, suppliers: 0, dropped: [] }));
});

test("a supplier no longer in the list (excluded / deleted), out of the group, or with its row gone is not brought back", () => {
  // Excluded: not in `suppliers` at all.
  const list = suppliers().filter((s) => s.id !== "uk2" && s.id !== "uk3");
  const r = fresh(list), k = keepFound(r, last(), opts({ suppliers: list }));
  assert.deepEqual([k.configs, k.suppliers], [0, 0]);
  assert.equal(r.configs.length, 1);
  assert.deepEqual(r.configs[0].suppliers.map((s) => s.supplierId), ["uk"]);
  assert.ok(k.dropped.length >= 2);
  // Out of the G7 group: the supplier is now based in China.
  const cn = suppliers().map((s) => (s.id === "uk2" || s.id === "uk3" ? { ...s, country: "CN" } : s));
  const r2 = fresh(cn), k2 = keepFound(r2, last(), opts({ suppliers: cn }));
  assert.deepEqual([k2.configs, k2.suppliers], [0, 0]);
  assert.equal(r2.configs.length, 1);
  // Its table row is gone.
  const gone = suppliers().map((s) => (s.id === "uk2" || s.id === "uk3" ? { ...s, specTables: [table(101, "| X | 1/1 | 1/1 | OTHER | ALT")] } : s));
  const r3 = fresh(gone), k3 = keepFound(r3, last(), opts({ suppliers: gone }));
  assert.deepEqual([k3.configs, k3.suppliers], [0, 0]);
  assert.equal(r3.configs.length, 1);
  // Viet Nam: a supplier based there is not suggested, whatever Tìm NCC found.
  const vn = suppliers().map((s) => (s.id === "uk3" ? { ...s, country: "VN" } : s));
  assert.equal(keepFound(fresh(vn), last(), opts({ suppliers: vn, origin: "all" })).configs, 0);
});

test("a configuration that sits under another supplier's row still found is kept with only the suppliers that still stand", () => {
  const prev = last();
  prev.configs[1].suppliers.push(ent("cn1", L2));
  const list = suppliers(), r = fresh(list);
  const k = keepFound(r, prev, opts());
  assert.equal(k.configs, 1);
  assert.deepEqual(r.configs.find((c) => c.keptFind).suppliers.map((s) => s.supplierId), ["uk3"]);
});

test("requirements of this run differ from the last: kept, with a note that its checks are of the last reading", () => {
  const prev = last(); prev.reqHash = "aaaa";
  const same = fresh(); same.reqHash = "aaaa";
  keepFound(same, prev, opts({ reqHash: "aaaa" }));
  assert.ok(!(same.configs.find((c) => c.keptFind).gaps || []).some((g) => /lần đọc HSMT trước/.test(g)));
  const other = fresh(); other.requirements.push({ item: "Tần số", requirement: "50 Hz", quote: "Tần số 50Hz" });
  const k = keepFound(other, prev, opts({ reqHash: "bbbb" }));
  assert.equal(k.configs, 1);
  const kept = other.configs.find((c) => c.keptFind);
  assert.ok(kept.gaps.some((g) => /lần đọc HSMT trước/.test(g)));
  assert.match(other.notes.at(-1), /khác lượt trước/);
  // No "met" the code made up: the only "met" is the power check it reads from the row, as for any configuration.
  assert.equal(kept.checks.filter((x) => x.status === "met").length, 1);
});

test("a configuration kept is outside the 2-per-make limit; one the run found is not", () => {
  const mk = (rank, model, extra = {}) => ({ rank, engine: { model, make: "Perkins" }, checks: [], suppliers: [{ supplierId: "a" }], ...extra });
  const three = (extra) => ({ requirements: [], configs: [mk(1, "E1"), mk(2, "E2"), mk(3, "E3", extra)] });
  assert.deepEqual(rankConfigs(three()).configs.map((c) => c.engine.model), ["E1", "E2"]);
  assert.deepEqual(rankConfigs(three({ keptFind: true, fromFind: true })).configs.map((c) => c.engine.model), ["E1", "E2", "E3"]);
});

test("a configuration made from a product line (its row does not name the engine) comes back; one whose row is gone does not", () => {
  const rowOnly = "| 400 | 50 | 352 | 440 | 320 | 400";
  const list = [S("uk", "GB", L1), S("pl", "GB", rowOnly)];
  const prev = last();
  prev.configs[1] = cfg(2, rowOnly, "P158LE", "", "Doosan", "pl", { fromFind: true }); prev.configs[1].suppliers = [ent("pl", rowOnly)]; delete prev.configs[1].alternator;
  const r = fresh(list), k = keepFound(r, prev, opts({ suppliers: list }));
  assert.equal(k.configs, 1);
  assert.equal(r.configs.find((c) => c.keptFind).engine.model, "P158LE");
  const gone = [S("uk", "GB", L1), S("pl", "GB", "| other row")];
  assert.equal(keepFound(fresh(gone), prev, opts({ suppliers: gone })).configs, 0);
});
