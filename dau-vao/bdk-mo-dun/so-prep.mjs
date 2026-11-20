// So đầu ra prep gốc ↔ nhánh cho một gói: mọi tệp .md / .json (trừ meta.json có giờ chạy) phải giống hệt từng ký tự;
// in thêm: mô-đun (DSE890/891/855, WebNet, CM2-4G, CM3-Ethernet, CM-RS232-485) có xuất hiện trong mục "Bộ điều khiển"
// của catalog.md hay trong controllers.md không.
// node so-prep.mjs <thư mục gốc> <thư mục nhánh>
import fs from "node:fs";
import path from "node:path";
const [a, b] = process.argv.slice(2);
const files = [...new Set([...fs.readdirSync(a), ...fs.readdirSync(b)])].filter((f) => /\.(md|json|txt)$/.test(f) && f !== "meta.json").sort();
let diff = 0;
for (const f of files) {
  const A = fs.existsSync(path.join(a, f)) ? fs.readFileSync(path.join(a, f), "utf8") : null;
  const B = fs.existsSync(path.join(b, f)) ? fs.readFileSync(path.join(b, f), "utf8") : null;
  const same = A === B;
  if (!same) diff++;
  console.log(`${same ? "=" : "KHÁC"} ${f} (${A?.length ?? "không có"} / ${B?.length ?? "không có"} ký tự)`);
}
const MOD = /DSE\s?89[01]|DSE\s?855|WebNet|CM2-4G|CM3-Ethernet|CM-RS232-485/gi;
for (const side of [a, b]) {
  const cat = fs.readFileSync(path.join(side, "catalog.md"), "utf8");
  const ctlSec = cat.split(/^## /m).filter((s) => /^Bộ điều khiển|^Thông số bộ điều khiển/.test(s)).join("\n");
  const ctl = fs.existsSync(path.join(side, "controllers.md")) ? fs.readFileSync(path.join(side, "controllers.md"), "utf8") : "";
  const heads = (t) => (t.match(/^### .*/gm) || []).filter((h) => MOD.test(h));
  console.log(`${path.basename(side)}: tên mô-đun trong mục bộ điều khiển của catalog.md ${(ctlSec.match(MOD) || []).length} lần, tiêu đề ### mang tên mô-đun: ${heads(ctlSec).length + heads(ctl).length}; controllers.md ${(ctl.match(MOD) || []).length} lần`);
}
console.log(diff ? `KHÁC ${diff} tệp` : "GIỐNG HỆT");
