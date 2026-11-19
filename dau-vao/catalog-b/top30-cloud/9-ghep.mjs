// node --max-old-space-size=12288 9-ghep.mjs <gop-goc.json> <gop-nhanh.json> <thư mục ra>
// catalog-b: khoá dòng của do-gop.mjs = NCC | e.key | a.key | keyOf(chữ dòng). keyOf mới bỏ "–" "—" mọi chỗ và dấu cuối ^ ×,
// nên CÙNG dòng có khoá khác chữ. Chuẩn hoá cả hai bên bằng cùng một hàm (canon) rồi so đa tập [khoá, điểm] của `all`, tập
// `top` và `rowflag` theo từng lượt. Ra: ghep.txt (tóm tắt + mọi khác biệt THẬT), ghep-cap.tsv (khoá cũ ↔ khoá mới ghép được).
import fs from "node:fs";
import path from "node:path";
const [GB, GH, OUT] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const cm = (k) => String(k).replace(/[–—]/g, "").replace(/[*†‡^×★]+$/, "");
const cl = (k) => String(k).replace(/[–—]/g, "").replace(/[*†‡^×]+$/, "");
const canon = (k) => {
  const s = String(k), i1 = s.indexOf("|"), i2 = s.indexOf("|", i1 + 1), i3 = s.indexOf("|", i2 + 1);
  return [s.slice(0, i1), cm(s.slice(i1 + 1, i2)), cm(s.slice(i2 + 1, i3)), cl(s.slice(i3 + 1))].join("|");
};
const short = (k) => { const p = String(k).split("|"); return `${p[0]}|${p[1]}|${p[2]}|${p.slice(3).join("|").slice(0, 60)}`; };
const B = JSON.parse(fs.readFileSync(GB, "utf8")), H = JSON.parse(fs.readFileSync(GH, "utf8"));
const pairs = new Map(); // khoá cũ → khoá mới (khác chữ, cùng canon)
const st = { luot: 0, giongRaw: 0, giongCanon: 0, topKhac: 0, topTapKhac: 0, allKhac: 0, rfKhac: 0, loi: 0 };
const roi = new Map(), vao = new Map(), diem = new Map(), raTop = new Map(), vaoTop = new Map(); // canon → [lượt...]
const lines = [];
const bump = (m, k, v) => { if (!m.has(k)) m.set(k, []); m.get(k).push(v); };
for (const id of new Set([...Object.keys(B), ...Object.keys(H)])) {
  const b = B[id], h = H[id];
  st.luot++;
  if (!b || !h || b.error || h.error) { st.loi++; lines.push(`LỖI/THIẾU ${id}`); continue; }
  if (JSON.stringify(b) === JSON.stringify(h)) { st.giongRaw++; st.giongCanon++; continue; }
  // ghép khoá cũ ↔ mới theo canon (cùng lượt)
  const cb = new Map(), ch = new Map();
  for (const [k] of b.all) cb.set(canon(k), k);
  for (const [k] of h.all) ch.set(canon(k), k);
  for (const [c, k] of cb) { const k2 = ch.get(c); if (k2 && k2 !== k) pairs.set(k, k2); }
  const ms = (all) => { const m = new Map(); for (const [k, s] of all) { const c = canon(k); m.set(c, [...(m.get(c) || []), s].sort((x, y) => x - y)); } return m; };
  const ab = ms(b.all), ah = ms(h.all);
  let allK = false;
  for (const [c, sb] of ab) {
    const sh = ah.get(c);
    if (!sh) { bump(roi, c, id); allK = true; }
    else if (JSON.stringify(sb) !== JSON.stringify(sh)) { bump(diem, c, `${id} ${sb.join(",")}→${sh.join(",")}`); allK = true; }
  }
  for (const [c] of ah) if (!ab.has(c)) { bump(vao, c, id); allK = true; }
  const tb = b.top.map(canon), th = h.top.map(canon);
  const topK = JSON.stringify(tb) !== JSON.stringify(th) || JSON.stringify(b.topScore) !== JSON.stringify(h.topScore);
  const sb = new Set(tb), sh = new Set(th);
  const tapK = tb.some((x) => !sh.has(x)) || th.some((x) => !sb.has(x));
  for (const x of tb) if (!sh.has(x)) bump(raTop, x, id);
  for (const x of th) if (!sb.has(x)) bump(vaoTop, x, id);
  const rfK = JSON.stringify([...b.rowflag].map(canon).sort()) !== JSON.stringify([...h.rowflag].map(canon).sort()) || b.dropped !== h.dropped;
  if (!allK && !topK && !rfK) { st.giongCanon++; continue; }
  if (topK) st.topKhac++; if (tapK) st.topTapKhac++; if (allK) st.allKhac++; if (rfK) st.rfKhac++;
  lines.push(`LƯỢT ${id}: top ${topK ? (tapK ? "đổi tập" : "đổi thứ tự/điểm") : "giữ"}; all ${allK ? "đổi" : "giữ"}; dropped ${b.dropped}→${h.dropped}${rfK ? " (rowflag đổi)" : ""}`);
  if (tapK) { for (const x of tb) if (!sh.has(x)) lines.push(`   ra top:  ${short(x)}`); for (const x of th) if (!sb.has(x)) lines.push(`   vào top: ${short(x)}`); }
}
const sec = (t, m) => [`\n## ${t}: ${m.size} khoá, ${[...m.values()].reduce((a, v) => a + v.length, 0)} dòng-lượt`, ...[...m].sort((a, b) => b[1].length - a[1].length).map(([k, v]) => `${v.length}\t${k.slice(0, 160)}\t${v.slice(0, 6).join(" ; ")}`)].join("\n");
const head = `lượt ${st.luot} (lỗi/thiếu ${st.loi}); giống y chữ ${st.giongRaw}; giống sau chuẩn hoá khoá ${st.giongCanon}; khác thật ${st.luot - st.giongCanon - st.loi}: top đổi ${st.topKhac} (đổi tập ${st.topTapKhac}), all đổi ${st.allKhac}, dropped/rowflag đổi ${st.rfKhac}\ncặp khoá cũ ↔ mới (cùng dòng, chỉ khác chữ khoá): ${pairs.size}`;
fs.writeFileSync(path.join(OUT, "ghep.txt"), [head, sec("Rời all (sau chuẩn hoá)", roi), sec("Vào all", vao), sec("Đổi điểm", diem), sec("Ra top", raTop), sec("Vào top", vaoTop), "\n## Từng lượt khác", ...lines].join("\n") + "\n");
fs.writeFileSync(path.join(OUT, "ghep-cap.tsv"), ["khoá cũ\tkhoá mới", ...[...pairs].map(([a, b]) => `${a}\t${b}`)].join("\n") + "\n");
console.log(head);
