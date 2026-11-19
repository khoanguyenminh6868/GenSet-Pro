// (a) MỌI dòng được chuyển từ tiêu đề sang dòng (nhánh): mỗi dòng cho bản ghi nào; dòng không cho bản ghi thì vì sao.
// Dòng chuyển tính lại theo đúng luật `headerRows` của catalog.js nhánh (cùng isCode / cellsOf), dòng thứ j chuyển → chỉ số
// rows.length + j. Kèm danh sách ghi chú "dòng máy lẫn với dòng tiêu đề" (bảng để nguyên).
// node 6-dong-chuyen.mjs
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const load = (root) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(root, "web", "catalog.js"), "utf8"), box); return box.GenbidCatalog; };
const CB = load("goc"), CH = load("../../../../wt-catalog-a"), dir = "../../../../wt-catalog-a/suppliers/cn";
const norm = (x) => String(x || "").replace(/\s+/g, " ").trim();
const C = CH;
const data = (l) => { const c = C.cellsOf(l); return c.length >= 3 && C.isCode(c[0]) && c.slice(1).some((x) => /\d/.test(x)); };
const out = ["ncc\tn\tbang\tdong-moi\tket-qua\tban-ghi\tdong-nguon"], tally = {}, notes = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); if (s.status === "incomplete") continue;
  const nh = [];
  let rb = null, rh = null;
  (s.specTables || []).forEach((t, ti) => {
    const H = t.header || [], R = t.rows || [];
    if (H.length < 2 || !R.length || !C.isCode(C.cellsOf(R[0])[0])) return;
    const at = H.findIndex((l, i) => i >= 1 && data(l));
    if (at < 0 || !H.slice(at).every(data)) return;
    rb = rb || CB.fromSupplier(s); rh = rh || CH.fromSupplier(s, nh);
    const seenB = new Set(rb.map((o) => norm(o.line)));
    H.slice(at).forEach((line, j) => {
      const ri = R.length + j;
      const recs = rh.filter((o) => [o, ...(o.also || [])].some((a) => a.table === ti && a.row === ri && (a.n ?? o.n) === t.n));
      const own = recs.filter((o) => o.table === ti && o.row === ri);
      let res = !recs.length ? "không bản ghi" : !own.length ? "gộp vào bản ghi đã có (chữ dòng trùng dòng khác)" : seenB.has(norm(line)) ? "bản ghi (chữ dòng đã đọc ở gốc)" : "bản ghi mới";
      tally[`${s.id}\t${res}`] = (tally[`${s.id}\t${res}`] || 0) + 1;
      out.push([s.id, t.n, ti, ri, res, recs.map((o) => `${o.kind}=${o.model}${o.table === ti && o.row === ri ? "" : ` (ở n${o.n} b${o.table} dòng ${o.row})`}`).join(", "), norm(line)].join("\t"));
    });
  });
  if (!rh) { rh = []; CH.fromSupplier(s, nh); }
  for (const x of nh) if (x.reason === "dòng máy lẫn với dòng tiêu đề") notes.push(`${s.id}\tn${x.n}\tb${x.table}\t${x.detail}`);
}
fs.writeFileSync("dong-chuyen.tsv", out.join("\n") + "\n");
fs.writeFileSync("dong-may-lan.tsv", notes.join("\n") + "\n");
for (const [k, v] of Object.entries(tally).sort()) console.log(v + "\t" + k);
console.log("dòng chuyển:", out.length - 1, "| ghi chú 'dòng máy lẫn với dòng tiêu đề':", notes.length);
