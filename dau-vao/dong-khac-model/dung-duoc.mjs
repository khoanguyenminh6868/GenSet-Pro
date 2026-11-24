// node dung-duoc.mjs ctx.json  → (1) mỗi dòng có làm bằng chứng cho chức năng truyền thông (ctlShows) hay không;
// (2) fixtures/runs: có sourceQuote / factSrc / quote nào trùng một dòng trong danh sách.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { pathToFileURL } from "node:url";
const REPO = "C:/Projects/GenSet Pro/GenSet-Pro";
const CM = await import(pathToFileURL(path.join(REPO, "suppliers", "ctl-module.mjs")).href);
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = { subs: {}, mod: 0 };
for (const r of rows) {
  r.subs = CM.SUBS.filter((s) => CM.ctlShows(r.line, s)).map((s) => s.k);
  r.modName = CM.moduleIn(r.line).map((m) => m.key);
  for (const k of r.subs) out.subs[k] = (out.subs[k] || 0) + 1;
  if (r.modName.length) out.mod++;
}
console.log("ctlShows:", JSON.stringify(out), "dòng có ít nhất 1 chức năng:", rows.filter((r) => r.subs.length).length);
for (const r of rows.filter((r) => r.subs.length)) console.log(" ", r.nguon, r.model, "->", r.subs.join("/"), "|", r.line.slice(0, 120));
// fixtures
const dir = path.join(REPO, "suppliers/fixtures/runs");
const strs = [];
const walk = (v, p) => { if (typeof v === "string") strs.push([p, v]); else if (Array.isArray(v)) v.forEach((x, i) => walk(x, p + "[" + i + "]")); else if (v && typeof v === "object") for (const k of Object.keys(v)) walk(v[k], p + "." + k); };
const files = [];
for (const d of fs.readdirSync(dir)) { const p = path.join(dir, d); if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p)) files.push(path.join(p, f)); }
const lines = [...new Map(rows.map((r) => [r.line, r])).values()].filter((r) => r.line.length >= 12);
let found = 0;
for (const f of files) {
  let txt;
  if (f.endsWith(".gz")) txt = zlib.gunzipSync(fs.readFileSync(f)).toString("utf8"); else txt = fs.readFileSync(f, "utf8");
  for (const r of lines) { if (txt.includes(JSON.stringify(r.line).slice(1, -1))) { found++; console.log("FIXTURE", path.relative(dir, f), "|", r.nguon, r.line.slice(0, 100)); } }
}
console.log("fixture: tệp", files.length, "trùng", found);
fs.writeFileSync(process.argv[2].replace(/\.json$/, ".subs.json"), JSON.stringify(rows, null, 1));
