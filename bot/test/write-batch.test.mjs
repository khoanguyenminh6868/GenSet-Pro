// Writing many hsmttext chunks to /api/ingest in small batches (ocrHsmt, HTTP 413 on IB2500441397, 2026-11-19): batchRows.
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { batchRows, WRITE_BATCH } = createRequire(import.meta.url)("../genbid-hsmt/sync-pure.js");

const row = (i, n) => ({ coll: "hsmttext", id: `K_${i}`, data: { text: "a".repeat(n) } });
const size = (r) => Buffer.byteLength(JSON.stringify(r), "utf8");
const ids = (bs) => bs.flat().map((r) => r.id);

test("0 chunk: no batch", () => {
  assert.deepEqual(batchRows([]), []);
  assert.deepEqual(batchRows([null, undefined]), []);
});

test("1 chunk: one batch", () => {
  const rows = [row(0, 190000)];
  assert.deepEqual(batchRows(rows), [rows]);
});

test("at the row limit: one batch; one more row: two", () => {
  const rows = Array.from({ length: WRITE_BATCH.rows }, (_, i) => row(i, 10));
  assert.equal(batchRows(rows).length, 1);
  const more = [...rows, row(99, 10)];
  const bs = batchRows(more);
  assert.deepEqual(bs.map((b) => b.length), [WRITE_BATCH.rows, 1]);
});

test("at the byte limit: one batch; one byte over: split", () => {
  const a = row(0, 1000), b = row(1, 1000);
  const limit = size(a) + size(b);
  assert.equal(batchRows([a, b], { rows: 15, bytes: limit }).length, 1);
  assert.equal(batchRows([a, b], { rows: 15, bytes: limit - 1 }).length, 2);
});

test("a single row bigger than the limit goes alone, order and rows kept", () => {
  const rows = [row(0, 100), row(1, 5000), row(2, 100)];
  const bs = batchRows(rows, { rows: 15, bytes: 1000 });
  assert.deepEqual(bs.map((x) => x.map((r) => r.id)), [["K_0"], ["K_1"], ["K_2"]]);
});

test("3.4 million characters (18-25 chunks of 190,000 bytes): every batch under the limit, nothing lost, order kept", () => {
  const rows = Array.from({ length: 25 }, (_, i) => row(i, 190000));
  const bs = batchRows(rows);
  assert.deepEqual(ids(bs), rows.map((r) => r.id));
  for (const b of bs) {
    assert.ok(b.length <= WRITE_BATCH.rows);
    assert.ok(Buffer.byteLength(JSON.stringify({ rows: b }), "utf8") < 4500000);
  }
  assert.ok(bs.length >= 2);
});

test("multi-byte text counts in UTF-8 bytes, not characters", () => {
  const vi = (i) => ({ coll: "hsmttext", id: `K_${i}`, data: { text: "ệ".repeat(60000) } }); // 3 bytes each → 180 KB
  const bs = batchRows(Array.from({ length: 20 }, (_, i) => vi(i)));
  for (const b of bs) assert.ok(Buffer.byteLength(JSON.stringify({ rows: b }), "utf8") < 4500000);
});
