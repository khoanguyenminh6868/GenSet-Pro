// node 2-lop.mjs [web|repo]  → lop-<nguồn>.json + lop-<nguồn>.tsv (CHỈ ĐỌC; đọc quet-<nguồn>.json của 1-quet.mjs)
// Xếp mỗi khoá nghi trùng vào một lớp theo phần chữ thừa ("rest") so với khoá đích. Lớp và luật ở LOP bên dưới.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url)), SRC = process.argv[2] || "web";
const q = JSON.parse(fs.readFileSync(path.join(HERE, `quet-${SRC}.json`), "utf8"));
const COUNTRY = /^(INDIA|UK|EU|USA|EP|CHINA|JAPAN|GERMANY|ITALY|SME)$/;
const MAKE = /^(FAW|YANGDONG|HYUNDAI|PERKINS|CUMMINS|WEICHAI|DCEC|MISTUBISHI|MITSUBISHI|VOLVO|KUBOTA|STAFMORD|STAMFORD|DOOSAN|YUCHAI|SDEC|DEUTZ|BAUDOUIN|KOFO|RICARDO|DONGFENG|CHONGKANG|GUANGXI|PANGU|POWER|SHIGEYASU)$/;
const SAME_WORD = /^(SWITCHABLE|DERATE|COMMODITY)$/;
const UNKNOWN_WORD = /^(L|M|HD|HPI|SD|T-2|S550|E)$/;
const NUM_UNIT = /^\d+(?:[.,]\d+)?\s*(KW|KVA)$/;
const OWN_ALT_PREFIX = /^(EL|ELS|SY-A|JET|UCI|PI|HCI|UCD|UCDI|LVI)$/;
function classOf(o) {
  if (o.sep === "kytu") return "G-ngoac-quanh-hau-to";
  const toks = String(o.rest || "").toUpperCase().split(/\s+/).filter(Boolean);
  if (!toks.length) return "?";
  if (toks.every((t) => NUM_UNIT.test(t)) || (toks.length === 2 && /^\d+(\.\d+)?$/.test(toks[0]) && /^(KW|KVA)$/.test(toks[1]))) return "C-cong-suat-dinh-ma";
  if (o.sep === "phay" || (toks.length === 1 && /^\d{3,4}$/.test(toks[0]) && o.sep !== "gach")) return "C-so-dinh-ma";
  if (o.sep === "gach" && toks.length === 1 && /^1500|1800$/.test(toks[0])) return "C-so-dinh-ma";
  if (toks.length === 2 && /^\d+$/.test(toks[0]) && NUM_UNIT.test(toks[1])) return "C-cong-suat-dinh-ma";
  if (toks.every((t) => COUNTRY.test(t))) return "D-noi-san-xuat";
  if (toks.every((t) => MAKE.test(t))) return "E-ten-hang-dinh-ma";
  if (toks.every((t) => SAME_WORD.test(t))) return "F1-chu-mo-ta";
  if (o.kind === "alternators" && o.sep === "cach" && toks.length === 1 && OWN_ALT_PREFIX.test(toks[0])) return "H-dich-la-ma-tran";
  if (o.kind === "engines" && o.sep === "cach" && toks.length === 1 && UNKNOWN_WORD.test(toks[0])) return "F2-chu-chua-ro-nghia";
  // A code part: the target is the family (a shorter code) and the rest is the rating / variant part of the same code.
  const codey = (t) => /\d/.test(t) || /^[A-Z]{1,3}(-[A-Z])?$/.test(t) || /^(II|III)$/.test(t);
  if ((o.sep === "cach") && toks.every(codey) && o.key.startsWith(o.target)) return "X-hau-to-ma (khac dong co / hau to cong suat)";
  if (o.sep === "ngoac" || o.sep === "gach" || o.sep === "cach") return `AB-hai-ma-mot-o (${o.sep})`;
  return "?";
}
const out = q.map((o) => ({ ...o, lop: classOf(o) }));
fs.writeFileSync(path.join(HERE, `lop-${SRC}.json`), JSON.stringify(out, null, 1));
const tsv = ["loai\tlop\tsep\tkhoa\tdich\tphan_thua\tso_dong\tNCC\tdong_dich\tNCC_dich\tten\tdong_nguon_1"];
for (const o of out) tsv.push([o.kind, o.lop, o.sep, o.key, o.target, o.rest ?? "", o.rows, o.sups.join(","), o.tRows ?? "", o.tSups ?? "", o.names.join(" ; "), (o.uses[0] || "").replace(/\t/g, " ")].join("\t"));
fs.writeFileSync(path.join(HERE, `lop-${SRC}.tsv`), tsv.join("\n") + "\n");
const sum = {};
for (const o of out) { const k = `${o.kind}\t${o.lop}`; sum[k] ||= { keys: new Set(), rows: 0, sups: new Set() }; if (!sum[k].keys.has(o.key)) sum[k].rows += o.rows; sum[k].keys.add(o.key); o.sups.forEach((s) => sum[k].sups.add(s)); }
for (const [k, v] of Object.entries(sum).sort()) console.log(`${k}\tkhoá ${v.keys.size}\tdòng ${v.rows}\tNCC ${v.sups.size}\t${[...v.sups].slice(0, 12).join(",")}`);
