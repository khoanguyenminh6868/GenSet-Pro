// node --test suppliers/*.test.mjs — "tra một lần, dùng lại cho mọi gói" (Khoa 2026-11-12, phương án B):
// cờ `official` của trang internet (tính bằng code) và kho kết quả âm (chỉ ghi khi log của lượt có dấu vết).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as M from "./web-memo.mjs";
import { catalogRecords, catalogMd, hintsOf, recordSearched, runModels, check } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "web-memo-test-"));
const line = (o) => `[12s] ${JSON.stringify(o)}`;
const use = (id, name, input) => line({ type: "assistant", message: { content: [{ type: "tool_use", id, name, input }] } });
const res = (id, content, is_error = false) => line({ type: "user", message: { content: [{ type: "tool_result", tool_use_id: id, content, is_error }] } });
const R = "https://www.powersystems.rehlko.com/sea/wp-content/uploads/d-series";
// What run IB2600594596-2 did (2026-11-12): two searches, a curl loop answered 403, a second try with a User-Agent the
// permission check refused, two pages saved from resellers.
const LOG = [
  use("a", "WebSearch", { query: "Rehlko D440 datasheet" }), res("a", "Web search results ..."),
  use("b", "Bash", { command: `for s in 0525 0226; do code=$(curl -s -o /dev/null -w "%{http_code}" "${R}/d440-$s.pdf"); echo "$s $code"; done` }), res("b", "0525 403\n0226 403\n"),
  use("c", "Bash", { command: `curl -s -A "Mozilla/5.0" "${R}/d440-1023.pdf"` }), res("c", "Permission for this action was denied by the Claude Code auto mode classifier.", true),
  use("d", "Bash", { command: `cd "x"; node "C:\\x\\config-bot.mjs" save --dir . --url "https://cdn.shopify.com/s/files/D440.pdf" 2>&1 | tail -5` }), res("d", "web/1.txt\n"),
  use("e", "WebFetch", { url: "https://www.hd-ce.com/en/engines/p158le", prompt: "fuel" }), res("e", "page text"),
].join("\n");
const cummins = { id: "cummins-x", role: "engine_maker", country: "US", website: "https://www.cummins.com/", names: { en: "Cummins Inc." }, sources: [] };
const rehlko = { id: "rehlko", role: "genset_oem", country: "US", website: "https://www.powersystems.rehlko.com/", names: { en: "Discovery Energy, LLC dba Rehlko", brands: ["Rehlko", "Kohler"] },
  sources: [{ n: 2002, url: "https://origin-sea.rehlko.com/sea/wp-content/uploads/controller/apm403-controller.pdf", tier: "A" }] };
const doosan = { id: "hd-hyundai-infracore", role: "engine_maker", country: "KR", website: "https://www.hd-ce.com/", names: { en: "HD Hyundai Infracore (Doosan engines)" }, sources: [] };
const models = (o = {}) => Object.fromEntries(M.PARTS.map((p) => [p, new Set((o[p] || []).map((m) => C.keyOf(m)))]));
const TODAY = "2026-11-12";

test("traceOf: searches, each URL of a loop with its status, a saved page; a refused call is no fetch", () => {
  const t = M.traceOf(LOG);
  assert.ok(t.searches.has("rehlko d440 datasheet"));
  assert.deepEqual(t.fetched.get(`${R}/d440-0525.pdf`), { status: 403, saved: null });
  assert.equal(t.fetched.get(`${R}/d440-0226.pdf`).status, 403);
  assert.ok(!t.fetched.has(`${R}/d440-1023.pdf`));
  assert.deepEqual(t.fetched.get("https://cdn.shopify.com/s/files/D440.pdf"), { status: 200, saved: "web/1.txt" });
  assert.ok(t.fetched.has("https://www.hd-ce.com/en/engines/p158le"));
});

test("official domain: the maker's own site (and its tier A hosts), never a reseller, a CDN or another maker", () => {
  const pool = [rehlko, doosan];
  assert.equal(M.domainOf("https://www.isuzu.co.jp/x"), "isuzu.co.jp");
  assert.equal(M.domainOf("https://www.dcec.com.cn/"), "dcec.com.cn");
  assert.ok(M.isOfficial(`${R}/d440-0525.pdf`, rehlko, pool));
  assert.ok(M.isOfficial("https://origin-sea.rehlko.com/a.pdf", rehlko, pool));
  assert.ok(!M.isOfficial("https://cdn.shopify.com/s/files/D440.pdf", rehlko, pool));
  assert.ok(!M.isOfficial("https://www.hd-ce.com/x.pdf", rehlko, pool));
  assert.ok(M.officialForMake(`${R}/d440-0525.pdf`, "Kohler", pool));
  assert.ok(!M.officialForMake("https://tech-expo.ru/P158LE_1.pdf", "Doosan", pool));
});

test("catalogRecords: each new source gets `official` from code, whatever tier the agent wrote", () => {
  const pages = { "web/1.txt": "URL: https://cdn.shopify.com/s/files/D440.pdf\nAccessed: 2026-11-12\n\nD440", "web/2.txt": `URL: ${R}/d440-0525.pdf\nAccessed: 2026-11-12\n\nD440` };
  const [x] = catalogRecords([{ id: "rehlko", sources: [{ n: 1, file: "web/1.txt", tier: "A", quote: ["D440"] }, { n: 2, file: "web/2.txt", tier: "A", quote: ["D440"] }] }],
    { existing: new Map([["rehlko", { ...rehlko, sources: [...rehlko.sources] }], ["hd-hyundai-infracore", doosan]]), readWeb: (f) => pages[f], today: TODAY });
  const added = x.rec.sources.filter((s) => s.n > 2002);
  assert.deepEqual(added.map((s) => [s.url, s.official]), [["https://cdn.shopify.com/s/files/D440.pdf", false], [`${R}/d440-0525.pdf`, true]]);
  // A new supplier: its own website counts.
  const [y] = catalogRecords([{ id: "depco-x", role: "genset_oem", country: "CN", website: "https://www.depcogenerator.com/", names: { en: "Depco" }, sources: [{ n: 1, file: "web/3.txt", tier: "A", quote: ["DPK"] }] }],
    { existing: new Map(), readWeb: () => "URL: https://www.depcogenerator.com/p252.html\nAccessed: 2026-11-12\n\nDPK", today: TODAY });
  assert.equal(y.rec.sources[0].official, true);
});

test("catalog.md: a figure found on the internet says whether its page is the maker's; the figure is used as before", () => {
  const src = (n, url) => ({ n, url, accessedAt: TODAY, tier: "C", quote: "x", file: `sources/x/${n}.md` });
  const maker = { ...cummins, confidence: "medium", sources: [src(2001, "https://tech-expo.ru/NTA855_1.pdf")], specTables: [{ n: 2001, title: "Datasheet NTA855-G2A", rows: ["| Displacement | 14.62 L |"] }] };
  const asm = { id: "asm", country: "CN", role: "genset_oem", confidence: "high", specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["| A-400 | 400 | 320 | NTA855-G2A | HCI444F |"] }] };
  const list = [maker, asm];
  const { md } = catalogMd(C.build(list), { value: 400, unit: "kVA" }, hintsOf("Tần số 50 Hz"), { suppliers: list, origin: "all" });
  const f = md.split("\n").find((l) => /14\.62/.test(l) && /factSrc/.test(l));
  assert.ok(f, "the figure is listed");
  assert.match(f, /trang không phải của hãng/);
  const off = catalogMd(C.build([{ ...maker, sources: [src(2001, "https://www.cummins.com/nta855.pdf")] }, asm]), { value: 400, unit: "kVA" }, hintsOf("Tần số 50 Hz"), { suppliers: [{ ...maker, sources: [src(2001, "https://www.cummins.com/nta855.pdf")] }, asm], origin: "all" }).md;
  assert.match(off.split("\n").find((l) => /14\.62/.test(l) && /factSrc/.test(l)), /trang chính hãng/);
});

test("recordNegatives: kept only with a trace in the log, the run's model key to key, blocked only with 401/403/429", () => {
  const t = M.traceOf(LOG), m = models({ genset: ["D440"], engine: ["P158LE"] });
  const base = { part: "genset", model: "D440", make: "Kohler", what: "datasheet" };
  const ok = M.recordNegatives([], [{ ...base, where: [`${R}/d440-0525.pdf`, `${R}/d440-0226.pdf`], outcome: "blocked" }], { trace: t, models: m, today: TODAY, tender: "IB1", suppliers: [rehlko] });
  assert.equal(ok.added.length, 1);
  assert.equal(ok.added[0].official, true);
  assert.deepEqual(ok.added[0].hosts, ["rehlko.com"]);
  const refused = (s) => M.recordNegatives([], [s], { trace: t, models: m, today: TODAY }).refused;
  // No trace: the refused User-Agent try, a query never run, a URL never fetched.
  assert.equal(refused({ ...base, where: [`${R}/d440-1023.pdf`], outcome: "blocked" }).length, 1);
  assert.equal(refused({ ...base, where: ["kohler d440 pdf"], outcome: "not_found" }).length, 1);
  // Blocked without a 403 in the log; not_found for a datasheet a page of which was saved.
  assert.equal(refused({ ...base, where: ["https://www.hd-ce.com/en/engines/p158le"], outcome: "blocked" }).length, 1);
  assert.equal(refused({ ...base, where: ["https://cdn.shopify.com/s/files/D440.pdf"], outcome: "not_found" }).length, 1);
  // A model not of this run, or not the same key (D44 ≠ D440); the same characters spaced differently are the same key.
  assert.equal(refused({ ...base, model: "D44", where: ["Rehlko D440 datasheet"], outcome: "not_found" }).length, 1);
  assert.equal(refused({ ...base, model: "D330", where: ["Rehlko D440 datasheet"], outcome: "not_found" }).length, 1);
  assert.equal(M.recordNegatives([], [{ ...base, model: "d-440", where: ["Rehlko D440 datasheet"], outcome: "not_found" }], { trace: t, models: m, today: TODAY }).added.length, 1);
  // A figure of the engine on the maker's site.
  const fig = M.recordNegatives(ok.entries, [{ part: "engine", model: "P158LE", what: "fuel75", where: ["https://www.hd-ce.com/en/engines/p158le"], outcome: "not_found" }], { trace: t, models: m, today: TODAY });
  assert.equal(fig.entries.length, 2);
  // The same (part, model, what) again: one entry, the newer.
  const again = M.recordNegatives(fig.entries, [{ ...base, where: ["Rehlko D440 datasheet"], outcome: "not_found" }], { trace: t, models: m, today: "2026-11-20" });
  assert.equal(again.entries.filter((e) => e.modelKey === "D440").length, 1);
  assert.equal(again.entries.find((e) => e.modelKey === "D440").date, "2026-11-20");
});

test("90 days, then gone; the store keeps its size; forget by model", () => {
  const e = (date, model = "D440") => ({ part: "genset", model, modelKey: C.keyOf(model), what: "datasheet", outcome: "not_found", where: ["q"], hosts: [], date, tender: "" });
  assert.ok(M.isLive(e("2026-08-15"), TODAY));
  assert.ok(!M.isLive(e("2026-08-14"), TODAY));
  assert.equal(M.negativesFor([e("2026-08-14"), e("2026-11-01")], "genset", "D440", TODAY).length, 1);
  const dir = tmp();
  const kept = M.saveNeg([e("2026-01-01"), ...Array.from({ length: M.NEG_MAX + 5 }, (_, i) => e("2026-11-01", `M${i}`))], dir, TODAY);
  assert.equal(kept.length, M.NEG_MAX);
  assert.ok(fs.statSync(path.join(dir, "negative.json")).size <= M.NEG_BYTES);
  assert.equal(M.loadNeg(dir).length, M.NEG_MAX);
  const f = M.forget([e("2026-11-01"), e("2026-11-01", "D330")], "d 440");
  assert.equal(f.removed, 1);
  assert.deepEqual(f.entries.map((x) => x.model), ["D330"]);
});

test("catalog.md section: not found → do not search again, unclear as when silent; blocked → never try again", () => {
  const t = M.traceOf(LOG), m = models({ genset: ["D440"], engine: ["P158LE"] });
  const { entries } = M.recordNegatives([], [
    { part: "genset", model: "D440", what: "datasheet", where: [`${R}/d440-0525.pdf`], outcome: "blocked" },
    { part: "engine", model: "P158LE", what: "fuel75", where: ["https://www.hd-ce.com/en/engines/p158le"], outcome: "not_found" },
  ], { trace: t, models: m, today: TODAY });
  const md = M.negativesMd(entries, [{ part: "genset", model: "D440" }, { part: "engine", model: "P158LE" }, { part: "engine", model: "QSZ13-G3" }], TODAY);
  assert.match(md, /## Đã tra trên mạng ở lượt trước/);
  assert.match(md, /### Tổ máy D440\n- datasheet trên rehlko\.com .*chặn tải tự động .*HTTP 403.*KHÔNG thử lại, không đổi User-Agent, không tìm bản sao để lách/);
  assert.match(md, /### Động cơ P158LE\n- fuel75: đã tra ngày 2026-11-12, không tìm thấy .*đừng tra lại; ghi trạng thái như khi nguồn không ghi/);
  assert.ok(!/QSZ13/.test(md));
  assert.equal(M.negativesMd(entries, [{ part: "genset", model: "D440" }], "2027-03-01"), "");
});

test("recordSearched (answer): takes result.searched out, keeps what the log shows, models of catalog.md and of the configurations", () => {
  const dir = tmp();
  const result = { configs: [{ genset: { model: "D440" }, engine: { model: "P158LE" } }], searched: [
    { part: "genset", model: "D440", what: "datasheet", where: [`${R}/d440-0525.pdf`], outcome: "blocked" },
    { part: "engine", model: "P158LE", what: "fuel75", where: ["https://never.example/x"], outcome: "not_found" }] };
  const r = recordSearched(result, { logText: LOG, listed: [], root: dir, today: TODAY, tender: "IB1", suppliers: [rehlko] });
  assert.equal(result.searched, undefined);
  assert.equal(r.added.length, 1);
  assert.equal(r.refused.length, 1);
  assert.equal(M.loadNeg(dir)[0].tender, "IB1");
  // Nothing declared: nothing written.
  const dir2 = tmp();
  recordSearched({ configs: [] }, { logText: LOG, root: dir2, today: TODAY });
  assert.ok(!fs.existsSync(path.join(dir2, "negative.json")));
});

test("runModels: the candidate rows' engines, alternators, gensets and controllers once each", () => {
  const top = [{ e: { model: "P158LE" }, a: { model: "HCI444F" }, u: { genset: "A-400" }, rowCtrl: [{ model: "DSE7320" }] }, { e: { model: "p 158le" }, a: null, u: {}, rowCtrl: [] }];
  assert.deepEqual(runModels(top), [{ part: "engine", model: "P158LE" }, { part: "alternator", model: "HCI444F" }, { part: "genset", model: "A-400" }, { part: "controller", model: "DSE7320" }]);
});

test("a later run reads the saved page again through check(): an internet figure added to the catalog is quoted by factSrc", () => {
  // The positive path is the supplier DB (newCatalog → addToCatalog): a figure of a page added by an earlier run is a
  // fact of the model for every tender, checked against the record's table as any other.
  const maker = { ...cummins, confidence: "medium", sources: [{ n: 2001, url: "https://www.cummins.com/nta855.pdf", accessedAt: TODAY, tier: "A", quote: "x", file: "sources/x/2001.md" }],
    specTables: [{ n: 2001, title: "Datasheet NTA855-G2A", rows: ["| Displacement | 14.62 L |"] }] };
  const asm = { id: "asm", country: "CN", role: "genset_oem", confidence: "high", specTables: [{ n: 101, title: "Gensets 50Hz", header: ["| Model | Prime kVA | Prime kW | Engine | Alternator |"], rows: ["| A-400 | 400 | 320 | NTA855-G2A | HCI444F |"] }] };
  const HSMT = "Chương V. Yêu cầu kỹ thuật\nDung tích xi lanh ≥ 14 L";
  const result = { requirements: [{ code: "displacement", item: "Dung tích xi lanh", requirement: "≥ 14 L", quote: "Dung tích xi lanh ≥ 14 L", part: "engine", level: "core" }],
    configs: [{ rank: 1, engine: { model: "NTA855-G2A", src: { kind: "catalog", supplierId: "asm", n: 101, line: "| A-400 | 400 | 320 | NTA855-G2A | HCI444F |" } },
      genset: { model: "A-400", src: { kind: "catalog", supplierId: "asm", n: 101, line: "| A-400 | 400 | 320 | NTA855-G2A | HCI444F |" } },
      checks: [{ item: "Dung tích xi lanh", requirement: "≥ 14 L", hsmtQuote: "Dung tích xi lanh ≥ 14 L", offered: "14.62 L", sourceQuote: "| Displacement | 14.62 L |", part: "engine", status: "met",
        factSrc: { supplierId: "cummins-x", n: 2001, line: "| Displacement | 14.62 L |" } }],
      suppliers: [{ supplierId: "asm", n: 101, line: "| A-400 | 400 | 320 | NTA855-G2A | HCI444F |" }] }] };
  const { result: out } = check(result, { hsmtText: HSMT, suppliers: [maker, asm], readWeb: () => null, origin: "all" });
  const x = out.configs[0].checks.find((c) => /Dung tích/.test(c.item));
  assert.equal(x.status, "met", JSON.stringify(x));
});

// Run IB2600601812 (2026-11-12): two WebSearch about the Hyundai DHY110KSE the HSMT names, nothing fetched, no source fit.
const LOG_SRC = [
  use("s1", "WebSearch", { query: "hyundai dhy110kse diesel generator 100kva datasheet engine alternator" }), res("s1", "results"),
  use("s2", "WebSearch", { query: "hyundai diesel generator dhy series manufacturer china factory oem hyundai power equipment generator made in china" }), res("s2", "results"),
].join("\n");
const HSMT = "Tổ máy phát điện Hyundai model DHY110KSE, công suất 100 kVA, 50 Hz";
const SRC = { part: "genset", model: "DHY110KSE", make: "Hyundai", what: "source", outcome: "not_found",
  where: ["hyundai dhy110kse diesel generator 100kva datasheet engine alternator", "hyundai diesel generator dhy series manufacturer china factory oem hyundai power equipment generator made in china"] };

test('what "source": a model the HSMT names (not a candidate) is kept with the run origin; same origin only', () => {
  const dir = tmp();
  const none = recordSearched({ configs: [], searched: [SRC] }, { logText: LOG_SRC, listed: [], root: dir, today: TODAY, origin: "cn" });
  assert.equal(none.added.length, 0, "no HSMT text → not a model of the run");
  const r = recordSearched({ configs: [], searched: [SRC] }, { logText: LOG_SRC, listed: [], root: dir, today: TODAY, tender: "IB2600601812", origin: "cn", hsmtText: HSMT });
  assert.equal(r.added.length, 1, r.refused.join(";"));
  const e = M.loadNeg(dir)[0];
  assert.equal(e.what, "source"); assert.equal(e.origin, "cn"); assert.equal(e.modelKey, "DHY110KSE");
  const neg = M.loadNeg(dir), pick = (origin) => M.negativesMd(neg, [], TODAY, { origin, hsmtText: HSMT });
  assert.match(pick("cn"), /### Tổ máy DHY110KSE\n- nguồn dùng được .*điều kiện nhà cung cấp đặt tại Trung Quốc.*đừng tra lại/);
  assert.equal(pick("g7"), "", "another origin is searched anew");
  assert.equal(M.negativesMd(neg, [], TODAY, { origin: "cn", hsmtText: "Hyundai khác" }), "", "model not in this HSMT");
  // Another origin is another entry, the same origin replaces.
  const g = M.recordNegatives(neg, [SRC], { trace: M.traceOf(LOG_SRC), models: models(), today: TODAY, origin: "g7", hsmtKeys: M.modelKeysOf(HSMT) });
  assert.equal(g.entries.length, 2);
  const c = M.recordNegatives(g.entries, [SRC], { trace: M.traceOf(LOG_SRC), models: models(), today: "2026-11-20", origin: "cn", hsmtKeys: M.modelKeysOf(HSMT) });
  assert.equal(c.entries.length, 2);
});

test('what "source": still needs the trace, not_found only, and a model the HSMT names', () => {
  const k = M.modelKeysOf(HSMT), t = M.traceOf(LOG_SRC);
  assert.ok(k.has("DHY110KSE"));
  assert.equal(M.recordNegatives([], [{ ...SRC, where: ["a query never run"] }], { trace: t, models: models(), today: TODAY, origin: "cn", hsmtKeys: k }).added.length, 0);
  assert.equal(M.recordNegatives([], [{ ...SRC, outcome: "blocked" }], { trace: t, models: models(), today: TODAY, origin: "cn", hsmtKeys: k }).added.length, 0);
  assert.equal(M.recordNegatives([], [{ ...SRC, model: "XYZ999" }], { trace: t, models: models(), today: TODAY, origin: "cn", hsmtKeys: k }).added.length, 0);
  // "datasheet" is not widened to HSMT models.
  assert.equal(M.recordNegatives([], [{ ...SRC, what: "datasheet" }], { trace: t, models: models(), today: TODAY, origin: "cn", hsmtKeys: k }).added.length, 0);
});
