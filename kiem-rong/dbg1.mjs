import * as L from "./lib.mjs";
const e = L.corpus().get("IB2300214975");
const h = L.INS.hintsOf(e.text, "");
console.log(JSON.stringify(h._raw), JSON.stringify(h._src));
const ls = e.text.split(/\r?\n/); console.log(JSON.stringify(ls.slice(203,212)));
process.exit(0);
