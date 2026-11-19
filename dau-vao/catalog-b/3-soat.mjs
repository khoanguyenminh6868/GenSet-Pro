// Soát MỌI bản ghi mới / đổi / mất giữa hai bản catalog.js (không lấy mẫu): in cạnh nhau dòng nguồn ↔ cách đọc, tự gắn cờ nghi.
// node 3-soat.mjs <repo gốc> <worktree nhánh> <tệp ra .md> [--tsv <tệp>]
// (catalog-b: chép từ catalog-a; cột dong-nguon / nguồn của bản ghi bảng nhãn lấy chữ các dòng của bảng thay vì "undefined")
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const [BASE, HEAD, OUT] = process.argv.slice(2);
const load = (root) => { const box = { console }; box.globalThis = box; box.window = box; vm.runInNewContext(fs.readFileSync(path.join(root, "web", "catalog.js"), "utf8"), box); return box.GenbidCatalog; };
const CB = load(BASE), CH = load(HEAD);
const dir = path.join(HEAD, "suppliers", "cn");
const key = (o) => `${o.supplierId}|${o.n}|${o.table}|${o.row}|${o.kind}|${o.model}`;
const pw = (p) => !p ? "∅" : ["prime", "standby", "rated"].filter((k) => p[k]).map((k) => `${k} ${p[k].kVA ?? "-"} kVA / ${p[k].kW ?? "-"} kW`).join("; ");
const textOf = (o) => o.line != null ? String(o.line) : [...(o.lines?.header || []), ...(o.lines?.rows || [])].join(" ¦ ");
const flagsOf = (o0) => {
  const o = { ...o0, line: textOf(o0) };
  const f = [];
  const p = o.power || {};
  for (const k of ["prime", "standby", "rated"]) { const x = p[k]; if (x && x.kVA && x.kW) { const r = x.kW / x.kVA; if (r < 0.75 || r > 0.86) f.push(`${k} kW/kVA=${r.toFixed(2)}`); } }
  const kva = (k) => p[k]?.kVA ?? (p[k]?.kW ? p[k].kW / 0.8 : null);
  if (kva("prime") && kva("standby") && kva("prime") > kva("standby")) f.push("prime > standby");
  if (kva("prime") && kva("standby") && kva("standby") > 1.25 * kva("prime")) f.push("standby > 1,25 × prime");
  if (!o.power) f.push("không công suất");
  if (!o.genset) f.push("không model tổ máy");
  if (o.genset && !CH.isCode(o.genset)) f.push("model tổ máy không dạng mã");
  if (/[()（）/]/.test(o.model)) f.push("model có ngoặc / gạch chéo");
  // công suất đọc ra phải có mặt trong chữ dòng nguồn
  const nums = new Set((String(o.line).match(/\d+(?:[.,]\d+)?/g) || []).map((x) => +x.replace(",", ".")));
  for (const k of ["prime", "standby", "rated"]) for (const u of ["kVA", "kW"]) { const v = p[k]?.[u]; if (v != null && !nums.has(v)) f.push(`${k} ${u}=${v} không có trong dòng`); }
  if (o.kind === "engine" && !String(o.line).includes(String(o.model).replace(/\s+/g, " ").split(" ")[0])) f.push("mã động cơ không có trong dòng");
  for (const x of o.specs || []) if (!String(o.line).includes(String(x.value).trim().split(/\s+/)[0])) f.push(`${x.key}=${x.value} không có trong dòng`);
  return f;
};
const lines = [], tsv = ["loai\tncc\tn\tbang\tdong\tkieu\tmodel\tto-may\tcong-suat\tkhac\thang\tthong-so\tco\tdong-nguon\tdoi"];
const tally = { moi: 0, mat: 0, matCoAlso: 0, doi: 0, co: 0, gensetMoi: new Set(), gensetCu: new Set() };
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const s = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (s.status === "incomplete") continue;
  const rb = CB.fromSupplier(s), rh = CH.fromSupplier(s);
  for (const o of rb) if (o.genset) tally.gensetCu.add(CB.keyOf(o.genset));
  const mb = new Map(rb.map((o) => [key(o), o])), mh = new Map(rh.map((o) => [key(o), o]));
  const out = [];
  for (const [k, o] of mh) if (!mb.has(k)) out.push(["MỚI", o]);
  for (const [k, o] of mb) if (!mh.has(k)) out.push(["MẤT", o]);
  // `header` / `lines` (chữ tiêu đề của bảng, nay đã gộp dấu cách Hán / bỏ dòng máy khỏi tiêu đề) đếm riêng, không liệt kê.
  const strip = (o) => JSON.stringify({ ...o, also: null, header: null, lines: null });
  for (const [k, o] of mh) if (mb.has(k)) {
    if (strip(mb.get(k)) !== strip(o)) out.push(["ĐỔI", o, mb.get(k)]);
    else if (JSON.stringify({ ...mb.get(k), also: null }) !== JSON.stringify({ ...o, also: null })) tally.chiTieuDe = (tally.chiTieuDe || 0) + 1;
  }
  if (!out.length) continue;
  lines.push(`\n## ${s.id} (mới ${out.filter((x) => x[0] === "MỚI").length}, mất ${out.filter((x) => x[0] === "MẤT").length}, đổi ${out.filter((x) => x[0] === "ĐỔI").length})\n`);
  for (const [t, o, old] of out) {
    let fl = t === "MẤT" ? [] : flagsOf(o);
    if (t === "MẤT") {
      // Bản ghi mất phải còn trong một bản ghi mới qua `also` (dòng nguyên văn gộp vào bảng đứng trước).
      const host = rh.find((h) => h.kind === o.kind && h.model === o.model && (h.also || []).some((a) => a.n === o.n && a.table === o.table && a.row === o.row));
      if (host) { tally.matCoAlso++; fl = [`gộp vào n${host.n} b${host.table} dòng ${host.row}`]; } else fl = ["MẤT HẲN"];
      tally.mat++;
    } else if (t === "MỚI") { tally.moi++; if (o.genset) tally.gensetMoi.add(CH.keyOf(o.genset)); }
    else tally.doi++;
    if (fl.length && t !== "MẤT") tally.co++;
    const spv = (x) => new Map((x.specs || []).map((s) => [s.key, s.value]));
    const sd = old ? (() => { const a = spv(old), b = spv(o); return [...new Set([...a.keys(), ...b.keys()])].filter((k) => a.get(k) !== b.get(k)).map((k) => `${k}: ${a.get(k) ?? "∅"} → ${b.get(k) ?? "∅"}`); })() : [];
    const diff = old ? [...sd, ...Object.keys({ ...o, ...old }).filter((k) => !["also", "header", "lines", "specs"].includes(k) && JSON.stringify(o[k]) !== JSON.stringify(old[k])).map((k) => `${k}: ${JSON.stringify(old[k])?.slice(0, 80)} → ${JSON.stringify(o[k])?.slice(0, 80)}`)].join("; ") : "";
    lines.push(`- **${t}** n${o.n} b${o.table} dòng ${o.row} ${o.kind} \`${o.model}\` | tổ máy \`${o.genset ?? "∅"}\` | ${pw(o.power)} | khác: ${o.other ?? "∅"} | hãng: ${(o.makes || []).map((m) => m.name).join(",") || "∅"} | ${(o.specs || []).map((x) => x.key + "=" + x.value).join("; ")}${fl.length ? " | ⚠ " + fl.join("; ") : ""}${diff ? "\n  - đổi: " + diff : ""}\n  - nguồn: \`${textOf(o).slice(0, 300)}\``);
    tsv.push([t, s.id, o.n, o.table, o.row, o.kind, o.model, o.genset ?? "", pw(o.power), o.other ?? "", (o.makes || []).map((m) => m.name).join(","), (o.specs || []).map((x) => x.key + "=" + x.value).join("; "), fl.join("; "), textOf(o).replace(/[\t\r\n]/g, " "), diff.replace(/\t/g, " ")].join("\t"));
  }
}
const newG = [...tally.gensetMoi].filter((g) => !tally.gensetCu.has(g));
const head = `# Soát bản ghi gốc ↔ nhánh (mọi bản ghi, không lấy mẫu)\n\nMới ${tally.moi}, mất ${tally.mat} (${tally.matCoAlso} gộp vào bản ghi khác qua \`also\`), đổi ${tally.doi} (thêm ${tally.chiTieuDe || 0} bản ghi chỉ đổi chữ tiêu đề lưu kèm); bản ghi mới / đổi có cờ ⚠: ${tally.co}. Model tổ máy trong bản ghi mới: ${tally.gensetMoi.size} khoá, trong đó ${newG.length} khoá CHƯA có ở bản gốc.\n`;
fs.writeFileSync(OUT, head + lines.join("\n") + "\n");
if (process.argv.includes("--tsv")) fs.writeFileSync(process.argv[process.argv.indexOf("--tsv") + 1], tsv.join("\n") + "\n");
fs.writeFileSync(OUT.replace(/\.md$/, "-model-to-may-moi.txt"), newG.sort().join("\n") + "\n");
console.log(head);
