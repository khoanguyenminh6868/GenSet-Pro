// Chụp MỘT bản cố định mọi kết quả Gợi ý + Phân tích + chữ HSMT từ web (chỉ đọc), để gốc và nhánh dùng chung.
// Lưu ngoài repo vì là chữ HSMT. node snap.mjs <gốc repo> [thư mục HSMT có sẵn]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]), old = process.argv[3], here = import.meta.dirname;
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
fs.mkdirSync(path.join(here, "snap"), { recursive: true });
fs.mkdirSync(path.join(here, "hsmt"), { recursive: true });
const cm = await CB.allDocs("configmatch");
const list = Array.isArray(cm) ? cm : Object.entries(cm).map(([id, d]) => ({ id, ...d }));
fs.writeFileSync(path.join(here, "snap", "configmatch.json"), JSON.stringify(list), "utf8");
const ana = {}, bad = [];
for (const d of list) {
  const key = d.id || d.key;
  try { ana[key] = await CB.doc("analysis", key); } catch (e) { bad.push(`${key} analysis: ${e.message}`); }
  const f = path.join(here, "hsmt", `${key}.txt`), o = old && path.join(old, `${key}.txt`);
  if (fs.existsSync(f)) continue;
  if (o && fs.existsSync(o)) { fs.copyFileSync(o, f); continue; }
  try { const { text } = await CB.hsmtTextOf(key); fs.writeFileSync(f, text || "", "utf8"); } catch (e) { bad.push(`${key} hsmt: ${e.message}`); }
}
fs.writeFileSync(path.join(here, "snap", "analysis.json"), JSON.stringify(ana), "utf8");
const at = list.map((d) => `${d.id || d.key} ${d.data?.at || d.at || ""}`);
console.log("configmatch:", list.length, "analysis:", Object.keys(ana).length, "lỗi:", bad.length);
console.log(bad.join("\n"));
console.log(at.join("\n"));
