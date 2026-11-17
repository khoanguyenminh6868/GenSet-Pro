// node gopKey.cjs <gop a> <gop b> <khoá lượt>: in cấu trúc một lượt ở hai phép đo (mọi trường trừ top), và vị trí dòng vào / ra.
const fs = require("fs");
const [FA, FB, K] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(FA, "utf8"))[K], B = JSON.parse(fs.readFileSync(FB, "utf8"))[K];
const lineOf = (rk) => { const p = rk.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
for (const [n, x] of [["A", A], ["B", B]]) { const { top, ...rest } = x; console.log(n, JSON.stringify(rest).slice(0, 1500), "top", top.length); }
const sa = A.top.map(lineOf), sb = B.top.map(lineOf);
sb.forEach((r, i) => { if (!sa.includes(r)) console.log("vào ở vị trí", i, B.top[i].slice(0, 140)); });
sa.forEach((r, i) => { if (!sb.includes(r)) console.log("ra từ vị trí", i, A.top[i].slice(0, 140)); });
