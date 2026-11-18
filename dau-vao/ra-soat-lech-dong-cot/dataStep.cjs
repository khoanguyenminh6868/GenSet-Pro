// node dataStep.cjs > dataStep.txt: lech-cot-9, bước DỮ LIỆU O → X theo khoá dòng (không đo lại).
// O = gop-lech-cot-8.json (mã = main, dữ liệu e0f51ec8). X = dữ liệu b9d4f06d, mã main: lượt có minCyl lấy từ rowCyl-main.json
// (gopRow), lượt khác = gop-lech-cot-9.json (nhánh = main khi không có minCyl). So top theo khoá NCC | dòng (bỏ động cơ, đầu phát).
// Phân loại mỗi dòng ra / vào theo 8 tệp dữ liệu đổi (#904 denyo, #906 yanmar, #907 kubota → kubota-japan, #909 starlight-power →
// xingguang-jiangsu, yingtai-group → yingtai-jiangsu). Không có điểm ở dữ liệu cũ (lượt gopRow dữ liệu cũ bị ngắt 16:17).
const fs = require("fs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const G8 = J("gop-lech-cot-8.json"), G9 = J("gop-lech-cot-9.json"), XC = J("rowCyl-main.json");
const lineKey = (k) => { const p = k.split("|"); return p[0] + "|" + p.slice(3).join("|"); };
const sup = (rk) => rk.split("|")[0], line = (rk) => rk.split("|").slice(1).join("|");
const MERGE = { "starlight-power": "xingguang-jiangsu", "yingtai-group": "yingtai-jiangsu", kubota: "kubota-japan" };
const INTO = Object.fromEntries(Object.entries(MERGE).map(([a, b]) => [b, a]));
const DATA = new Set([...Object.keys(MERGE), ...Object.values(MERGE), "denyo", "yanmar"]);
const T = {}, add = (c) => (T[c] = (T[c] || 0) + 1);
const allD = { down: 0, up: 0, same: 0, hist: {} };
let same = 0, order = 0, setc = 0, nOut = 0, nIn = 0;
const lines = [], orderRuns = [];
for (const k of Object.keys(G8)) {
  const o = G8[k].top.map(lineKey);
  const x = XC[k] ? Object.entries(XC[k].rows).filter(([, r]) => r.st === "top").sort((a, b) => a[1].ti - b[1].ti).map(([q]) => q) : G9[k].top.map(lineKey);
  const ax = XC[k] ? Object.values(XC[k].rows).filter((r) => r.st !== "dropped").length : G9[k].all;
  const d = ax - G8[k].all; allD[d < 0 ? "down" : d > 0 ? "up" : "same"]++; allD.hist[d] = (allD.hist[d] || 0) + 1;
  if (JSON.stringify(o) === JSON.stringify(x)) { same++; continue; }
  const so = new Set(o), sx = new Set(x), outs = o.filter((r) => !sx.has(r)), ins = x.filter((r) => !so.has(r));
  if (!outs.length && !ins.length) {
    order++;
    // Đổi thứ tự: dòng đổi chỗ có thuộc NCC đổi dữ liệu không.
    const moved = o.filter((r, i) => x[i] !== r);
    const touch = moved.some((r) => DATA.has(sup(r)));
    add(`thứ tự: ${touch ? "có dòng của NCC đổi dữ liệu trong nhóm đổi chỗ" : "KHÔNG có dòng NCC đổi dữ liệu"}`);
    orderRuns.push(`${k}: ${moved.length} vị trí; NCC đổi chỗ: ${[...new Set(moved.map(sup))].join(", ")}`);
    continue;
  }
  setc++; nOut += outs.length; nIn += ins.length;
  lines.push(`\n== ${k} (ra ${outs.length}, vào ${ins.length}; all ${G8[k].all} → ${ax})`);
  for (const r of outs) {
    const s = sup(r);
    const c = MERGE[s] ? (sx.has(`${MERGE[s]}|${line(r)}`) ? `ra: ${s} → ${MERGE[s]}, cùng dòng vẫn trong top (đổi id)` : `ra: ${s} gộp / xoá, bản ${MERGE[s]} không trong top`) : `ra: dòng NCC khác (bị đẩy hoặc đổi xếp hạng do dữ liệu)`;
    add(c); lines.push(`  ${c}: ${r.slice(0, 100)}`);
  }
  for (const r of ins) {
    const s = sup(r);
    const c = INTO[s] && so.has(`${INTO[s]}|${line(r)}`) ? `vào: ${s} (gộp từ ${INTO[s]}), cùng dòng (đổi id)` : DATA.has(s) ? `vào: dòng của NCC đổi dữ liệu (${s})` : "vào: dòng NCC khác (lấp chỗ)";
    add(c); lines.push(`  ${c}: ${r.slice(0, 100)}`);
  }
}
// Khoá lượt mà bước dữ liệu đổi top (tập hoặc thứ tự): đo lại từng dòng bằng gopRow (mã main, dữ liệu cũ và mới).
const changedKeys = Object.keys(G8).filter((k) => lines.some((l) => l.startsWith(`\n== ${k} `)) || orderRuns.some((l) => l.startsWith(`${k}:`)));
const cylSet = new Set(Object.keys(XC));
fs.writeFileSync("keys-du-lieu.txt", changedKeys.join(","));
fs.writeFileSync("keys-du-lieu-nocyl.txt", changedKeys.filter((k) => !cylSet.has(k)).join(","));
console.log(`Bước dữ liệu O → X, 1.093 lượt: top giống hệt ${same}; chỉ đổi thứ tự ${order}; đổi tập ${setc} (ra ${nOut}, vào ${nIn})`);
console.log(`all: giảm ${allD.down}, tăng ${allD.up}, giữ ${allD.same} lượt; phân bố chênh: ${JSON.stringify(allD.hist)}`);
for (const [c, v] of Object.entries(T).sort()) console.log(`${String(v).padStart(5)}  ${c}`);
console.log("\nĐổi thứ tự:\n" + orderRuns.join("\n"));
console.log(lines.join("\n"));
