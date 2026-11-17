import * as L from "./lib.mjs";
const C = L.corpus(); const st = {};
for (const e of C.values()) { const nfd = /[̀-ͯ]/.test(e.text); const k = e.src; st[k] = st[k] || { n: 0, nfd: 0, nfdNoNfcDisp: 0 }; st[k].n++; if (nfd) { st[k].nfd++; const ratio = (e.text.match(/[̀-ͯ]/g) || []).length / (e.text.match(/[À-ỹ]/g) || [1]).length; if (ratio > 0.5) st[k].nfdNoNfcDisp++; } }
console.log(st); process.exit(0);
