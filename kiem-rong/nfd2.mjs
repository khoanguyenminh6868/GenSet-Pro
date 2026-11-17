import * as L from "./lib.mjs";
// ảnh hưởng NFD: so hintsOf(text) với hintsOf(text.normalize("NFC")) trên toàn corpus
const C = L.corpus(); let diff = 0, n = 0; const rows = [];
for (const e of C.values()) { if (!/[̀-ͯ]/.test(e.text)) continue; n++; const a = L.B.hintsOf(e.text, ""), b = L.B.hintsOf(e.text.normalize("NFC"), "");
  for (const k of ["minDisp", "maxDisp", "minCyl", "minPrime", "maxFuel"]) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) { diff++; rows.push({ key: e.key, src: e.src, k, raw: a[k], nfc: b[k] }); } }
console.log("gói có NFD:", n, "| ngưỡng khác nhau giữa NFD và NFC:", diff);
for (const r of rows) console.log(JSON.stringify(r));
process.exit(0);
