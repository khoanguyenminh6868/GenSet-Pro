// node rereadH.cjs <selH.json> [tệp ra.txt]: danh sách gói bidhist phải đọc lại sau khi sửa goods-read.js: 81 gói đã soát dòng thô
// + mọi gói nhiều phần lô có phần mang hàng hoá cạnh phần không có dòng nào (mẫu mảng dòng dồn hết vào phần đầu).
const fs = require("fs");
const J = JSON.parse(fs.readFileSync("C:/Projects/GenSet Pro/genbid-work/doc-cache/bidhist.json", "utf8")).docs;
const ids = new Set(JSON.parse(fs.readFileSync(process.argv[2], "utf8")).map((x) => x.id)); const base = ids.size;
let multi = 0, mixed = 0;
for (const [id, { d }] of Object.entries(J)) {
  const lots = d.lots || []; if (lots.length < 2) continue; multi++;
  const withG = lots.filter((l) => (l.goods || []).length).length;
  if (withG && withG < lots.length && d.url) { mixed++; ids.add(id); }
}
console.log(`gói nhiều phần lô ${multi}, có phần mang hàng cạnh phần trống ${mixed} | đọc lại ${ids.size} gói (${base} đã soát + ${ids.size - base} thêm)`);
if (process.argv[3]) fs.writeFileSync(process.argv[3], [...ids].sort().join(","));
