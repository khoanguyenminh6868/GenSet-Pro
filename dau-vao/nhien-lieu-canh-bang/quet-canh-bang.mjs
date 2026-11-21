// Câu 4 (jianghao-n104 điều tra, Khoa 21/11/2026): CHỈ ĐẾM VÀ LIỆT KÊ. Bảng nào của suppliers/cn mà tên trang / tiêu đề bảng / dòng cạnh bảng
// (trong tệp nguồn sources/<id>/<n>.md) ghi khí (gas / 燃气 / biogas / 沼气 / LPG…) nhưng có bản ghi catalog `fuel` rỗng.
//   node quet-canh-bang.mjs <gốc repo> <thư mục ra>
// Bản ghi = C.fromSupplier(s) (+ C.gensetsOf(s) nếu có) của MỌI NCC status != "incomplete"; `fuel` rỗng = o.fuel không có.
// Vị trí: title = tiêu đề bảng (specTables[].title); trang = dòng đầu tiên của tệp nguồn (tên trang); truoc / sau = tối đa 8 dòng chữ
// (không phải dòng bảng) ngay trước dòng tiêu đề / ngay sau dòng cuối của bảng trong tệp nguồn; url = địa chỉ trang.
import fs from "node:fs"; import path from "node:path"; import vm from "node:vm";
const ROOT = process.argv[2], OUT = process.argv[3];
const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(ROOT, "web", "catalog.js"), "utf8"), box);
const C = box.GenbidCatalog, dir = path.join(ROOT, "suppliers", "cn"), src = path.join(ROOT, "suppliers", "sources");
const sups = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort().map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))).filter((d) => d.status !== "incomplete");
const STRONG = /燃气|沼气|天然气|煤层气|瓦斯|生物质气|液化气|气体发电|气体机|气体燃料|natural\s*gas|\bgas[- ]?(gen|engine|set|fired|powered|genset)\w*|biogas|bio-gas|\bLPG\b|\bCNG\b|\bLNG\b|syngas|landfill|methane|gas natural|gás natural|khí thiên nhiên|khí tự nhiên|khí sinh học|khí hóa lỏng|\bgaz\b|oil\s*fi?e?l?d\s*gas|straw gas|coal gas|石油伴生气|秸秆气|煤气/ig;
const WEAK = /\bgas\b(?!oline)|\bgases\b|气体|燃料气/ig;
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const mdOf = (id, n) => { try { return fs.readFileSync(path.join(src, id, n + ".md"), "utf8").split(/\r?\n/); } catch { return null; } };
const isTab = (l) => /^\s*\|/.test(l);
const snip = (text, re) => { const out = []; re.lastIndex = 0; let m; while ((m = re.exec(text)) && out.length < 4) { const a = Math.max(0, m.index - 70), b = Math.min(text.length, m.index + m[0].length + 90); out.push(norm(text.slice(a, b))); if (m.index === re.lastIndex) re.lastIndex++; } return out; };
const rows = []; const tbl = new Set(); const tblStrong = new Set(); const sup = new Set(); let nTables = 0, nTablesEmpty = 0, nRecEmpty = 0, nRecAll = 0;
for (const s of sups) {
  let recs = C.fromSupplier(s); if (typeof C.gensetsOf === "function") recs = recs.concat(C.gensetsOf(s));
  const by = new Map(); for (const o of recs) { const k = o.table + "|" + o.n; if (!by.has(k)) by.set(k, { n: 0, e: 0, r: o }); const b = by.get(k); b.n++; if (!o.fuel) b.e++; }
  nRecAll += recs.length; nRecEmpty += recs.filter((o) => !o.fuel).length;
  (s.specTables || []).forEach((t, ti) => {
    nTables++;
    const b = by.get(ti + "|" + t.n); if (!b || !b.e) return; nTablesEmpty++;
    const md = mdOf(s.id, t.n); const url = md ? ((md.find((l) => /^URL:/.test(l)) || "").replace(/^URL:\s*/, "")) : "";
    const texts = [["title", String(t.title || "")]];
    if (md) {
      const body = md.filter((l) => !/^(URL|Accessed):/.test(l) && l.trim());
      if (body[0]) texts.push(["trang", body[0]]);
      const want = norm((t.header || [])[0] || ""), want2 = norm((t.rows || [])[0] || "");
      let i0 = md.findIndex((l) => isTab(l) && norm(l) === want); if (i0 < 0) i0 = md.findIndex((l) => isTab(l) && norm(l) === want2);
      if (i0 >= 0) {
        let i1 = i0; while (i1 + 1 < md.length && (isTab(md[i1 + 1]) || !md[i1 + 1].trim())) i1++;
        const before = []; for (let i = i0 - 1; i >= 0 && before.length < 8; i--) if (md[i].trim() && !isTab(md[i])) before.unshift(md[i]);
        const after = []; for (let i = i1 + 1; i < md.length && after.length < 8; i++) if (md[i].trim() && !isTab(md[i])) after.push(md[i]);
        texts.push(["truoc", before.join(" ¶ ")], ["sau", after.join(" ¶ ")]);
      } else texts.push(["khong-thay-bang-trong-md", ""]);
    }
    const seen = new Set();
    for (const [pos, tx] of texts) for (const [lvl, re] of [["manh", STRONG], ["yeu", WEAK]]) for (const sn of snip(tx, re)) {
      const key = pos + "|" + sn; if (seen.has(key)) continue;
      if (lvl === "yeu" && snip(tx, STRONG).some((x) => x === sn)) continue; seen.add(key);
      rows.push([s.id, t.n, ti, `${b.e}/${b.n}`, pos, lvl, sn, url, norm(t.title || "").slice(0, 80)]);
      tbl.add(s.id + "|" + t.n + "|" + ti); if (lvl === "manh") tblStrong.add(s.id + "|" + t.n + "|" + ti); sup.add(s.id);
    }
  });
}
fs.mkdirSync(OUT, { recursive: true });
const hdr = ["ncc", "n", "ti", "ban_ghi_fuel_rong/tong", "vi_tri", "muc", "cau_nguyen_van", "url", "tieu_de_bang"];
fs.writeFileSync(path.join(OUT, "bang-co-chu-khi-canh-bang.tsv"), [hdr.join("\t"), ...rows.map((r) => r.map((x) => String(x).replace(/[\t\r\n]+/g, " ")).join("\t"))].join("\n") + "\n");
const strongSup = new Set([...tblStrong].map((k) => k.split("|")[0]));
console.log(JSON.stringify({ ncc: sups.length, tongBang: nTables, tongBanGhi: nRecAll, banGhiFuelRong: nRecEmpty, bangCoBanGhiRong: nTablesEmpty, bangCoChuKhi: tbl.size, bangCoChuKhiManh: tblStrong.size, nccCoChuKhi: sup.size, nccManh: strongSup.size, dong: rows.length }));
