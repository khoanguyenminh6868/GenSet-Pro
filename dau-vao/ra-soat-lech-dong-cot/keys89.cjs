// node keys89.cjs <gop 8> <gop 9> <cylKeys.txt>: ghi keys-doi.txt (lượt đổi tập hoặc thứ tự top 30) và keys-doi-nocyl.txt (trong
// đó, lượt không có minCyl: chưa có gopRow dữ liệu mới).
const fs = require("fs");
const [FA, FB, CK] = process.argv.slice(2);
const A = JSON.parse(fs.readFileSync(FA, "utf8")), B = JSON.parse(fs.readFileSync(FB, "utf8"));
const cyl = new Set(fs.readFileSync(CK, "utf8").split(","));
const keys = Object.keys(A).filter((k) => JSON.stringify(A[k].top) !== JSON.stringify(B[k].top));
fs.writeFileSync("keys-doi.txt", keys.join(","));
fs.writeFileSync("keys-doi-nocyl.txt", keys.filter((k) => !cyl.has(k)).join(","));
console.log(keys.length, keys.filter((k) => !cyl.has(k)).length);
