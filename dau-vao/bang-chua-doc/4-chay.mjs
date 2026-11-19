// Bước 4: chạy phân loại cho MỌI bảng chưa đọc, ghi dữ liệu. Chạy: node 4-chay.mjs
// Ra: phan-loai.json / phan-loai.tsv (mỗi bảng 1 dòng), tom-tat-nhom.tsv (mỗi nhóm), ncc-x-nhom.tsv, ncc-tong.tsv, tong-hop.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { features, classify, modelsOf, keyOf, GROUPS } from "./2-phan-loai.mjs";

const D = path.dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(fs.readFileSync(path.join(D, "bang-chua-doc-tho.json"), "utf8"));
const K = JSON.parse(fs.readFileSync(path.join(D, "model-da-co.json"), "utf8"));
const known = new Set([...K.models, ...K.gensets]);

// Cờ "bảng có nói tới": dò từ khoá trong cả bảng (CHỈ cho biết có từ, không đọc giá trị)
const FLAGS = {
  công_suất: /\d\s*(kva|kw|kwe|kwm|hp|ps|bhp|mw)\b|\b(kva|kw|kwe|rated power|power rating|rated output)\b|额定功率/i,
  prime_standby: /\b(prime|standby|stand-by|prp|esp|ltp|cop)\b|主用|备用|常用/i,
  động_cơ: /\b(engine|motor|moteur|motore|perkins|cummins|volvo|deutz|baudouin|yuchai|weichai|doosan|mitsubishi|kubota|isuzu|yanmar)\b|发动机|柴油机|动力/i,
  đầu_phát: /\b(alternator|stamford|mecc alte|leroy|marathon|newage|alternador)\b|发电机型号|交流发电机/i,
  nhiên_liệu: /\b(fuel|consumption|l\/h|g\/kw|l\/jam)\b|油耗|燃油/i,
  kích_thước: /\d\s*[x×*]\s*\d+\s*[x×*]\s*\d+|\b(dimension|dimensions|l\s*x\s*w\s*x\s*h)\b|尺寸/i,
  trọng_lượng: /\b(weight|kg)\b|重量|净重/i,
  điện_áp_tần_số: /\b(voltage|frequency|hz)\b|\d\s*v\b|电压|频率/i,
  độ_ồn: /\b(noise|db\(a\)|dba|db)\b|噪音|噪声/i,
  bộ_điều_khiển: /\b(controller|deepsea|comap|smartgen|dse\d|control panel|control system)\b|控制器|控制屏/i,
};
const out = [], sum = new Map(), matrix = new Map(), perSup = new Map();
T.forEach((t, i) => {
  const f = features(t), g = classify(t, f), mo = modelsOf(t, f, g);
  const ks = [...new Set(mo.models.map(keyOf).filter((k) => k.length >= 3))];
  const isNew = ks.filter((k) => !known.has(k));
  const text = [...t.header, ...t.rows, t.title].join("\n");
  const flags = Object.fromEntries(Object.entries(FLAGS).map(([k, re]) => [k, re.test(text) ? 1 : 0]));
  out.push({ i, sup: t.sup, n: t.n, ti: t.ti, grp: g, title: t.title, rows: t.rows.length, via: mo.via, models: ks.length, newModels: isNew.length, modelList: mo.models.slice(0, 80), newKeys: isNew.slice(0, 80), flags });
  const s = sum.get(g) || { n: 0, sups: new Set(), rows: 0, models: 0, newM: 0, allKeys: new Set(), newKeys: new Set(), flags: {}, withModel: 0 };
  s.n++; s.sups.add(t.sup); s.rows += t.rows.length; s.models += ks.length; s.newM += isNew.length; if (ks.length) s.withModel++;
  ks.forEach((k) => s.allKeys.add(k)); isNew.forEach((k) => s.newKeys.add(k));
  for (const [k, v] of Object.entries(flags)) s.flags[k] = (s.flags[k] || 0) + v;
  sum.set(g, s);
  const mk = `${t.sup}|${g}`; matrix.set(mk, (matrix.get(mk) || 0) + 1);
  const ps = perSup.get(t.sup) || { n: 0, rows: 0, by: {} }; ps.n++; ps.rows += t.rows.length; ps.by[g] = (ps.by[g] || 0) + 1; perSup.set(t.sup, ps);
});
fs.writeFileSync(path.join(D, "phan-loai.json"), JSON.stringify(out));
fs.writeFileSync(path.join(D, "phan-loai.tsv"), ["stt\tncc\tn\tbang\tnhom\tso-dong\tcach-uoc-luong-model\tso-model-nhin-thay\tso-model-chua-co\ttieu-de"].concat(out.map((o) => [o.i, o.sup, o.n, o.ti, o.grp, o.rows, o.via, o.models, o.newModels, String(o.title).replace(/\s+/g, " ").slice(0, 100)].join("\t"))).join("\n") + "\n");
const fk = Object.keys(FLAGS);
const lines = ["nhom\tso-bang\tso-ncc\tso-dong\tbang-co-model-nhin-thay\tdong-model-tong-theo-bang\tdong-model-chua-co-theo-bang\tmodel-khac-nhau\tmodel-chua-co-trong-catalog\t" + fk.map((k) => "%bang-co-" + k).join("\t") + "\tdinh-nghia"];
for (const [k, v] of [...sum].sort()) lines.push([k, v.n, v.sups.size, v.rows, v.withModel, v.models, v.newM, v.allKeys.size, v.newKeys.size, ...fk.map((x) => Math.round((100 * (v.flags[x] || 0)) / v.n)), GROUPS[k]].join("\t"));
fs.writeFileSync(path.join(D, "tom-tat-nhom.tsv"), lines.join("\n") + "\n");
const groups = [...sum.keys()].sort();
fs.writeFileSync(path.join(D, "ncc-x-nhom.tsv"), ["ncc\ttong\t" + groups.join("\t")].concat([...perSup].sort((a, b) => b[1].n - a[1].n).map(([s, v]) => [s, v.n, ...groups.map((g) => v.by[g] || 0)].join("\t"))).join("\n") + "\n");
// Hợp nhất model "chưa có" qua các nhóm là mức tổ máy (một model xuất hiện ở nhiều nhóm chỉ tính một lần)
const GEN = ["R1", "R2", "T1", "P1", "V1", "V2", "V4", "V5", "V6", "F1"], PART = ["H1", "M1"];
const uni = (gs) => { const a = new Set(), n = new Set(); for (const g of gs) { const v = sum.get(g); if (!v) continue; v.allKeys.forEach((k) => a.add(k)); v.newKeys.forEach((k) => n.add(k)); } return { distinct: a.size, notInCatalog: n.size }; };
const tong = { tables: T.length, suppliers: perSup.size, rows: T.reduce((a, t) => a + t.rows.length, 0), tổ_máy: uni(GEN), bộ_phận: uni(PART), tổ_máy_và_bộ_phận: uni([...GEN, ...PART]) };
fs.writeFileSync(path.join(D, "tong-hop.json"), JSON.stringify(tong, null, 1));
for (const [k, v] of [...sum].sort()) console.log(`${k.padEnd(3)} ${String(v.n).padStart(5)} bảng ${String(v.sups.size).padStart(3)} NCC ${String(v.rows).padStart(6)} dòng  có-model ${String(v.withModel).padStart(4)} model ${String(v.allKeys.size).padStart(5)} chưa-có ${String(v.newKeys.size).padStart(5)}`);
console.log(JSON.stringify(tong));
