// node --test suppliers/*.test.mjs — ma-dong-co-trung PR 1 (Khoa 20/11/2026: "gộp đi"; Derate / Switchable "gộp", Perkins " L" "để
// riêng"): chữ / số viết cạnh mã động cơ bỏ ở tidyModel / engineCode, để một động cơ không đứng dưới hai khoá. Mỗi ô là ô thật
// trong suppliers/cn (NCC, bảng n ghi cạnh); bảng dựng lại với tiêu đề tối giản.
import test from "node:test";
import assert from "node:assert/strict";
import "../web/catalog.js";

const C = globalThis.GenbidCatalog;
// One horizontal genset table whose engine cell is `cell`.
const engineOf = (id, cell) => {
  const s = { id, country: "CN", confidence: "high", role: "genset_oem", specTables: [{ n: 101, title: "Diesel generator set",
    header: ["| Genset Model | Prime Power kVA | Prime Power kW | Engine Model | Alternator Model"],
    rows: [`| GS100 | 125 | 100 | ${cell} | S4L1D-C41`] }] };
  return C.fromSupplier(s, []).filter((r) => r.kind === "engine").map((r) => r.model);
};
const same = (id, cell, code) => assert.deepEqual(engineOf(id, cell).map(C.keyOf), [C.keyOf(code)], `${id} "${cell}"`);
const apart = (id, cell) => assert.deepEqual(engineOf(id, cell), [cell], `${id} "${cell}" phải giữ nguyên`);

test("công suất tổ máy viết sau mã (jet-power, weiman, bauer, jinlongteng): bỏ", () => {
  same("jet-power", "YD385D/11KW", "YD385D");
  same("jet-power", "3TNV88-GGE/12.2KW", "3TNV88-GGE");
  same("jet-power", "4DX23-65D /48KW", "4DX23-65D");
  same("weiman-fujian", "8M33D890E200/815/890KW", "8M33D890E200");
  same("weiman-fujian", "WP13D405E200/368kw", "WP13D405E200");
  same("bauer-generator", "ZH4100D/30,1 KW", "ZH4100D");
  same("aksa-power", "4045HFG20 (103kW)", "4045HFG20");
});

test("số của ô kế bên dính vào ô động cơ (eastern-lion tốc độ, nenjo, cgm-italia kW): bỏ", () => {
  same("eastern-lion-fuan", "WD129TAD23/1500", "WD129TAD23");
  same("eastern-lion-fuan", "WD129TAD23-10/1800", "WD129TAD23-10");
  same("nenjo-generator", "4006-23TAG3A 1800", "4006-23TAG3A");
  same("cgm-italia", "1320 4012-46TAG2A", "4012-46TAG2A");
  same("cgm-italia", "119,2 1106A-70TG1", "1106A-70TG1");
  // Mã có dấu cách mà phần đầu là số: KHÔNG bỏ (rise-power Jichai, mahindra, jcb)
  apart("rise-power", "6190 TL-2");
  apart("rise-power", "4190 ZLT1-2");
  apart("mahindra-powerol", "3285 GM-C2");
  apart("jcb-power", "444 G-TCA-100");
  // Mã Baudouin / Weichai có "/": giữ
  apart("kaihua-genset", "6M16G350/5");
});

test("nơi sản xuất viết cạnh mã (kaihua n122, landtop, sr-genset, superwatt): bỏ khỏi model, dòng nguồn giữ chữ", () => {
  same("kaihua-genset", "India 4006-23TAG2A", "4006-23TAG2A");
  same("kaihua-genset", "UK 4006-23TAG2A", "4006-23TAG2A");
  same("landtop-fuzhou", "1103A-33G(India)", "1103A-33G");
  same("landtop-fuzhou", "1206A-E70TTAG1(UK/EP)", "1206A-E70TTAG1");
  same("landtop-fuzhou", "2206C-E13TAG2 (USA/EU)", "2206C-E13TAG2");
  same("sr-genset", "1104D-44TG2 EU", "1104D-44TG2");
  same("superwatt-swt", "S16R2-PTAW-C SME", "S16R2-PTAW-C");
  const s = { id: "kaihua-genset", country: "CN", confidence: "high", role: "genset_oem", specTables: [{ n: 122, title: "Perkins",
    header: ["| Genset Model | Prime Power kVA | Prime Power kW | Engine Model | Alternator Model"], rows: ["| HC-825GF | 825 | 750 | India 4006-23TAG2A | S5L1D-H1"] }] };
  const r = C.fromSupplier(s, []).find((x) => x.kind === "engine");
  assert.match(r.line, /India 4006-23TAG2A/);
});

test("tên hãng / nhà máy dính mã: bỏ (yongcai FAW, Yangdong; superwatt sau mã; jiuan '(DCEC)'; kc-generatorset 'Chongkang/')", () => {
  same("yongcai-elecmama", "FAW CA6DL2-27D", "CA6DL2-27D");
  same("yongcai-elecmama", "Yangdong Y4100D", "Y4100D");
  same("superwatt-swt", "QSK38-G5 cummins", "QSK38-G5");
  same("superwatt-swt", "WP7D264E310 Weichai", "WP7D264E310");
  same("jiuan-power", "6ZTAA13-G2 (DCEC)", "6ZTAA13-G2");
  same("stone-power", "Mistubishi S16R-PTA2-C", "S16R-PTA2-C");
  same("kc-generatorset", "Chongkang/KTA38-G1B", "KTA38-G1B");
  same("kc-generatorset", "Dongfeng Cummins/4BT3.9-G2", "4BT3.9-G2");
});

test("Switchable / Derate / commodity: gộp vào mã gốc (Khoa 20/11/2026)", () => {
  same("nenjo-generator", "4006-23TAG2A Switchable", "4006-23TAG2A");
  same("aj-power", "403D-11G Derate", "403D-11G");
  same("nenjo-generator", "403D-11G commodity", "403D-11G");
});

test("KHÔNG gộp: Perkins ' L' (Khoa: để riêng), 3512B HD, số trong ngoặc chưa rõ nghĩa, hai mã một ô", () => {
  apart("sr-genset", "2806A-E18TAG2 L");
  apart("rise-power", "3512B HD");
  apart("elitech-power", "4BTA3.9-G13(40)");
  assert.notEqual(C.keyOf(engineOf("kaihua-genset", "6M33G8D3/5 (6M33G825/5)")[0] || ""), C.keyOf("6M33G825/5"));
});
