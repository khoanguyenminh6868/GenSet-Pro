// node --test suppliers/*.test.mjs — bảng R1 chưa đọc (catalog-bang-r1, Khoa 19/11/2026 "ok làm nhóm 1"): nhiều model xếp
// dòng, có dòng tiêu đề cột. Mỗi ca là dòng thật trong suppliers/cn (NCC, số bảng n ghi cạnh).
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
const sup = (id, tables) => ({ id, country: "CN", confidence: "high", role: "genset_oem", specTables: tables });
const recs = (s, kind, notes = []) => C.fromSupplier(s, notes).filter((r) => !kind || r.kind === kind);
const names = (r) => (r.makes || []).map((m) => m.name);
const spec = (r, k) => (r.specs || []).find((x) => x.key === k)?.value;

test("jinjia n101: bảng không tiêu đề, dòng đầu = tiêu đề + dòng máy đầu → tách đôi, đọc như bảng có tiêu đề", () => {
  const s = sup("jinjia-power", [{ n: 101, title: "Cummins Generator 20kW-3000kW | Jinjia Power", header: [], rows: [
    "| | Model | Prime Power (kW) | Standby (kW) | kVA | Engine | Cyl. | Displacement (L) | Fuel (g/kW·h) | Weight (kg) | Dimensions (mm) | JJC-20GF | 20 | 22 | 25 | 4B3.9-G11 | 4 | 3.9 | 208 | 700 | 1650x720x1200",
    "| JJC-24GF | 24 | 26.4 | 30 | 4B3.9-G2 | 4 | 3.9 | 208 | 700 | 1650x720x1200"] }]);
  const e = recs(s, "engine");
  assert.deepEqual(e.map((r) => [r.row, r.genset, r.model]), [[0, "JJC-20GF", "4B3.9-G11"], [1, "JJC-24GF", "4B3.9-G2"]]);
  // dòng 0 giữ chỉ số, chữ là phần sau tiêu đề, nguyên văn
  assert.equal(e[0].line, "| JJC-20GF | 20 | 22 | 25 | 4B3.9-G11 | 4 | 3.9 | 208 | 700 | 1650x720x1200");
  assert.equal(spec(e[0], "weight"), "700");
  // "kVA" (chỉ đơn vị) kế thừa mức standby của tiêu đề trước nhưng 25 kVA với 22 kW không là một cặp (0,88): 25 kVA là của
  // prime 20 kW → không biết mức, bỏ số đó; kW của hai mức vẫn giữ.
  assert.deepEqual(e[0].power, { prime: { kW: 20 }, standby: { kW: 22 } });
  assert.deepEqual(e[1].power, { prime: { kW: 24 }, standby: { kW: 26.4 } });
});

test("dòng đầu không đủ điều kiện tách (số ô ≠ 2 × số tiêu đề) thì để nguyên như cũ", () => {
  const s = sup("x", [{ n: 1, title: "t", header: [], rows: [
    "| | Model | Prime Power (kW) | Engine | JJC-20GF | 20 | 4B3.9-G11 | 700",
    "| JJC-24GF | 24 | 4B3.9-G2"] }]);
  assert.equal(recs(s, "engine").filter((r) => r.genset === "JJC-20GF").length, 0);
});

test("mã Scania viết bốn cụm (kaihua n114, agg-fuzhou n102, cgm-italia n101, tecnogen n2004) là mã động cơ", () => {
  for (const c of ["DC09 320A 02-61", "DC09 072A 02-12", "DC09 072A 02 11", "OC16 071A 02-83", "DC9 65A 10-93"]) assert.equal(C.isCode(c), true, c);
  for (const c of ["DC09 072A 02-12 Scania", "Open Type 3 phase 4", "1500 rpm 50 Hz 400 V"]) assert.equal(C.isCode(c), false, c);
  const kaihua = sup("kaihua-genset", [{ n: 114, title: "Scania Generator-TAIZHOU KAIHUA DIESEL GENERATOR SETS CO. LTD",
    header: ["| Genset Model | Standby Power | Prime power | Engine model | Dimension | Weight(KG)", "| KVA | KW | KVA | KW"],
    rows: ["| KH-200GF | None | None | 250 | 200 | DC09 320A 02-61 | 3400*1300*1900 | 2600"] }]);
  const k = recs(kaihua, "engine");
  assert.equal(k.length, 1);
  assert.equal(k[0].model, "DC09 320A 02-61");
  assert.equal(k[0].genset, "KH-200GF");
  // ô "None" không là số nên tiêu đề không xếp được; ghép chặt theo hệ số 0,8 cho một cặp không rõ mức (luật cũ, không đổi)
  assert.deepEqual(k[0].power, { rated: { kVA: 250, kW: 200 } });
  const agg = sup("agg-fuzhou", [{ n: 102, title: "中型：301-800 kVA-德塔", header: ["| | 发电机型号 | ESP (kVA/kW) | PRP (kVA/kW) | 发动机型号 | 品牌"],
    rows: ["| S313E5 | 313/250 | 275/220 | DC09 072A 02-12 | Scania"] }]);
  const a = recs(agg, "engine");
  assert.equal(a[0].model, "DC09 072A 02-12");
  assert.deepEqual(names(a[0]), ["Scania"]);
  assert.deepEqual(a[0].power, { standby: { kVA: 313, kW: 250 }, prime: { kVA: 275, kW: 220 } });
});

test("cgm-italia n101: trước đây mã khung bệ 'B300' bị đọc làm động cơ; nay động cơ là ô Scania", () => {
  const s = sup("cgm-italia", [{ n: 101, title: "Industrial CGM Generators | Silent, Robust, and Reliable", header: [
    "| | Model | PDF | PRP | STYB | Engine | M/E | Emissions | No. of cylinders | Net mechanical power | ¾ load consumption | Tank | Open base frame | Soundproof canopy | dB(A) at 7 mt | Manual panel | Automatic panel",
    "| | | KVA | KW | KVA | KW | | | | | Hp/Kw | lt/hr | lt | Modello | Kg | LxLWxH [mm] | Modello | Kg | LxLWxH [mm] | dB(A) | Modello | Modello"],
  rows: ["| 250S | | 250 | 200 | 275 | 220 | DC09 072A 02 11 | E | 0 | 5 | 294.9/220 | 38 | 250 | B300 | 2470 | 2800x1310x1800 | C300 | 3130 | 3700x1435x2250 | 69 | QM250 | QA250"] }]);
  assert.deepEqual(recs(s, "engine").map((r) => r.model), ["DC09 072A 02 11"]);
});

test("tổ máy hai động cơ Scania '2 x DC13 072A 02 14' vẫn không cho động cơ nào (tecnogen)", () => {
  const notes = [];
  const s = sup("tecnogen", [{ n: 1, title: "t", header: ["| MODEL | kVA LTP | kVA PRP | Engine | Panel"], rows: ["| SA1100TSX | 1100 | 1000 | 2 x DC13 072A 02 14 | SCP8610"] }]);
  assert.equal(recs(s, "engine", notes).length, 0);
  assert.ok(notes.some((x) => x.reason === "tổ máy nhiều động cơ"));
});

test("simpson n101: tiêu đề chữ Hán cách từng chữ ('发 动 机 型 号') nhận được cột động cơ", () => {
  const notes = [];
  const s = sup("simpson-power", [{ n: 101, title: "10kW-100kW", header: ["| 机 组 型 号 | 备 用 功 率 ( kW/kVA) | 发 动 机 品 牌 | 发 动 机 型 号 | 机 组 尺 寸 (mm) ( 长 × 宽 × 高 ) | 机 组 数 据"],
    rows: ["| SP0011D-P | 11/14 | Perkins | 403D-15G | 1100×550×1030 | SP0011D-P.pdf", "| SP0022D-C | 22/27 | CUMMINS | 4B3.9-G1(G2) | 1800×7410×1380 | SP0022D-C.pdf"] }]);
  const e = recs(s, "engine", notes);
  assert.deepEqual(e.map((r) => [r.genset, r.model]), [["SP0011D-P", "403D-15G"]]);
  assert.deepEqual(e[0].power, { standby: { kVA: 14, kW: 11 } });
  assert.deepEqual(names(e[0]), ["Perkins"]);
  // một ô hai mã "4B3.9-G1(G2)": dòng không cho bản ghi (trước đây "SP0022D-C.pdf" suýt thành động cơ), có ghi chú
  assert.ok(notes.some((x) => x.reason === "một ô ghi hai mã" && /4B3\.9-G1\(G2\)/.test(x.detail)));
});

test("tiêu đề chữ Hán chỉ cách một chỗ giữa hai từ ('机组重 量', '发动机 型号') KHÔNG bị gộp (bảng đang đọc giữ nguyên)", () => {
  const h = "| 机组型号 | 输出功率 (KW/KVA) | 柴油机型号 | 机组重 量(KG)";
  const s = sup("pengpai-yangzhou", [{ n: 1, title: "t", header: [h], rows: ["| PPDL-C1500 | 1500/1875 | KTA50-G15 | 13000"] }]);
  const e = recs(s, "engine");
  assert.equal(e.length, 1);
  assert.deepEqual(e[0].header, [h]);
});

test("rcg-power n124: ô 'hãng chữ Hán & mã' → mã, hãng vẫn đọc từ chữ Hán của dòng", () => {
  const s = sup("rcg-power", [{ n: 124, title: "R-V 系列 (沃尔沃) -江苏瑞昌哥尔德发电设备股份有限公司", header: ["| | 型号 | 主电源 | 备用电源 | 发动机 | 交流发电机 | 下载"],
    rows: ["| R-V85D5/S | 85 kVA / 68 kW | 94 kVA / 75 kW | 沃尔沃 & TAD530GE | 利莱森玛 & TAL-A44-C | PDF"] }]);
  const e = recs(s, "engine"), a = recs(s, "alternator");
  assert.equal(e.length, 1);
  assert.equal(e[0].model, "TAD530GE");
  assert.equal(e[0].genset, "R-V85D5/S");
  assert.deepEqual(names(e[0]), ["Volvo Penta"]);
  // "主电源" (nguồn chính) không có trong từ prime (主用 / 常用): không thêm, nghĩa không chắc là prime → chỉ standby
  assert.deepEqual(e[0].power, { standby: { kVA: 94, kW: 75 } });
  assert.equal(a[0].model, "TAL-A44-C");
  assert.deepEqual(names(a[0]), ["Leroy-Somer"]);
  // dòng nguồn giữ nguyên văn
  assert.match(e[0].line, /沃尔沃 & TAD530GE/);
});

test("conductorjasa n124: 'Mesin' (tiếng Indonesia: động cơ) là cột động cơ", () => {
  const s = sup("conductorjasa", [{ n: 124, title: "Genset Besar 500–4125 kVA Open & Silent | Conductorjasa", header: ["| | Model | Mesin | Prime (kVA) | Standby (kVA) | Tipe"],
    rows: ["| PJPS-750 WP2 | Perkins 4006-23TAG2A | 750 | 825 | Open Type · opsi silent, container"] }]);
  const e = recs(s, "engine");
  assert.equal(e.length, 1);
  assert.equal(e[0].model, "4006-23TAG2A");
  assert.equal(e[0].genset, "PJPS-750 WP2");
  assert.deepEqual(names(e[0]), ["Perkins"]);
});

test("kente n168 (bản dịch máy tiếng Hmong): 'Cav Qauv' KHÔNG được nhận là cột động cơ", () => {
  const s = sup("kente-power", [{ n: 168, title: "Tuam Tshoj KT-SDEC Series Diesel Generator Chaw tsim tshuaj paus thiab Hoobkas |KENT", header: [
    "| Genset Qauv | 50HZ PF = 0.8 400/230V 3phase 4Wire | Cav Qauv | cil | Npog | Storke | hloov chaw | Tus tswv xeev | Qhib Hom Dimension",
    "| Standby Fais Fab | Prime hwj chim | Cons 100% (L / H)", "| KVA/KW | KVA/KW | MM | MM | L | | L × W × H (MM) | Nyhav KG"],
  rows: ["| KT-SC70 | 70/55 ib | 63/50 ib | 15.1 | SC4H95D 2 | 4L | 105 | 124 | 4.3 | Elec. | 1980 * 880 * 1510 | 960 ua"] }]);
  assert.equal(recs(s).length, 0);
});

test("comappower n108: '/kw' kế thừa mức standby nhưng 463 kW với 500 kVA không là một cặp → bỏ kW đó, giữ phần còn lại", () => {
  const s = sup("comappower", [{ n: 108, title: "VOLVO GENERATOR SET - Comappower", header: ["| | Genset Model | Standby power | /kw | Prime power | /kw | Engine Model | NO. of Cylinder | Detail Data"],
    rows: ["| COM500V | 500kVA | 463kW | 455kVA | 364kW | TAD1344GE-B | 6 | COM500V", "| COM412V | 412kVA | 330kW | 375kVA | 300kW | TAD1343GE-B | 6 | COM412V"] }]);
  const e = recs(s, "engine");
  assert.deepEqual(e[0].power, { standby: { kVA: 500 }, prime: { kVA: 455, kW: 364 } });
  // dòng khớp hệ số 0,8 không đổi
  assert.deepEqual(e[1].power, { standby: { kVA: 412, kW: 330 }, prime: { kVA: 375, kW: 300 } });
});
