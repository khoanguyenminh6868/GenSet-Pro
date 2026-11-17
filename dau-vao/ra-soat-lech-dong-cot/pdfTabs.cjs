// node pdfTabs.cjs <repo> [id NCC] [n]: các bảng nguồn 5001–5999 (catalog PDF). Không có id: đếm theo NCC + khoá nguồn.
// Có id (và n): in tiêu đề + mọi dòng của bảng để đối chiếu với trang PDF.
const fs = require("fs"), path = require("path");
const [repo, id, n] = process.argv.slice(2);
const dir = path.join(repo, "suppliers", "cn");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const tabs = (s.specTables || []).filter((t) => t.n >= 5001 && t.n < 6000);
  if (!tabs.length || (id && s.id !== id)) continue;
  if (!id) {
    const src = (s.sources || s.specSources || []).filter((x) => x && x.n >= 5001 && x.n < 6000);
    console.log(s.id, "bảng", tabs.length, "dòng", tabs.reduce((a, t) => a + (t.rows || []).length, 0), "| khoá:", Object.keys(s).join(","));
    for (const t of tabs.slice(0, 400)) console.log("   n" + t.n, (t.rows || []).length, "dòng |", String(t.title || "").slice(0, 90), "|", Object.keys(t).join(","), t.source || t.url || t.file || "");
    if (src.length) console.log("   nguồn:", JSON.stringify(src).slice(0, 600));
    continue;
  }
  for (const t of tabs) {
    if (n && String(t.n) !== String(n)) continue;
    console.log(`\n[${s.id} n${t.n}] ${t.title || ""}`);
    for (const h of t.header || []) console.log("  H:", h);
    (t.rows || []).forEach((r, i) => console.log("  " + String(i).padStart(3), r));
  }
}
