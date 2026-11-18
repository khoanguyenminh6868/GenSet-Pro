// node allWhy.cjs: câu 1 của điều phối (all giảm mà dropped không tăng). Lượt không minCyl có gopRow cả hai bộ dữ liệu
// (rowDL-cu / rowDL-moi-nocyl): chênh all của gop (8 → 9, chỉ do dữ liệu ở các lượt này) = − dòng yingtai-group / kubota /
// starlight-power ở gốc + dòng yingtai-jiangsu / kubota-japan / xingguang-jiangsu / denyo / yanmar mới? Đếm dòng (all và dropped)
// theo NCC trong gopRow bằng khoá đầy đủ không có, nên đếm theo khoá NCC | dòng (gộp trùng) và so chênh theo NCC.
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const O = J("rowDL-cu.json"), XN = J("rowDL-moi-nocyl.json"), G8 = J("gop-lech-cot-8.json"), G9 = J("gop-lech-cot-9.json");
const DATA = ["starlight-power", "xingguang-jiangsu", "yingtai-group", "yingtai-jiangsu", "kubota", "kubota-japan", "denyo", "yanmar"];
const cnt = (R, st) => { const m = {}; for (const [k, r] of Object.entries(R.rows)) if (st(r)) { const s = k.split("|")[0]; m[s] = (m[s] || 0) + 1; } return m; };
let n = 0, ok = 0, other = 0;
const T = {};
for (const k of Object.keys(XN)) {
  n++;
  const a = cnt(O[k], (r) => r.st !== "dropped"), b = cnt(XN[k], (r) => r.st !== "dropped");
  const da = cnt(O[k], (r) => r.st === "dropped"), db = cnt(XN[k], (r) => r.st === "dropped");
  const sups = [...new Set([...Object.keys(a), ...Object.keys(b), ...Object.keys(da), ...Object.keys(db)])];
  const chg = sups.filter((s) => (a[s] || 0) !== (b[s] || 0) || (da[s] || 0) !== (db[s] || 0));
  if (chg.every((s) => DATA.includes(s))) ok++; else { other++; console.log("NCC ngoài 8 tệp đổi:", k, chg.filter((s) => !DATA.includes(s))); }
  const yg = (a["yingtai-group"] || 0), dg = (da["yingtai-group"] || 0);
  const key = `gop all ${G9[k].all - G8[k].all >= 0 ? "+" : ""}${G9[k].all - G8[k].all}, dropped ${G9[k].dropped - G8[k].dropped}; yingtai-group ở gốc: all ${yg}, dropped ${dg}`;
  T[key] = (T[key] || 0) + 1;
}
console.log(`lượt: ${n}; chỉ NCC của 8 tệp đổi số dòng: ${ok}; có NCC khác: ${other}`);
for (const [k, v] of Object.entries(T)) console.log(String(v).padStart(4), k);
