// Nhóm 2b: 164 bảng có chữ khí / xăng, 0 bản ghi (phan-loai-ngoai-catalog.tsv). Ghép với cand.json (ti) và all.json (main hiện tại).
// node g2b.mjs <may-khi dir> all.json out.tsv
import fs from "node:fs";
import path from "node:path";
const [MK, ALL, OUT] = process.argv.slice(2);
const T = JSON.parse(fs.readFileSync(ALL, "utf8"));
const cand = JSON.parse(fs.readFileSync(path.join(MK, "cand.json"), "utf8"));
const tsv = fs.readFileSync(path.join(MK, "phan-loai-ngoai-catalog.tsv"), "utf8").trim().split("\n").slice(1).map((l) => l.split("\t"));
const used = new Set();
const rows = [];
for (const [id, n, dong, title, tier] of tsv) {
  const c = cand.find((x) => x.id === id && String(x.n) === n && String(x.nRows) === dong && x.nRecs === 0 && !used.has(x.id + "|" + x.ti));
  if (!c) { rows.push({ id, n, miss: true }); continue; }
  used.add(c.id + "|" + c.ti);
  const t = T[c.id + "|" + c.ti];
  const reasons = {}; for (const x of t.notes) reasons[x.reason] = (reasons[x.reason] || 0) + 1;
  const fuel = Object.keys(c.sig).filter((k) => !["url", "ng", "fuelv"].includes(k));
  const H = (t.header || []).join(" ");
  const R = t.rows.slice(0, 6).join(" ");
  // loại bảng (theo chữ, để gom; soát tay ở báo cáo)
  let kind;
  if (/controller|module|控制器|DSE|HGM/i.test(t.title + H) && /smartgen|deep-sea/.test(c.id)) kind = "bộ điều khiển";
  else if (!t.header.length && t.rows.every((r) => r.split("|").filter((x) => x.trim()).length <= 3)) kind = "bảng nhãn / dọc (1 máy)";
  else if (!t.header.length) kind = "bảng không tiêu đề cột (ngang theo cột model)";
  else if (/engine|发动机|柴油机|motor/i.test(H) && /model|型号|type/i.test(H)) kind = "bảng có cột động cơ";
  else if (/^(engine|motor)/i.test(t.title) || ["man-engines", "deutz-ag", "scania-engines", "volvo-penta", "yanmar", "mhiet"].includes(c.id)) kind = "bảng động cơ (hãng)";
  else kind = "bảng tổ máy / khác, không cột động cơ";
  rows.push({ id: c.id, n: c.n, ti: c.ti, tier, fuel: fuel.join("+"), nrows: t.nrows, recsNow: t.recs.length, kind, reason: Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ×${v}`).join("; ") || "(không note dòng)", url: c.url, title: t.title.slice(0, 90), header: t.header.join(" // ").slice(0, 220), ex1: (t.rows[0] || "").slice(0, 200), ex2: (t.rows[1] || "").slice(0, 200), why: (c.why || []).join(","), sigs: JSON.stringify(c.sig).slice(0, 250) });
}
const cols = ["id", "n", "ti", "tier", "fuel", "nrows", "recsNow", "kind", "reason", "url", "title", "header", "ex1", "ex2", "why", "sigs"];
fs.writeFileSync(OUT, [cols.join("\t")].concat(rows.map((r) => cols.map((k) => String(r[k] ?? "").replace(/[\t\n]/g, " ")).join("\t"))).join("\n") + "\n");
const by = (f) => { const m = {}; for (const r of rows) { const k = f(r); m[k] = m[k] || { bang: 0, dong: 0 }; m[k].bang++; m[k].dong += r.nrows || 0; } return m; };
console.log("khớp", rows.filter((r) => !r.miss).length, "/", rows.length, "trượt", rows.filter((r) => r.miss).map((r) => r.id + " " + r.n).join(","));
console.log("bản ghi hiện tại >0:", rows.filter((r) => r.recsNow > 0).map((r) => `${r.id} n${r.n} ${r.recsNow}`).join(", ") || "0");
console.log("theo nhiên liệu", JSON.stringify(by((r) => r.fuel)));
console.log("theo loại", JSON.stringify(by((r) => r.kind), null, 0));
console.log("theo lý do", JSON.stringify(by((r) => (r.reason || "").split(" ×")[0])));
