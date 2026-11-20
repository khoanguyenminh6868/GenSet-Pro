// PR 1 bdk-mo-dun: tiêu đề bảng datasheet MÔ-ĐUN truyền thông = tên mô-đun (dòng đầu của tờ), không phải dòng đầu nhắc
// một bộ điều khiển (maker-datasheets.mjs controllerSheet lấy dòng đầu có model bộ điều khiển: "DSE8680" trong danh sách
// tương thích, "InteliLite" trong câu mô tả → mọi dòng của mô-đun thành thông số của bộ điều khiển đó).
// Chạy: node sua-tieu-de.mjs <thư mục suppliers của worktree>
import fs from "node:fs";
import path from "node:path";
const dir = process.argv[2];
const T = {
  "deep-sea-electronics": { 1012: "| DSE890 MKII DSEWebNet® / IoT | Gateway", 1013: "| DSE891 MKII DSEWebNet® Gateway | -", 1014: "| dse855 | SPECIFICATION", 1015: "| DSEWebNet® Remote Monitoring | Software" },
  comap: { 1014: "CM2-4G-GPS", 1015: "CM3-Ethernet", 1016: "CM-RS232-485" },
};
for (const [id, map] of Object.entries(T)) {
  const f = path.join(dir, "datasheets", `${id}.json`), list = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const t of list) if (map[t.n]) { console.log(id, t.n, JSON.stringify(t.title), "→", JSON.stringify(`Datasheet: ${map[t.n]}`)); t.title = `Datasheet: ${map[t.n]}`; }
  fs.writeFileSync(f, JSON.stringify(list, null, 1) + "\n", "utf8");
}
