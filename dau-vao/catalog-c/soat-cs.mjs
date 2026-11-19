// Soát công suất đọc được của MỌI dòng T (1.753): tỉ số kW/kVA, prime > standby, và nhãn mức so với tiêu đề.
import fs from "node:fs";
const T = JSON.parse(fs.readFileSync("t-rows.json", "utf8"));
const out = { lech: {}, primeGtStandby: {}, contRead: 0, engMixed: 0 };
const ex = {};
for (const h of T) {
  for (const p of Object.values(h.power || {})) if (p.kVA && p.kW) {
    const r = p.kW / p.kVA;
    if (!(r >= 0.75 && r <= 0.86) && r !== 1) { out.lech[h.sup] = (out.lech[h.sup] || 0) + 1; ex[h.sup] ||= `${h.line.slice(0, 100)} => ${JSON.stringify(h.power)}`; }
  }
  const P = h.power || {};
  if (P.prime && P.standby && ((P.prime.kVA || 0) > (P.standby.kVA ?? 1e9) || (P.prime.kW || 0) > (P.standby.kW ?? 1e9))) out.primeGtStandby[h.sup] = (out.primeGtStandby[h.sup] || 0) + 1;
  if (/continuous/i.test(h.header) && (P.prime || P.standby)) out.contRead++;
  if (/Engine \(Output Power\)/i.test(h.header)) out.engMixed++;
}
console.log(JSON.stringify(out, null, 1));
console.log(ex);
