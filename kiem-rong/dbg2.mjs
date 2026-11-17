import * as L from "./lib.mjs";
const e = L.corpus().get("IB2300214975");
const ls = e.text.split(/\r?\n/); const s = ls[207]; console.log([...s].map(c=>c.codePointAt(0).toString(16)).join(" "));
const h = L.INS.hintsOf(s + "\n" + ls[222], ""); console.log(JSON.stringify(h._raw));
const h2 = L.INS.hintsOf("Dung tích xy lanh: ≥ 9.7 L\n", ""); console.log(JSON.stringify(h2._raw));
const h3 = L.INS.hintsOf("Dung tích xy lanh: ≥ 9.7 L\nTổng dung tích làm mát: ≥ 22L\n", ""); console.log(JSON.stringify(h3._raw));
process.exit(0);
