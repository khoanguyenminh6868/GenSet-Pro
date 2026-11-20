// Phụ lục: mọi bảng của 4 nhóm, tiêu đề cột nguyên văn + 2 dòng đầu + bản ghi hiện tại (main) + lớp.
// node phu-luc.mjs all.json g3.json g2b.tsv out.tsv
import fs from "node:fs";
const [ALL, G3, G2B, OUT] = process.argv.slice(2);
const T = JSON.parse(fs.readFileSync(ALL, "utf8"));
const rows = [];
const kinds = (t) => { const k = {}; for (const r of t.recs) k[r.kind] = (k[r.kind] || 0) + 1; return Object.entries(k).map(([a, b]) => `${a} ${b}`).join(", ") || "0"; };
const push = (nhom, lop, t) => rows.push([nhom, lop, t.sid, t.n, t.ti, t.nrows, kinds(t), t.title, t.header.join(" // "), t.rows[0] || "", t.rows[1] || ""]);
// Nhóm 1: mọi bảng eastern-lion có ô EL / ELS / RUIFEN
const EL = /\|\s*ELS?\s?\d{3}/, RF = /RUIFEN/;
for (const t of Object.values(T)) {
  if (t.sid !== "eastern-lion-fuan" || !t.rows.some((r) => EL.test(r) || RF.test(r))) continue;
  const H = t.header.join(" ");
  const engEL = t.recs.some((r) => r.kind === "engine" && /^ELS?\s?\d/.test(r.model || ""));
  const alts = new Set(t.recs.filter((r) => r.kind === "alternator").map((r) => r.row)).size, elRows = t.rows.filter((r) => EL.test(r)).length;
  const lop = /Power range/.test(H) ? "1-tongquan (đúng: không bản ghi)" : /Core Length/.test(H) ? "1-bang-dau-phat-EL (0 bản ghi)" : engEL ? "1-EL-doc-lam-dong-co" : alts < elRows ? "1-thieu-dau-phat (RUIFEN sau EL)" : "1-dung";
  push("1", lop, t);
}
// Nhóm 2a
for (const k of ["jianghao-genset|4", "jianghao-genset|5", "kingway-power|12", "man-engines|4", "simpson-power|15"]) push("2a", "nhien-lieu-khong-ro", T[k]);
// Nhóm 2b
const g2b = fs.readFileSync(G2B, "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const LOP = (id, n, ti) => {
  const k = `${id}|${n}|${ti}`;
  if (["deep-sea-electronics", "smartgen", "comap"].includes(id)) return "2b-N bộ điều khiển (chữ khí/xăng trong datasheet)";
  if (["frs-shenyang|111|9", "vantek-jiangsu|111|13", "camda-generator|140|48"].includes(k)) return "2b-N không phải tổ máy (robot thoát nước / máy phát + bơm / lọc biogas)";
  if (id === "man-engines" || ["volvo-penta", "yanmar", "deutz-ag", "mhiet"].includes(id) && id !== "mhiet") return "2b-KDC động cơ khí của hãng";
  if (id === "scania-engines") return "2b-KDC động cơ hãng, lẫn diesel + khí (chú thích '* For natural gas')";
  if (id === "jet-power") return "2b-XDC động cơ xăng rời";
  if (["bison-zhejiang", "endress-stromerzeuger", "gordon-power", "grupel", "kena-chongqing", "kigerpower"].includes(id) || k === "zc-power|109|11" || k === "zc-power|109|12" || k === "zc-power|110|13") return "2b-XTM tổ máy xăng";
  if (["kachai-hangzhou", "winco", "powgen-argentina"].includes(id) || k === "zc-power|106|6" || k === "zc-power|109|10" || k === "shunfeng-changzhou|108|5") return "2b-KR không rõ / dải công suất / so sánh / tin";
  if (id === "younes-bros") return "2b-KR rao bán máy cũ (tuabin, CAT khí)";
  return "2b-KTM tổ máy khí / biogas / LPG / CHP";
};
for (const r of g2b) { const t = T[`${r[0]}|${r[2]}`]; push("2b", LOP(r[0], r[1], r[2]), t); }
// Nhóm 3
for (const o of JSON.parse(fs.readFileSync(G3, "utf8"))) push("3", o.cls === "A" ? "3-A đầu phát rời" : "3-E động cơ rời", T[`${o.sid}|${o.ti}`]);
// Nhóm 4
for (const t of Object.values(T)) if (t.sid === "huatai-yangzhou" && t.n === 111) push("4", "4-huatai", t);
const cols = ["nhom", "lop", "ncc", "n", "bang(ti)", "so-dong", "ban-ghi-hien-tai(main 389935b3)", "ten-trang", "tieu-de-cot", "dong-1", "dong-2"];
fs.writeFileSync(OUT, [cols.join("\t")].concat(rows.map((r) => r.map((x) => String(x).replace(/[\t\r\n]+/g, " ")).join("\t"))).join("\n") + "\n");
const c = {}; for (const r of rows) { const k = r[1]; c[k] = c[k] || { bang: 0, dong: 0 }; c[k].bang++; c[k].dong += r[5]; }
for (const [k, v] of Object.entries(c)) console.log(k, v.bang, v.dong);
console.log("tổng", rows.length);
