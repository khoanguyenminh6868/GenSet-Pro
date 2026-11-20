// Chụp MỘT bản cố định mọi kết quả Gợi ý (configmatch) + Phân tích (analysis) + chữ HSMT từ web (chỉ đọc) để gốc và nhánh
// dùng chung. node snap.mjs <gốc repo>  → snap/configmatch.json, snap/analysis.json, hsmt/<TBMT>.txt
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve(process.argv[2]);
const CB = await import(pathToFileURL(path.join(root, "suppliers", "config-bot.mjs")).href);
const dir = path.join(import.meta.dirname, "snap");
fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(path.join(import.meta.dirname, "hsmt"), { recursive: true });
const cm = await CB.allDocs("configmatch");
const list = (Array.isArray(cm) ? cm : Object.entries(cm).map(([id, d]) => ({ id, ...d })));
console.log("configmatch:", list.length);
fs.writeFileSync(path.join(dir, "configmatch.json"), JSON.stringify(list), "utf8");
const ana = {};
for (const d of list) {
  const key = d.id || d.key;
  try { ana[key] = await CB.doc("analysis", key); } catch (e) { console.log(key, "analysis lỗi", e.message); }
  const f = path.join(import.meta.dirname, "hsmt", `${key}.txt`);
  if (!fs.existsSync(f)) { try { const { text } = await CB.hsmtTextOf(key); fs.writeFileSync(f, text || "", "utf8"); } catch (e) { console.log(key, "hsmt lỗi", e.message); } }
}
fs.writeFileSync(path.join(dir, "analysis.json"), JSON.stringify(ana), "utf8");
console.log("xong", Object.keys(ana).length);
