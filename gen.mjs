import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("nen.json")), B = JSON.parse(fs.readFileSync("th.json"));
const ch = JSON.parse(fs.readFileSync("changes.json"));
const pk = [...new Set(ch.map((c) => c.pkg))];
const short = (r) => { const p = r.split("|"); return `${p[0]} · ${p[1]}${p[4] ? " · " + p[4] : ""}`.slice(0, 70); };
let md = "";
const out = {};
for (const k of pk) {
  const inB = new Set(B[k].all.map((x) => x[0]));
  const rows = ch.filter((c) => c.pkg === k);
  md += `\n### ${k} (${rows.length} dòng đổi)\n\n| NCC · khoá động cơ · mã máy | hạng nền → tích hợp | điểm nền → tích hợp | loại | nguyên nhân |\n|---|---|---|---|---|\n`;
  for (const c of rows) {
    let type, why;
    if (c.from && !c.to) { type = inB.has(c.row) ? "RA top30 (vẫn trong danh sách đầy đủ)" : "BỊ LOẠI khỏi danh sách"; }
    else if (!c.from) type = "VÀO top30";
    else type = c.from[1] === c.to[1] ? "dịch hạng" : "ĐỔI ĐIỂM";
    out[c.pkg + "|" + c.row] = type;
    const sup = c.row.split("|")[0];
    if (type.startsWith("BỊ LOẠI")) why = sup === "longkai-power" ? "mất standby: 'Max power(with fan)' thành engPower (#1239)" : "gắn freq 60 Hz > HSMT 50 Hz (#1240)";
    else if (type === "dịch hạng") why = "một dòng phía trên rời top30";
    else if (type === "VÀO top30") why = "chỗ trống: trần NCC (4) / động cơ (3) mở khi dòng bị loại rời đi; điểm không đổi";
    else why = "";
    if (/comappower\|S16RPTAA2/.test(c.row) && type.startsWith("RA")) why = "KHÔNG QUY ĐƯỢC trực tiếp (xem mục 'Không quy được')";
    if (/byc-power\|YCC80TA3000G30/.test(c.row)) why = "chỗ cuối top30 sau khi comappower rời; KHÔNG QUY ĐƯỢC trực tiếp";
    md += `| ${short(c.row)} | ${c.from ? c.from[0] : "–"} → ${c.to ? c.to[0] : "–"} | ${c.from ? c.from[1] : "–"} → ${c.to ? c.to[1] : "–"} | ${type} | ${why} |\n`;
  }
}
fs.writeFileSync("bang-dong.md", md);
const cnt = {}; for (const t of Object.values(out)) cnt[t] = (cnt[t] || 0) + 1; console.log(cnt);
