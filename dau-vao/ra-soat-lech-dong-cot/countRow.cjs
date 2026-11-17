// node countRow.cjs <gop.json> <regex>: các lượt có dòng top khớp regex (khoá dòng của do-gop.mjs).
const fs = require("fs");
const [F, RE] = process.argv.slice(2), re = new RegExp(RE, "i"), G = JSON.parse(fs.readFileSync(F, "utf8"));
let n = 0; for (const [k, x] of Object.entries(G)) for (const [i, r] of (x.top || []).entries()) if (re.test(r)) { n++; console.log(k, "vị trí", i, "/", x.top.length, r.slice(0, 90)); }
console.log("tổng", n);
