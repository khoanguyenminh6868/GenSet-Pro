// Tóm tắt đo đủ PR #786 từ full\shard-*\rows.json.
import fs from "node:fs";
import path from "node:path";
const OUT = process.argv[2];
const rows = fs.readdirSync(OUT).filter((d) => d.startsWith("shard-") && fs.existsSync(path.join(OUT, d, "rows.json")))
  .flatMap((d) => JSON.parse(fs.readFileSync(path.join(OUT, d, "rows.json"), "utf8")));
const skip = rows.filter((r) => r.skip), err = rows.filter((r) => r.err), ok = rows.filter((r) => r.res?.off && r.res?.["1"]);
const L = [`Gói đã đo: ${rows.length} (chạy được ${ok.length}; không có chữ HSMT ${skip.length}; lỗi ${err.length})`];
for (const f of ["1", "fuel", "disp", "other"]) {
  let catDiff = 0, listDiff = 0, orderOnly = 0, add = 0, drop = 0; const ex = [];
  for (const r of ok) {
    const x = r.res[f]; if (!x) continue;
    if ((x.onlyHere || []).length || (x.goneHere || []).length) catDiff++;
    const o = r.res.off.models.map(String), n = x.models.map(String), so = new Set(o), sn = new Set(n);
    const a = n.filter((m) => !so.has(m)), d = o.filter((m) => !sn.has(m));
    if (a.length || d.length) { listDiff++; add += a.length; drop += d.length; if (ex.length < 6) ex.push(`${r.key}: +[${a.slice(0, 3).join(", ")}] −[${d.slice(0, 3).join(", ")}]`); }
    else if (JSON.stringify(o) !== JSON.stringify(n)) orderOnly++;
  }
  L.push(`${f}: catalog khác ${catDiff} gói; danh sách ứng viên đổi ${listDiff} gói (thêm ${add}, bớt ${drop} model), chỉ đổi thứ tự ${orderOnly} gói${ex.length ? "\n   vd " + ex.join("\n      ") : ""}`);
}
// Lý do mới xuất hiện / mất đi trong catalog.md khi bật cờ (dòng "chưa rõ"/"trừ điểm"...): đếm theo cụm từ.
const why = {};
for (const r of ok) for (const l of r.res["1"].onlyHere || []) { const m = l.match(/(chưa so|chưa rõ|không ghi[^,;.)]*|tiêu hao[^,;)]*|dung tích[^,;)]*|xi lanh[^,;)]*)/i); if (m) { const k = m[1].replace(/\d[\d.,]*/g, "#").slice(0, 60); why[k] = (why[k] || 0) + 1; } }
L.push("Cụm lý do mới khi bật cờ (dòng catalog chỉ có khi bật): " + JSON.stringify(Object.entries(why).sort((a, b) => b[1] - a[1]).slice(0, 12)));
for (const r of err.slice(0, 5)) L.push(`lỗi ${r.key}: ${r.err}`);
fs.writeFileSync(path.join(OUT, "summary-full.txt"), L.join("\n"), "utf8");
console.log(L.join("\n"));
