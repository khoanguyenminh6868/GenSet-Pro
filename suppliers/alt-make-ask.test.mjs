// node --test suppliers/*.test.mjs — Khoa quyết 23/11/2026 về baifa:
// (1) "Standby KVA | Prime KVA" dưới tiêu đề phủ "POWER": đơn vị của CẢ hai mức nằm ở tiêu đề con của chính cột nên cặp
//     prime = 0,8 × standby không bị coi là một cặp kVA / kW (không veto). Tiêu đề phủ mang đơn vị thì vẫn veto như cũ.
// (2) Mã đầu phát thuộc họ của một hãng dưới tiêu đề cột của hãng khác: không tin bên nào, dòng giữ, hãng của cột rời bản
//     ghi, `makeAsk` ghi "mã … dưới cột …"; Gợi ý không cộng điểm theo hãng và hạ check hãng đầu phát về "cần xác nhận".
// Mỗi ca là dòng thật trong suppliers/cn (NCC, số bảng n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";
import { altMakeAskOf, altMakeAskChecks, candidates, hintsOf } from "./config-bot.mjs";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const names = (r) => (r.makes || []).map((m) => m.name);

const BAIFA = sup("baifa-power", [{ n: 101, title: "", header: [
  "| BAIFA MODEL | POWER | DIESEL ENGINE | ALTERNATOR | Emission | ENGINE MANUFACTURER / COUNTRY",
  "| Standby KVA | Prime KVA | Brand | Model | Gov. | STAMFORD"], rows: [
  "| BF-C2750Q-T2 | 2750 | 2500 | QSK60-G23 | | S7L1D-J41 | TIER 2/ CHINA STAGE3 | UK/ CCEC",
  "| BF-C3000Q-T2 | 3000 | 2750 | QSK78-G15 | | LSA52.3 UL16 | TIER 2/ CHINA STAGE3 | UK",
  "| BF-BD38-T3 | 37.5 | 30 | 4M08G8D3/5 | | STAGE 3A/ CHINA STAGE3 | CHINA"] }]);
const PENLUCKY = sup("penlucky", [{ n: 103, title: "Weichai Generator | Penlucky", header: [
  "| | Penlucky Model | Standby kVA | Prime kVA | Engine Model | Alternator Leroy-Somer | Dimension mm Open Type | Soundproof Type | Data PDF"], rows: [
  "| PLW2500B73 | 2500 | 2272 | 20M33G2000/6 | PI734E1 | 7010*2680*2980 | | view"] }]);

test("baifa n101: 37.5 / 30 dưới 'Standby KVA | Prime KVA' là standby 37,5 kVA và prime 30 kVA, không gộp thành 37,5 kVA / 30 kW", () => {
  const e = C.fromSupplier(BAIFA, []).find((r) => r.kind === "engine" && r.model === "4M08G8D3/5");
  assert.deepEqual(e.power, { standby: { kVA: 37.5 }, prime: { kVA: 30 } });
});

test("tiêu đề phủ mang đơn vị ('Power kVA' trên 'Standby | Prime'): cặp 0,8 vẫn bị veto như trước", () => {
  const s = sup("x", [{ n: 1, title: "", header: ["| Model | Power kVA | Engine", "| Standby | Prime | Model"], rows: ["| G38 | 37.5 | 30 | 4M08G8D3/5"] }]);
  const e = C.fromSupplier(s, []).find((r) => r.kind === "engine");
  assert.ok(!e?.power?.prime || e.power.prime.kVA !== 30 || !e.power.standby, JSON.stringify(e?.power));
});

test("baifa n101: 'LSA52.3 UL16' dưới cột STAMFORD → không hãng, makeAsk; 'S7L1D-J41' cùng cột giữ Stamford", () => {
  const alts = C.fromSupplier(BAIFA, []).filter((r) => r.kind === "alternator");
  const lsa = alts.find((r) => r.model === "LSA52.3 UL16"), st = alts.find((r) => r.model === "S7L1D-J41");
  assert.deepEqual(names(lsa), []);
  assert.equal(lsa.makeAsk, "mã LSA52.3 UL16 dưới cột Stamford");
  assert.deepEqual(names(st), ["Stamford"]);
  assert.equal(st.makeAsk, undefined);
});

test("penlucky n103: 'PI734E1' dưới cột 'Alternator Leroy-Somer' → không hãng, makeAsk (không gán Stamford theo tiền tố)", () => {
  const a = C.fromSupplier(PENLUCKY, []).find((r) => r.kind === "alternator");
  assert.equal(a.model, "PI734E1");
  assert.deepEqual(names(a), []);
  assert.equal(a.makeAsk, "mã PI734E1 dưới cột Leroy-Somer");
});

test("build(): dòng có cờ không còn bỏ phiếu hãng của cột; khoá đầu phát không tự nhận hãng theo tiền tố", () => {
  const cat = C.build([BAIFA, PENLUCKY]);
  const lsa = cat.alternators.find((a) => a.model === "LSA52.3 UL16"), pi = cat.alternators.find((a) => a.model === "PI734E1");
  assert.equal(lsa.make, null);
  assert.equal(pi.make, null);
  assert.equal(cat.alternators.find((a) => a.model === "S7L1D-J41").make, "Stamford");
});

test("candidates: dòng có cờ ghi 'cần xác nhận hãng đầu phát', không cộng điểm 'đầu phát HSMT nêu' theo hãng", () => {
  // Một NCC khác ghi cùng mã dưới cột Leroy-Somer: khoá có hãng Leroy-Somer (từ nguồn đó), nhưng dòng baifa vẫn là "cần xác nhận".
  const other = sup("other", [{ n: 1, title: "", header: ["| Model | Standby kVA | Prime kVA | Engine Model | Alternator Leroy-Somer"], rows: ["| X3000 | 3000 | 2750 | QSK78-G15 | LSA52.3 UL16"] }]);
  const S = [BAIFA, other], cat = C.build(S);
  assert.equal(cat.alternators.find((a) => a.model === "LSA52.3 UL16").make, "Leroy-Somer");
  const hints = hintsOf(["Chương V. Yêu cầu kỹ thuật", "Tần số 50 Hz", "Đầu phát: hãng Stamford hoặc Leroy-Somer"].join("\n"));
  assert.deepEqual([...hints.altMakes].sort(), ["Leroy-Somer", "Stamford"]);
  const rows = candidates(cat, { value: 2750, unit: "kVA" }, hints, { suppliers: S, makeCap: 0 }).top;
  const b = rows.find((r) => r.u.supplierId === "baifa-power" && r.u.genset === "BF-C3000Q-T2"), o = rows.find((r) => r.u.supplierId === "other");
  assert.equal(b.altAsk, "mã LSA52.3 UL16 dưới cột Stamford");
  assert.ok(b.why.includes("cần xác nhận hãng đầu phát (NCC ghi mã LSA52.3 UL16 dưới cột Stamford)"), b.why.join(" | "));
  assert.ok(!b.why.includes("đầu phát HSMT nêu"));
  assert.ok(o.why.includes("đầu phát HSMT nêu") && !o.altAsk);
  assert.equal(altMakeAskOf(b.a, o.u), null);
});

test("altMakeAskChecks: check hãng đầu phát đang đạt → cần xác nhận, bỏ make agent ghi; chạy lại sau confirmChecks vẫn vậy; dòng không cờ không đổi", () => {
  const cat = C.build([BAIFA]);
  const row = cat.engines.find((e) => e.model === "QSK78-G15").uses[0], plain = cat.engines.find((e) => e.model === "QSK60-G23").uses[0];
  const reqs = [{ code: "alt_make", item: "Hãng đầu phát", requirement: "Stamford hoặc tương đương" }];
  const c = { alternator: { model: "LSA52.3 UL16", make: "Stamford" }, checks: [{ item: "Hãng đầu phát", status: "met", note: "nguồn ghi Stamford" }] };
  altMakeAskChecks(c, reqs, row, cat);
  assert.equal(c.alternator.make, undefined);
  assert.equal(c.alternator.makeAsk, "mã LSA52.3 UL16 dưới cột Stamford");
  assert.deepEqual(c.checks[0], { item: "Hãng đầu phát", status: "confirm", confirm: "document", makeHold: "met", note: "nguồn ghi Stamford Code ghi: cần xác nhận hãng đầu phát, NCC ghi mã LSA52.3 UL16 dưới cột Stamford; không tin bên nào." });
  const once = JSON.stringify(c);
  c.checks[0].status = "unclear"; delete c.checks[0].confirm; // như confirmChecks làm ở lượt sau
  altMakeAskChecks(c, reqs, row, cat);
  assert.equal(JSON.stringify(c), once);
  const d = { alternator: { model: "S7L1D-J41", make: "Stamford" }, checks: [{ item: "Hãng đầu phát", status: "met", note: "nguồn ghi Stamford" }] }, was = JSON.stringify(d);
  altMakeAskChecks(d, reqs, plain, cat);
  assert.equal(JSON.stringify(d), was);
  const n = { alternator: { model: "LSA52.3 UL16" }, checks: [{ item: "Hãng đầu phát", status: "not_met" }] };
  altMakeAskChecks(n, reqs, row, cat);
  assert.equal(n.checks[0].status, "not_met");
  assert.match(n.checks[0].note, /cần xác nhận hãng đầu phát/);
});
