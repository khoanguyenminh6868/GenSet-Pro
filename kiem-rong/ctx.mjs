import * as L from "./lib.mjs";
import fs from "node:fs";
const C = L.corpus(); const [key, re, n = 3, w = 3] = process.argv.slice(2);
const e = C.get(key); const lines = e.text.split(/\r?\n/);
console.log(key, e.src, "dòng", lines.length, "| gói:", e.analysis?.keyInfo?.bidName, "| cap:", e.analysis?.keyInfo?.generatorCapacity);
let c = 0;
lines.forEach((l, i) => { if (c < +n && new RegExp(re, "i").test(l)) { c++; console.log(`--- dòng ${i}`); for (let j = Math.max(0, i - +w); j <= Math.min(lines.length - 1, i + +w); j++) console.log((j === i ? ">> " : "   ") + lines[j].slice(0, 200)); } });
process.exit(0);
