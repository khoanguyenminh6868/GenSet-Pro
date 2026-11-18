import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("gop-main.json", "utf8")), B = JSON.parse(fs.readFileSync("gop-lech-cot-11.json", "utf8"));
const pat = new RegExp(process.argv[2]); let n = 0;
for (const k of Object.keys(A)) { const a = A[k], b = B[k]; if (!a.all) continue; const mb = new Map(b.all); for (const [r, s] of a.all) if (pat.test(r) && mb.has(r) && mb.get(r) !== s) { if (n++ < 6) console.log(k, r.slice(0, 150), s, "→", mb.get(r), "top?", a.top.includes(r), b.top.includes(r)); } }
console.log("tổng", n);
