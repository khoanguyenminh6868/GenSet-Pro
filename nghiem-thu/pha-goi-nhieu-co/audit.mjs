// node audit.mjs <truoc.tsv> <sau.tsv> <analysis.json> <out.tsv>
// Mọi lượt nhiều cỡ có pha 1/3 ở trước hoặc sau. Đối chiếu độc lập với Phân tích:
//  capPha: đoạn của keyInfo.generatorCapacity chứa con số của cỡ (tách theo ; và "và" / "+" / ")")
//  specPha: các dòng technicalSpecs có chữ pha mà item hoặc requirement nêu con số của cỡ
//  allPha: mọi loại pha trong các dòng technicalSpecs (lọc thiết bị khác thô)
import fs from "node:fs";
const [A, Bf, AN, OUT] = process.argv.slice(2);
const rd = (f) => fs.readFileSync(f, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const before = new Map(rd(A).map((r) => [`${r[0]}#${r[1]}`, r]));
const after = rd(Bf);
const an = JSON.parse(fs.readFileSync(AN, "utf8")).docs;
const P3 = /(?<![\d.,])0?3\s*-?\s*(?:pha(?![\p{L}])|ph(?:ase)?(?![\p{L}]))|(?<![\p{L}])ba\s+pha(?![\p{L}])|three\s*-?\s*phase/iu;
const P1 = /(?<![\d.,])0?1\s*-?\s*(?:pha(?![\p{L}])|ph(?:ase)?(?![\p{L}]))|(?<![\p{L}])m[ộo]t\s+pha(?![\p{L}])|single\s*-?\s*phase/iu;
const AUX = /s[ạa]c|[ắa]c\s*quy|đ[ồo]ng\s*h[ồo]|bi[ếe]n\s*(?:d[òo]ng|[áa]p)|aptomat|c[ầa]u\s*dao|\bATS\b|chuy[ểe]n\s*đ[ổo]i\s*ngu[ồo]n|\bt[ủu]\b|b[ảa]o\s*v[ệe]|m[ấa]t\s*pha|l[ệe]ch\s*pha|\bMCCB\b|\bACB\b/iu;
const kinds = (s) => { const k = new Set(); if (P3.test(s)) k.add(3); if (P1.test(s)) k.add(1); return k; };
const fig = (co) => { const v = Number(co.split(" ")[0]); return new RegExp(`(?<![\\d.,])0*${String(v).replace(".", "[.,]")}(?:[.,]0+)?\\s*(?:kVA|kW|KVA|KW|kva|kw|Kva|Kw)`, "i"); };
const show = (k) => (k.size === 1 ? [...k][0] : k.size ? "1+3" : "-");
const rows = [["goi", "luot", "co", "truoc", "sau", "how", "capPha", "specPha", "allPha", "capDoan", "specDong"].join("\t")];
for (const r of after) {
  if (r[3] !== "nhieu-co") continue;
  const b = before.get(`${r[0]}#${r[1]}`);
  if (!["1", "3"].includes(r[4]) && !["1", "3"].includes(b[4])) continue;
  const res = an[r[0]]?.d?.result || {};
  const re = fig(r[2]);
  const cap = String(res.keyInfo?.generatorCapacity || "");
  const segs = cap.split(/;|\bvà\b|\+|\)\s*,/).filter((s) => re.test(s));
  const capK = new Set(segs.flatMap((s) => [...kinds(s)]));
  const specs = (res.technicalSpecs || []).map((x) => `${x.item || ""}: ${x.requirement || ""}`).filter((s) => /pha(?![\p{L}])|phase/iu.test(s) && (!AUX.test(s) || /s[ốo]\s*pha/iu.test(s)));
  const allK = new Set(specs.flatMap((s) => [...kinds(s)]));
  const mine = specs.filter((s) => re.test(s));
  const specK = new Set(mine.flatMap((s) => [...kinds(s)]));
  rows.push([r[0], r[1], r[2], b[4], r[4], r[5], show(capK), show(specK), show(allK), segs.join(" ¦ ").slice(0, 160), mine.join(" ¦ ").slice(0, 200)].join("\t"));
}
fs.writeFileSync(OUT, rows.join("\n") + "\n");
console.error("lượt", rows.length - 1);
