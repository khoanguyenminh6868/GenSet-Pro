// node rawRow.cjs <thư mục rawH> <id> [số dòng]: in nguyên các dòng thô đầu tiên của bảng hàng hoá từng lô (mọi trường có giá trị).
const fs = require("fs"), path = require("path");
const [dir, id, max = 3] = process.argv.slice(2);
const kq = JSON.parse(fs.readFileSync(path.join(dir, id + ".json"), "utf8"));
const parse = (v) => { try { return typeof v === "string" ? JSON.parse(v || "[]") : v || []; } catch { return null; } };
const slim = (r) => Object.fromEntries(Object.entries(r).filter(([, v]) => !(v == null || v === "" || (Array.isArray(v) && !v.length))).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 70) : v]));
for (const lot of kq.lotResultDTO || []) {
  const g = parse(lot.goodsList);
  console.log(`\nlô ${lot.lotNo} | khoá lô: ${Object.keys(lot).join(",")}`);
  console.log("  goodsList:", Array.isArray(g) ? `mảng ${g.length}` : g && typeof g === "object" ? "object " + Object.keys(g).join(",") : g);
  const rows = Array.isArray(g) ? g : (g?.dsHhKq || []);
  for (const r of rows.slice(0, Number(max))) console.log("   ", JSON.stringify(slim(r)).slice(0, 1500));
}
for (const o of (kq.lotOpenDetails || []).slice(0, 20)) console.log("mở thầu:", JSON.stringify(slim(o)).slice(0, 400));
