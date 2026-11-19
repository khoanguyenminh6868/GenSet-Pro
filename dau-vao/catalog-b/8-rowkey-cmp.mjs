// node 8-rowkey-cmp.mjs <worktree gốc> <worktree nhánh> [--rowok <tệp json>]
// Khoá dòng (row-flags-lib rowKey / lineKey = NCC | băm chữ dòng) của MỌI bản ghi fromSupplier ở hai bên: khoá có ở một bên mà
// không ở bên kia, và các quyết định rowok (web, chỉ đọc; hoặc tệp) trỏ tới dòng nào, còn áp ở nhánh không.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const [A, B, ...rest] = process.argv.slice(2);
if (rest[0] === "--one") {
  const cb = await import(pathToFileURL(path.join(A, "suppliers", "config-bot.mjs")).href);
  const lib = await import(pathToFileURL(path.join(A, "suppliers", "row-flags-lib.mjs")).href);
  const dir = path.join(A, "suppliers", "cn");
  const S = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
  const out = { row: [], line: [] };
  for (const o of lib.recordsOf(S)) { out.row.push(lib.rowKey(o)); out.line.push(lib.lineKey(o)); }
  if (rest[1] === "--fetch") out.rowok = await cb.rowOkOf(cb.allDocs);
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
const me = fileURLToPath(import.meta.url);
const run = (wt, fetch) => JSON.parse(execFileSync(process.execPath, [me, wt, "", "--one", fetch ? "--fetch" : ""], { maxBuffer: 1 << 29 }).toString());
const a = run(A, true), b = run(B, false);
const ra = new Set(a.row), rb = new Set(b.row), la = new Set(a.line), lb = new Set(b.line);
console.log(`rowKey: gốc ${ra.size}, nhánh ${rb.size}, chỉ gốc ${[...ra].filter((k) => !rb.has(k)).length}, chỉ nhánh ${[...rb].filter((k) => !ra.has(k)).length}`);
console.log(`lineKey (NCC|băm dòng, khoá quyết định áp): gốc ${la.size}, nhánh ${lb.size}, chỉ gốc ${[...la].filter((k) => !lb.has(k)).length}, chỉ nhánh ${[...lb].filter((k) => !la.has(k)).length}`);
for (const k of [...la].filter((k) => !lb.has(k))) console.log(`  dòng chỉ gốc: ${k}`);
const rowok = a.rowok || {};
let n = 0, lost = 0;
for (const [sid, m] of Object.entries(rowok)) for (const [k, v] of Object.entries(m || {})) {
  n++;
  const p = k.split("|"), l = `${p[0]}|${p[p.length - 1]}`;
  const inA = la.has(l), inB = lb.has(l);
  if (inA && !inB) lost++;
  console.log(`rowok ${sid}\t${v?.d}\t${k}\tgốc ${inA ? "có" : "không"}\tnhánh ${inB ? "có" : "không"}`);
}
console.log(`quyết định rowok trên web: ${n}; trỏ tới dòng có ở gốc mà mất ở nhánh: ${lost}`);
