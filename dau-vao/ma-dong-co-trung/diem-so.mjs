// node diem-so.mjs (CHỈ ĐỌC): dòng có mặt trong top 30 cả gốc lẫn nhánh: điểm đổi có đúng bằng 8 × (min(số loại thông số nhánh, 8) − min(gốc, 8)) không.
// Ghép theo NCC + chữ dòng (bỏ trường đầu phát); một dòng nhiều bản thì ghép theo thứ tự điểm.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const J = (f) => JSON.parse(fs.readFileSync(path.join(HERE, f), "utf8"));
const A = J("cloud/base.top30.json"), Z = J("cloud/br.top30.json");
const norm = (id) => id.replace(/\|+$/, "").replace(/^([^|]*)\|+/, "$1|");
const lineId = (k) => { const p = k.split("|"); return norm(`${p[0]}|${p.slice(3).join("|")}`); };
const load = (f) => { const m = new Map(); for (const [k, v] of Object.entries(J(f))) m.set(norm(k), v); return m; };
const da = load("diem-goc.json"), dz = load("diem-nhanh.json");
const kinds = (m, id) => (m.has(id) ? Math.min(m.get(id)[1], 8) : null);
const group = (e) => { const m = new Map(); e.top.forEach((k, i) => { const id = lineId(k); if (!m.has(id)) m.set(id, []); m.get(id).push(e.topScore[i]); }); for (const v of m.values()) v.sort((x, y) => y - x); return m; };
const hist = new Map(); let both = 0, changed = 0, match = 0, unknown = 0, plus300 = 0; const miss = [];
for (const run of Object.keys(A)) {
  if (!Z[run]?.top) continue;
  const a = group(A[run]), z = group(Z[run]);
  for (const [id, sa] of a) {
    const sz = z.get(id); if (!sz) continue;
    for (let i = 0; i < Math.min(sa.length, sz.length); i++) {
      both++;
      const d = sz[i] - sa[i]; if (!d) continue;
      changed++; hist.set(d, (hist.get(d) || 0) + 1);
      const ka = kinds(da, id), kz = kinds(dz, id);
      // 8 điểm mỗi loại thông số (tối đa 8 loại) + 60 khi động cơ có hãng; có hãng mà hãng đó HSMT nêu thì thêm 300.
      const exp = ka == null || kz == null ? null : 8 * (kz - ka) + 60 * ((dz.get(id)[2] || 0) - (da.get(id)[2] || 0));
      if (exp == null) { unknown++; if (miss.length < 4) miss.push(`KHÔNG TRA ĐƯỢC ${id.slice(0, 90)} | gốc ${da.has(id)} nhánh ${dz.has(id)}`); }
      else if (exp === d) match++;
      else if (exp + 300 === d && dz.get(id)[2] && !da.get(id)[2]) { match++; plus300++; }
      else if (miss.length < 15) miss.push(`${run} ${id.slice(0, 70)}: đổi ${d}, tính ${exp} (loại ${ka}→${kz}, hãng ${da.get(id)[2]}→${dz.get(id)[2]})`);
    }
  }
}
console.log(`dòng có ở cả hai top: ${both}; đổi điểm: ${changed}; khớp công thức: ${match}; không tra được: ${unknown}; lệch: ${changed - match - unknown}; trong số khớp, có +300 hãng HSMT nêu: ${plus300}`);
console.log("chênh:", [...hist].sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k > 0 ? "+" : ""}${k}: ${v}`).join(", "));
if (miss.length) console.log(miss.join("\n"));
