// node --test suppliers/*.test.mjs — số đông DUNG TÍCH (Khoa 19/11/2026, (c), cách gộp C6 của so-dong-dung-tich): NCC chép chung
// một bảng mẫu tính MỘT phiếu. Hai NCC là một phiếu khi có dòng cùng model với ô kích thước tổ máy giống hệt (không phải cỡ
// container ISO) VÀ cùng tập giá trị dung tích; hãng động cơ (role engine_maker) / datasheet hãng không bao giờ bị gộp.
// Dòng thật: suppliers/fixtures/so-dong-dung-tich.json (chép nguyên văn từ suppliers/cn 19/11/2026 bằng
// genbid-work\dieu-phoi\dau-vao\so-dong-dung-tich\fixture.mjs, mọi dòng có nhắc TAD1341GE, 6R1600G70F, 12V2000G25,
// S12R-PTA-C, TAD531GE, TAD1351GE).
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { candidates, hintsOf, modelFacts, dispVoters, majorityOf, normFig, useNormCtx, isContainerDims, BLOCK } from "./config-bot.mjs";

process.env.GENBID_SPEC_NORM = "1";
const C = globalThis.GenbidCatalog;
const SUPS = JSON.parse(fs.readFileSync(new URL("./fixtures/so-dong-dung-tich.json", import.meta.url), "utf8"));
const read = (f, ctx) => { const x = normFig(f, ctx, { unit: "L" }); return x.ok ? x.r.num ?? null : x.why.includes("value") ? null : BLOCK; };
const free = (text) => ({ ...hintsOf(`Chương V. Yêu cầu kỹ thuật\n${text}`), engineMakes: [], altMakes: [], ctrlMakes: [], ctrlModels: [] });
// `noMaker`: id của NCC coi như KHÔNG phải hãng (đối chứng): bỏ role và cờ `sheet` của số nó ghi, số vẫn giữ.
function engine(key, sups = SUPS, noMaker = null) {
  const cat = C.build(sups), facts = modelFacts(cat, sups), e = cat.engines.find((x) => x.key === key);
  let ef = facts.get(`engine:${key}`) || [];
  if (noMaker) ef = ef.map((f) => (f.supplierId === noMaker ? (({ sheet, ...g }) => g)(f) : f));
  const v = dispVoters(e, ef, { suppliers: new Map(sups.map((s) => [s.id, s.id === noMaker ? { ...s, role: undefined } : s])), read });
  const figs = [...ef.filter((f) => f.key === "disp").map((f) => [f.supplierId, read(f)])];
  for (const u of e.uses) for (const f of u.specs || []) if (f.key === "disp") figs.push([u.supplierId, read(f, useNormCtx(u))]);
  const groups = Object.values([...v].reduce((o, [s, r]) => ((o[r] ||= []).push(s), o), {})).filter((g) => g.length > 1).map((g) => g.sort());
  return { e, v, groups, before: majorityOf(figs), after: majorityOf(figs.map(([s, x]) => [v.get(s) ?? s, x])) };
}
const runOn = (sups, kva, text) => candidates(C.build(sups), { value: kva, unit: "kVA" }, free(text), { suppliers: sups });
const rowOf = (r, sid, eKey) => r.all.find((x) => x.u.supplierId === sid && x.e.key === eKey);
const dropOf = (r, sid, eKey) => r.dropped.find((x) => x.u.supplierId === sid && x.e.key === eKey);

test("isContainerDims: 20 / 30 / 40 ft ISO (và bản làm tròn) là container; vỏ máy thường thì không", () => {
  for (const k of ["6058*2438*2591", "6058*2438*2896", "12192*2438*2896", "12192*2438*2591", "9125*2438*2896", "6060*2440*2600", "12200*2440*2590", "6058*2438*3151"]) assert.ok(isContainerDims(k), k);
  for (const k of ["2900*1100*1600", "6150*2150*2400", "12000*2400*2900", "6050*2660*2870", "6360*2438*2600"]) assert.ok(!isContainerDims(k), k);
});

test("TAD1341GE (nhóm sai đã biết): 9,36 L (số của TAD941GE) bị bỏ ở 6 NCC (tad1341-9-36, Khoa 20/11/2026 \"bỏ 9,36 L\") → hết nhóm chép chung, hết phiếu 9,36", () => {
  // Đổi so với trước tad1341-9-36: bdadl / fukangsi / huatai / liangzi / pengpai cùng ô 2900*1100*1600 và cùng 9,36 L từng là MỘT phiếu
  // (groups = 5 NCC; đếm mỗi NCC một phiếu thì 9,36 thắng sai, đúng là 131×158×6 = 12,78 L). Nay ROW_EXCEPTIONS `dropspec` bỏ riêng dung tích của
  // các dòng đó (dòng vẫn ở lại, giữ số xi lanh), nên không còn số nào để gộp: nhóm rỗng, và còn đúng một nguồn dung tích (lees-power 12,78)
  // → không có giá trị thắng (cần ≥ 3 NCC). Hai khẳng định cũ (groups, before.win = 9,36) không còn đúng và được đổi theo hành vi mới.
  const t = engine("TAD1341GE");
  assert.deepEqual(t.groups, []);
  // buoc-4 PR A (24/11/2026): cột "排气量" (taihai-taizhou n111, yingtai-jiangsu n107, ...) nay đọc được → thêm phiếu 12,78 (= 131×158×6):
  // trước đó chỉ còn một nguồn (lees-power) nên không có số thắng; nay 3 phiếu 12,78, không còn số 9,36 nào.
  assert.deepEqual(t.before, { win: 12.78, votes: { 12.78: 3 }, blocked: 0 }, "hết 9,36: thắng 12,78 (3 phiếu)");
  assert.deepEqual(t.after, { win: 12.78, votes: { 12.78: 3 }, blocked: 0 });
  assert.equal(t.e.uses.find((u) => u.supplierId === "bdadl-shanghai")?.specs.find((s) => s.key === "disp"), undefined, "bdadl: dung tích bỏ");
  // HSMT ≥ 12 lít: không còn giá trị thắng → "mọi nguồn" như trước, dòng bdadl ở lại (lees / huipu ghi 12,78 / 1278).
  const r = runOn(SUPS, 312.5, "Dung tích xi lanh: ≥ 12 lít\n50 Hz");
  assert.ok(rowOf(r, "bdadl-shanghai", "TAD1341GE"), "dòng BDA-V250 ở lại");
  assert.equal(dropOf(r, "bdadl-shanghai", "TAD1341GE"), undefined);
});

test("MTU 6R1600G70F (nhóm sai đã biết): bộ ba bdadl / fukangsi / pengpai một phiếu → 8,2 × 3 : 10,5 × 1 hết thắng; HSMT ≥ 10 lít không loại dòng wintpower", () => {
  const t = engine("6R1600G70F");
  assert.deepEqual(t.groups, [["bdadl-shanghai", "fukangsi-yangzhou", "pengpai-yangzhou"]]);
  assert.deepEqual(t.before?.votes, { 8.2: 3, 10.5: 1 });
  assert.equal(t.after, null);
  const r = runOn(SUPS, 250, "Dung tích xi lanh: ≥ 10 lít\n50 Hz");
  const w = r.all.find((x) => x.u.supplierId === "wintpower" && x.e.key === "6R1600G70F");
  if (w) assert.ok(!w.ruled?.includes("disp"));
  assert.ok(!r.dropped.some((x) => x.u.supplierId === "wintpower" && x.e.key === "6R1600G70F" && x.ruled.includes("disp")), "wintpower 10,5 L không bị loại");
});

test("12V2000G25: frs-shenyang + tellhow-power chung ô container 6058*2438*2591 KHÔNG gộp; bộ ba ghi 21 L (số của 12V1600) một phiếu → 23,88 thắng", () => {
  const t = engine("12V2000G25");
  // Từ #941 (catalog R1 đọc bảng jinjia-power): jinjia + yunding cùng ô 4000*1650*2280 và cùng 23,88 → một phiếu (đúng C6).
  // buoc-4 PR A: cột "排气量" nay đọc được nên có thêm NCC ghi dung tích (haifeng-taizhou + taihai-taizhou thành một nhóm; kangwo-guangdong vào nhóm jinjia / yunding): nhóm theo luật ô kích thước + cùng tập giá trị sẵn có của `dispVoters`.
  assert.deepEqual(t.groups, [["bdadl-shanghai", "fukangsi-yangzhou", "pengpai-yangzhou"], ["haifeng-taizhou", "taihai-taizhou"], ["jinjia-power", "kangwo-guangdong", "yunding-jiangsu"]]);
  assert.notEqual(t.v.get("frs-shenyang"), t.v.get("tellhow-power"));
  const lines = (id) => SUPS.find((s) => s.id === id).specTables.flatMap((x) => x.rows).filter((l) => l.includes("12V2000G25")).join(" ");
  const box = /6058[*×xX]2438[*×xX]2591/;
  assert.ok(box.test(lines("frs-shenyang")) && box.test(lines("tellhow-power")), "fixture có ô container chung");
  assert.equal(t.before, null, "đếm mỗi NCC: 21 × 3 : 23,88 × 3+, không thắng");
  assert.deepEqual(t.after?.votes, { 21: 1, 23.88: 4 });
  // Trần dung tích ≤ 22 lít: dòng rise-power RMM515 (không tự ghi dung tích; facts của động cơ có cả 21 của bộ ba lẫn 23,88)
  // bị loại theo giá trị thắng 23,88, lý do ghi số phiếu. Trước: "mọi nguồn" không thoả (có nguồn 21 ≤ 22) → ở lại.
  const r = runOn(SUPS, 570, "Dung tích xi lanh: ≤ 22 lít\n50 Hz");
  const d = dropOf(r, "rise-power", "12V2000G25");
  assert.ok(d, "dòng RMM515 bị loại");
  assert.deepEqual(d.ruled, ["maxDisp"]);
  assert.deepEqual(d.src.maxDisp, { win: 23.88, votes: { 21: 1, 23.88: 4 }, group: [23.88], exact: 23.88 });
});

test("KD186FAE: koop-changzhou là hãng động cơ (engine_maker) → không gộp với gordon-power dù cùng ô kích thước và cùng dung tích", () => {
  const t = engine("KD186FAE");
  assert.equal(SUPS.find((s) => s.id === "koop-changzhou").role, "engine_maker");
  assert.notEqual(t.v.get("koop-changzhou"), t.v.get("gordon-power"));
  // Đối chứng: bỏ vai hãng của koop (và cờ datasheet hãng của các số nó ghi) thì hai NCC gộp. Một trong 4 chỗ của toàn bộ
  // suppliers/cn 19/11/2026 mà luật này có tác dụng (solo-scan.mjs: KD186FAE, 4BTA3.9-G2, 2206C-E13TAG2 / TAG3).
  const p = engine("KD186FAE", SUPS, "koop-changzhou");
  assert.equal(p.v.get("koop-changzhou"), p.v.get("gordon-power"));
});

test("TAD531GE: mất giá trị thắng (4,76 × 6 : 1,5 × 1 → bộ năm một phiếu) → về luật mọi nguồn như main", () => {
  const t = engine("TAD531GE");
  assert.equal(t.before?.win, 4.76);
  // buoc-4 PR A: các NCC khác ghi 4,76 ở cột "排气量" (ngoài bộ năm chép chung) → còn 3 phiếu 4,76 : 1 phiếu 1,5, vẫn thắng 4,76 (bộ năm vẫn một phiếu).
  assert.deepEqual(t.after, { win: 4.76, votes: { 1.5: 1, 4.76: 3 }, blocked: 0 });
});

test("TAD1351GE: giữ giá trị thắng 12,78 (fukangsi + pengpai gộp, còn 9 phiếu từ S8-2); dòng liangzi hết số 9,36 nên trần ≤ 11 lít không còn loại nó", () => {
  const t = engine("TAD1351GE");
  // Từ #941: jinjia-power 3100×1150×1600 và victory-generator 3100*1150*1600, cùng 12,78 → một phiếu (đúng C6).
  assert.deepEqual(t.groups, [["fukangsi-yangzhou", "pengpai-yangzhou"], ["jinjia-power", "victory-generator"]]);
  assert.equal(t.before?.win, 12.78);
  // Đổi so với trước tad1341-9-36: phiếu lẻ 9,36 × 1 của liangzi (số của TAD941GE) đã bị bỏ ở nguồn (ROW_EXCEPTIONS `dropspec`), nên chỉ còn 12,78.
  // S8-2 (Khoa 22/11/2026): tecnogen n2003 VO353TSX** ghi "cm3 | 12780" = 12,78 L (l_from_cc) → thêm một phiếu 12,78.
  // buoc-4 PR A: cột "排气量" của một NCC nữa ghi 12,78 → thêm một phiếu (9 → 10; 11 → 12 mỗi NCC một phiếu).
  assert.deepEqual(t.after?.votes, { 12.78: 10 });
  assert.deepEqual(t.before?.votes, { 12.78: 12 }, "từ #941 thêm phiếu jinjia-power; S8-2 thêm phiếu tecnogen; buoc-4 thêm cột 排气量");
  const r = runOn(SUPS, 312.5, "Dung tích xi lanh: ≤ 11 lít\n50 Hz");
  // Trước: dòng LZ- V250 (9,36 L) bị loại `maxDisp` vì số đông 12,78 trội hơn số tự ghi của dòng. Nay dòng không ghi dung tích, nên bị loại theo
  // chính giá trị thắng 12,78 của động cơ (cùng lý do `maxDisp`, cùng kết quả, nhưng không còn dựa vào số sai 9,36).
  const d = dropOf(r, "liangzi-yangzhou", "TAD1351GE");
  assert.ok(d, "dòng LZ- V250 vẫn bị loại");
  assert.deepEqual(d.ruled, ["maxDisp"]);
  assert.equal(d.src.maxDisp.win, 12.78, "theo giá trị thắng của động cơ, không theo số 9,36 của dòng");
});

test("+50 điểm bộ điều khiển có lý do (điểm không đổi): dòng ghi bộ điều khiển / NCC có hồ sơ bộ điều khiển", () => {
  const H = "| Model | Prime kVA | Prime kW | Engine | Alternator | Controller |";
  const rec = { id: "rec", country: "CN", confidence: "high", controllers: [{ brand: "SmartGen", model: "HGM6120" }], specTables: [{ n: 101, title: "Gensets", header: [H], rows: ["| r-1 | 650 | 520 | QSK19-G4 | X | |"] }] };
  const row = { id: "row", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows: ["| w-1 | 650 | 520 | QSK19-G4 | X | Deep Sea DSE7320 |"] }] };
  const none = { id: "none", country: "CN", confidence: "high", specTables: [{ n: 101, title: "Gensets", header: [H], rows: ["| n-1 | 650 | 520 | QSK19-G4 | X | |"] }] };
  const r = runOn([rec, row, none], 650, "50 Hz");
  const of = (id) => r.all.find((x) => x.u.supplierId === id);
  assert.ok(of("rec").why.includes("NCC có hồ sơ bộ điều khiển SmartGen HGM6120"), of("rec").why.join("; "));
  assert.ok(of("row").why.some((w) => /^dòng ghi bộ điều khiển Deep Sea/.test(w)), of("row").why.join("; "));
  assert.ok(!of("none").why.some((w) => /bộ điều khiển/.test(w)));
  assert.equal(of("rec").score - of("none").score, 50, "chỉ +50 như trước");
});
