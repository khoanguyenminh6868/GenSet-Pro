// Phản chứng: đặt lại tiêu đề tự động của maker-datasheets.mjs cho 7 bảng mô-đun (trong một worktree nháp) để thấy
// vì sao phải sửa tiêu đề. node tieu-de-tu-dong.mjs <repo nháp>
import fs from "node:fs";
import path from "node:path";
const repo = process.argv[2];
const AUTO = {
  "deep-sea-electronics": { 1012: "Datasheet: | DSE8680 | Synchronising Generator Bus Tie Control Module | 8680-01", 1013: "Datasheet: | DSE8680 | Synchronising Generator Bus Tie Control Module | 8680-01", 1014: "Datasheet: | dse855 Installation Instructions | 053-159 | dse6010/20", 1015: "Datasheet: DSEComms Data Sheet" },
  comap: { 1016: "Datasheet: Optional plug-in card to enable InteliLite the RS232" },
};
for (const [id, map] of Object.entries(AUTO)) {
  const f = path.join(repo, "suppliers/cn", `${id}.json`), s = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const t of s.specTables) if (map[t.n]) t.title = map[t.n];
  fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n", "utf8");
}
