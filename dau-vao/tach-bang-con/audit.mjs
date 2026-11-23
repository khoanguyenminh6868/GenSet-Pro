// Kiểm chéo MỌI bản ghi fromSupplier trước ↔ sau của các NCC, đối chiếu với tệp nguồn và tiêu đề bảng chứa dòng.
// Khác recdiff2: bản ghi trùng khoá được ghép theo NỘI DUNG trước (bản giống hệt bỏ ra), phần còn lại mới ghép theo thứ tự.
//   node audit.mjs <gốc sau (có web/catalog.js)> <gốc trước> <id,id,...> <thư mục ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, idArg, outDir] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (r, id) => JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8"));
const key = (r) => [r.kind, r.model, r.genset ?? "", r.line ?? ""].join(" ¦ ");
const body = (r) => { const { table, row, also, header, lines, n, title, ...x } = r; return JSON.stringify(x); };
const full = (r) => { const { table, row, also, header, lines, n, ...x } = r; return x; };
const group = (l) => { const m = new Map(); for (const r of l) { if (!m.has(key(r))) m.set(key(r), []); m.get(key(r)).push(r); } return m; };
const unit = (l) => (/g\s*\/\s*k\s*w/i.test(l) ? "g/kWh" : /l\s*\/\s*h/i.test(l) ? "L/h" : "?");
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, "");
const tablesWith = (rec, line, n) => rec.specTables.filter((t) => (n == null || t.n === n) && t.rows.includes(line));
fs.mkdirSync(outDir, { recursive: true });
const total = [];
for (const id of idArg.split(",")) {
  const ra = load(before, id), rb = load(after, id), A = C.fromSupplier(ra, []), B = C.fromSupplier(rb, []);
  const ga = group(A), gb = group(B), out = [], cls = {}, bad = [];
  const hit = (c) => { cls[c] = (cls[c] || 0) + 1; };
  const oldRows = new Set(ra.specTables.flatMap((t) => t.rows)), oldHead = new Set(ra.specTables.flatMap((t) => t.header));
  const srcHas = (n, line) => { try { return fs.readFileSync(path.join(after, "suppliers", "sources", id, `${n}.md`), "utf8").split(/\r?\n/).includes(line); } catch { return false; } };
  let add = 0, del = 0, chg = 0, same = 0;
  for (const k of new Set([...ga.keys(), ...gb.keys()])) {
    const x = [...(ga.get(k) || [])], y = [...(gb.get(k) || [])];
    for (let i = x.length - 1; i >= 0; i--) { const j = y.findIndex((v) => body(v) === body(x[i]) && (v.title ?? "") === (x[i].title ?? "")); if (j >= 0) { x.splice(i, 1); y.splice(j, 1); same++; } }
    for (let i = x.length - 1; i >= 0; i--) { const j = y.findIndex((v) => body(v) === body(x[i])); if (j >= 0) { const v = y[j]; chg++; hit(`title: ${x[i].n === v.n ? "cùng trang" : "đổi trang (dòng trùng giữa trang)"}`); out.push(`TITLE\tn${x[i].n}→n${v.n}\t${v.model}\t${x[i].title} → ${v.title}`); if (!srcHas(v.n, v.line)) bad.push(`title: dòng không có ở nguồn n${v.n}: ${v.line}`); x.splice(i, 1); y.splice(j, 1); } }
    const m = Math.min(x.length, y.length);
    for (let i = 0; i < m; i++) {
      chg++; const p = full(x[i]), q = full(y[i]), ts = tablesWith(rb, y[i].line, y[i].n), head = norm(ts.flatMap((t) => t.header).join(" "));
      for (const f of new Set([...Object.keys(p), ...Object.keys(q)])) {
        if (JSON.stringify(p[f]) === JSON.stringify(q[f])) continue;
        if (f === "makes") {
          const nn = (q.makes || []).map((v) => v.name), oo = (p.makes || []).map((v) => v.name), ok = nn.every((v) => head.includes(norm(v)));
          hit(`makes ${oo.join("+") || "—"} → ${nn.join("+") || "—"}${ok ? " (tên hãng có trong tiêu đề bảng con)" : " (KHÔNG thấy ở tiêu đề)"}`);
          if (!ok) bad.push(`makes: ${y[i].model} n${y[i].n}: ${nn} không ở tiêu đề`);
        } else if (f === "specs") {
          const ps = new Map((p.specs || []).map((s) => [s.key, s])), qs = new Map((q.specs || []).map((s) => [s.key, s]));
          for (const s of new Set([...ps.keys(), ...qs.keys()])) {
            const u = ps.get(s), v = qs.get(s); if (JSON.stringify(u) === JSON.stringify(v)) continue;
            const kind = !u ? "thêm" : !v ? "BỎ" : u.value !== v.value ? "ĐỔI GIÁ TRỊ" : "chỉ đổi nhãn";
            const un = s === "fuel" && u && v && unit(u.label) !== unit(v.label) ? ` ${unit(u.label)}→${unit(v.label)}` : "";
            const inHead = !v || head.includes(norm(v.label).replace(/\(.*$/, "").slice(0, 6));
            hit(`specs ${s} ${kind}${un}`);
            out.push(`SPEC\t${s}\t${kind}${un}\tn${y[i].n}\t${y[i].model}\t${y[i].genset ?? ""}\t${u ? u.label + "=" + u.value : "—"} → ${v ? v.label + "=" + v.value : "—"}`);
            if (kind === "BỎ" || kind === "ĐỔI GIÁ TRỊ" || !inHead) bad.push(`specs ${s} ${kind}: ${y[i].model} n${y[i].n}: ${u ? u.label + "=" + u.value : "—"} → ${v ? v.label + "=" + v.value : "—"}`);
          }
        } else if (f === "title") hit("title (kèm đổi khác)");
        else { hit(`${f}: ${JSON.stringify(p[f])} → ${JSON.stringify(q[f])}`); if (f === "power") bad.push(`power: ${y[i].model}`); }
      }
    }
    for (const r of x.slice(m)) { del++; bad.push(`MẤT n${r.n} ${r.kind} ${r.model}: ${r.line}`); }
    for (const r of y.slice(m)) {
      add++;
      const was = oldRows.has(r.line) ? "dòng đã ở bảng cũ, trước không ra bản ghi" : oldHead.has(r.line) ? "dòng nằm trong tiêu đề cũ" : "dòng ngoài mọi bảng cũ";
      const src = srcHas(r.n, r.line), cell = r.line.includes(r.model);
      hit(`THÊM ${r.kind}: ${was}`);
      if (!src) bad.push(`THÊM không có nguyên văn ở nguồn n${r.n}: ${r.line}`);
      if (!cell) bad.push(`THÊM model không nằm trong dòng: ${r.model}: ${r.line}`);
      out.push(`THÊM\tn${r.n}\t${r.kind}\t${r.model}\t${r.genset ?? ""}\t${was}\t${JSON.stringify(r.power)}\t${r.line.slice(0, 120)}`);
    }
  }
  fs.writeFileSync(path.join(outDir, `${id}.tsv`), out.join("\n") + "\n", "utf8");
  fs.writeFileSync(path.join(outDir, `${id}.bad.txt`), bad.join("\n") + (bad.length ? "\n" : ""), "utf8");
  const line = `${id}: ${A.length} → ${B.length}; thêm ${add}, MẤT ${del}, đổi ${chg}, y nguyên ${same}; cần xem ${bad.length}`;
  total.push(line, ...Object.entries(cls).sort().map(([c, v]) => `   ${v}\t${c}`));
}
fs.writeFileSync(path.join(outDir, "_tong.txt"), total.join("\n") + "\n", "utf8");
console.log(total.join("\n"));
