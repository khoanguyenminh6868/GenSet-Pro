import * as L from "./lib.mjs";
const [key, a, b] = process.argv.slice(2); const e = L.corpus().get(key); const ls = e.text.split(/\r?\n/);
console.log(ls.slice(+a, +b).map((l, i) => `${+a + i}: ${l}`).join("\n").slice(0, 6000)); process.exit(0);
