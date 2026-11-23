// PR 2: kiểm TỪNG bản ghi đổi của các NCC theo nội dung (không lấy mẫu), ghép theo khoá + dòng nguồn.
//   - freq đổi: tiêu đề của bảng con chứa dòng phải ghi đúng tần số mới
//   - specs thêm / đổi nhãn: giá trị phải nằm nguyên trong dòng nguồn
//   - makes: hãng bỏ đi / thêm vào, kèm tiêu đề bảng con trước và sau
//   node pr2-check.mjs <gốc sau> <gốc trước> <id,id,...> <tệp ra>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const [after, before, ids, outFile] = process.argv.slice(2);
await import(pathToFileURL(path.join(after, "web", "catalog.js")).href);
const C = globalThis.GenbidCatalog;
const load = (r, id) => JSON.parse(fs.readFileSync(path.join(r, "suppliers", "cn", `${id}.json`), "utf8"));
const k = (r) => [r.kind, r.model, r.genset ?? "", r.line ?? ""].join("¦");
const names = (r) => (r.makes || []).map((m) => m.name).join("+") || "—";
const out = [], total = {};
for (const id of ids.split(",")) {
  const ra = load(before, id), rb = load(after, id), A = C.fromSupplier(ra, []), B = C.fromSupplier(rb, []);
  const pool = new Map();
  for (const r of A) { if (!pool.has(k(r))) pool.set(k(r), []); pool.get(k(r)).push(r); }
  const heads = (rec, r) => rec.specTables.filter((t) => t.n === r.n && t.rows.includes(r.line)).flatMap((t) => t.header).join(" ");
  const stat = {};
  const hit = (c) => { stat[c] = (stat[c] || 0) + 1; total[c] = (total[c] || 0) + 1; };
  for (const r of B) {
    const list = pool.get(k(r));
    if (!list || !list.length) continue;
    const j = list.findIndex((o) => o.n === r.n), o = list.splice(j < 0 ? 0 : j, 1)[0];
    if ((o.freq ?? null) !== (r.freq ?? null)) {
      const h = heads(rb, r), ok = r.freq != null && new RegExp(`(^|[^\\d])${r.freq}\\s*hz`, "i").test(h + " " + r.line);
      hit(`freq ${o.freq ?? "—"}→${r.freq ?? "—"} ${ok ? "(tiêu đề bảng con ghi đúng)" : "(!! tiêu đề KHÔNG ghi)"}`);
      if (!ok) out.push(`FREQ\t${id}\tn${r.n}\t${r.model}\t${o.freq}→${r.freq}\t${h.slice(0, 120)}`);
    }
    if (names(o) !== names(r)) {
      hit(`makes ${names(o)} → ${names(r)} [${r.kind}]`);
      out.push(`MAKES\t${id}\tn${r.n}\t${r.kind}\t${r.model}\t${names(o)} → ${names(r)}\tTRƯỚC: ${heads(ra, o).slice(0, 90)}\tSAU: ${heads(rb, r).slice(0, 90)}`);
    }
    const ps = new Map((o.specs || []).map((s) => [s.key, s]));
    for (const s of r.specs || []) {
      const u = ps.get(s.key);
      if (u && u.value === s.value) continue;
      const ok = r.line.includes(String(s.value));
      hit(`spec ${u ? "ĐỔI" : "thêm"} ${ok ? "(giá trị có trong dòng)" : "(!! không có trong dòng)"}`);
      if (!ok) out.push(`SPEC\t${id}\tn${r.n}\t${r.model}\t${s.key}\t${u?.value ?? "—"} → ${s.value}\t${r.line.slice(0, 100)}`);
    }
    for (const f of ["prime", "standby"]) for (const unit of ["kVA", "kW"]) {
      const a = o.power?.[f]?.[unit], b = r.power?.[f]?.[unit];
      if (a === b) continue;
      const ok = b != null && new RegExp(`(^|[^\\d.])${String(b).replace(".", "\\.")}([^\\d]|$)`).test(r.line);
      hit(`power ${a == null ? "thêm" : b == null ? "BỎ" : "ĐỔI"} ${ok ? "(số có trong dòng)" : "(!! không có trong dòng)"}`);
      if (!ok) out.push(`POWER\t${id}\tn${r.n}\t${r.model}\t${f} ${unit}\t${a} → ${b}\t${r.line.slice(0, 100)}`);
    }
  }
  const c = Object.entries(stat).sort();
  if (c.length) console.log(`== ${id}\n` + c.map(([x, v]) => `  ${v}\t${x}`).join("\n"));
}
fs.writeFileSync(outFile, out.join("\n") + "\n", "utf8");
console.log(`\nchi tiết: ${out.length} dòng`);
