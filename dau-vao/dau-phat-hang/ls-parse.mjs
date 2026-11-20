// Đọc thử bảng định mức + "General characteristics" của tờ hãng đầu phát đã lưu bằng ratings.mjs hiện có.
// node ls-parse.mjs <gốc repo> <tệp nguồn .md>...
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const R = await import(pathToFileURL(path.join(root, "suppliers", "ratings.mjs")).href);
for (const f of process.argv.slice(3)) {
  const t = fs.readFileSync(f, "utf8");
  const rs = R.ratingsOf(t), at = R.altSheetAttrs(t);
  const models = [...new Set(rs.map((r) => r.model))];
  console.log(`${f}: ${rs.length} ô định mức, model: ${models.join(", ") || "-"}; thuộc tính: ${at.map((a) => a.key).join(", ") || "-"}`);
}
