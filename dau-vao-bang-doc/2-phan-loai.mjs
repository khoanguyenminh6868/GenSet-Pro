// Bước 2: phân loại ĐỦ MỌI bảng chưa đọc bằng luật (không lấy mẫu). Chạy:  node 2-phan-loai.mjs
// Vào:  bang-chua-doc-tho.json, model-da-co.json (từ 1-trich.mjs).
// Ra:   phan-loai.json (mỗi bảng: nhóm, nhóm con, mã model ước lượng), phan-loai.tsv, tom-tat-nhom.tsv
// Luật theo THỨ TỰ, bảng rơi vào luật đầu tiên khớp. Mọi luật là hàm thuần trên nội dung bảng (tiêu đề, header, dòng).
// Không đọc thông số, không suy ra: chỉ đếm "mã nhìn giống model" để ước lượng. Định nghĩa từng nhóm ở GROUPS bên dưới.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const D = path.dirname(fileURLToPath(import.meta.url));

// Cùng chuẩn hoá với catalog.keyOf
export const keyOf = (m) => String(m).normalize("NFKC").toUpperCase().replace(/[\s\-_.·]/g, "").replace(/[*†‡]+$/, "");
// Cùng cách tách ô với catalog.cellsOf; dòng không có gạch đứng và không có "nhãn:" thì tách theo ≥2 dấu cách.
export function cellsOf(line) {
  const s = String(line).trim();
  if (s.startsWith("|")) {
    const p = s.split("|").slice(1).map((c) => c.trim()).filter((c, i, a) => c || i < a.length - 1);
    // KHÁC catalog.cellsOf (cố ý, để thấy khoảng hở): dòng một ô "| Genset Model：SW500NFK" được tách nhãn / giá trị
    const m = p.length === 1 && p[0].match(/^([^:：]{2,60})[:：]\s*(.+)$/);
    return m ? [m[1].trim(), m[2].trim()] : p;
  }
  const m = s.match(/^([^:：]{2,60})[:：]\s*(.+)$/);
  if (m) return [m[1].trim(), ...m[2].split("|").map((c) => c.trim()).filter(Boolean)];
  const w = s.split(/\s{2,}|\t/).map((c) => c.trim()).filter(Boolean);
  return w.length ? w : [s];
}
const UNITLIKE = /^[\d.,\s]*\d[\d.,\s\/*×xX~-]*\s*[A-Za-z°%³²\/.()Ω]{0,8}$/;
const STD = /^(ISO|IP|EN|CE|UL|IEC|GB|TIER|STAGE|EU|EPA|ECE|R\d|NO\.?|H|F|B|DIN|BS|NEMA|IEEE|CSA|TA)[\s-]?\d/i;
// "mã nhìn giống model": có chữ và số, không dấu cách, không là số + đơn vị / chuẩn / kích thước.
export function codeish(c) {
  c = String(c).trim().replace(/^[*†‡]+|[*†‡]+$/g, "");
  if (c.length < 3 || c.length > 30 || /\s/.test(c)) return false;
  if (!/[A-Za-z]/.test(c) || !/\d/.test(c)) return false;
  if (/^\d{1,4}GF[A-Z]{0,2}$/i.test(c)) return true; // "68GF", "400GFS": model tổ máy kiểu Trung Quốc, số + GF
  if (UNITLIKE.test(c) || STD.test(c) || /^n[o0]\.?$/i.test(c)) return false;
  if (/^\d+(\.\d+)?(kw|kva|kwe|kwm)[-\/]\d/i.test(c) || /^(wp|c|o)-?\d{1,3}$/i.test(c)) return false;
  if (/[:：]/.test(c) || /\d(hz|rpm)\b/i.test(c) || (c.split(")").length !== c.split("(").length)) return false;
  if (/^\d+(\.\d+)?(kva|kw|kwe|kwm|kwt|hz|rpm|v|a|l|kg|mm|db|hp|ps|vdc|ac|dc)(\/.*)?$/i.test(c)) return false;
  if (/^[A-Z]?\d{1,2}[A-Z]?$/.test(c)) return false;
  if (/^\d+[xX*×]\d+/.test(c)) return false;
  if (/^(3|1)ph(ase)?$/i.test(c) || /^\d+(st|nd|rd|th)$/i.test(c) || /^(kw|kva)\d/i.test(c) && c.length < 5) return false;
  if (/^(19|20)\d\d$/.test(c) || /^\d+[a-z]?\d{0,3}(hz|v)$/i.test(c)) return false;
  return true;
}
// mã trong tiêu đề trang: từng chuỗi ASCII (kể cả dính chữ Hán / dấu gạch) nhìn giống model
const titleCodes = (s) => [...new Set((String(s).replace(/&#?x?[0-9a-f]+;|&[a-z]+;/gi, " ").replace(/\.(pdf|html?)\b/gi, " ").match(/[A-Za-z0-9][A-Za-z0-9-/.]*[A-Za-z0-9]/g) || []).map((x) => x.replace(/[-./]+$/, "")).filter(codeish))];
const codeWords = (s) => String(s).replace(/[,;()（）]/g, " ").split(/\s+/).filter(codeish);

const GENW = /\b(genset|gen-set|gensets|generating sets?|generator sets?|generating-set)\b|机组|stromerzeuger|aggregat|groupe électrogène|gruppo elettrogeno|grupo electr|grupos? electr/i;
const SETW =/\b(prime|standby|stand-by|stand by|prp|esp|ltp|cop|genset|gen-set|gensets|generating set|generator set)\b|主用|备用|机组型号|机组功率|发电机组|stromerzeuger|gruppo elettrogeno|groupe électrogène|grupo electr/i;
const POWW = /\d\s*(kva|kw|kwe|kwm|hp|ps|bhp|mw)\b|\b(kva|kw|kwe|kwm|rated power|power rating|rated output|output power|rated capacity)\b|额定功率|功率|công suất|potenza|potencia|puissance|leistung/i;
const ENGW = /\b(bore|stroke|stoke|displacement|cylinders?|aspiration|compression|governor|lube oil|oil capacity|coolant|firing|piston|fuel consumption|combustion|motortyp|bohrung|hub|cilindrada|cilindr)\b|缸径|行程|排量|气缸|燃气机|发动机型号|冲程/i;
const ALTW = /\b(alternator|stamford|leroy|mecc|brushless|avr|reactances?|excitation|winding|insulation|voltage regulation|frame size|poles?|short circuit|sincro|exciting|ip2[13]|thd)\b|电机|绕组|励磁|发电机型号/i;
const FUELW = /\b(fuel|consumption|l\/h|load|noise|db\(a\)|dimension|weight|dimensions?|length|width|height|tank|exhaust|emission|sound|canopied|open skid)\b|尺寸|重量|噪音|油耗/i;
const MODELLAB = /\b(model|genset|type|gen[\s-]?sets?[\s-]model|series|modelo|modèle|modell|modello|motortyp\w*|motor type|motortype|serie|baureihe)\b|型号|类型|机组型号|燃气机类型/i;
const NOTSET = /engine|alternator|motor|cylinder|exciting|动力|发动机|电机|motortyp|燃气机/i;
const CATW = /view details|details →|power range|catalogue|catalog\b/i;
// bảng niêm yết máy bán lại / máy cũ: tiêu đề cột có ≥3 trong Manufacturer / Model / Year / Hours / Condition / Wattage
const LISTW = /\b(manufacturer|model|year|hours|condition|wattage|fuel type|version|recommended use)\b/gi;

export function features(t) {
  const lines = [...t.header, ...t.rows];
  const cs = lines.map(cellsOf);
  const N = lines.length, text = lines.join("\n"), title = t.title || "";
  const count = (re) => lines.filter((l) => re.test(l)).length;
  const ncell = cs.map((c) => c.length);
  const med = ncell.slice().sort((x, y) => x - y)[N >> 1];
  const first = (c) => c.find((x) => x) || "";
  const isLabel = (c) => { const f = first(c); return /[A-Za-z一-鿿]{2,}/.test(f) && !codeish(f) && !/^\d/.test(f); };
  const labelFirst = cs.filter(isLabel).length / N;
  // ô "mô tả model" của dòng: ô đầu; nếu ô đầu rỗng hoặc chỉ là số thứ tự / "No." thì ô thứ hai
  const modelCell = (c) => (c[0] && !/^(\d{1,3}|no\.?|n0\.?|#)$/i.test(c[0]) ? c[0] : c[1] || "");
  const isModelCell = (x) => !!x && (codeish(x) || (codeWords(x).length > 0 && x.split(/\s+/).length <= 8));
  const rowsFirstCode = cs.filter((c) => isModelCell(modelCell(c))).length;
  const hasTitleRow = cs.slice(0, 2).some((c) => !isModelCell(modelCell(c)) && POWW.test(c.join(" ")) || SETW.test(c.join(" ")) && !isModelCell(modelCell(c)));
  let modelRow = null;
  cs.slice(0, 8).forEach((c, i) => {
    if (modelRow || !c[0] || !MODELLAB.test(c[0]) || NOTSET.test(c[0])) return;
    // ô giá trị: một mã, hoặc vài từ có mã ("SC-800GF / SC-800S (Silent)") → lấy các mã trong ô
    const codes = c.slice(1).flatMap((x) => (codeish(x) ? [x] : x && x.split(/s+/).length <= 6 ? codeWords(x) : []));
    if (codes.length) modelRow = { i, codes, label: c[0] };
  });
  // dòng chữ thô một dấu cách: "MODEL LB62(S) LB80(S) LB100(S)" (lance-power): nhãn Model rồi ≥2 mã
  if (!modelRow) lines.slice(0, 8).forEach((l, i) => {
    const w = String(l).trim().split(/s+/);
    if (modelRow || String(l).trim().startsWith("|") || !MODELLAB.test(w[0]) || NOTSET.test(w[0])) return;
    const codes = w.slice(1).filter(codeish);
    if (codes.length >= 2) modelRow = { i, codes, label: w[0] };
  });
  // tiêu đề cột là mã model (ô đầu rỗng): "| | TAD1341GE-B | TAD1342GE-B | …" (volvo-penta)
  if (!modelRow) cs.slice(0, 3).forEach((c, i) => {
    if (modelRow || c.length < 4 || (c[0] && codeish(c[0]))) return;
    const rest = c.slice(1).filter(Boolean), codes = rest.filter(codeish);
    if (codes.length >= 3 && codes.length >= rest.length * 0.6 && !/\d\s*(kva|kw|hz|v|a)\b/i.test(c.join(" "))) modelRow = { i, codes, label: c[0] || "(ô đầu rỗng)" };
  });
  // dòng nhãn Model mà tên model có dấu cách ("TCG 3016"), không là mã đơn
  const WORDONLY = /^(prime|standby|stand-by|esp|prp|ltp|kva|kw|kwe|power|rated|unit|hz|rpm|output|\(?\w{1,3}\)?)$/i;
  const looseModelRow = cs.slice(0, 8).find((c) => c[0] && MODELLAB.test(c[0]) && !NOTSET.test(c[0]) && c.slice(1).filter((x) => x && !WORDONLY.test(x)).length >= 3);
  const pipe = lines.filter((l) => String(l).trim().startsWith("|")).length / N;
  return { N, cs, text, title, med, pipe, labelFirst, rowsFirstCode, hasTitleRow, modelCell, isModelCell, modelRow, looseModelRow, titleCodes: titleCodes(title), setN: count(SETW), genN: count(GENW), powN: count(POWW), engN: count(ENGW), altN: count(ALTW), fuelN: count(FUELW), cat: count(CATW),
    covA: t.nrows ? t.covAny / t.nrows : 0, cov: t.nrows ? t.covSame / t.nrows : 0 };
}

export const GROUPS = {
  A1: "Nằm trọn trong một bảng đã đọc của cùng NCC: ≥90% dòng khác nhau (chuẩn hoá chữ thường, bỏ ký tự không phải chữ/số, ≥6 ký tự) có trong MỘT bảng đã cho bản ghi; bảng chưa đọc có ≥2 dòng",
  A2: "Nằm trọn trong một bảng đã đọc của NCC khác: như A1 nhưng bảng chứa ở NCC khác; bảng chưa đọc có ≥4 dòng, dòng có ở >300 bảng đã đọc không tính",
  B1: "Lặp đúng một bảng chưa đọc khác (nội dung chuẩn hoá giống hệt; bản đầu tiên ở lại nhóm của nó)",
  C1: "Không phải bảng tổ máy: không dòng nào có từ công suất (kVA/kW…), prime/standby, động cơ, đầu phát; không dòng Model; <40% dòng bắt đầu bằng mã model",
  H1: "Đầu phát rời: không dòng nào (và tiêu đề không) có từ tổ máy (genset / generating set / generator set / 机组); ≥2 dòng có từ đầu phát (alternator, Stamford, winding, excitation, reactance, poles, IP23…) và không ít hơn số dòng có từ động cơ",
  M1: "Động cơ rời: không có từ tổ máy như H1, không có chữ kVA nào (công suất động cơ tính kWm / kW); ≥2 dòng có từ động cơ (bore, stroke, displacement, cylinders, governor…) và đầu phát không nhiều hơn",
  O1: "Chủ đề khác: không có từ tổ máy, động cơ, đầu phát, prime/standby; ≤1 dòng nhắc công suất; chỉ có từ nhiên liệu / tải / ồn / kích thước / trọng lượng; không dòng nào bắt đầu bằng mã model",
  S1: "Danh mục dòng sản phẩm / liên kết: ≥2 dòng có 'Power range', 'View details →', 'catalog' (một dòng = một dòng sản phẩm, không phải model), median ≥4 ô",
  L1: "Niêm yết máy (bán lại / máy cũ): 2 dòng đầu có ≥4 trong Manufacturer / Model / Year / Hours / Condition / Wattage / Version…, kèm Year hoặc Hours hoặc Condition",
  P1: "Dòng thô pdftotext: <30% dòng có gạch đứng, ô tách bằng dấu cách (cột không rõ)",
  T1: "Nhiều model xếp CỘT: có dòng nhãn Model với ≥2 mã khác nhau, các dòng khác là nhãn thông số đứng đầu dòng",
  R1: "Nhiều model xếp DÒNG, có dòng tiêu đề cột (một trong 2 dòng đầu không bắt đầu bằng mã, có từ công suất/prime/standby): ô mô tả model (ô đầu, hoặc ô 2 nếu ô đầu là số thứ tự) của ≥40% dòng là mã, median ≥4 ô/dòng",
  R2: "Nhiều model xếp DÒNG, KHÔNG dòng tiêu đề cột (mọi dòng đều bắt đầu bằng mã model): cột nào là công suất phải đoán từ giá trị",
  F1: "Mảnh bảng ≤3 dòng, không nhãn Model; tiêu đề trang có mã nhìn giống model",
  F2: "Mảnh bảng ≤3 dòng, không nhãn Model; tiêu đề không có mã",
  V1: "Một máy dạng dọc (≥60% dòng ≤3 ô: nhãn | giá trị), CÓ dòng nhãn Model với mã",
  V6: "Một máy dạng dọc như V1 nhưng ≥3 dòng dùng dấu chấm dẫn (Manufacturer……CUMMINS | Fuel consumption): nhãn và giá trị dính trong một ô",
  V2: "Một máy dạng dọc, không dòng Model nhưng tiêu đề trang có mã nhìn giống model",
  V3: "Một máy dạng dọc, không dòng Model và tiêu đề không có mã",
  V4: "Một máy dạng dọc kép: ≥50% dòng 4 ô, nhãn | giá trị | nhãn | giá trị",
  O2: "Bảng tiêu thụ nhiên liệu / công suất theo mức tải: ≥50% dòng bắt đầu '75%…', '100%Prime…', không mã model",
  R3: "Nhiều dòng, MỖI DÒNG bắt đầu bằng SỐ (công suất), không có cột model; median ≥5 ô: dòng thuộc model nào chưa rõ (model ở tiêu đề / bảng khác)",
  T3: "Nhiều cột giá trị (median ≥5 ô), nhãn thông số đứng đầu ≥60% dòng, không dòng Model nhận được (model có thể ở tiêu đề cột bị mất / ở dòng trên)",
  V5: "Bảng nhỏ hỗn hợp (≤12 dòng, ≤6 ô), tiêu đề trang có mã nhìn giống model, không khớp luật dọc / ngang",
  Z: "Chưa xếp được",
};
const SEEN = new Map();
const lines0 = (t) => [...t.header, ...t.rows];
export function classify(t, f = features(t)) {
  const { N, med } = f;
  // A: ≥90% dòng (khác nhau, ≥6 ký tự chuẩn hoá) nằm trong MỘT bảng đã cho bản ghi. A1: bảng đó của cùng NCC (≥2 dòng);
  // A2: của NCC khác (≥4 dòng, dòng có mặt ở >300 bảng đã đọc không tính: chữ chung).
  if (t.nuniq >= 2 && t.bestSame && t.bestSame.c / t.nuniq >= 0.9) return "A1";
  if (t.nuniq >= 4 && t.bestOther && t.bestOther.c / t.nuniq >= 0.9) return "A2";
  const k = [...t.header, ...t.rows].map((r) => String(r).normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")).join("¦");
  if (SEEN.has(k)) return "B1";
  SEEN.set(k, 1);
  const head2 = lines0(t).slice(0, 2).join(" ");
  if (new Set((head2.match(LISTW) || []).map((x) => x.toLowerCase())).size >= 4 && /\b(year|hours|condition)\b/i.test(head2)) return "L1";
  if (!f.powN && !f.setN && !f.engN && !f.altN && !f.modelRow && f.rowsFirstCode < N * 0.4) return "C1";
  // Chủ đề: nếu không dòng nào (và tiêu đề) nói "tổ máy / genset / generating set / 机组", bảng nói về một bộ phận hoặc về số đo phụ
  // (trừ bảng có dòng nhãn Model và có chữ prime/standby hoặc ≥2 dòng công suất: đó là tờ thông số một tổ máy)
  if (!f.genN && !GENW.test(t.title || "") && !(f.modelRow && (f.setN >= 1 || f.powN >= 2))) {
    if (f.altN >= 2 && f.altN >= f.engN) return "H1";
    if (f.engN >= 2 && !/\bkva\b/i.test(f.text)) return "M1";
    if (!f.altN && !f.engN && f.fuelN && !f.setN && f.powN <= 1 && f.rowsFirstCode < N * 0.4 && !f.modelRow) return "O1";
  }
  if (f.cs.filter((c) => /^\d+\s*%/.test(c[0] || "")).length >= N * 0.5 && !f.rowsFirstCode) return "O2";
  if (f.cat >= 2 && med >= 4 && f.rowsFirstCode < N * 0.4) return "S1";
  if (f.pipe < 0.3 && med >= 3) return "P1";
  if (f.modelRow && f.modelRow.codes.length >= 2 && f.labelFirst >= 0.5) return "T1";
  const small = f.cs.filter((c) => c.length <= 3).length / N, four = f.cs.filter((c) => c.length === 4).length / N;
  const labelish = (x) => /[A-Za-z一-鿿]{2,}/.test(x || "") && !codeish(x);
  const pairs = f.cs.filter((c) => c.length === 4 && labelish(c[0]) && labelish(c[2])).length / N;
  if (pairs >= 0.5 && med === 4) return "V4";
  if (f.labelFirst >= 0.6 && med >= 5 && N >= 3 && !f.rowsFirstCode) return "T3";
  const wideFirst = f.rowsFirstCode >= 1 && f.rowsFirstCode / N >= 0.4 && med >= 3 && f.cs.filter((c) => c.length >= 3).length / N >= 0.6;
  if (wideFirst) return f.hasTitleRow ? "R1" : "R2";
  if (N <= 3 && !f.modelRow) return f.titleCodes.length ? "F1" : "F2";
  if (small >= 0.6 && f.modelRow && f.cs.filter((c, i) => /[….]{5,}/.test(lines0(t)[i])).length >= 3) return "V6";
  if (small >= 0.6) return f.modelRow ? "V1" : f.titleCodes.length ? "V2" : "V3";
  if (four >= 0.5) return "V4";
  // dòng bắt đầu bằng SỐ (công suất), không có cột model: model nằm ở tiêu đề trang hoặc bảng khác
  if (f.cs.filter((c) => /^\d+([.,]\d+)?$/.test(c[0] || "")).length >= N * 0.5 && med >= 5 && N >= 3) return "R3";
  if (N <= 12 && f.titleCodes.length && med <= 6) return "V5";
  return "Z";
}

// Ước lượng model có trong bảng: { models: [...], via }. Chỉ đếm mã nhìn giống model; KHÔNG đọc thông số.
export function modelsOf(t, f, g) {
  const uniq = (a) => [...new Set(a)];
  if (g === "T1") return { via: "dòng Model (cột)", models: uniq(f.modelRow.codes) };
  if (g === "R1" || g === "R2") {
    const m = [];
    // ô mô tả model của dòng (ô đầu; ô 2 nếu ô đầu là số thứ tự): chính nó nếu là mã, hoặc mã đầu tiên trong cụm chữ ("PJPS-100 WP 1104 C-44TAG2 100 kVA prime")
    for (const c of f.cs) { const mc = f.modelCell(c); const x = codeish(mc) ? mc : codeWords(mc)[0]; if (x) m.push(x); }
    return { via: "ô đầu mỗi dòng", models: uniq(m) };
  }
  if (g === "V1" || g === "V6") return { via: "nhãn Model", models: f.modelRow.codes.slice(0, 1) };
  if (g === "V2" || g === "F1" || g === "V5") return { via: "tiêu đề trang", models: uniq(f.titleCodes) };
  if (g === "V4") { const m = []; for (const c of f.cs) { if (c[0] && MODELLAB.test(c[0]) && !NOTSET.test(c[0]) && codeish(c[1] || "")) m.push(c[1]); if (c[2] && MODELLAB.test(c[2]) && !NOTSET.test(c[2]) && codeish(c[3] || "")) m.push(c[3]); } return { via: "nhãn Model (kép)", models: uniq(m.length ? m : f.titleCodes) }; }
  if (g === "P1") {
    // dòng thô: mã đầu tiên của mỗi dòng (hoặc cả các mã trên dòng nhãn Model); ước lượng THÔ
    const m = [];
    for (const c of f.cs) { const x = c.flatMap((y) => y.split(/\s+/)).slice(0, 3).find(codeish); if (x) m.push(x); }
    if (f.modelRow) m.push(...f.modelRow.codes);
    return { via: "mã đầu dòng (dòng thô, ước lượng thô)", models: uniq(m) };
  }
  if (g === "H1" || g === "M1") {
    const m = []; for (const c of f.cs) { const x = c.slice(0, 2).find(codeish); if (x) m.push(x); }
    if (f.modelRow) m.push(...f.modelRow.codes);
    return { via: "ô đầu dòng / dòng Model / tiêu đề", models: uniq(m.concat(f.titleCodes)) };
  }
  return { via: "-", models: [] };
}

