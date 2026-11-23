// Kiểm đuôi /5, /6, /S của mã Baudouin với cột RPM trong MỌI tờ hãng đã lưu (sources/baudouin/*.md).
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const WANT = ["4M06G25/6", "8M33G770/6", "12M55G2500/6", "4M10G66/6", "12M33G1000/6", "16M33G1400/6", "16M55G3300/6"];
const CODE = /^(\d+M\d+[A-Z0-9]*)\/([56S])(\^?)$/;
const seen = new Map(); // code -> { suf, rpms:Set, files:Set, noRpm:number }
const notes = new Map();

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
  const lines = fs.readFileSync(path.join(dir, f), "utf8").split(/\r?\n/);
  for (const l of lines) {
    if (/switchable|50\s*\/\s*60\s*Hz/i.test(l)) notes.set(l.trim().slice(0, 110), (notes.get(l.trim().slice(0, 110)) || 0) + 1);
    if (!l.startsWith("|")) continue;
    const cells = l.split("|").slice(1).map((c) => c.trim()).filter((c) => c !== "");
    const m = cells[0]?.match(CODE);
    if (!m) continue;
    const r = seen.get(cells[0]) || { suf: m[2], rpms: new Set(), files: new Set(), noRpm: 0 };
    r.files.add(f);
    const last = cells[cells.length - 1];
    // Chỉ tin ô CUỐI (cột RPM của bảng công suất) hoặc ô thứ hai của bảng kích thước có đúng 6 ô; ô giữa có thể là công suất.
    // Bảng công suất CÓ cột RPM: mã + 6 số + RPM (≥ 8 ô). Bảng 7 ô không có cột RPM: ô cuối là kVA (12M33G1200/6 ... 1500).
    // Bảng kích thước: mã | RPM | D | R | C | khối lượng (6 ô), hoặc hai bản trần / vỏ (10 ô).
    if (cells.length >= 8 && cells.length !== 10 && (last === "1500" || last === "1800")) r.rpms.add(Number(last));
    else if ((cells.length === 6 || cells.length === 10) && (cells[1] === "1500" || cells[1] === "1800")) r.rpms.add(Number(cells[1]));
    else r.noRpm++;
    seen.set(cells[0], r);
  }
}

const tally = { 5: { ok: 0, bad: [], none: [] }, 6: { ok: 0, bad: [], none: [] }, S: { r1500: 0, r1800: 0, both: 0, none: 0 } };
for (const [code, r] of seen) {
  if (r.suf === "S") {
    const a = r.rpms.has(1500), b = r.rpms.has(1800);
    tally.S[a && b ? "both" : a ? "r1500" : b ? "r1800" : "none"]++;
    continue;
  }
  const want = r.suf === "5" ? 1500 : 1800, t = tally[r.suf];
  if (!r.rpms.size) t.none.push(code);
  else if (r.rpms.size === 1 && r.rpms.has(want)) t.ok++;
  else t.bad.push(`${code} rpm=${[...r.rpms].join("/")} (${[...r.files].join(",")})`);
}
console.log("mã khác nhau:", seen.size);
console.log("/5: khớp 1500 =", tally[5].ok, "| trái =", tally[5].bad.length, "| không đọc được rpm =", tally[5].none.length);
console.log("/6: khớp 1800 =", tally[6].ok, "| trái =", tally[6].bad.length, "| không đọc được rpm =", tally[6].none.length);
console.log("/S:", JSON.stringify(tally.S));
console.log("TRÁI:", [...tally[5].bad, ...tally[6].bad].join("\n  ") || "(không)");
console.log("/5 không rpm:", tally[5].none.join(" "));
console.log("/6 không rpm:", tally[6].none.join(" "));
console.log("--- 7 mã trong yêu cầu:");
for (const c of WANT) {
  const hit = seen.get(c) || seen.get(c + "^");
  console.log(c, hit ? `rpm=${[...hit.rpms].join("/") || "?"} tệp=${[...hit.files].join(",")}` : "KHÔNG có trong tờ hãng");
}
console.log("--- chú thích tần số trong tờ hãng:");
for (const [k, v] of notes) console.log(v, k);
