// node --test suppliers/*.test.mjs — the pages of internet finds are kept, and a configuration found on the internet
// comes back on Gợi ý lại, checked against the saved pages (savePages, savedReader, keepFound; Khoa 2026-11-12).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { check, keepFound, savePages, savedReader, catalogPageOf, restoreWeb } from "./config-bot.mjs";

const HSMT = "Chương V. Yêu cầu kỹ thuật\nSố xi lanh: ≥ 6\nTần số 50Hz";
const URL1 = "https://maker.example/d440.pdf", PAGE = `URL: ${URL1}\nAccessed: 2026-11-11\n\nEngine ref. P158LE\nNumber of cylinders 6\nGenset D440\n`;
const reqs = () => [{ item: "Số xi lanh", requirement: "≥ 6", quote: "Số xi lanh: ≥ 6", part: "engine", level: "core", code: "cylinders" }];
const web = (file = "web/1.txt", url = URL1, quote = "Engine ref. P158LE") => ({ kind: "internet", url, file, quote });
const webCfg = (rank, model = "P158LE", src = web()) => ({ rank, engine: { model, make: "Doosan", src }, genset: { model: "D440", src: { ...src, quote: "Genset D440" } },
  checks: [{ item: "Số xi lanh", hsmtQuote: "Số xi lanh: ≥ 6", offered: "6", sourceQuote: "Number of cylinders 6", part: "engine", status: "met" }], suppliers: [] });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "keep-web-"));
const runDir = () => { const d = tmp(); fs.mkdirSync(path.join(d, "web")); fs.writeFileSync(path.join(d, "web", "1.txt"), PAGE); return d; };
const opts = (root, sourcesDir, over = {}) => ({ suppliers: [], origin: "all", hsmtText: HSMT, readWeb: savedReader({ root, sourcesDir }), ...over });

test("savePages: a page no supplier source has is copied to config-web; pages no configuration uses are removed", () => {
  const dir = runDir(), root = tmp(), sourcesDir = tmp();
  const r = { configs: [webCfg(2)] };
  const s = savePages(r, dir, { key: "IB1", size: { kva: 400, cap: { value: 400, unit: "kVA" } }, root, sourcesDir });
  assert.deepEqual([s.saved, s.catalog, s.skipped.length], [1, 0, 0]);
  const saved = r.configs[0].engine.src.saved;
  assert.match(saved, /^IB1\/400kVA\/[0-9a-f]{12}\.txt$/);
  assert.equal(r.configs[0].genset.src.saved, saved, "one page, one file");
  assert.equal(r.configs[0].webRank, 2);
  assert.equal(fs.readFileSync(path.join(root, saved), "utf8"), PAGE);
  // The next run chose nothing from that page: the file goes.
  savePages({ configs: [] }, dir, { key: "IB1", size: { kva: 400, cap: { value: 400, unit: "kVA" } }, root, sourcesDir });
  assert.ok(!fs.existsSync(path.join(root, saved)));
});

test("savePages: a page a supplier record already has (same URL, holding the quote) is that source, no copy", () => {
  const dir = runDir(), root = tmp(), sourcesDir = tmp();
  fs.mkdirSync(path.join(sourcesDir, "maker")); fs.writeFileSync(path.join(sourcesDir, "maker", "7.md"), PAGE);
  // The same URL saved twice, the first read apart without the quote.
  fs.writeFileSync(path.join(sourcesDir, "maker", "3.md"), `URL: ${URL1}\n\nEngine P 158 LE`);
  const sups = [{ id: "maker", sources: [{ n: 3, url: URL1 }, { n: 7, url: `${URL1}/` }] }];
  assert.deepEqual(catalogPageOf(sups, URL1, sourcesDir, "Engine ref. P158LE"), { supplierId: "maker", n: 7 });
  const r = { configs: [webCfg(1)] };
  const s = savePages(r, dir, { key: "IB1", suppliers: sups, root, sourcesDir });
  assert.deepEqual([s.saved, s.catalog], [0, 2]);
  assert.deepEqual(r.configs[0].engine.src.saved, { supplierId: "maker", n: 7 });
  assert.ok(!fs.existsSync(path.join(root, "IB1")));
});

test("savedReader reads only config-web and supplier sources", () => {
  const root = tmp(), sourcesDir = tmp();
  fs.mkdirSync(path.join(root, "IB1", "all"), { recursive: true }); fs.writeFileSync(path.join(root, "IB1", "all", "a.txt"), "x");
  const rd = savedReader({ root, sourcesDir });
  assert.equal(rd("saved:IB1/all/a.txt"), "x");
  assert.equal(rd("saved:../../etc/passwd"), null);
  assert.equal(rd("catalog:../x/1"), null);
  assert.equal(rd("web/1.txt"), null);
});

test("keepFound: a configuration found on the internet (1st–3rd) comes back, checked against its saved page", () => {
  const dir = runDir(), root = tmp(), sourcesDir = tmp();
  const prev = { requirements: reqs(), configs: [webCfg(1)] };
  savePages(prev, dir, { key: "IB1", root, sourcesDir });
  const fresh = { requirements: reqs(), configs: [] };
  const k = keepFound(fresh, prev, opts(root, sourcesDir));
  assert.equal(k.web, 1);
  const c = fresh.configs[0];
  assert.ok(c.keptWeb && c.webRank === 1 && !c.fromFind);
  assert.equal(c.engine.src.file, `saved:${prev.configs[0].engine.src.saved}`);
  assert.ok(!c.engine.unverified);
  assert.equal(c.checks.find((x) => x.item === "Số xi lanh").status, "met");
  assert.ok(fresh.notes.some((n) => /internet/.test(n)));
  // A later run that does not choose it keeps it again, once.
  const again = { requirements: reqs(), configs: [] };
  keepFound(again, fresh, opts(root, sourcesDir));
  assert.equal(again.configs.filter((x) => x.engine.model === "P158LE").length, 1);
  assert.equal(again.configs[0].webRank, 1);
});

test("keepFound: the engine's page saved nowhere: not kept; 4th or later, or chosen again, is not kept; at most 2 a size", () => {
  const root = tmp(), sourcesDir = tmp();
  const prev = { requirements: reqs(), configs: [webCfg(1)] };
  const fresh = { requirements: reqs(), configs: [] };
  const k = keepFound(fresh, prev, opts(root, sourcesDir));
  assert.equal(fresh.configs.length, 0);
  assert.ok(!fresh.notes);
  assert.ok(k.dropped.some((d) => /trang nguồn của động cơ/.test(d)));
  savePages(prev, runDir(), { key: "IB1", root, sourcesDir });
  // Only the alternator's (here the genset's) page missing: kept, those checks unclear as ever.
  const half = JSON.parse(JSON.stringify(prev)); half.configs[0].genset.src.saved = "IB1/all/none.txt";
  const fh = { requirements: reqs(), configs: [] };
  keepFound(fh, half, opts(root, sourcesDir));
  assert.equal(fh.configs.length, 1);
  assert.ok(fh.configs[0].genset.unverified && !fh.configs[0].engine.unverified);
  const four = { requirements: reqs(), configs: [webCfg(4)] }, f2 = { requirements: reqs(), configs: [] };
  assert.equal(keepFound(f2, four, opts(root, sourcesDir)).web || 0, 0);
  const same = { requirements: reqs(), configs: [webCfg(1)] };
  assert.equal(keepFound(same, prev, opts(root, sourcesDir)).web || 0, 0);
  const many = { requirements: reqs(), configs: [webCfg(1, "A1"), webCfg(2, "B2"), webCfg(3, "C3")] }, f3 = { requirements: reqs(), configs: [] };
  savePages(many, runDir(), { key: "IB1", size: { kva: 1, cap: { value: 1, unit: "kVA" } }, root, sourcesDir });
  assert.equal(keepFound(f3, many, opts(root, sourcesDir)).web, 2);
  assert.deepEqual(f3.configs.map((c) => c.engine.model).sort(), ["A1", "B2"]);
});

test("keepFound: the HSMT read otherwise than last time: kept with a gap", () => {
  const root = tmp(), sourcesDir = tmp();
  const prev = { requirements: reqs(), reqHash: "a", configs: [webCfg(1)] }, fresh = { requirements: reqs(), configs: [] };
  savePages(prev, runDir(), { key: "IB1", root, sourcesDir });
  keepFound(fresh, prev, opts(root, sourcesDir, { reqHash: "b" }));
  assert.ok(fresh.configs[0].gaps.some((g) => /lần đọc HSMT trước/.test(g)));
});

test("restoreWeb: an older result's internet configuration put back into a copy of the current one, size by size", () => {
  const dir = runDir(), root = tmp(), sourcesDir = tmp();
  const cap = { value: 400, unit: "kVA" }, old = { sizes: [{ cap, kva: 400, label: "400 kVA", result: { requirements: reqs(), configs: [webCfg(1)] } }] };
  savePages(old.sizes[0].result, dir, { key: "IB1", root, sourcesDir });
  const cur = { sizes: [{ cap, kva: 400, label: "400 kVA", result: { requirements: reqs(), configs: [] } }] };
  const { result, lines } = restoreWeb(cur, old, { hsmtText: HSMT, root, sourcesDir });
  assert.equal(cur.sizes[0].result.configs.length, 0, "the current result is not changed");
  assert.equal(result.sizes[0].result.configs[0].engine.model, "P158LE");
  assert.ok(lines.some((l) => /máy 400 kVA: #1 P158LE/.test(l)));
});
